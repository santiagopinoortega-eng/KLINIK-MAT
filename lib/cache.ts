// lib/cache.ts
/**
 * Sistema de caché híbrido: Redis (producción) + Memory (desarrollo)
 * 
 * Estrategia automática:
 * - ✅ Redis (Upstash) si UPSTASH_REDIS_REST_URL está configurado
 * - ✅ Memory como fallback en desarrollo o cuando Redis no disponible
 * 
 * 🔥 OPTIMIZACIÓN: TTL inteligente según tipo de dato
 * - Casos clínicos: 15 min (raramente cambian)
 * - Resultados de usuario: 5 min
 * - PubMed búsquedas: 24h (literature no cambia)
 * 
 * Setup Redis:
 * 1. Crear cuenta en console.upstash.com
 * 2. Crear Redis database
 * 3. Copiar UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN
 * 4. Agregar a .env.local (desarrollo) y Vercel (producción)
 */

import { redisCache } from './cache/redis';
import { memoryCache } from './cache/memory';

// TTL preconfigurado según tipo de dato
export const CACHE_TTL = {
  CASES: 15 * 60 * 1000,         // 15 minutos
  RESULTS: 5 * 60 * 1000,        // 5 minutos
  PUBMED: 24 * 60 * 60 * 1000,   // 24 horas
  USER_PROFILE: 10 * 60 * 1000,  // 10 minutos
  SHORT: 60 * 1000,              // 1 minuto
} as const;

/**
 * Cache Interface - Abstracción para soportar Redis y Memory
 */
interface CacheAdapter {
  get<T>(key: string): Promise<T | null> | T | null;
  set<T>(key: string, data: T, ttl?: number): Promise<void> | void;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  stats(): Promise<any> | any;
}

/**
 * Wrapper para MemoryCache con interfaz async
 */
class MemoryCacheAdapter implements CacheAdapter {
  async get<T>(key: string): Promise<T | null> {
    return memoryCache.get<T>(key);
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    return memoryCache.set(key, data, ttl);
  }

  async delete(key: string): Promise<boolean> {
    return memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    return memoryCache.clear();
  }

  async stats() {
    return memoryCache.stats();
  }
}

/**
 * Seleccionar automáticamente Redis o Memory
 */
function selectCacheAdapter(): CacheAdapter {
  if (redisCache.isReady()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Cache] 🚀 Using Redis (Upstash)');
    }
    return redisCache;
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Cache] 💾 Using Memory (Fallback)');
    }
    return new MemoryCacheAdapter();
  }
}

// Instancia singleton con estrategia automática
export const cache = selectCacheAdapter();

/**
 * Helper para generar claves de caché consistentes
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}

/**
 * Helper para operaciones con caché (get or set)
 */
export async function cacheWrapper<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Intentar obtener del caché
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Si no está en caché, ejecutar función y guardar resultado
  const data = await fetchFunction();
  await cache.set(key, data, ttl);
  return data;
}
