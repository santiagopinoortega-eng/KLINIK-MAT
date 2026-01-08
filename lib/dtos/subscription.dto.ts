// lib/dtos/subscription.dto.ts
/**
 * DTOs para endpoints de suscripción
 * Valida datos de entrada para pagos, cancelaciones, y gestión de suscripciones
 */

import { z } from 'zod';

/**
 * POST /api/subscription/create-payment
 * Crear preferencia de pago en Mercado Pago
 */
export const CreatePaymentDto = z.object({
  planId: z.string().uuid('Plan ID debe ser un UUID válido'),
  couponCode: z.string().optional(),
}).strict();

export type CreatePaymentInput = z.infer<typeof CreatePaymentDto>;

/**
 * POST /api/subscription/create-preference
 * Crear preferencia de pago (legacy endpoint)
 */
export const CreatePreferenceDto = z.object({
  planId: z.string().uuid('Plan ID debe ser un UUID válido'),
  couponCode: z.string().optional(),
}).strict();

export type CreatePreferenceInput = z.infer<typeof CreatePreferenceDto>;

/**
 * POST /api/subscription/cancel
 * Cancelar suscripción activa
 */
export const CancelSubscriptionDto = z.object({
  subscriptionId: z.string().uuid('Subscription ID debe ser un UUID válido'),
  reason: z.string().max(500, 'Razón no puede exceder 500 caracteres').optional(),
  immediate: z.boolean().default(false).optional(),
}).strict();

export type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionDto>;

/**
 * DELETE /api/subscription/cancel?subscription_id=xxx
 * Reactivar suscripción cancelada
 */
export const ReactivateSubscriptionQueryDto = z.object({
  subscription_id: z.string().uuid('Subscription ID debe ser un UUID válido'),
});

export type ReactivateSubscriptionQuery = z.infer<typeof ReactivateSubscriptionQueryDto>;

/**
 * GET /api/subscription/payment-status?paymentId=xxx
 * Verificar estado de un pago
 */
export const PaymentStatusQueryDto = z.object({
  paymentId: z.string().min(1, 'Payment ID es requerido'),
  type: z.enum(['payment', 'subscription']).optional(),
});

export type PaymentStatusQuery = z.infer<typeof PaymentStatusQueryDto>;

/**
 * GET /api/subscription/check-access?feature=xxx
 * Verificar acceso a feature por suscripción
 */
export const CheckAccessQueryDto = z.object({
  feature: z.string().min(1, 'Feature name es requerido'),
});

export type CheckAccessQuery = z.infer<typeof CheckAccessQueryDto>;
