// app/api/ai/tutor/route.ts
// Endpoint para tutor socrático - solo 1 vez por caso

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { llamarGemini, puedeUsarIA, GeminiError } from '@/lib/gemini';
import { generarPromptTutorMCQ, validarRespuestaIA } from '@/lib/ai/prompts';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  try {
    // Autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Rate limiting adicional (seguridad)
    const { success, remaining } = await ratelimit.limit(`tutor:${userId}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Espera un momento.' },
        { status: 429 }
      );
    }

    // Parsear request
    const body = await req.json();
    const {
      caseId,
      preguntaId,
      opcionElegida,
      opcionCorrecta,
    } = body;

    // Validaciones
    if (!caseId || !preguntaId || !opcionElegida || !opcionCorrecta) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Verificar si ya usó el tutor en este caso
    const tutorKey = `tutor:usado:${userId}:${caseId}`;
    const yaUsado = await prisma.cacheEntry.findUnique({
      where: { key: tutorKey },
    });

    if (yaUsado) {
      return NextResponse.json(
        { 
          error: 'Ya usaste el tutor en este caso. Solo puedes usarlo 1 vez por caso.',
          tipo: 'limite_caso',
        },
        { status: 403 }
      );
    }

    // Verificar límites generales de IA
    const limites = await puedeUsarIA(userId, caseId);
    if (!limites.puede) {
      return NextResponse.json(
        { error: limites.razon, tipo: 'limite_general' },
        { status: 403 }
      );
    }

    // Obtener datos de la pregunta y caso
    const pregunta = await prisma.question.findUnique({
      where: { id: preguntaId },
      include: {
        case: {
          select: {
            id: true,
            escenario: true,
            area: true,
            modulo: true,
          },
        },
      },
    });

    if (!pregunta || pregunta.caseId !== caseId) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      );
    }

    // Extraer contexto de la etapa
    const escenario = pregunta.case.escenario as any;
    const etapa = escenario?.etapas?.find((e: any) => e.id === pregunta.etapaId);
    const contextoEtapa = etapa
      ? `${etapa.titulo}\n${etapa.texto}\n${JSON.stringify(etapa.datos || {}, null, 2)}`
      : 'Contexto no disponible';

    // Extraer explicaciones de opciones
    const opciones = pregunta.opciones as any[];
    const explicaciones = opciones.map((o: any) => ({
      id: o.id,
      texto: o.explicacion || o.texto,
    }));

    // Generar prompt con guardrails
    const prompt = generarPromptTutorMCQ({
      contextoEtapa,
      enunciado: pregunta.enunciado,
      opcionElegida,
      opcionCorrecta,
      leadInTipo: pregunta.leadInTipo || 'diagnostico',
      explicaciones,
    });

    // Llamar a Gemini
    let respuestaIA;
    try {
      respuestaIA = await llamarGemini(prompt, userId, caseId, 'tutor');
    } catch (error) {
      if (error instanceof GeminiError) {
        return NextResponse.json(
          { 
            error: error.message,
            tipo: error.code === 'RATE_LIMIT' ? 'limite_general' : 'error_api',
          },
          { status: error.code === 'RATE_LIMIT' ? 429 : 500 }
        );
      }
      throw error;
    }

    // Validar que la respuesta no tenga leaks
    const opcionesCorrectas = opciones
      .filter((o: any) => o.correcta)
      .map((o: any) => o.texto);

    const validacion = validarRespuestaIA(respuestaIA.texto, opcionesCorrectas);
    if (!validacion.valida) {
      logger.error('IA intentó dar respuesta directa', {
        userId,
        caseId,
        preguntaId,
        razon: validacion.razon,
      });

      // Respuesta fallback
      return NextResponse.json({
        respuesta: '¿Qué hallazgos del caso te ayudarían a elegir mejor? ¿Qué criterios clínicos consideraste?',
        tokensUsados: 0,
        cached: false,
        fallback: true,
      });
    }

    // Marcar como usado en este caso (persistente)
    await prisma.cacheEntry.create({
      data: {
        key: tutorKey,
        value: JSON.stringify({
          preguntaId,
          timestamp: new Date().toISOString(),
        }),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });

    // Registrar uso en analytics
    await prisma.aiUsage.create({
      data: {
        userId,
        caseId,
        tipo: 'tutor_socratico',
        preguntaId,
        tokensInput: respuestaIA.tokensUsados.input,
        tokensOutput: respuestaIA.tokensUsados.output,
        cached: respuestaIA.cached,
      },
    });

    logger.info('Tutor socrático usado', {
      userId,
      caseId,
      preguntaId,
      tokensInput: respuestaIA.tokensUsados.input,
      tokensOutput: respuestaIA.tokensUsados.output,
      cached: respuestaIA.cached,
    });

    return NextResponse.json({
      respuesta: respuestaIA.texto,
      tokensUsados: respuestaIA.tokensUsados,
      cached: respuestaIA.cached,
      llamadasRestantes: 0, // Ya no puede usar más en este caso
    });

  } catch (error: any) {
    logger.error('Error en endpoint tutor', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET: Verificar si puede usar tutor en este caso
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json(
        { error: 'caseId requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya usó el tutor
    const tutorKey = `tutor:usado:${userId}:${caseId}`;
    const yaUsado = await prisma.cacheEntry.findUnique({
      where: { key: tutorKey },
    });

    return NextResponse.json({
      puede: !yaUsado,
      razon: yaUsado ? 'Ya usaste el tutor en este caso' : undefined,
    });

  } catch (error: any) {
    logger.error('Error verificando tutor', { error: error.message });
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
