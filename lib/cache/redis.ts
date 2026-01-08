// lib/cache/redis.ts
/**
 * RedisCache - Cliente distribuido con Upstash Redis
 * 
 * Ventajas sobre MemoryCache:
 * - ✅ Distribuido (múltiples instancias comparten caché)
 * - ✅ Persistente (sobrevive a reinicios)
 * - ✅ Edge-ready (funciona en edge runtime)
 * - ✅ Auto-eviction con TTL nativo
 * - ✅ No limita memoria del servidor
 * 
 * Setup en Upstash (console.upstash.com):
 * 1. Crear database Redis
 * 2. Copiar UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN
 * 3. Agregar a .env.local y Vercel
 */

import { Redis } from '@upstash/redis';

interface CacheStats {
  size: number;
  maxEntries: number;
  hitRate: number;
  hits: number;
  misses: number;
}

class RedisCache {
  private client: Redis | null = null;
  private hitCount: number = 0;
  private missCount: number = 0;
  private isEnabled: boolean = false;

  constructor() {
    // Verificar si tenemos credenciales de Upstash
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      try {
        this.client = new Redis({
          url,
          token,
        });
        this.isEnabled = true;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[RedisCache] ✅ Connected to Upstash Redis');
        }
      } catch (error) {
        console.error('[RedisCache] ❌ Failed to connect:', error);
        this.isEnabled = false;
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[RedisCache] ⚠️  No Upstash credentials found, caching disabled');
      }
      this.isEnabled = false;
    }
  }

  /**
   * Verificar si Redis está disponible
   */
  isReady(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * Obtener valor del caché
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      this.missCount++;
      return null;
    }

    try {
      const data = await this.client!.get<T>(key);
      
      if (data === null) {
        this.missCount++;
        return null;
      }

      this.hitCount++;
      return data;
    } catch (error) {
      console.error('[RedisCache] Get error:', error);
      this.missCount++;
      return null;
    }
  }

  /**
   * Guardar valor en caché
   * @param ttl Time to live en milisegundos
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      if (ttl) {
        // TTL en segundos para Redis
        const ttlSeconds = Math.ceil(ttl / 1000);
        await this.client!.setex(key, ttlSeconds, data);
      } else {
        await this.client!.set(key, data);
      }
    } catch (error) {
      console.error('[RedisCache] Set error:', error);
    }
  }

  /**
   * Eliminar valor del caché
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client!.del(key);
      return result > 0;
    } catch (error) {
      console.error('[RedisCache] Delete error:', error);
      return false;
    }
  }

  /**
   * Limpiar todo el caché (usar con precaución)
   */
  async clear(): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      await this.client!.flushdb();
    } catch (error) {
      console.error('[RedisCache] Clear error:', error);
    }
  }

  /**
   * Obtener estadísticas del caché
   */
  async stats(): Promise<CacheStats> {
    const total = this.hitCount + this.missCount;
    
    let size = 0;
    if (this.isReady()) {
      try {
        size = await this.client!.dbsize();
      } catch (error) {
        console.error('[RedisCache] Stats error:', error);
      }
    }

    return {
      size,
      maxEntries: -1, // Redis no tiene límite fijo
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      hits: this.hitCount,
      misses: this.missCount,
    };
  }

  /**
   * Obtener múltiples valores (optimización)
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isReady() || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const results = await this.client!.mget<T[]>(...keys);
      return results.map(r => r ?? null);
    } catch (error) {
      console.error('[RedisCache] Mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Establecer múltiples valores (optimización)
   */
  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    if (!this.isReady() || entries.length === 0) {
      return;
    }

    try {
      // Redis mset no soporta TTL individual, hacemos set individual
      await Promise.all(
        entries.map(({ key, value, ttl }) => this.set(key, value, ttl))
      );
    } catch (error) {
      console.error('[RedisCache] Mset error:', error);
    }
  }

  /**
   * Incrementar contador (útil para rate limiting)
   */
  async incr(key: string, ttl?: number): Promise<number> {
    if (!this.isReady()) {
      return 0;
    }

    try {
      const value = await this.client!.incr(key);
      
      // Establecer TTL si es la primera vez
      if (value === 1 && ttl) {
        const ttlSeconds = Math.ceil(ttl / 1000);
        await this.client!.expire(key, ttlSeconds);
      }
      
      return value;
    } catch (error) {
      console.error('[RedisCache] Incr error:', error);
      return 0;
    }
  }

  /**
   * Verificar si una clave existe
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client!.exists(key);
      return result > 0;
    } catch (error) {
      console.error('[RedisCache] Exists error:', error);
      return false;
    }
  }
}

// Instancia singleton
export const redisCache = new RedisCache();
