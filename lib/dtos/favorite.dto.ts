// lib/dtos/favorite.dto.ts
/**
 * Data Transfer Objects para favoritos
 * Validación con Zod para garantizar type safety en runtime
 */

import { z } from 'zod';

/**
 * Schema para agregar favorito
 */
export const AddFavoriteDto = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
});

export type AddFavoriteDto = z.infer<typeof AddFavoriteDto>;

/**
 * Schema para eliminar favorito
 */
export const RemoveFavoriteDto = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
});

export type RemoveFavoriteDto = z.infer<typeof RemoveFavoriteDto>;

/**
 * Schema para obtener favoritos
 */
export const GetFavoritesQueryDto = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  area: z.string().optional(),
});

export type GetFavoritesQueryDto = z.infer<typeof GetFavoritesQueryDto>;
