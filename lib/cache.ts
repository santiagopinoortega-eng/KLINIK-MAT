// lib/cache.ts
/**
 * Sistema de caché en memoria simple para casos clínicos
 * Ideal para reducir carga de BD en consultas frecuentes
 * Para escalar a Redis en producción, solo cambiar la implementación
 * 
 * 🔥 OPTIMIZACIÓN: TTL inteligente según tipo de dato
 * - Casos clínicos: 15 min (raramente cambian)
 * - Resultados de usuario: 5 min
 * - PubMed búsquedas: 24h (literature no cambia)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number; // Contador de accesos (para LRU mejorado)
}

// TTL preconfigurado según tipo de dato
export const CACHE_TTL = {
  CASES: 15 * 60 * 1000,      // 15 minutos
  RESULTS: 5 * 60 * 1000,     // 5 minutos
  PUBMED: 24 * 60 * 60 * 1000, // 24 horas
  USER_PROFILE: 10 * 60 * 1000, // 10 minutos
  SHORT: 60 * 1000,            // 1 minuto
} as const;

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number; // Time To Live en milisegundos
  private maxEntries: number;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(defaultTTL: number = 5 * 60 * 1000, maxEntries: number = 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxEntries = maxEntries;
  }

  /**
   * Obtener valor del caché
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Verificar si expiró
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // 🔥 OPTIMIZACIÓN: Incrementar hits para LRU mejorado
    entry.hits++;
    this.hitCount++;

    return entry.data as T;
  }

  /**
   * Guardar valor en caché
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    // Si llegamos al límite, eliminar las entradas más antiguas
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
      hits: 0, // Inicializar contador
    });
  }

  /**
   * Eliminar valor del caché
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtener estadísticas del caché
   */
  stats(): { 
    size: number; 
    maxEntries: number; 
    hitRate: number;
    hits: number;
    misses: number;
  } {
    const total = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      hits: this.hitCount,
      misses: this.missCount,
    };
  }

  /**
   * 🔥 OPTIMIZACIÓN: Eliminar las entradas menos usadas (LFU + LRU híbrido)
   * Combina frecuencia de uso (hits) con antigüedad para mejor eviction
   */
  private evictOldest(): void {
    let worstKey: string | null = null;
    let worstScore = Infinity;

    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      // Score = hits / age_in_minutes (priorizamos datos frecuentes y recientes)
      const ageMinutes = (now - entry.timestamp) / 60000 || 1;
      const score = entry.hits / ageMinutes;

      if (score < worstScore) {
        worstScore = score;
        worstKey = key;
      }
    }

    if (worstKey) {
      this.cache.delete(worstKey);
    }
  }

  /**
   * Limpiar entradas expiradas (llamar periódicamente)
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Instancia singleton
export const cache = new MemoryCache(
  5 * 60 * 1000,  // 5 minutos TTL por defecto
  1000             // Máximo 1000 entradas (ajustar según memoria disponible)
);

// Limpiar caché expirado cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = cache.cleanExpired();
    if (cleaned > 0) {
      // Solo debug, no enviar a Sentry
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache] Cleaned ${cleaned} expired entries`);
      }
    }
  }, 10 * 60 * 1000);
}

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
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Si no está en caché, ejecutar función y guardar resultado
  const data = await fetchFunction();
  cache.set(key, data, ttl);
  return data;
}
