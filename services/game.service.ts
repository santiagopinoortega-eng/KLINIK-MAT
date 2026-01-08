// services/game.service.ts
/**
 * Servicio de gestión de juegos educativos
 * Maneja toda la lógica de negocio relacionada con game stats
 * 
 * REFACTORED: Now uses GameRepository for data access
 * Educational platform: Gamification to engage obstetrics students
 */

import { gameRepository } from '@/lib/repositories';
import { logger } from '@/lib/logger';
import type { GameStats } from '@prisma/client';
import type { GameType } from '@/lib/repositories';

export type { GameType } from '@/lib/repositories';

export type UpdateGameStatsData = {
  won: boolean;
  score: number;
  streak?: number;
};

export class GameService {
  /**
   * Obtiene las estadísticas de un juego para un usuario
   */
  static async getGameStats(userId: string, gameType: GameType): Promise<GameStats | null> {
    try {
      const stats = await gameRepository.findByUserAndType(userId, gameType);
      return stats;
    } catch (error) {
      logger.error('Failed to get game stats', { userId, gameType, error });
      return null;
    }
  }

  /**
   * Crea estadísticas iniciales para un juego
   */
  static async createInitialStats(userId: string, gameType: GameType): Promise<GameStats> {
    try {
      const stats = await gameRepository.createInitialStats(userId, gameType);
      logger.info('Initial game stats created', { userId, gameType });
      return stats;
    } catch (error) {
      logger.error('Failed to create initial stats', { userId, gameType, error });
      throw error;
    }
  }

  /**
   * Actualiza las estadísticas después de un juego
   * Business logic: Calculate streaks and update counters
   */
  static async updateGameStats(
    userId: string,
    gameType: GameType,
    data: UpdateGameStatsData
  ): Promise<GameStats> {
    try {
      // Obtener stats actuales o crear si no existen
      let stats = await gameRepository.findByUserAndType(userId, gameType);
      
      if (!stats) {
        stats = await gameRepository.createInitialStats(userId, gameType);
      }

      // Business logic: Calcular nueva racha
      const newStreak = data.won ? (stats.currentStreak + 1) : 0;
      const newBestStreak = Math.max(stats.bestStreak, newStreak);

      // Actualizar estadísticas usando repository
      const updatedStats = await gameRepository.updateStats(userId, gameType, {
        scoreIncrement: data.score,
        gamesPlayedIncrement: 1,
        gamesWonIncrement: data.won ? 1 : 0,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
      });

      logger.info('Game stats updated', { 
        userId, 
        gameType, 
        won: data.won, 
        score: data.score,
        streak: newStreak,
      });

      return updatedStats;
    } catch (error) {
      logger.error('Failed to update game stats', { userId, gameType, data, error });
      throw error;
    }
  }

  /**
   * Obtiene todas las estadísticas de un usuario
   */
  static async getAllUserStats(userId: string): Promise<GameStats[]> {
    try {
      const stats = await gameRepository.findAllByUser(userId);
      return stats;
    } catch (error) {
      logger.error('Failed to get all user stats', { userId, error });
      return [];
    }
  }

  /**
   * Obtiene el ranking de jugadores por juego
   */
  static async getLeaderboard(
    gameType: GameType,
    limit: number = 20
  ): Promise<GameStats[]> {
    try {
      const leaderboard = await gameRepository.getLeaderboard(gameType, limit);
      return leaderboard;
    } catch (error) {
      logger.error('Failed to get leaderboard', { gameType, error });
      return [];
    }
  }

  /**
   * Reinicia la racha de un usuario (si no jugó ayer)
   * Business logic: Check time elapsed and reset if needed
   */
  static async checkAndResetStreak(userId: string, gameType: GameType): Promise<void> {
    try {
      const needsReset = await gameRepository.needsStreakReset(userId, gameType);
      
      if (needsReset) {
        await gameRepository.resetStreak(userId, gameType);
        logger.info('Streak reset', { userId, gameType });
      }
    } catch (error) {
      logger.error('Failed to check and reset streak', { userId, gameType, error });
    }
  }

  /**
   * Obtiene estadísticas globales del juego
   */
  static async getGlobalStats(gameType: GameType) {
    try {
      const stats = await gameRepository.getGlobalStats(gameType);
      return stats;
    } catch (error) {
      logger.error('Failed to get global stats', { gameType, error });
      return null;
    }
  }

  /**
   * Elimina las estadísticas de un usuario
   */
  static async deleteUserStats(userId: string): Promise<number> {
    try {
      const result = await gameRepository.deleteUserStats(userId);
      logger.info('User game stats deleted', { userId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to delete user stats', { userId, error });
      throw error;
    }
  }

  /**
   * Obtiene la posición de un usuario en el ranking
   */
  static async getUserRank(userId: string, gameType: GameType): Promise<number | null> {
    try {
      const rank = await gameRepository.getUserRank(userId, gameType);
      return rank || null;
    } catch (error) {
      logger.error('Failed to get user rank', { userId, gameType, error });
      return null;
    }
  }
}

