# 🚀 IMPLEMENTACIÓN DE CORRECCIONES DE SEGURIDAD

Este documento guía la implementación de las correcciones críticas identificadas en la auditoría de seguridad.

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### 🔴 PASO 1: Agregar tabla de Idempotency Keys

**Tiempo estimado:** 10 minutos

```bash
# 1. Agregar modelo a schema.prisma
```

Editar `prisma/schema.prisma`, agregar al final:

```prisma
model IdempotencyKey {
  id        String   @id @default(cuid())
  key       String   @unique
  response  Json
  createdAt DateTime @default(now())
  expiresAt DateTime

  @@index([expiresAt])
  @@index([createdAt])
  @@map("idempotency_keys")
}
```

```bash
# 2. Crear migración
npx prisma migrate dev --name add_idempotency_keys

# 3. Generar cliente
npx prisma generate
```

---

### 🔴 PASO 2: Implementar CSRF Protection

**Tiempo estimado:** 30 minutos

#### 2.1 Aplicar middleware en endpoints de pago

**Archivo:** `app/api/subscription/process-payment/route.ts`

```typescript
// ANTES
import {
  compose,
  withAuth,
  withRateLimit,
  withValidation,
  withLogging,
} from '@/lib/middleware/api-middleware';

export const POST = compose(
  withAuth,
  withRateLimit({ windowMs: 60_000, maxRequests: 5 }),
  withValidation(CreatePaymentDto),
  withLogging
)(async (req, context) => {
  // ...
});
```

```typescript
// DESPUÉS
import {
  compose,
  withAuth,
  withRateLimit,
  withValidation,
  withLogging,
} from '@/lib/middleware/api-middleware';
import { withStrictCSRF } from '@/lib/middleware/csrf-middleware'; // ✅ NUEVO

export const POST = compose(
  withAuth,
  withStrictCSRF,              // ✅ AGREGAR AQUÍ (después de withAuth)
  withRateLimit({ windowMs: 60_000, maxRequests: 5 }),
  withValidation(CreatePaymentDto),
  withLogging
)(async (req, context) => {
  // ... resto sin cambios
});
```

#### 2.2 Aplicar en otros endpoints críticos

Aplicar la misma modificación en:

- ✅ `app/api/subscription/create-payment/route.ts`
- ✅ `app/api/subscription/create-preference/route.ts`
- ✅ `app/api/subscription/cancel/route.ts`

#### 2.3 Obtener token CSRF en el cliente

**Archivo:** `app/components/MercadoPagoCheckout.tsx`

Agregar al inicio de `initializeMercadoPago`:

```typescript
const initializeMercadoPago = async () => {
  try {
    // ✅ NUEVO: Obtener token CSRF
    const csrfResponse = await fetch('/api/csrf');
    const { token: csrfToken } = await csrfResponse.json();
    
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    // ... resto del código
```

Y modificar el callback onSubmit:

```typescript
onSubmit: async (formData: any) => {
  setProcessing(true);
  try {
    const response = await fetch('/api/subscription/process-payment', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken, // ✅ AGREGAR HEADER
      },
      body: JSON.stringify({
        planId,
        token: formData.token,
        paymentMethodId: formData.payment_method_id,
        issuerId: formData.issuer_id,
        installments: formData.installments,
      }),
    });
    // ... resto sin cambios
  }
}
```

---

### 🔴 PASO 3: Implementar Idempotency

**Tiempo estimado:** 20 minutos

#### 3.1 Aplicar middleware en process-payment

**Archivo:** `app/api/subscription/process-payment/route.ts`

```typescript
import { withIdempotency } from '@/lib/idempotency'; // ✅ NUEVO

export const POST = compose(
  withAuth,
  withStrictCSRF,
  withIdempotency(86400), // ✅ AGREGAR (24 horas)
  withRateLimit({ windowMs: 60_000, maxRequests: 5 }),
  withValidation(CreatePaymentDto),
  withLogging
)(async (req, context) => {
  // ... resto sin cambios
});
```

