// lib/dtos/user.dto.ts
/**
 * Data Transfer Objects para usuarios
 * Validación con Zod para garantizar type safety en runtime
 */

import { z } from 'zod';

/**
 * Schema para actualizar perfil de usuario
 */
export const UpdateUserProfileDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  country: z.string().max(50).optional(),
  university: z.string().max(200).optional(),
  yearOfStudy: z.number().int().min(1).max(7, 'Year of study must be between 1 and 7').optional(),
  specialty: z.string().max(100).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

export type UpdateUserProfileDto = z.infer<typeof UpdateUserProfileDto>;

/**
 * Schema para sincronizar usuario desde Clerk
 */
export const SyncUserDto = z.object({
  id: z.string().min(1),
  email: z.string().email('Invalid email format'),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
});

export type SyncUserDto = z.infer<typeof SyncUserDto>;

/**
 * Schema para registrar sesión de estudio
 */
export const RecordStudySessionDto = z.object({
  casesStudied: z.number().int().min(1).max(50, 'Cases studied must be between 1 and 50'),
  timeSpent: z.number().int().min(1, 'Time spent must be at least 1 minute'),
});

export type RecordStudySessionDto = z.infer<typeof RecordStudySessionDto>;
