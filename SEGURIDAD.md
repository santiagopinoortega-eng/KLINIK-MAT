# Sistema de Seguridad y Rate Limiting

## Implementación Completa - Diciembre 2025

### 📋 Resumen

Sistema de seguridad multicapa implementado para proteger la plataforma KLINIK-MAT contra ataques comunes y prevenir abuso de recursos.

---

## 🛡️ Componentes Implementados

### 1. **Rate Limiting** (`lib/ratelimit.ts`)

Protección contra abuso de API mediante límites configurables por tipo de endpoint.

#### Configuración

```typescript
export const RATE_LIMITS = {
  PUBLIC: { windowMs: 60_000, maxRequests: 100 },        // 100 req/min - APIs públicas
  AUTHENTICATED: { windowMs: 60_000, maxRequests: 60 },  // 60 req/min - APIs autenticadas
  WRITE: { windowMs: 60_000, maxRequests: 30 },          // 30 req/min - Operaciones de escritura
  AUTH: { windowMs: 300_000, maxRequests: 5 },           // 5 req/5min - Login/signup (anti brute-force)
  RESULTS: { windowMs: 60_000, maxRequests: 20 },        // 20 req/min - Guardar resultados
}
```

#### Características

- ✅ **In-memory storage** con `globalThis` (persiste en serverless)
- ✅ **Limpieza automática** de buckets expirados (1% de requests)
- ✅ **Rate limiting por IP** y **por usuario autenticado**
- ✅ **Headers estándar**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`
- ✅ **Logging automático** de violaciones con Sentry

#### Uso en APIs

```typescript
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(req, RATE_LIMITS.RESULTS);
  if (!rateLimit.ok) {
    return createRateLimitResponse(rateLimit.resetAt);
  }
  // ... lógica del endpoint
}
```

#### APIs Protegidas

- ✅ `/api/results` (POST) - 20 req/min
- ✅ `/api/profile` (GET/PATCH) - 60/30 req/min
- ✅ `/api/cases` (GET) - 100 req/min
- ✅ `/api/cases/[id]` (GET) - 100 req/min

---

### 2. **Input Sanitization** (`lib/sanitize.ts`)

Validación y limpieza de todos los inputs para prevenir XSS, SQL injection, y NoSQL injection.

#### Funciones Principales

| Función | Propósito |
|---------|-----------|
| `sanitizeString()` | Remueve HTML, limita longitud |
| `sanitizeEmail()` | Valida formato email |
| `sanitizeNumber()` | Valida rango numérico |
| `sanitizeCaseId()` | Valida UUID v4 |
| `sanitizeEnum()` | Valida valores permitidos |
| `sanitizeObject()` | Valida schema completo |

#### Ejemplo de Uso

```typescript
const sanitized = sanitizeObject<{
  caseId: string;
  score: number;
  mode?: 'study' | 'timed' | 'exam';
}>(body, {
  caseId: { type: 'caseId', required: true },
  score: { type: 'number', required: true, min: 0 },
  mode: { 
    type: 'enum', 
    allowedValues: ['study', 'timed', 'exam'] 
  },
});
```

#### Protecciones Implementadas

- ✅ **XSS**: Remoción de tags HTML y caracteres peligrosos
- ✅ **NoSQL Injection**: Filtrado de operadores Mongo (`$where`, `$regex`)
- ✅ **Type Coercion**: Validación estricta de tipos
- ✅ **Length Limits**: Prevención de ataques de payload grande
- ✅ **Enum Validation**: Solo valores permitidos

---

### 3. **CSRF Protection** (`lib/csrf.ts`)

Protección contra Cross-Site Request Forgery usando Double Submit Cookie pattern.

#### Flujo de Validación

1. **Server**: Genera token y lo guarda en cookie `httpOnly`
2. **Client**: Lee cookie y envía token en header `x-csrf-token`
3. **Server**: Valida que cookie === header (timing-safe)

#### Uso en API Routes

```typescript
import { requireCsrfToken } from '@/lib/csrf';

