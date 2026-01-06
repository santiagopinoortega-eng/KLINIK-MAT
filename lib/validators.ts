// lib/validators.ts
/**
 * Schemas de validación con Zod para APIs
 * Previene inyección, valida tipos automáticamente
 */

import { z } from 'zod';

// ============================================
// VALIDACIÓN DE QUERIES DE CASOS
// ============================================

export const CaseQuerySchema = z.object({
  search: z.string().max(100).optional().transform(val => val?.trim()),
  area: z.string().max(50).optional(),
  difficulty: z.coerce.number().min(1).max(3).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CaseQuery = z.infer<typeof CaseQuerySchema>;

// ============================================
// VALIDACIÓN DE RESULTS (ENVÍO DE RESPUESTAS)
// ============================================

export const AnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1),
  isCorrect: z.boolean(),
  timeSpent: z.number().min(0).optional(),
});

export const CreateResultSchema = z.object({
  caseId: z.string().min(1),
  answers: z.array(AnswerSchema),
  totalTimeSpent: z.number().min(0),
  score: z.number().min(0),
  percentage: z.number().min(0).max(100),
});

export type CreateResult = z.infer<typeof CreateResultSchema>;

// ============================================
// VALIDACIÓN DE ENGAGEMENT
// ============================================

export const EngagementSchema = z.object({
  caseId: z.string().min(1),
  source: z.enum(['recommendation', 'search', 'browse', 'trending', 'challenge']),
  recommendationGroup: z.enum(['specialty', 'review', 'challenge', 'trending']).optional(),
  action: z.enum(['view', 'click', 'complete', 'favorite']),
  sessionDuration: z.number().min(0).optional(),
});

export type Engagement = z.infer<typeof EngagementSchema>;

// ============================================
// VALIDACIÓN DE PUBMED
// ============================================

export const PubMedQuerySchema = z.object({
  query: z.string().min(1).max(500),
  maxResults: z.coerce.number().min(1).max(50).default(15),
  filters: z.object({
    yearFrom: z.coerce.number().min(1900).max(2100).optional(),
    yearTo: z.coerce.number().min(1900).max(2100).optional(),
  }).optional(),
});

export type PubMedQuery = z.infer<typeof PubMedQuerySchema>;

// ============================================
// VALIDACIÓN DE FAVORITOS
// ============================================

export const AddFavoriteSchema = z.object({
  caseId: z.string().min(1),
});

export const RemoveFavoriteSchema = z.object({
  favoriteId: z.string().min(1),
});

// ============================================
// VALIDACIÓN DE SUBSCRIPTION
// ============================================

export const CreateSubscriptionSchema = z.object({
  planId: z.string().min(1),
  couponCode: z.string().optional(),
});

export const CancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ============================================
// VALIDACIÓN DE MERCADO PAGO WEBHOOK
// ============================================

export const MercadoPagoWebhookSchema = z.object({
  id: z.number(),
  live_mode: z.boolean(),
  type: z.string(),
  date_created: z.string(),
  user_id: z.number().optional(),
  api_version: z.string().optional(),
  action: z.string(),
  data: z.object({
    id: z.string(),
  }),
});

export type MercadoPagoWebhook = z.infer<typeof MercadoPagoWebhookSchema>;

// ============================================
// VALIDACIÓN DE CLERK WEBHOOK
// ============================================

// ============================================
// VALIDACIÓN DE CLERK WEBHOOK
// ============================================

export const ClerkWebhookSchema = z.object({
  type: z.enum([
    'user.created',
    'user.updated',
    'user.deleted',
    'session.created',
    'session.ended',
  ]),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({
      email_address: z.string().email(),
    })).optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    username: z.string().optional(),
    public_metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type ClerkWebhook = z.infer<typeof ClerkWebhookSchema>;

// ============================================
// HELPER: PARSE CON ERROR HANDLING
// ============================================

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validación fallida' };
  }
}

// ============================================
// SAFE PARSE (NO LANZA EXCEPCIÓN)
// ============================================

export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}
