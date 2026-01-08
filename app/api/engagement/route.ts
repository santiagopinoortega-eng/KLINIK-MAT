// app/api/engagement/route.ts
/**
 * API endpoint para tracking de métricas de engagement
 * Registra interacciones del usuario con recomendaciones y casos
 * Arquitectura: DTOs + Middleware composable + Error handling
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { compose, withAuth, withRateLimit, withLogging, withValidation, withQueryValidation } from '@/lib/middleware/api-middleware';
import { CreateEngagementDto, GetEngagementQueryDto } from '@/lib/dtos/subscription.dto';

/**
 * POST /api/engagement
 * Crear métrica de engagement
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withRateLimit - Protección contra spam
 * @middleware withValidation - Valida body con CreateEngagementDto
 * @middleware withLogging - Log de requests/responses
 */
export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withValidation(CreateEngagementDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const data = context.body;

  // Crear métrica de engagement directamente
  const metric = await prisma.engagementMetric.create({
    data: {
      userId,
      caseId: data.caseId,
      source: data.source,
      recommendationGroup: data.recommendationGroup || null,
      action: data.action,
      sessionDuration: data.sessionDuration || null,
      timestamp: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    metricId: metric.id,
  });
});

/**
 * GET /api/engagement
 * Obtener métricas de engagement del usuario
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withRateLimit - Protección contra spam
 * @middleware withQueryValidation - Valida query con GetEngagementQueryDto
 * @middleware withLogging - Log de requests/responses
 */
export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withQueryValidation(GetEngagementQueryDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const { limit, source } = context.query;

  // Construir query
  const where: any = { userId };
  if (source) {
    where.source = source;
  }

  // Obtener métricas
  const metrics = await prisma.engagementMetric.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: {
      id: true,
      caseId: true,
      source: true,
      recommendationGroup: true,
      action: true,
      sessionDuration: true,
      timestamp: true,
    },
  });

  // Estadísticas agregadas
  const stats = await prisma.engagementMetric.groupBy({
    by: ['source', 'action'],
    where: { userId },
    _count: true,
  });

  return NextResponse.json({
    success: true,
    metrics,
    stats,
    total: metrics.length,
  });
});
