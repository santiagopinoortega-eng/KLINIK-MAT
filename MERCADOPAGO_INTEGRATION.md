# Sistema de Suscripciones y Pagos - KLINIK-MAT

## 🎯 Descripción General

Sistema completo de monetización integrado con Mercado Pago para gestionar suscripciones, pagos únicos, cupones de descuento y límites de uso.

## 📊 Planes de Suscripción

### Plan FREE (Gratuito)
- **Precio**: $0/mes
- **Límite**: 10 casos por mes
- **Características**: Acceso básico a casos clínicos
- **Trial**: No aplica

### Plan BASIC ($10,000 CLP/mes)
- **Precio**: $10,000 CLP/mes o $102,000/año (ahorro 15%)
- **Límite**: Ilimitado
- **Características**:
  - Acceso completo a todos los casos
  - Reportes personalizados
  - Estadísticas avanzadas
  - Exportar PDF
  - Modo offline
- **Trial**: 14 días gratis

### Plan PREMIUM ($20,000 CLP/mes)
- **Precio**: $20,000 CLP/mes o $204,000/año (ahorro 15%)
- **Límite**: Ilimitado
- **Características**:
  - Todo lo del Plan Básico
  - ✨ **IA integrada** (Gemini 2.0)
  - 100+ solicitudes de IA/mes
  - Soporte prioritario
  - Casos personalizados
- **Trial**: 14 días gratis

### Plan ENTERPRISE (Institucional)
- **Precio**: Personalizado
- **Límite**: Ilimitado
- **Características**:
  - Todo lo del Premium
  - IA ilimitada
  - Licencias masivas
  - Soporte dedicado
  - Branding personalizado
  - Integración SSO
- **Trial**: 30 días

## 🏗️ Arquitectura de Base de Datos

### Modelos Principales

#### `SubscriptionPlan`
Define los planes disponibles con precios, características y límites.

```typescript
{
  id: string
  name: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE"
  displayName: "Plan Básico"
  price: Decimal
  currency: "CLP" | "USD" | "ARS"
  billingPeriod: "MONTHLY" | "QUARTERLY" | "YEARLY"
  trialDays: number
  features: Json // Características detalladas
  maxCasesPerMonth: number | null
  hasAI: boolean
  mpPreapprovalPlanId: string // ID del plan en MP
}
```

#### `Subscription`
Suscripción activa de un usuario.

```typescript
{
  id: string
  userId: string
  planId: string
  status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED"
  currentPeriodStart: DateTime
  currentPeriodEnd: DateTime
  trialStart: DateTime?
  trialEnd: DateTime?
  mpPreapprovalId: string // Para suscripciones recurrentes
  cancelAtPeriodEnd: boolean
  canceledAt: DateTime?
}
```

#### `Payment`
Registro de todos los pagos (exitosos y fallidos).

```typescript
{
  id: string
  subscriptionId: string?
  userId: string
  amount: Decimal
  currency: "CLP"
  status: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED"
  paymentMethod: "CREDIT_CARD" | "DEBIT_CARD" | etc
  mpPaymentId: string // ID único de Mercado Pago
  mpPreferenceId: string // Para links de pago
  paidAt: DateTime?
}
```

#### `Coupon`
Cupones de descuento con validaciones.

```typescript
{
  id: string
  code: "PROMO2025"
  discountType: "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue: Decimal // 20% o $5000
  maxRedemptions: number?
  validFrom: DateTime
  validUntil: DateTime
  applicablePlans: string[] // ["all"] o IDs específicos
  firstPurchaseOnly: boolean
}
```

#### `UsageRecord`
Rastrea uso de recursos para aplicar límites.

```typescript
{
  id: string
  userId: string
  subscriptionId: string?
  resourceType: "CASE_COMPLETION" | "AI_REQUEST" | "EXPORT_REPORT"
  quantity: number
  billingPeriodStart: DateTime
  billingPeriodEnd: DateTime
}
```

