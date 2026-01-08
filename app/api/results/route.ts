// app/api/results/route.ts
/**
 * API de resultados de casos clínicos
 * Arquitectura: Services + DTOs + Middleware composable + Error handling
 */

import { NextResponse, type NextRequest } from 'next/server';
import { ResultService } from '@/services/result.service';
import { CreateResultDto, GetResultsQueryDto } from '@/lib/dtos/result.dto';
import {
  withAuth,
  withRateLimit,
  withValidation,
  withQueryValidation,
  withLogging,
  compose,
  type ApiContext,
} from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { checkCaseAccessLimit, recordCaseCompletion } from '@/lib/subscription-limits';
import { PaymentRequiredError, ValidationError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/results
 * Guarda el resultado de un caso clínico completado
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withRateLimit - 50 req/min
 * @middleware withValidation - Valida body con CreateResultDto
 * @middleware withLogging - Log de requests/responses
 */
export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.RESULTS),
  withValidation(CreateResultDto),
  withLogging
)(async (req: NextRequest, context: ApiContext) => {
  const userId = context.userId!;
  const validatedData = context.body;
  
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

    // VERIFICAR LÍMITES DE SUSCRIPCIÓN
    const limitCheck = await checkCaseAccessLimit(userId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason,
          usageCount: limitCheck.usageCount,
          limit: limitCheck.limit,
          planName: limitCheck.planName,
          requiresUpgrade: true,
        },
        { status: 403 }
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
  
  // Verificar límites de suscripción
  const limitCheck = await checkCaseAccessLimit(userId);
  if (!limitCheck.allowed) {
    throw new PaymentRequiredError(limitCheck.reason, {
      usageCount: limitCheck.usageCount,
      limit: limitCheck.limit,
      planName: limitCheck.planName,
    });
  }

  // Validación de negocio: score no puede exceder totalPoints
  if (validatedData.score > validatedData.totalPoints) {
    throw new ValidationError('Score cannot exceed totalPoints');
  }

  // Crear resultado usando el servicio
  const result = await ResultService.createResult({
    userId,
    caseId: validatedData.caseId,
    caseTitle: validatedData.caseTitle,
    caseArea: validatedData.caseArea,
    score: validatedData.score,
    totalPoints: validatedData.totalPoints,
    mode: validatedData.mode || 'study',
    timeSpent: validatedData.timeSpent,
    timeLimit: validatedData.timeLimit,
    answers: validatedData.answers,
  });

  // Registrar uso para sistema de límites
  await recordCaseCompletion(userId, validatedData.caseId);

  logger.info('Result created successfully', {
    userId,
    caseId: validatedData.caseId,
    score: validatedData.score,
  });

  return NextResponse.json(
    {
      success: true,
      result: {
        id: result.id,
        score: result.score,
        totalPoints: result.totalPoints,
        percentage: Math.round((result.score / result.totalPoints) * 100),
      },
    },
    { status: 201 }
  );
});

/**
 * GET /api/results?area=ginecologia&limit=50
 * Obtiene el historial de resultados del usuario actual
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withQueryValidation - Valida query params
 * @middleware withLogging - Log de requests/responses
 */
export const GET = compose(
  withAuth,
  withQueryValidation(GetResultsQueryDto),
  withLogging
)(async (req: NextRequest, context: ApiContext) => {
  const userId = context.userId!;
  const { area, limit, sortBy } = context.query;

  // Obtener resultados usando el servicio
  const results = await ResultService.getUserResults(userId, {
    area,
    limit,
    sortBy,
  });

  // Obtener estadísticas
  const stats = await ResultService.getUserStats(userId, area);
  const statsByArea = await ResultService.getStatsByArea(userId);

  return NextResponse.json({
    success: true,
    results: results.map(r => ({
      id: r.id,
      caseId: r.caseId,
      caseTitle: r.caseTitle,
      caseArea: r.caseArea,
      score: r.score,
      totalPoints: r.totalPoints,
      percentage: Math.round((r.score / r.totalPoints) * 100),
      mode: r.mode,
      timeSpent: r.timeSpent,
      completedAt: r.completedAt,
    })),
    stats: {
      totalCompleted: stats.totalCases,
      averageScore: Math.round(stats.averageScore),
      totalPoints: stats.totalPoints,
      bestScore: stats.bestScore,
      timeAverage: Math.round(stats.timeAverage),
      byArea: statsByArea.reduce((acc, stat) => {
        acc[stat.area || 'unknown'] = {
          count: stat.casesCompleted,
          average: Math.round(stat.averageScore),
        };
        return acc;
      }, {} as Record<string, { count: number; average: number }>),
    },
    meta: {
      count: results.length,
      limit,
      area: area || 'all',
    },
  });
});

    results.forEach((r: typeof results[0]) => {
      const area = r.caseArea || 'General';
      const mode = r.mode || 'study';
      stats.byArea[area] = (stats.byArea[area] || 0) + 1;

