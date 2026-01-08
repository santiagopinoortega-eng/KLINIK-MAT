# 🚀 Redis Cache Setup con Upstash

## Resumen

Migración de **MemoryCache** (en memoria) a **RedisCache** (distribuido) usando Upstash para:
- ✅ Caché compartido entre múltiples instancias (serverless)
- ✅ Persistencia entre reinicios
- ✅ Edge-ready (funciona en edge runtime)
- ✅ Sin limitar memoria del servidor
- ✅ Fallback automático a MemoryCache si Redis no disponible

---

## 1. Crear cuenta en Upstash

1. Ir a [console.upstash.com](https://console.upstash.com)
2. Crear cuenta (gratis con 10K comandos/día)
3. Crear nueva Redis Database

**Configuración recomendada:**
- **Name:** `klinikmat-cache` (o el nombre que prefieras)
- **Region:** Elegir región más cercana a tu servidor (ej: `us-east-1` para Vercel US)
- **Type:** `Regional` (más barato) o `Global` (baja latencia mundial)
- **Eviction:** `allkeys-lru` (elimina claves menos usadas automáticamente)

---

## 2. Copiar credenciales

Una vez creada la database, copiar las credenciales:

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxxxxxxxxxxxxxxxxxx
```

---

## 3. Configurar variables de entorno

### Desarrollo (`.env.local`)

```bash
# Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Producción (Vercel)

1. Ir a tu proyecto en Vercel → Settings → Environment Variables
2. Agregar las dos variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Seleccionar **Production**, **Preview**, **Development**
4. Hacer redeploy para aplicar cambios

---

## 4. Verificar funcionamiento

### En desarrollo:

```bash
npm run dev
```

Deberías ver en la consola:
```
[Cache] 🚀 Using Redis (Upstash)
[RedisCache] ✅ Connected to Upstash Redis
```

Si no tienes las credenciales configuradas, verás:
```
[Cache] 💾 Using Memory (Fallback)
[RedisCache] ⚠️  No Upstash credentials found, caching disabled
```

### Verificar en producción:

Después del deploy, visitar `/api/cases` varias veces:
- Primera request: `fromCache: false`
- Siguientes requests: `fromCache: true`

---

## 5. Arquitectura implementada

### Estructura de archivos:

```
lib/
├── cache.ts                # Selector automático (Redis o Memory)
├── cache/
│   ├── redis.ts           # RedisCache con Upstash
│   └── memory.ts          # MemoryCache fallback
```

### Estrategia automática:

```typescript
// lib/cache.ts
import { redisCache } from './cache/redis';
import { memoryCache } from './cache/memory';

// Selección automática según disponibilidad
const cache = redisCache.isReady() 
  ? redisCache 
  : new MemoryCacheAdapter();

export { cache };
```

### TTL configurados:

```typescript
export const CACHE_TTL = {
  CASES: 15 * 60 * 1000,         // 15 minutos (casos raramente cambian)
  RESULTS: 5 * 60 * 1000,        // 5 minutos (resultados de usuario)
  PUBMED: 24 * 60 * 60 * 1000,   // 24 horas (literature no cambia)
  USER_PROFILE: 10 * 60 * 1000,  // 10 minutos (perfil de usuario)
  SHORT: 60 * 1000,              // 1 minuto (datos volátiles)
};
```

---

## 6. Uso en código

### Cache básico:

```typescript
import { cache, CACHE_TTL } from '@/lib/cache';

// GET
const data = await cache.get<MyType>('my-key');

// SET con TTL
await cache.set('my-key', data, CACHE_TTL.CASES);

// DELETE
await cache.delete('my-key');
```

### Cache wrapper (get or set):

```typescript
import { cacheWrapper, CACHE_TTL } from '@/lib/cache';

const cases = await cacheWrapper(
  'cases:all',
  async () => prisma.caso.findMany(),
  CACHE_TTL.CASES
);
```

### Operaciones batch (Redis optimizado):

```typescript
// MGET - Obtener múltiples valores
const [user, profile, stats] = await cache.mget<[User, Profile, Stats]>([
  'user:123',
  'profile:123',
  'stats:123'
]);

// MSET - Establecer múltiples valores
await cache.mset([
  { key: 'user:123', value: user, ttl: CACHE_TTL.USER_PROFILE },
  { key: 'profile:123', value: profile, ttl: CACHE_TTL.USER_PROFILE },
]);

// INCR - Incrementar contador (rate limiting)
const requests = await cache.incr('rate:user:123', 60 * 1000); // TTL 1 min
if (requests > 10) {
  throw new RateLimitError();
}
```

---

## 7. Estadísticas de caché

### Endpoint de monitoreo (opcional):

```typescript
// app/api/cache/stats/route.ts
import { cache } from '@/lib/cache';

export async function GET() {
  const stats = await cache.stats();
  
  return Response.json({
    ...stats,
    hitRateFormatted: `${stats.hitRate.toFixed(2)}%`,
    efficiency: stats.hitRate > 70 ? 'excellent' : 'good'
  });
}
```

Respuesta ejemplo:
```json
{
  "size": 245,
  "maxEntries": -1,
  "hitRate": 78.5,
  "hits": 1250,
  "misses": 342,
  "hitRateFormatted": "78.50%",
  "efficiency": "excellent"
}
```

---

## 8. Migración desde MemoryCache

### Antes (MemoryCache):

```typescript
import { cache } from '@/lib/cache';

// Síncrono
const data = cache.get('key');
cache.set('key', data);
```

### Después (RedisCache):

```typescript
import { cache } from '@/lib/cache';

// Asíncrono (funciona con ambos)
const data = await cache.get('key');
await cache.set('key', data);
```

**Nota:** El código anterior sigue funcionando con MemoryCache como fallback.

---

## 9. Costos y límites

### Plan Free de Upstash:

- ✅ 10,000 comandos/día
- ✅ 256 MB RAM
- ✅ Sin tarjeta de crédito
- ✅ Perfecto para desarrollo y staging

### Plan Pro ($10/mes):

- ✅ 100,000 comandos/día
- ✅ 1 GB RAM
- ✅ 99.99% uptime SLA
- ✅ Recomendado para producción

### Estimar comandos:

```
100 usuarios activos × 50 requests/día × 2 comandos (get+set) = 10,000 comandos/día ✅
```

Para 1,000+ usuarios activos considerar plan Pro.

---

## 10. Troubleshooting

### Error: "UPSTASH_REDIS_REST_URL is not defined"

**Solución:** Verificar que las variables estén en `.env.local` y reiniciar `npm run dev`.

### Cache siempre retorna null

**Verificar:**
1. Credenciales correctas en Upstash dashboard
2. Database activa (no pausada)
3. Token tiene permisos correctos

### Hit rate muy bajo (<50%)

**Causas comunes:**
- TTL muy corto (incrementar)
- Claves de caché no consistentes (usar `generateCacheKey`)
- Datos cambian frecuentemente (revisar estrategia de invalidación)

### Latencia alta (>100ms)

**Soluciones:**
- Cambiar región de Upstash más cercana al servidor
- Usar plan Global para latencia <50ms mundial
- Considerar MemoryCache para hot paths

---

## 11. Próximos pasos

### Cache invalidation inteligente:

```typescript
// Invalidar caché cuando se crea un nuevo caso
await prisma.caso.create({ data: newCase });
await cache.delete('cases:all'); // Invalidar lista
```

### Tags para invalidación masiva:

```typescript
// Usar prefijos para invalidar grupos
await cache.delete('cases:*');     // Todos los casos
await cache.delete('user:123:*');  // Todo del usuario 123
```

### Monitoring con Upstash:

Dashboard de Upstash muestra:
- Comandos ejecutados
- Latencia promedio
- Uso de memoria
- Claves más accedidas

---

## 🎉 Implementación completada

Redis Cache está listo. Ventajas logradas:

- ✅ **Distribuido:** Múltiples instancias comparten caché
- ✅ **Persistente:** Sobrevive a reinicios
- ✅ **Escalable:** Redis maneja millones de operaciones
- ✅ **Edge-ready:** Funciona en edge runtime de Vercel
- ✅ **Fallback automático:** MemoryCache si Redis no disponible
- ✅ **Zero downtime:** Migración sin interrupciones

**Hit rate esperado:** 70-85% (depende del uso)  
**Latencia esperada:** <50ms (Redis) | <1ms (Memory)

---

## Referencias

- [Upstash Documentation](https://docs.upstash.com/redis)
- [Next.js Data Cache](https://nextjs.org/docs/app/building-your-application/caching)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
