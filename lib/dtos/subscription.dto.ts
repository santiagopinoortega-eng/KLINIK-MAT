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
 * DTO para engagement metrics
 * POST /api/engagement
 */
export const CreateEngagementDto = z.object({
  caseId: z.string().uuid('Case ID debe ser un UUID válido'),
  source: z.enum(['recommendation', 'search', 'direct', 'favorite']),
  recommendationGroup: z.string().max(100).optional(),
  action: z.enum(['view', 'start', 'complete', 'favorite', 'share']),
  sessionDuration: z.number().int().min(0).max(86400).optional(), // Max 24 hours
}).strict();

export type CreateEngagementInput = z.infer<typeof CreateEngagementDto>;

/**
 * DTO para query de engagement metrics
 * GET /api/engagement
 */
export const GetEngagementQueryDto = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  source: z.enum(['recommendation', 'search', 'direct', 'favorite']).optional(),
});

export type GetEngagementQuery = z.infer<typeof GetEngagementQueryDto>;

/**
 * DTO para búsqueda en PubMed
 * POST /api/pubmed/search
 */
export const PubMedSearchDto = z.object({
  query: z.string().min(1, 'Query es requerido').max(500, 'Query muy largo'),
  maxResults: z.number().int().min(1).max(50).default(15),
  filters: z.object({
    yearFrom: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
    yearTo: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
    articleType: z.string().max(50).optional(),
  }).optional(),
}).strict();

export type PubMedSearchInput = z.infer<typeof PubMedSearchDto>;

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
