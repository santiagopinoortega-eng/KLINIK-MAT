// app/api/ai/evaluar-short/route.ts
// Endpoint para evaluación automática de preguntas SHORT con rúbrica

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { llamarGemini, puedeUsarIA, GeminiError } from '@/lib/gemini';
import { generarPromptEvaluarSHORT } from '@/lib/ai/prompts';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting - protección contra abuso de IA
    const rateLimit = checkRateLimit(req, RATE_LIMITS.AUTHENTICATED);
    if (!rateLimit.ok) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    // Autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Parsear request
    const body = await req.json();
    const { caseId, preguntaId, respuestaEstudiante } = body;

    // Validaciones
    if (!caseId || !preguntaId || !respuestaEstudiante) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    if (respuestaEstudiante.length < 10) {
      return NextResponse.json(
        { error: 'Respuesta muy corta (mínimo 10 caracteres)' },
        { status: 400 }
      );
    }

    // Verificar límites de IA
    const limites = await puedeUsarIA(userId, caseId);
    if (!limites.puede) {
      return NextResponse.json(
        { error: limites.razon },
        { status: 403 }
      );
    }

    // Obtener pregunta SHORT con rúbrica
    const pregunta = await prisma.question.findUnique({
      where: { id: preguntaId },
      include: {
        case: {
          select: {
            id: true,
            escenario: true,
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

    if (pregunta.tipo !== 'SHORT') {
      return NextResponse.json(
        { error: 'Solo preguntas SHORT pueden evaluarse con IA' },
        { status: 400 }
      );
    }

    // Verificar que tenga rúbrica
    const rubrica = pregunta.rubrica as any;
    if (!rubrica || !rubrica.criterios || rubrica.criterios.length === 0) {
      return NextResponse.json(
        { error: 'Pregunta sin rúbrica configurada' },
        { status: 400 }
      );
    }

    // Verificar que evaluación automática esté habilitada
    const evalConfig = pregunta.evaluacionAuto as any;
    if (!evalConfig || evalConfig.modo !== 'ia_con_rubricas') {
      return NextResponse.json(
        { error: 'Evaluación automática no habilitada para esta pregunta' },
        { status: 400 }
      );
    }

    // Extraer contexto
    const escenario = pregunta.case.escenario as any;
    const etapa = escenario?.etapas?.find((e: any) => e.id === pregunta.etapaId);
    const contexto = etapa
      ? `${etapa.titulo}\n${etapa.texto}`
      : 'Contexto no disponible';

    // Generar prompt
    const prompt = generarPromptEvaluarSHORT({
      enunciado: pregunta.enunciado,
      respuestaEstudiante,
      rubrica: {
        criterios: rubrica.criterios.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          puntos: c.puntos,
          evidencias: c.evidencias || [],
          descripcion: c.descripcion,
        })),
        respuestaModelo: rubrica.respuestaModelo || '',
      },
      contexto,
    });

    // Llamar a Gemini
    let respuestaIA;
    try {
      respuestaIA = await llamarGemini(prompt, userId, caseId, 'evaluar_short');
    } catch (error) {
      if (error instanceof GeminiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.code === 'RATE_LIMIT' ? 429 : 500 }
        );
      }
      throw error;
    }

    // Parsear respuesta JSON
    let evaluacion;
    try {
      // Extraer JSON de la respuesta (por si viene con texto adicional)
      const jsonMatch = respuestaIA.texto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en respuesta');
      }
      evaluacion = JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error parseando respuesta IA', {
        userId,
        preguntaId,
        respuesta: respuestaIA.texto,
      });

      // Fallback: evaluación manual requerida
      return NextResponse.json({
        evaluacionManual: true,
        razon: 'No se pudo procesar la evaluación automática',
      });
    }

    // Validar estructura de evaluación
    if (!evaluacion.criterios || !Array.isArray(evaluacion.criterios)) {
      return NextResponse.json({
        evaluacionManual: true,
        razon: 'Formato de evaluación inválido',
      });
    }

    // Registrar uso
    await prisma.aiUsage.create({
      data: {
        userId,
        caseId,
        tipo: 'evaluar_short',
        preguntaId,
        tokensInput: respuestaIA.tokensUsados.input,
        tokensOutput: respuestaIA.tokensUsados.output,
        cached: respuestaIA.cached,
        metadata: {
          puntajeTotal: evaluacion.puntaje_total,
        },
      },
    });

    logger.info('Pregunta SHORT evaluada con IA', {
      userId,
      caseId,
      preguntaId,
      puntajeTotal: evaluacion.puntaje_total,
      tokensUsados: respuestaIA.tokensUsados,
    });

    return NextResponse.json({
      evaluacion,
      tokensUsados: respuestaIA.tokensUsados,
      cached: respuestaIA.cached,
    });

  } catch (error: any) {
    logger.error('Error evaluando SHORT', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