#### 3.2 Generar idempotency key en el cliente

**Archivo:** `app/components/MercadoPagoCheckout.tsx`

Agregar al inicio del componente:

```typescript
export default function MercadoPagoCheckout({
  planId,
  planName,
  amount,
  onSuccess,
  onError,
  onClose,
}: MercadoPagoCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const initializationRef = useRef(false);
  const brickInstanceRef = useRef<any>(null);
  
  // ✅ NUEVO: Generar idempotency key único para este intento de pago
  const idempotencyKeyRef = useRef(`IDEM_${planId}_${Date.now()}_${Math.random().toString(36).substring(7)}`);
```

Y agregar al fetch:

```typescript
const response = await fetch('/api/subscription/process-payment', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
    'idempotency-key': idempotencyKeyRef.current, // ✅ AGREGAR
  },
  body: JSON.stringify({ ... }),
});
```

---

### 🔴 PASO 4: Sanitizar Inputs

**Tiempo estimado:** 30 minutos

#### 4.1 Aplicar sanitización en process-payment

**Archivo:** `app/api/subscription/process-payment/route.ts`

```typescript
import { sanitizePaymentData, maskSensitivePaymentData } from '@/lib/sanitize-payment'; // ✅ NUEVO

export const POST = compose(
  // ... middlewares
)(async (req, context) => {
  const userId = context.userId!;
  const { planId, token, paymentMethodId, issuerId, installments } = context.body;

  // ... código para obtener user y plan ...

  // ✅ NUEVO: Sanitizar datos antes de enviar a MercadoPago
  const sanitizedData = sanitizePaymentData({
    planDisplayName: plan.displayName,
    payerEmail: payerEmail,
    payerName: user.name || undefined,
    externalReference: `SUB_${userId}_${planId}_${Date.now()}`,
    paymentMethodId,
    issuerId,
    token,
    installments,
    amount: finalPrice,
  });

  console.log('💳 [PROCESS-PAYMENT] Sanitized data:', 
    maskSensitivePaymentData(sanitizedData) // ✅ Log enmascarado
  );

  // Crear pago con datos sanitizados
  const payment = await paymentClient.create({
    body: {
      token: sanitizedData.token,
      payment_method_id: sanitizedData.paymentMethodId,
      issuer_id: sanitizedData.issuerId,
      installments: sanitizedData.installments,
      transaction_amount: sanitizedData.amount,
      description: sanitizedData.description, // ✅ Ya sanitizado
      payer: {
        email: sanitizedData.payerEmail,       // ✅ Ya validado
        identification: {
          type: 'RUT',
          number: '11111111-1',
        },
      },
      external_reference: sanitizedData.externalReference, // ✅ Ya sanitizado
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    },
  });

  // ... resto sin cambios
});
```

---

### 🟠 PASO 5: Tests E2E (Opcional pero recomendado)

**Tiempo estimado:** 2 horas

Crear `__tests__/integration/payment-security.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Payment Security', () => {
  describe('CSRF Protection', () => {
    it('should reject payment without CSRF token', async () => {
      const response = await fetch('http://localhost:3000/api/subscription/process-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // ❌ Sin x-csrf-token
        },
        body: JSON.stringify({ 
          planId: 'test-plan-id',
          token: 'test-token',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('CSRF');
    });

    it('should accept payment with valid CSRF token', async () => {
      // 1. Obtener token
      const csrfRes = await fetch('http://localhost:3000/api/csrf');
      const { token } = await csrfRes.json();

      // 2. Usar token
      const response = await fetch('http://localhost:3000/api/subscription/process-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': token, // ✅ Con token
        },
        body: JSON.stringify({ 
          planId: 'valid-plan-id',
          token: 'valid-mp-token',
        }),
      });

      expect(response.status).not.toBe(403);
    });
  });

  describe('Idempotency', () => {
    it('should prevent duplicate payments', async () => {
      const idempotencyKey = `TEST_${Date.now()}`;

      // Hacer 2 requests idénticos en paralelo
      const [res1, res2] = await Promise.all([
        makePayment({ idempotencyKey }),
        makePayment({ idempotencyKey }),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      // Deben retornar el mismo paymentId
      expect(data1.paymentId).toBe(data2.paymentId);
      
      // Uno debe tener el header de replay
      const hasReplay = 
        res1.headers.get('x-idempotent-replay') === 'true' ||
        res2.headers.get('x-idempotent-replay') === 'true';
      
      expect(hasReplay).toBe(true);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize malicious plan names', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      // Sanitizar
      const sanitized = sanitizePaymentData({
        planDisplayName: maliciousInput,
        payerEmail: 'test@example.com',
        externalReference: 'KMAT_test',
        amount: 5000,
      });

      expect(sanitized.description).not.toContain('<script>');
      expect(sanitized.description).not.toContain('alert');
    });
  });
});
```

