// lib/dtos/game.dto.ts
/**
 * Data Transfer Objects para juegos educativos
 * Validación con Zod para garantizar type safety en runtime
 */

import { z } from 'zod';

/**
 * Schema para tipo de juego
 */
export const GameTypeSchema = z.enum(['wordsearch', 'hangman'], {
  message: 'Game type debe ser wordsearch o hangman',
});

export type GameType = z.infer<typeof GameTypeSchema>;

/**
 * Schema para actualizar estadísticas de juego
 */
export const UpdateGameStatsDto = z.object({
  gameType: GameTypeSchema,
  won: z.boolean(),
  score: z.number().int().min(0, 'Score must be non-negative'),
  streak: z.number().int().min(0).optional(),
});

export type UpdateGameStatsDto = z.infer<typeof UpdateGameStatsDto>;

/**
 * Schema para obtener estadísticas
 */
export const GetGameStatsQueryDto = z.object({
  gameType: GameTypeSchema,
});

export type GetGameStatsQueryDto = z.infer<typeof GetGameStatsQueryDto>;

/**
 * Schema para leaderboard
 */
export const GetLeaderboardQueryDto = z.object({
  gameType: GameTypeSchema,
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type GetLeaderboardQueryDto = z.infer<typeof GetLeaderboardQueryDto>;
