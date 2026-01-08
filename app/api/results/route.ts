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
      byArea: statsByArea.reduce((acc: Record<string, { count: number; average: number }>, stat: any) => {
        acc[stat.area || 'unknown'] = {
          count: stat.casesCompleted,
          average: Math.round(stat.averageScore),
        };
        return acc;
      }, {}),
    },
    meta: {
      count: results.length,
      limit,
      area: area || 'all',
    },
  });
});