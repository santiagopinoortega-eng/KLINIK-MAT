// app/api/results/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger, ErrorMessages, logApiError } from '@/lib/logger';
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/ratelimit';
import { sanitizeObject, sanitizeCaseId, sanitizeNumber, sanitizeEnum } from '@/lib/sanitize';
import { requireCsrfToken } from '@/lib/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/results
 * Guarda el resultado de un caso clínico completado
 */
export async function POST(req: Request) {
  let body: any;
  
  try {
    // CSRF Protection - validar token antes que nada
    const csrfError = await requireCsrfToken(req);
    if (csrfError) return csrfError;

    // Rate limiting - límite estricto para escritura
    const rateLimit = checkRateLimit(req, RATE_LIMITS.RESULTS);
    if (!rateLimit.ok) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    body = await req.json();
    
    // Sanitizar y validar datos de entrada
    const sanitized = sanitizeObject<{
      caseId: string;
      caseTitle: string;
      caseArea?: string;
      score: number;
      totalPoints: number;
      mode?: 'study' | 'timed' | 'exam';
      timeLimit?: number;
      timeSpent?: number;
    }>(body, {
      caseId: { type: 'caseId', required: true },
      caseTitle: { type: 'string', required: true, maxLength: 200 },
      caseArea: { type: 'string', required: false, maxLength: 100 },
      score: { type: 'number', required: true, min: 0 },
      totalPoints: { type: 'number', required: true, min: 1 },
      mode: { 
        type: 'enum', 
        required: false,
        allowedValues: ['study', 'timed', 'exam'] as const
      },
      timeLimit: { type: 'number', required: false, min: 0 },
      timeSpent: { type: 'number', required: false, min: 0 },
    });

    const { 
      caseId, 
      caseTitle, 
      caseArea, 
      score, 
      totalPoints, 
      mode, 
      timeLimit, 
      timeSpent,
    } = sanitized;

    // Sanitizar answers si existe (mantener estructura original pero validar)
    let answers = body.answers;
    if (answers && typeof answers === 'object') {
      // Validar que sea un objeto/array válido JSON
      try {
        JSON.stringify(answers);
      } catch {
        answers = undefined;
      }
    }

    // Validación adicional: score no puede exceder totalPoints
    if (score! > totalPoints!) {
      return NextResponse.json(
        { error: 'Score no puede ser mayor que totalPoints' },
        { status: 400 }
      );
    }

    // Crear resultado en la base de datos
    const result = await prisma.studentResult.create({
      data: {
        id: `${userId}-${caseId}-${Date.now()}`, // ID único
        userId,
        caseId: caseId as string,
        caseTitle: caseTitle as string,
        caseArea: (caseArea as string) || 'General',
        score: Math.round(score as number),
        totalPoints: Math.round(totalPoints as number),
        mode: (mode || 'study') as 'study' | 'timed' | 'exam',
        timeLimit: (timeLimit as number) || null,
        timeSpent: (timeSpent as number) || null,
        answers: answers ? JSON.stringify(answers) : undefined,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        result: {
          id: result.id,
          score: result.score,
          totalPoints: result.totalPoints,
          percentage: Math.round((result.score / result.totalPoints) * 100),
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    logApiError('/api/results', error, {
      userId: (await auth()).userId,
      caseId: body?.caseId,
      method: 'POST',
    });

    return NextResponse.json(
      { error: ErrorMessages.SAVE_RESULT_FAILED },
      { status: 500 }
    );
  }
}

/**
 * GET /api/results?area=ginecologia
 * Obtiene el historial de resultados del usuario actual
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const area = searchParams.get('area');
    const limit = parseInt(searchParams.get('limit') || '50');

    const results = await prisma.studentResult.findMany({
      where: {
        userId,
        ...(area && area !== 'all' ? { caseArea: area } : {}),
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        caseId: true,
        caseTitle: true,
        caseArea: true,
        score: true,
        totalPoints: true,
        mode: true,
        timeSpent: true,
        completedAt: true,
      },
    });

    // Calcular estadísticas
    const stats = {
      totalCompleted: results.length,
      averageScore: results.length > 0 
        ? Math.round(results.reduce((sum: number, r: typeof results[0]) => sum + (r.score / r.totalPoints * 100), 0) / results.length)
        : 0,
      byArea: {} as Record<string, number>,
      byMode: {} as Record<string, number>,
    };

    results.forEach((r: typeof results[0]) => {
      const area = r.caseArea || 'General';
      const mode = r.mode || 'study';
      stats.byArea[area] = (stats.byArea[area] || 0) + 1;
      stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      results,
      stats,
    });

  } catch (error: any) {
    console.error('Error al obtener resultados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
