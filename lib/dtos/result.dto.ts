// lib/dtos/result.dto.ts
/**
 * Data Transfer Objects para resultados de casos
 * Validación con Zod para garantizar type safety en runtime
 */

import { z } from 'zod';

/**
 * Schema para crear un nuevo resultado
 */
export const CreateResultDto = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  caseTitle: z.string().min(1, 'Case title is required'),
  caseArea: z.string().min(1, 'Case area is required'),
  score: z.number().int().min(0, 'Score must be non-negative'), // Puntaje absoluto obtenido
  totalPoints: z.number().int().min(0, 'Total points must be non-negative'), // Puntaje máximo posible
  mode: z.enum(['study', 'exam', 'practice', 'timed']).optional().default('study'),
  timeSpent: z.number().int().min(0).nullable().optional(), // Acepta null, undefined o number
  timeLimit: z.number().int().min(0).nullable().optional(), // Acepta null, undefined o number
  answers: z.any().optional(), // Flexible para mantener compatibilidad
})
  .refine(data => data.score <= data.totalPoints, {
    message: 'Score cannot exceed totalPoints',
    path: ['score'],
  });

export type CreateResultDto = z.infer<typeof CreateResultDto>;

/**
 * Schema para filtros de búsqueda de resultados
 */
export const GetResultsQueryDto = z.object({
  limit: z.number().int().min(1).max(100).optional().default(50),
  area: z.string().optional(),
  sortBy: z.enum(['date', 'score']).optional().default('date'),
});

export type GetResultsQueryDto = z.infer<typeof GetResultsQueryDto>;

/**
 * Schema para obtener estadísticas
 */
export const GetStatsQueryDto = z.object({
  area: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type GetStatsQueryDto = z.infer<typeof GetStatsQueryDto>;
