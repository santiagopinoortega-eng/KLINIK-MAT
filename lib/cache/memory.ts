// lib/cache/memory.ts
/**
 * MemoryCache - Fallback cuando Redis no está disponible
 * 
 * Ventajas:
 * - ✅ Sin dependencias externas
 * - ✅ Funciona en desarrollo sin setup
 * - ✅ Zero latency
 * 
 * Desventajas:
 * - ❌ No compartido entre instancias
 * - ❌ Se pierde en reinicios
 * - ❌ Consume memoria del servidor
 * 
 * Uso: Automático como fallback si UPSTASH_REDIS_REST_URL no está configurado
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
}

export class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;
  private maxEntries: number;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(defaultTTL: number = 5 * 60 * 1000, maxEntries: number = 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxEntries = maxEntries;
  }

  /**
   * Obtener valor del caché (síncrono)
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    entry.hits++;
    this.hitCount++;
    return entry.data as T;
  }

  /**
   * Guardar valor en caché (síncrono)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
      hits: 0,
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
   * Eliminar las entradas menos usadas (LFU + LRU híbrido)
   */
  private evictOldest(): void {
    let worstKey: string | null = null;
    let worstScore = Infinity;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
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
   * Limpiar entradas expiradas
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
export const memoryCache = new MemoryCache(
  5 * 60 * 1000,  // 5 minutos TTL
  1000             // Máximo 1000 entradas
);

// Limpiar caché expirado cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = memoryCache.cleanExpired();
    if (cleaned > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[MemoryCache] Cleaned ${cleaned} expired entries`);
    }
  }, 10 * 60 * 1000);
}