#### `WebhookEvent`
Auditoría completa de webhooks de Mercado Pago.

```typescript
{
  id: string
  eventType: "payment" | "subscription_preapproval"
  action: "created" | "updated"
  payload: Json // Payload completo
  processed: boolean
  processedAt: DateTime?
  processingError: string?
  retryCount: number
}
```

## 🔧 Servicios

### `SubscriptionService`

#### Métodos principales:

**`getActivePlans()`**
Obtiene todos los planes activos ordenados por precio.

**`getUserSubscription(userId)`**
Obtiene la suscripción activa de un usuario.

**`canAccessFeature(userId, feature)`**
Verifica si un usuario puede acceder a una característica.

```typescript
const canUseAI = await SubscriptionService.canAccessFeature(userId, 'aiEnabled');
```

**`checkUsageLimit(userId, resourceType)`**
Verifica si el usuario puede usar un recurso considerando su límite.

```typescript
const { allowed, used, limit } = await SubscriptionService.checkUsageLimit(
  userId,
  'CASE_COMPLETION'
);
```

**`recordUsage(userId, resourceType, quantity)`**
Registra el uso de un recurso.

```typescript
await SubscriptionService.recordUsage(userId, 'AI_REQUEST', 1, {
  model: 'gemini-2.0-flash',
  tokens: 1250,
});
```

**`createSubscriptionPayment(userId, planId, couponCode?)`**
Crea una preferencia de pago en Mercado Pago.

```typescript
const { initPoint, preferenceId } = await SubscriptionService.createSubscriptionPayment(
  userId,
  planId,
  'PROMO2025'
);
// Redirigir usuario a initPoint
```

**`activateSubscription(userId, planId, mpPreapprovalId?)`**
Activa una suscripción después de pago exitoso.

**`cancelSubscription(subscriptionId, cancelAtPeriodEnd, reason?)`**
Cancela una suscripción (inmediato o al final del período).

## 🔄 Flujo de Pago

### 1. Usuario selecciona un plan

```typescript
// app/api/subscription/create-payment/route.ts
const { initPoint } = await SubscriptionService.createSubscriptionPayment(
  userId,
  planId
);

return NextResponse.json({ initPoint });
```

### 2. Usuario completa el pago en Mercado Pago

El usuario es redirigido a `initPoint` donde ingresa sus datos de pago.

### 3. Mercado Pago envía webhook

```typescript
// app/api/webhooks/mercadopago/route.ts
POST /api/webhooks/mercadopago
{
  "type": "payment",
  "data": { "id": "1234567890" },
  "action": "payment.created"
}
```

### 4. Sistema procesa el webhook

- Obtiene datos completos del pago desde MP
- Crea/actualiza registro en `Payment`
- Si el pago fue aprobado, activa la suscripción
- Registra uso de cupón si aplica
- Marca el webhook como procesado

### 5. Usuario es redirigido

```
Success: /subscription/success
Failure: /subscription/failure
Pending: /subscription/pending
```

## 🔐 Seguridad

### Verificación de Firma (Webhooks)

```typescript
// lib/mercadopago.ts
export function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

### Variables de Entorno Requeridas

```env
# TEST (desarrollo)
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789-012345-abcdef...
MERCADOPAGO_PUBLIC_KEY=TEST-abc123-def456...
MERCADOPAGO_WEBHOOK_SECRET=your-secret

# PRODUCTION (Vercel)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-123456789-012345-abcdef...
MERCADOPAGO_PUBLIC_KEY=APP_USR-abc123-def456...
MERCADOPAGO_WEBHOOK_SECRET=your-production-secret
NEXT_PUBLIC_APP_URL=https://klinikmat.cl
```

## 📝 Configuración en Mercado Pago

### 1. Crear aplicación

1. Ir a https://www.mercadopago.cl/developers
2. Crear aplicación
3. Obtener `Access Token` y `Public Key`

### 2. Configurar Webhook

1. Ir a "Tus integraciones" > "Webhook"
2. URL: `https://klinikmat.cl/api/webhooks/mercadopago`
3. Eventos:
   - ✅ Pagos
   - ✅ Suscripciones
   - ✅ Pagos autorizados de suscripción
