// app/api/ai/gaps/route.ts
// Endpoint para detectar gaps conceptuales al finalizar caso

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { llamarGemini, puedeUsarIA, GeminiError } from '@/lib/gemini';
import { generarPromptDetectarGaps } from '@/lib/ai/prompts';
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
    const { caseId, errores } = body;

    // Validaciones
    if (!caseId || !errores || !Array.isArray(errores)) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Solo analizar si hubo al menos 2 errores (patrón mínimo)
    if (errores.length < 2) {
      return NextResponse.json({
        sinAnalisis: true,
        razon: 'Se requieren al menos 2 errores para detectar patrones',
      });
    }

    // Verificar límites de IA
    const limites = await puedeUsarIA(userId, caseId);
    if (!limites.puede) {
      return NextResponse.json(
        { error: limites.razon },
        { status: 403 }
      );
    }

    // Obtener caso
    const caso = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        titulo: true,
        area: true,
        modulo: true,
        dificultad: true,
        questions: {
          select: {
            id: true,
            leadInTipo: true,
            opciones: true,
          },
        },
      },
    });

    if (!caso) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }

    // Mapear errores con información completa
    const erroresCompletos = errores.map((error: any) => {
      const pregunta = caso.questions.find(q => q.id === error.preguntaId);
      const opciones = pregunta?.opciones as any[] || [];
      
      const opcionElegida = opciones.find(o => o.id === error.opcionElegida);
      const opcionCorrecta = opciones.find(o => o.correcta);

      return {
        preguntaId: error.preguntaId,
        leadInTipo: pregunta?.leadInTipo || 'desconocido',
        opcionElegida: opcionElegida?.texto || error.opcionElegida,
        opcionCorrecta: opcionCorrecta?.texto || 'desconocida',
      };
    });

    // Generar prompt
    const prompt = generarPromptDetectarGaps({
      errores: erroresCompletos,
      dificultad: caso.dificultad,
      area: caso.area || 'General',
      modulo: caso.modulo || 'General',
    });

    // Llamar a Gemini
    let respuestaIA;
    try {
      respuestaIA = await llamarGemini(prompt, userId, caseId, 'gaps');
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
    let analisis;
    try {
      const jsonMatch = respuestaIA.texto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en respuesta');
      }
      analisis = JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error parseando análisis de gaps', {
        userId,
        caseId,
        respuesta: respuestaIA.texto,
      });

      // Fallback genérico
      return NextResponse.json({
        analisis: {
          concepto_debil: 'Manejo del caso clínico',
          pregunta_reflexion: '¿Qué criterios clínicos podrías revisar para estos escenarios?',
          recomendacion: 'Practica más casos similares de este módulo',
        },
        fallback: true,
      });
    }

    // Registrar uso
    await prisma.aiUsage.create({
      data: {
        userId,
        caseId,
        tipo: 'detectar_gaps',
        tokensInput: respuestaIA.tokensUsados.input,
        tokensOutput: respuestaIA.tokensUsados.output,
        cached: respuestaIA.cached,
        metadata: {
          conceptoDebil: analisis.concepto_debil,
          numErrores: errores.length,
        },
      },
    });

    logger.info('Gaps conceptuales detectados', {
      userId,
      caseId,
      conceptoDebil: analisis.concepto_debil,
      numErrores: errores.length,
      tokensUsados: respuestaIA.tokensUsados,
    });

    return NextResponse.json({
      analisis,
      tokensUsados: respuestaIA.tokensUsados,
      cached: respuestaIA.cached,
    });

  } catch (error: any) {
    logger.error('Error detectando gaps', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
