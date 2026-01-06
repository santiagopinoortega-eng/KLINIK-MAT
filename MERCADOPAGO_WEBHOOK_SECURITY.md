# 🔐 CONFIGURACIÓN DE SEGURIDAD - MERCADO PAGO WEBHOOK

## Variable de Entorno Requerida

Para habilitar la verificación de firmas en webhooks de Mercado Pago, debes configurar:

```bash
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_aqui
```

## ¿Dónde obtener el Secret?

1. **Dashboard de Mercado Pago**:
   - Ingresa a https://www.mercadopago.com.ar/developers/
   - Ve a "Tus integraciones" > "Webhooks"
   - Copia el **Webhook Secret** (aparece al crear o editar un webhook)

2. **Vercel (Producción)**:
   ```bash
   vercel env add MERCADOPAGO_WEBHOOK_SECRET production
   # Pegar el secret cuando se solicite
   ```

3. **Local (.env.local)**:
   ```bash
   # .env.local
   MERCADOPAGO_WEBHOOK_SECRET=app-1234567890abcdef
   ```

## ¿Cómo funciona la verificación?

### 1. Mercado Pago envía headers con cada webhook:
```
x-signature: ts=1704470400,v1=a1b2c3d4e5f6...
x-request-id: 550e8400-e29b-41d4-a716-446655440000
```

### 2. Nuestro servidor calcula el hash esperado:
```typescript
// Manifest según documentación MP
const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`;

// HMAC-SHA256
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(manifest)
  .digest('hex');
```

### 3. Comparación segura (timing-safe):
```typescript
const isValid = crypto.timingSafeEqual(
  Buffer.from(receivedSignature, 'hex'),
  Buffer.from(expectedSignature, 'hex')
);
```

## Protección adicional implementada

✅ **Validación de timestamp**: Rechaza webhooks con más de 5 minutos de antigüedad  
✅ **Timing-safe comparison**: Previene timing attacks  
✅ **Auditoría**: Guarda intentos fallidos en `WebhookEvent`  
✅ **Logging estructurado**: Registra todas las verificaciones  

## Comportamiento por ambiente

### Desarrollo (`NODE_ENV=development`):
- Si falta `MERCADOPAGO_WEBHOOK_SECRET`: ⚠️ Advertencia, permite webhook
- Útil para testing local sin configurar MP

### Producción (`NODE_ENV=production`):
- Si falta `MERCADOPAGO_WEBHOOK_SECRET`: 🔴 **RECHAZA TODO**
- **CRÍTICO**: Nunca desplegar a producción sin este secret

## Testing local con ngrok

Para probar webhooks localmente:

```bash
# 1. Instalar ngrok
brew install ngrok  # macOS
# o descargar desde https://ngrok.com/

# 2. Exponer puerto local
ngrok http 3000

# 3. Configurar en MP Dashboard
# URL: https://abc123.ngrok.io/api/webhooks/mercadopago
# Eventos: payment.created, payment.updated

# 4. Copiar el secret y agregarlo a .env.local
MERCADOPAGO_WEBHOOK_SECRET=app-xxx
```

## Logs para debugging

Cuando un webhook falla la verificación, verás:

```
❌ [MP WEBHOOK] Invalid signature - rejecting webhook
❌ Invalid webhook signature {
  received: 'a1b2c3d4e5...',
  expected: 'f6e5d4c3b2...'
}
```

Cuando pasa correctamente:

```
📥 [MP WEBHOOK abc-123] Received: {
  type: 'payment',
  action: 'payment.created',
  dataId: '123456789',
  hasSignature: true
}
✅ Webhook signature verified
```

## Checklist pre-launch

- [ ] `MERCADOPAGO_WEBHOOK_SECRET` configurado en Vercel
- [ ] Webhook registrado en MP Dashboard con URL de producción
- [ ] Secret copiado correctamente (sin espacios)
- [ ] Testeado con al menos 1 pago real en producción
- [ ] Logs de Sentry configurados para alertar sobre fallos de firma

## Referencias

- [Documentación oficial MP - Webhooks](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/your-integrations/notifications/webhooks)
- [Seguridad de webhooks - Best practices](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/security/secure-webhooks)