4. Copiar el `Secret` generado

### 3. Crear planes de suscripción (opcional)

Para suscripciones mensuales automáticas:

```bash
curl -X POST \
  'https://api.mercadopago.com/preapproval_plan' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "reason": "Plan Básico - KLINIK-MAT",
    "auto_recurring": {
      "frequency": 1,
      "frequency_type": "months",
      "transaction_amount": 10000,
      "currency_id": "CLP"
    }
  }'
```

Guardar el `id` retornado en `SubscriptionPlan.mpPreapprovalPlanId`.

## 🧪 Testing

### Test de webhook local

```bash
# Instalar ngrok para exponer localhost
npm install -g ngrok
ngrok http 3000

# URL generada: https://abc123.ngrok.io
# Configurar en MP: https://abc123.ngrok.io/api/webhooks/mercadopago
```

### Test manual de webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.created",
    "data": { "id": "1234567890" },
    "date_created": "2025-12-16T20:00:00Z",
    "user_id": "123456789"
  }'
```

## 📊 Métricas y Análisis

### Queries útiles

**Ingresos del mes**:
```typescript
const revenue = await prisma.payment.aggregate({
  where: {
    status: 'APPROVED',
    paidAt: {
      gte: new Date(2025, 11, 1), // Diciembre 2025
      lt: new Date(2026, 0, 1),
    },
  },
  _sum: { amount: true },
});
```

**Suscripciones activas por plan**:
```typescript
const stats = await prisma.subscription.groupBy({
  by: ['planId'],
  where: { status: { in: ['ACTIVE', 'TRIALING'] } },
  _count: true,
});
```

**Tasa de conversión de trials**:
```typescript
const trials = await prisma.subscription.count({
  where: { trialStart: { not: null } },
});

const converted = await prisma.subscription.count({
  where: {
    trialStart: { not: null },
    status: 'ACTIVE',
  },
});

const conversionRate = (converted / trials) * 100;
```

## 🚀 Próximos Pasos

1. **Crear UI de planes**: Página `/pricing` con cards de planes
2. **Dashboard de usuario**: Ver suscripción actual, historial de pagos
3. **Admin panel**: Gestionar planes, cupones, ver métricas
4. **Emails transaccionales**: Confirmación de pago, vencimiento, etc.
5. **Integración con IA**: Verificar límites antes de solicitudes
6. **Testing end-to-end**: Flujo completo de compra
7. **Modo sandbox**: Testing sin pagos reales

## 📚 Recursos

- [Documentación Mercado Pago](https://www.mercadopago.cl/developers/es/docs)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Webhooks](https://www.mercadopago.cl/developers/es/docs/checkout-api/additional-content/your-integrations/notifications/webhooks)
- [Testing](https://www.mercadopago.cl/developers/es/docs/checkout-api/additional-content/test-your-integration)

## 🐛 Troubleshooting

### Webhook no se recibe

1. Verificar que la URL sea pública (no localhost)
2. Verificar que el endpoint retorne 200
3. Ver logs en Mercado Pago > Notificaciones
4. Verificar firewall/CORS

### Pago aprobado pero suscripción no activa

1. Ver tabla `webhook_events` para errores
2. Verificar `metadata` del pago tiene `user_id` y `plan_id`
3. Ver logs del servidor

### Firma de webhook inválida

1. Verificar `MERCADOPAGO_WEBHOOK_SECRET` en variables de entorno
2. Verificar que el secret coincida con el de Mercado Pago
3. En desarrollo, puedes saltarte la validación

---

**Creado por**: KLINIK-MAT Team  
**Fecha**: Diciembre 2025  
**Versión**: 1.0.0
