// app/api/engagement/route.ts
/**
 * API endpoint para tracking de métricas de engagement
 * Registra interacciones del usuario con recomendaciones y casos
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { compose, withAuth, withRateLimit, withLogging, withValidation, withQueryValidation } from '@/lib/middleware/api-middleware';
import { z } from 'zod';

// DTO para crear engagement metric
const CreateEngagementDto = z.object({
  caseId: z.string().min(1, 'Case ID es requerido'),
  source: z.enum(['recommendation', 'search', 'direct', 'favorite']),
  recommendationGroup: z.string().optional(),
  action: z.enum(['view', 'start', 'complete', 'favorite', 'share']),
  sessionDuration: z.number().int().min(0).optional(),
});

// DTO para query params del GET
const GetEngagementQueryDto = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  source: z.enum(['recommendation', 'search', 'direct', 'favorite']).optional(),
});

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
 * GET: Obtener métricas de engagement del usuario
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
