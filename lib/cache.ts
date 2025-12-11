// lib/cache.ts
/**
 * Sistema de caché en memoria simple para casos clínicos
 * Ideal para reducir carga de BD en consultas frecuentes
 * Para escalar a Redis en producción, solo cambiar la implementación
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number; // Time To Live en milisegundos
  private maxEntries: number;

  constructor(defaultTTL: number = 5 * 60 * 1000, maxEntries: number = 500) {
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
      return null;
    }

    // Verificar si expiró
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

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
  stats(): { size: number; maxEntries: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
    };
  }

  /**
   * Eliminar las entradas más antiguas (LRU simple)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
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
      console.log(`[Cache] Cleaned ${cleaned} expired entries`);
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
