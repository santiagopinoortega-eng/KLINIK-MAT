// app/api/cases/route.ts
import { prismaRO } from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/ratelimit';
import { cache, generateCacheKey } from '@/lib/cache';
import type { CaseWhereClause, CaseQueryResult, CaseListItem } from '@/lib/types/api-types';
import { CaseQuerySchema, validateSchema } from '@/lib/validators';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidar cada minuto
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  try {
    // Rate limiting - límite generoso para lectura pública
    const rateLimit = checkRateLimit(req, RATE_LIMITS.PUBLIC);
    if (!rateLimit.ok) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    // Obtener parámetros de búsqueda con paginación y filtros
    const { searchParams } = new URL(req.url);
    
    // Validar con Zod
    const validationResult = validateSchema(CaseQuerySchema, {
      search: searchParams.get('search'),
      area: searchParams.get('area'),
      difficulty: searchParams.get('difficulty'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: validationResult.error },
        { status: 400 }
      );
    }

    const { search: searchQuery, area, difficulty, page, limit } = validationResult.data;
    const skip = (page - 1) * limit;

    // Query base - solo casos públicos
    const whereClause: CaseWhereClause = { isPublic: true };

    // Filtrar por área (ya validado por Zod)
    if (area && area !== 'all') {
      whereClause.area = area;
    }

    // Filtrar por dificultad (ya validado por Zod, 1-3)
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    // Si hay búsqueda, buscar en título, viñeta y contenido de preguntas
    if (searchQuery && searchQuery.length > 0) {
      whereClause.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { vignette: { contains: searchQuery, mode: 'insensitive' } },
        { summary: { contains: searchQuery, mode: 'insensitive' } },
        // Buscar en texto de preguntas
        {
          questions: {
            some: {
              text: { contains: searchQuery, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    // Generar clave de caché
    const cacheKey = generateCacheKey('cases', {
      search: searchQuery || 'none',
      area: area || 'all',
      difficulty: difficulty || 'all',
      page,
      limit
    });

    // Intentar obtener del caché
    const cached = cache.get<CaseQueryResult>(cacheKey);
    let data: CaseListItem[];
    let total: number;

    if (cached) {
      data = cached.data;
      total = cached.total;
    } else {
      // Si no está en caché, consultar BD
      [data, total] = await Promise.all([
        prismaRO.case.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          select: { 
            id: true, 
            title: true, 
            area: true,
            modulo: true, // Campo para filtros granulares
            difficulty: true, 
            createdAt: true,
            summary: true,
            isPublic: true,
            _count: {
              select: { questions: true }
            }
          },
          skip,
          take: limit,
        }),
        prismaRO.case.count({ where: whereClause })
      ]);

      // Guardar en caché por 3 minutos
      cache.set(cacheKey, { data, total }, 3 * 60 * 1000);
    }

    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({ 
      ok: true, 
      data, 
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      },
      filters: {
        search: searchQuery || null,
        area: area || null,
        difficulty: difficulty || null
      }
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=60, s-maxage=120', // Cache 2 minutos
        'X-RateLimit-Limit': RATE_LIMITS.PUBLIC.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}