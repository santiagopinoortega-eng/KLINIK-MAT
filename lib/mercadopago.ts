// lib/mercadopago.ts
/**
 * Configuración y cliente de Mercado Pago
 * 
 * Documentación oficial:
 * - https://www.mercadopago.com.ar/developers/es/docs
 * - SDK: https://github.com/mercadopago/sdk-nodejs
 */

import { MercadoPagoConfig, Payment, Preference, PreApproval } from 'mercadopago';

// Validar que las credenciales existan
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables');
}

// Inicializar cliente de Mercado Pago
export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: process.env.MERCADOPAGO_IDEMPOTENCY_KEY,
  },
});

// Clientes específicos para cada recurso
export const paymentClient = new Payment(mercadoPagoClient);
export const preferenceClient = new Preference(mercadoPagoClient);
export const preApprovalClient = new PreApproval(mercadoPagoClient);

// URLs de retorno (configurables por ambiente)
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://klinikmat.cl';

export const MERCADOPAGO_URLS = {
  success: `${BASE_URL}/subscription/success`,
  failure: `${BASE_URL}/subscription/failure`,
  pending: `${BASE_URL}/subscription/pending`,
  webhook: `${BASE_URL}/api/webhooks/mercadopago`,
} as const;

// Tipos de eventos de webhook que procesamos
export const WEBHOOK_TOPICS = {
  PAYMENT: 'payment',
  SUBSCRIPTION: 'subscription_preapproval',
  SUBSCRIPTION_AUTHORIZED_PAYMENT: 'subscription_authorized_payment',
  PLAN: 'subscription_preapproval_plan',
} as const;

// Estados de pago
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  AUTHORIZED: 'authorized',
  IN_PROCESS: 'in_process',
  IN_MEDIATION: 'in_mediation',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHARGED_BACK: 'charged_back',
} as const;

// Estados de suscripción
export const SUBSCRIPTION_STATUS = {
  AUTHORIZED: 'authorized',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
} as const;

/**
 * Mapeo de estados de MP a estados de Prisma
 */
export function mapMercadoPagoPaymentStatus(
  mpStatus: string
): 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED' {
  switch (mpStatus) {
    case PAYMENT_STATUS.APPROVED:
    case PAYMENT_STATUS.AUTHORIZED:
      return 'APPROVED';
    case PAYMENT_STATUS.PENDING:
    case PAYMENT_STATUS.IN_PROCESS:
      return 'PENDING';
    case PAYMENT_STATUS.REJECTED:
      return 'REJECTED';
    case PAYMENT_STATUS.CANCELLED:
      return 'CANCELLED';
    case PAYMENT_STATUS.REFUNDED:
    case PAYMENT_STATUS.CHARGED_BACK:
      return 'REFUNDED';
    default:
      return 'PENDING';
  }
}

export function mapMercadoPagoSubscriptionStatus(
  mpStatus: string
): 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'EXPIRED' {
  switch (mpStatus) {
    case SUBSCRIPTION_STATUS.AUTHORIZED:
      return 'ACTIVE';
    case SUBSCRIPTION_STATUS.PAUSED:
      return 'PAUSED';
    case SUBSCRIPTION_STATUS.CANCELLED:
      return 'CANCELED';
    default:
      return 'EXPIRED';
  }
}

/**
 * Verifica la firma del webhook de Mercado Pago
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/your-integrations/notifications/webhooks
 */
export function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  if (!process.env.MERCADOPAGO_WEBHOOK_SECRET) {
    console.warn('⚠️  MERCADOPAGO_WEBHOOK_SECRET not set, skipping signature verification');
    return true; // En desarrollo podemos permitir sin firma
  }

  try {
    const crypto = require('crypto');
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    
    // Template: x-signature = ts={timestamp},v1={signature}
    const parts = xSignature.split(',');
    const ts = parts.find((p) => p.startsWith('ts='))?.split('=')[1];
    const signature = parts.find((p) => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !signature) {
      console.error('❌ Invalid x-signature format');
      return false;
    }

    // Crear el hash esperado
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error);
    return false;
  }
}

// Exportar tipos útiles
export type MercadoPagoWebhookEvent = {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
};
