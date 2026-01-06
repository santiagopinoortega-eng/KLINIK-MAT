// lib/db-helpers.ts
/**
 * 🔥 HELPERS DE OPTIMIZACIÓN PARA QUERIES
 * Funciones utilitarias para mejorar el rendimiento de queries de Prisma
 */

import { prisma, prismaRO, withTimeout } from './prisma';
import { cache, CACHE_TTL, cacheWrapper } from './cache';

/**
 * 🔥 OPTIMIZACIÓN: Select minimal para listados
 * Solo devuelve los campos necesarios para reducir payload
 */
export const CASE_LIST_SELECT = {
  id: true,
  title: true,
  area: true,
  modulo: true,
  difficulty: true,
  summary: true,
  createdAt: true,
  _count: {
    select: {
      questions: true,
      favorites: true, // Para mostrar "trending"
    },
  },
} as const;

/**
 * 🔥 OPTIMIZACIÓN: Select completo para detalles de caso
 * Incluye preguntas, opciones e imágenes ordenadas
 */
export const CASE_DETAIL_SELECT = {
  id: true,
  title: true,
  area: true,
  modulo: true,
  difficulty: true,
  dificultad: true,
  summary: true,
  vignette: true,
  version: true,
  createdAt: true,
  images: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      url: true,
      alt: true,
      caption: true,
      order: true,
    },
  },
  questions: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      order: true,
      tipo: true,
      enunciado: true,
      feedbackDocente: true,
      guia: true,
      puntosMaximos: true,
      criteriosEval: true,
      options: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          text: true,
          order: true,
          // NO incluir isCorrect ni explicacion (solo servidor)
        },
      },
      images: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          url: true,
          alt: true,
          caption: true,
          order: true,
        },
      },
    },
  },
  norms: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} as const;

/**
 * 🔥 HELPER: Obtener casos con caché inteligente
 * Usa prismaRO (read-only) para reducir carga en la DB principal
 */
export async function getCachedCases(params: {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
}) {
  const cacheKey = `cases:${JSON.stringify(params)}`;

  return cacheWrapper(
    cacheKey,
    async () => {
      return withTimeout(
        prismaRO.case.findMany({
          ...params,
          select: CASE_LIST_SELECT,
        }),
        5000, // Timeout 5s
        'Query de casos excedió el tiempo límite'
      );
    },
    CACHE_TTL.CASES // 15 minutos
  );
}

/**
 * 🔥 HELPER: Obtener detalles de caso con caché
 */
export async function getCachedCaseById(caseId: string) {
  const cacheKey = `case:detail:${caseId}`;

  return cacheWrapper(
    cacheKey,
    async () => {
      return withTimeout(
        prismaRO.case.findUnique({
          where: { id: caseId, isPublic: true },
          select: CASE_DETAIL_SELECT,
        }),
        5000,
        'Query de caso excedió el tiempo límite'
      );
    },
    CACHE_TTL.CASES // 15 minutos
  );
}

/**
 * 🔥 HELPER: Obtener resultados de usuario con paginación
 */
export async function getUserResults(userId: string, params?: {
  area?: string;
  limit?: number;
  offset?: number;
}) {
  const { area, limit = 20, offset = 0 } = params || {};

  const where: any = { userId };
  if (area) where.caseArea = area;

  return withTimeout(
    prismaRO.studentResult.findMany({
      where,
      select: {
        id: true,
        caseId: true,
        caseTitle: true,
        caseArea: true,
        score: true,
        completedAt: true,
        timeSpent: true,
        mode: true,
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    5000
  );
}

/**
 * 🔥 HELPER: Guardar resultado con validación
 */
export async function saveUserResult(data: {
  userId: string;
  caseId: string;
  score: number;
  answers: any;
  timeSpent?: number;
  mode?: string;
}) {
  // Obtener datos del caso para llenar campos denormalizados
  const caseData = await prismaRO.case.findUnique({
    where: { id: data.caseId },
    select: {
      title: true,
      area: true,
    },
  });

  if (!caseData) {
    throw new Error('Caso no encontrado');
  }

  return withTimeout(
    prisma.studentResult.create({
      data: {
        id: `result_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: data.userId,
        caseId: data.caseId,
        caseTitle: caseData.title,
        caseArea: caseData.area,
        score: data.score,
        answers: data.answers,
        timeSpent: data.timeSpent || 0,
        mode: data.mode || 'study',
        completedAt: new Date(),
      },
    }),
    5000
  );
}

/**
 * 🔥 HELPER: Obtener trending cases (más favoritos últimos 7 días)
 */
export async function getTrendingCases(limit: number = 10) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const cacheKey = `cases:trending:${limit}`;

  return cacheWrapper(
    cacheKey,
    async () => {
      // Query optimizada con GROUP BY
      const trending = await prismaRO.$queryRaw<Array<{ caseId: string; count: bigint }>>`
        SELECT "caseId", COUNT(*) as count
        FROM favorites
        WHERE "created_at" >= ${sevenDaysAgo}
        GROUP BY "caseId"
        ORDER BY count DESC
        LIMIT ${limit}
      `;

      const caseIds = trending.map(t => t.caseId);

      if (caseIds.length === 0) return [];

      // Obtener detalles de los casos
      return prismaRO.case.findMany({
        where: {
          id: { in: caseIds },
          isPublic: true,
        },
        select: CASE_LIST_SELECT,
      });
    },
    CACHE_TTL.SHORT // 1 minuto (trending cambia rápido)
  );
}

/**
 * 🔥 HELPER: Batch update con transacción
 */
export async function batchUpdateEngagement(
  metrics: Array<{
    userId: string;
    caseId: string;
    source: string;
    action: string;
    sessionDuration?: number;
  }>
) {
  if (metrics.length === 0) return;

  // Usar transacción para garantizar atomicidad
  return withTimeout(
    prisma.$transaction(
      metrics.map(metric =>
        prisma.engagementMetric.create({
          data: {
            id: `eng_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            ...metric,
            timestamp: new Date(),
          },
        })
      )
    ),
    10000 // 10s timeout para batch
  );
}

/**
 * 🔥 HELPER: Limpiar caché de caso cuando se actualiza
 */
export function invalidateCaseCache(caseId: string) {
  cache.delete(`case:detail:${caseId}`);
  // Limpiar también listados que podrían incluir este caso
  if (process.env.NODE_ENV === 'development') {
    const stats = cache.stats();
    console.log(`[Cache] Invalidated case ${caseId}. Cache size: ${stats.size}`);
  }
}
