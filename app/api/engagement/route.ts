// app/api/engagement/route.ts
/**
 * API endpoint para tracking de métricas de engagement
 * Registra interacciones del usuario con recomendaciones y casos
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, createRateLimitResponse, RATE_LIMITS } from '@/lib/ratelimit';
import { requireCsrfToken } from '@/lib/csrf';
import { sanitizeCaseId, sanitizeEnum } from '@/lib/sanitize';

type EngagementData = {
  caseId: string;
  source: 'recommendation' | 'search' | 'browse' | 'trending' | 'challenge';
  recommendationGroup?: 'specialty' | 'review' | 'challenge' | 'trending';
  action: 'view' | 'click' | 'complete' | 'favorite';
  sessionDuration?: number; // en segundos
};

export async function POST(req: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = await requireCsrfToken(req);
    if (csrfError) return csrfError;

    // Autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(req, RATE_LIMITS.AUTHENTICATED);
    if (!rateLimitResult.ok) {
      return createRateLimitResponse(rateLimitResult.resetAt);
    }

    // Parse body
    const data: EngagementData = await req.json();

    // Validación básica
    if (!data.caseId || !data.source || !data.action) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: caseId, source, action' },
        { status: 400 }
      );
    }

    // Sanitizar y validar inputs
    let sanitizedCaseId: string;
    try {
      sanitizedCaseId = sanitizeCaseId(data.caseId);
      sanitizeEnum(data.source, ['recommendation', 'search', 'browse', 'trending', 'challenge'] as const, 'source');
      sanitizeEnum(data.action, ['view', 'click', 'complete', 'favorite'] as const, 'action');
      if (data.recommendationGroup) {
        sanitizeEnum(data.recommendationGroup, ['specialty', 'review', 'challenge', 'trending'] as const, 'recommendationGroup');
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Verificar que el caso existe
    const caseExists = await prisma.case.findUnique({
      where: { id: sanitizedCaseId },
      select: { id: true },
    });

    if (!caseExists) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }

    // Crear métrica de engagement
    const metric = await prisma.engagementMetric.create({
      data: {
        userId,
        caseId: sanitizedCaseId,
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
  } catch (error) {
    console.error('[ENGAGEMENT API] Error:', error);
    return NextResponse.json(
      { error: 'Error al registrar métrica' },
      { status: 500 }
    );
  }
}

/**
 * GET: Obtener métricas de engagement del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const source = searchParams.get('source');

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
      metrics,
      stats,
      total: metrics.length,
    });
  } catch (error) {
    console.error('[ENGAGEMENT API GET] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas' },
      { status: 500 }
    );
  }
}