Ejecutar tests:

```bash
npm test -- payment-security.test.ts
```

---

## ✅ VALIDACIÓN POST-IMPLEMENTACIÓN

### Checklist de Validación

- [ ] **CSRF Token en cookies**: Inspeccionar DevTools → Application → Cookies → `csrf-token`
- [ ] **CSRF Header en requests**: Network → Headers → `x-csrf-token: ...`
- [ ] **Idempotency Key enviado**: Network → Headers → `idempotency-key: ...`
- [ ] **Sin errores 403**: Pagos procesan correctamente
- [ ] **Double-click no crea 2 pagos**: Verificar en DB
- [ ] **Logs enmascarados**: No se ven emails completos en logs
- [ ] **Tests pasan**: `npm test`

### Prueba Manual

1. **Ir a /pricing**
2. **Abrir DevTools (F12)**
3. **Click en "Suscribirse"**
4. **Verificar en Network tab:**
   - Request a `/api/csrf` (debe existir)
   - Request a `/api/subscription/process-payment` debe incluir:
     - Header `x-csrf-token`
     - Header `idempotency-key`
5. **Completar pago de prueba**
6. **Verificar que no se permita doble-click (botón deshabilitado)**

---

## 🔧 TROUBLESHOOTING

### Error: "Invalid CSRF token"

**Causa:** Cookie no se está enviando correctamente

**Solución:**

```typescript
// Verificar en app/api/csrf/route.ts que las cookies tengan:
response.cookies.set('csrf-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', // ✅ Importante
  path: '/',
});
```

### Error: "Idempotency key already exists"

**Causa:** Re-uso del mismo key

**Solución:** Generar nuevo key en cada intento:

```typescript
// En MercadoPagoCheckout.tsx, usar useRef para guardar el key
const idempotencyKeyRef = useRef(`IDEM_${Date.now()}_${Math.random()}`);
```

### Error: "Invalid email format"

**Causa:** Email no pasa validación

**Solución:** Verificar `sanitizeEmail()` en `lib/sanitize.ts`:

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

---

## 📊 MÉTRICAS DE ÉXITO

### Antes de Implementación

- ✅ CSRF: **NO IMPLEMENTADO** (0/5) ⭐
- ✅ Idempotency: **NO IMPLEMENTADO** (0/5) ⭐⭐
- ✅ Sanitización: **PARCIAL** (2/5) ⭐⭐

### Después de Implementación

- ✅ CSRF: **IMPLEMENTADO** (5/5) ⭐⭐⭐⭐⭐
- ✅ Idempotency: **IMPLEMENTADO** (5/5) ⭐⭐⭐⭐⭐
- ✅ Sanitización: **COMPLETO** (5/5) ⭐⭐⭐⭐⭐

### Score Total

**Antes:** 3.7/5.0  
**Después:** 4.8/5.0 🎉

---

## 📚 REFERENCIAS

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Idempotency in REST APIs](https://stripe.com/docs/api/idempotent_requests)
- [Input Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [MercadoPago Security](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/security)

---

**Tiempo total estimado:** 2-3 horas  
**Complejidad:** Media  
**Riesgo:** Bajo (cambios no-breaking, agregan capas de seguridad)