export async function POST(req: Request) {
  const csrfError = await requireCsrfToken(req);
  if (csrfError) return csrfError;
  
  // ... lógica protegida
}
```

#### Uso en Cliente

```typescript
import { getCsrfTokenFromCookie } from '@/lib/csrf';

const token = getCsrfTokenFromCookie();
fetch('/api/results', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': token,
  },
  body: JSON.stringify(data),
});
```

#### Características

- ✅ **Timing-safe comparison** (previene timing attacks)
- ✅ **httpOnly cookies** (no accesibles desde JS malicioso)
- ✅ **SameSite=strict** en producción
- ✅ **Auto-validación** en POST/PUT/PATCH/DELETE
- ✅ **24h expiration** automática

---

## 🚀 Implementación en Producción

### Next.js + Vercel

El sistema actual funciona en **desarrollo y producción single-region**:

- ✅ Rate limiting in-memory persiste con `globalThis`
- ✅ Funciona en Vercel serverless functions
- ✅ CSRF protection funciona con Next.js cookies

### Upgrade Recomendado para Multi-Region

Para deployment multi-región con Vercel, considera:

#### Opción 1: Upstash Redis (Recomendado)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
});
```

**Pros:**
- ✅ Funciona en todas las regiones de Vercel
- ✅ Pricing: 10,000 comandos gratis/día
- ✅ Latencia: <1ms desde edge

#### Opción 2: Vercel KV

```typescript
import { kv } from '@vercel/kv';

const count = await kv.incr(`ratelimit:${ip}`);
await kv.expire(`ratelimit:${ip}`, 60);
```

**Pros:**
- ✅ Integrado con Vercel
- ✅ 30,000 comandos gratis/mes

---

## 📊 Monitoreo

### Logs Automáticos

Todas las violaciones de seguridad se loguean automáticamente:

```typescript
// Rate limit exceeded
logger.warn('Rate limit exceeded', { ip, limit, window });

// CSRF token inválido (retorna 403 directamente)
```

### Métricas en Sentry

- Total de rate limits por endpoint
- IPs bloqueadas frecuentemente
- Patrones de ataque detectados

---

## 🧪 Testing

### Manual Testing - Rate Limiting

```bash
# Test rate limit (debería bloquear después de 20 requests)
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/results \
    -H "Content-Type: application/json" \
    -d '{"caseId":"test","caseTitle":"Test","score":10,"totalPoints":10}'
  echo "Request $i"
done
```

### Manual Testing - Input Sanitization

```bash
# Test XSS prevention
curl -X POST http://localhost:3000/api/results \
  -H "Content-Type: application/json" \
  -d '{"caseId":"test","caseTitle":"<script>alert(1)</script>","score":10,"totalPoints":10}'
# Debería sanitizar el título y remover el tag <script>
```

### Automated Tests

```bash
npm test lib/sanitize
npm test lib/ratelimit
```

---

## 📋 Checklist de Seguridad

- [x] Rate limiting en todas las APIs de escritura
- [x] Input sanitization en `/api/results`
- [x] CSRF protection implementado (listo para usar)
- [x] XSS prevention en todos los strings
- [x] SQL/NoSQL injection prevention
- [x] Error logging con Sentry
- [ ] CSRF aplicado en todas las mutaciones (próximo paso)
- [ ] Upgrade a Redis para multi-region (cuando escale)
- [ ] Honeypot fields en forms (anti-bot)
- [ ] reCAPTCHA en signup (anti-bot)

---

## 🔐 Mejores Prácticas

1. **Rate Limiting**: Ajustar límites según patrones de uso reales
2. **Sanitization**: Validar en el servidor, nunca confiar en el cliente
3. **CSRF**: Aplicar en TODAS las mutaciones (POST/PUT/PATCH/DELETE)
4. **Monitoring**: Revisar Sentry semanalmente para patrones sospechosos
5. **Updates**: Mantener dependencias de seguridad actualizadas

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [CSRF Protection](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
