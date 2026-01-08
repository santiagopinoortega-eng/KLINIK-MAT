// app/api/cases/route.ts
import { NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { compose, withRateLimit, withLogging, withQueryValidation } from '@/lib/middleware/api-middleware';
import { CasoService } from '@/services/caso.service';
import { GetCasesQueryDto } from '@/lib/dtos/case.dto';
import { generateCacheKey, cache } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidar cada minuto
export const fetchCache = 'force-no-store';

export const GET = compose(
  withRateLimit(RATE_LIMITS.PUBLIC),
  withQueryValidation(GetCasesQueryDto),
  withLogging
)(async (req, context) => {
  const query = context.query;
  const { search, area, difficulty, page = 1, limit = 20 } = query;

  // Generar clave de caché
  const cacheKey = generateCacheKey('cases', {
    search: search || 'none',
    area: area || 'all',
    difficulty: difficulty || 'all',
    page,
    limit
  });

  // Intentar obtener del caché (async)
  const cached = await cache.get(cacheKey);
  if (cached) {
    return NextResponse.json({
      success: true,
      ...cached,
      fromCache: true
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=120',
      }
    });
  }

  // Si no hay cache, obtener de servicio
  const result = await CasoService.getCases({
    search,
    area: area !== 'all' ? area : undefined,
    difficulty,
    page,
    limit
  });

  // Guardar en caché por 3 minutos (async)
  await cache.set(cacheKey, result, 3 * 60 * 1000);

  return NextResponse.json({
    success: true,
    ...result,
    fromCache: false
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=120',
    }
  });
});