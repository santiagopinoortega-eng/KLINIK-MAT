# 🧪 Guía de Pruebas - Mercado Pago

## 1️⃣ Acceder a la página de pricing

```
https://klinikmat.cl/pricing
```

## 2️⃣ Tarjetas de Prueba de Mercado Pago

### ✅ Pago APROBADO
- **Número:** `5031 7557 3453 0604`
- **Nombre:** `APRO`
- **CVV:** `123`
- **Vencimiento:** Cualquier fecha futura (ej: 12/25)
- **Resultado:** Pago aprobado inmediatamente

### ❌ Pago RECHAZADO
- **Número:** `5031 4332 1540 6351`
- **Nombre:** `OTHE`
- **CVV:** `123`
- **Vencimiento:** Cualquier fecha futura
- **Resultado:** Pago rechazado, redirige a `/subscription/failure`

### ⏳ Pago PENDIENTE
- **Número:** `5031 7557 3453 0604`
- **Nombre:** `PEND`
- **CVV:** `123`
- **Vencimiento:** Cualquier fecha futura
- **Resultado:** Pago pendiente, redirige a `/subscription/pending`

### 🔒 Seguridad (requiere verificación)
- **Número:** `5031 7557 3453 0604`
- **Nombre:** `CALL`
- **CVV:** `123`
- **Vencimiento:** Cualquier fecha futura
- **Resultado:** Requiere autorización

## 3️⃣ Flujo de Prueba Completo

### Paso 1: Crear suscripción
1. Ve a https://klinikmat.cl/pricing
2. Haz clic en "Suscribirse" en el plan **Básico** ($10,000/mes)
3. Deberías ser redirigido a Mercado Pago

### Paso 2: Completar el pago
1. En la página de Mercado Pago, usa la tarjeta de prueba **APROBADO**:
   ```
   Tarjeta: 5031 7557 3453 0604
   Nombre: APRO
   CVV: 123
   Vencimiento: 12/25
   ```
2. Completa el pago
3. Deberías ser redirigido a `/subscription/success?payment_id=XXX`

### Paso 3: Verificar en la base de datos
```sql
-- Ver el pago creado
SELECT * FROM "Payment" 
WHERE "userId" = 'tu_user_id' 
ORDER BY "createdAt" DESC LIMIT 1;

-- Ver la suscripción activada
SELECT * FROM "Subscription" 
WHERE "userId" = 'tu_user_id' 
ORDER BY "createdAt" DESC LIMIT 1;

-- Ver el webhook procesado
SELECT * FROM "WebhookLog" 
WHERE "source" = 'mercadopago' 
ORDER BY "createdAt" DESC LIMIT 5;
```

## 4️⃣ Verificar Webhooks

### Ver logs de webhooks en Vercel
```bash
# En Vercel Dashboard
Logs → Runtime Logs → Buscar "[MP WEBHOOK]"
```

Deberías ver:
```
✅ [MP WEBHOOK] Signature verified
✅ [MP WEBHOOK] Processing payment event
✅ [MP WEBHOOK] Payment approved: 123456789
✅ [MP WEBHOOK] Subscription activated
✅ [MP WEBHOOK] Processed in 234ms
```

### Webhook manualmente (opcional)
Si el webhook no llega automáticamente:

```bash
# Simular webhook desde terminal
curl -X POST https://klinikmat.cl/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -H "x-signature: test" \
  -H "x-request-id: test-123" \
  -d '{
    "type": "payment",
    "action": "payment.updated",
    "data": {
      "id": "PAYMENT_ID_FROM_MP"
    }
  }'
```

## 5️⃣ Probar diferentes escenarios

### A. Pago rechazado
1. Usa tarjeta `5031 4332 1540 6351` (OTHE)
2. Verifica redirección a `/subscription/failure`
3. Confirma que NO se creó suscripción

### B. Trial period
1. Suscríbete al plan Premium (14 días gratis)
2. Verifica que `Subscription.status = 'TRIALING'`
3. Verifica que `Subscription.trialEnd` sea en 14 días

### C. Planes anuales
1. Prueba suscripción anual (15% descuento)
2. Verifica precio correcto ($102,000 o $204,000)

## 6️⃣ Probar Límites de Uso

```bash
# En tu app, verifica límites
const { allowed, limit, used } = await SubscriptionService.checkUsageLimit(
  userId,
  'CASE_COMPLETED'
);

console.log(`Permitido: ${allowed}, Usado: ${used}/${limit}`);
```

### Plan FREE (límite: 10 casos/mes)
1. Completa 9 casos
2. Verifica que el 10° funcione
3. Verifica que el 11° sea bloqueado

### Plan BASIC/PREMIUM (ilimitado)
1. Completa más de 10 casos
2. Verifica que todos funcionen

## 7️⃣ Verificar Features por Plan

```javascript
// Verificar acceso a IA
const hasAI = await SubscriptionService.checkFeatureAccess(userId, 'ai_assistant');
console.log('Acceso IA:', hasAI);

// Plan FREE: false
// Plan PREMIUM: true
```

## 8️⃣ URLs Importantes

- **Pricing:** https://klinikmat.cl/pricing
- **Success:** https://klinikmat.cl/subscription/success
- **Failure:** https://klinikmat.cl/subscription/failure
- **Pending:** https://klinikmat.cl/subscription/pending
- **API Plans:** https://klinikmat.cl/api/subscription/plans
- **API Current:** https://klinikmat.cl/api/subscription/current
- **Webhook:** https://klinikmat.cl/api/webhooks/mercadopago

## 9️⃣ Dashboard de Mercado Pago

Verifica los pagos en:
```
https://www.mercadopago.cl/developers/panel/credentials
```

## 🐛 Troubleshooting

### Webhook no llega
1. Verifica URL en MP Dashboard: `https://klinikmat.cl/api/webhooks/mercadopago`
2. Verifica que el webhook esté activo
3. Revisa logs de Vercel

### Pago aprobado pero no activa suscripción
1. Revisa logs del webhook
2. Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté en Vercel
3. Revisa tabla `WebhookLog` para errores

### Error 401 en API
1. Verifica que estés autenticado con Clerk
2. Revisa que `userId` sea válido

## ✅ Checklist de Prueba

- [ ] Página /pricing carga correctamente
- [ ] Muestra 6 planes (FREE, BASIC, PREMIUM + yearly)
- [ ] Botón "Suscribirse" redirige a Mercado Pago
- [ ] Pago con tarjeta de prueba APRO funciona
- [ ] Redirige a /subscription/success
- [ ] Se crea registro en tabla Payment
- [ ] Se crea registro en tabla Subscription
- [ ] Webhook se procesa correctamente
- [ ] WebhookLog guarda el evento
- [ ] Plan FREE limita a 10 casos/mes
- [ ] Plan PREMIUM permite acceso ilimitado
- [ ] Trial period se registra correctamente
- [ ] Pago rechazado redirige a /failure
- [ ] Plan anual muestra 15% descuento
