// lib/ratelimit.ts
// Rate limiting con diferentes límites según el tipo de endpoint
// En Vercel funciona porque globalThis sobrevive entre invocaciones en el mismo edge/region.

import { logger } from './logger';

type Bucket = { count: number; resetAt: number };

const store: Map<string, Bucket> = (globalThis as any).__rlstore ?? new Map();
(globalThis as any).__rlstore = store;

export type RateLimitConfig = {
  windowMs: number;  // Ventana de tiempo en ms
  maxRequests: number; // Máximo de requests
};

// Diferentes límites según el endpoint
export const RATE_LIMITS = {
  // APIs públicas - límite generoso
  PUBLIC: { windowMs: 60_000, maxRequests: 100 }, // 100 req/min
  
  // APIs autenticadas - límite moderado
  AUTHENTICATED: { windowMs: 60_000, maxRequests: 60 }, // 60 req/min
  
  // APIs de escritura - límite estricto
  WRITE: { windowMs: 60_000, maxRequests: 30 }, // 30 req/min
  
  // Login/signup - muy estricto para prevenir brute force
  AUTH: { windowMs: 300_000, maxRequests: 5 }, // 5 req/5min
  
  // Guardar resultados - moderado
  RESULTS: { windowMs: 60_000, maxRequests: 20 }, // 20 req/min
} as const;

export function checkRateLimit(
  req: Request,
  config: RateLimitConfig = RATE_LIMITS.AUTHENTICATED
) {
  // IP real si existe, si no, usa el header estándar o fallback
  const ip =
    (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()) ||
    (req.headers.get('x-real-ip')) ||
    'unknown';

  const now = Date.now();
  const key = `ip:${ip}:${config.windowMs}`;
  const bucket = store.get(key);

  // Limpiar buckets expirados periódicamente
  if (Math.random() < 0.01) { // 1% de las veces
    cleanupExpiredBuckets();
  }

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { 
      count: 1, 
      resetAt: now + config.windowMs 
    });
    return { 
      ok: true, 
      remaining: config.maxRequests - 1, 
      resetAt: now + config.windowMs 
    };
  }

  if (bucket.count >= config.maxRequests) {
    // Log rate limit exceeded
    logger.warn('Rate limit exceeded', {
      ip,
      limit: config.maxRequests,
      window: config.windowMs,
    });

    return { 
      ok: false, 
      remaining: 0, 
      resetAt: bucket.resetAt 
    };
  }

  bucket.count += 1;
  return { 
    ok: true, 
    remaining: config.maxRequests - bucket.count, 
    resetAt: bucket.resetAt 
  };
}

/**
 * Rate limit específico por usuario autenticado
 */
export function checkUserRateLimit(
  userId: string,
  config: RateLimitConfig = RATE_LIMITS.AUTHENTICATED
) {
  const now = Date.now();
  const key = `user:${userId}:${config.windowMs}`;
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { 
      count: 1, 
      resetAt: now + config.windowMs 
    });
    return { 
      ok: true, 
      remaining: config.maxRequests - 1, 
      resetAt: now + config.windowMs 
    };
  }

  if (bucket.count >= config.maxRequests) {
    logger.warn('User rate limit exceeded', {
      userId,
      limit: config.maxRequests,
    });

    return { 
      ok: false, 
      remaining: 0, 
      resetAt: bucket.resetAt 
    };
  }

  bucket.count += 1;
  return { 
    ok: true, 
    remaining: config.maxRequests - bucket.count, 
    resetAt: bucket.resetAt 
  };
}

/**
 * Limpiar buckets expirados para evitar memory leak
 */
function cleanupExpiredBuckets() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug(`Cleaned ${cleaned} expired rate limit buckets`);
  }
}

/**
 * Helper para crear respuesta de rate limit exceeded
 */
export function createRateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Demasiados intentos. Por favor espera un momento antes de intentar nuevamente.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  );
}