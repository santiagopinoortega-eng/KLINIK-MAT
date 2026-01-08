// lib/dtos/case.dto.ts
/**
 * Data Transfer Objects para casos clínicos
 * Validación con Zod para garantizar type safety en runtime
 */

import { z } from 'zod';

/**
 * Schema para filtros de búsqueda de casos
 */
export const GetCasesQueryDto = z.object({
  area: z.string().optional(),
  modulo: z.string().optional(),
  difficulty: z.number().int().min(1).max(3).optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
  search: z.string().max(200).optional(),
});

export type GetCasesQueryDto = z.infer<typeof GetCasesQueryDto>;

/**
 * Schema para responder una pregunta
 */
export const AnswerQuestionDto = z.object({
  questionId: z.string().min(1),
  optionId: z.string().optional(),
  shortAnswer: z.string().max(1000).optional(),
});

export type AnswerQuestionDto = z.infer<typeof AnswerQuestionDto>;

/**
 * Schema para enviar respuestas de caso completo
 */
export const SubmitCaseAnswersDto = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  answers: z.array(AnswerQuestionDto).min(1, 'At least one answer is required'),
  mode: z.enum(['study', 'exam', 'practice']).optional().default('study'),
  timeSpent: z.number().int().min(0).optional(),
});

export type SubmitCaseAnswersDto = z.infer<typeof SubmitCaseAnswersDto>;

/**
 * Schema para crear caso (admin)
 */
export const CreateCaseDto = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  area: z.string().min(1),
  modulo: z.string().optional(),
  difficulty: z.number().int().min(1).max(3),
  dificultad: z.enum(['Baja', 'Media', 'Alta']).optional(),
  summary: z.string().max(500).optional(),
  isPublic: z.boolean().optional().default(false),
  vignette: z.string().optional(),
});

export type CreateCaseDto = z.infer<typeof CreateCaseDto>;
