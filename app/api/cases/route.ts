// app/api/cases/route.ts
import { prismaRO } from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  try {
    // Rate limiting - límite generoso para lectura pública
    const rateLimit = checkRateLimit(req, RATE_LIMITS.PUBLIC);
    if (!rateLimit.ok) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('search')?.trim().toLowerCase();

    // Query base
    let whereClause: any = {};

    // Si hay búsqueda, buscar en título, viñeta y contenido de preguntas
    if (searchQuery && searchQuery.length > 0) {
      whereClause = {
        OR: [
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
        ]
      };
    }

    const data = await prismaRO.case.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        title: true, 
        area: true, 
        difficulty: true, 
        createdAt: true,
        summary: true,
        vignette: true,
      },
      take: 200,
    });

    return new Response(JSON.stringify({ ok: true, data, query: searchQuery || null }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
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