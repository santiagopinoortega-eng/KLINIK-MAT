// services/game.service.ts
/**
 * Servicio de gestión de juegos educativos
 * Maneja toda la lógica de negocio relacionada con game stats
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { GameStats } from '@prisma/client';

export type GameType = 'wordsearch' | 'hangman';

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
      const stats = await prisma.gameStats.findUnique({
        where: {
          userId_gameType: {
            userId,
            gameType,
          },
        },
      });

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
      const stats = await prisma.gameStats.create({
        data: {
          userId,
          gameType,
          totalScore: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          bestStreak: 0,
          currentStreak: 0,
        },
      });

      logger.info('Initial game stats created', { userId, gameType });
      return stats;
    } catch (error) {
      logger.error('Failed to create initial stats', { userId, gameType, error });
      throw error;
    }
  }

  /**
   * Actualiza las estadísticas después de un juego
   */
  static async updateGameStats(
    userId: string,
    gameType: GameType,
    data: UpdateGameStatsData
  ): Promise<GameStats> {
    try {
      // Obtener stats actuales o crear si no existen
      let stats = await this.getGameStats(userId, gameType);
      
      if (!stats) {
        stats = await this.createInitialStats(userId, gameType);
      }

      // Calcular nueva racha
      const newStreak = data.won ? (stats.currentStreak + 1) : 0;
      const newBestStreak = Math.max(stats.bestStreak, newStreak);

      // Actualizar estadísticas
      const updatedStats = await prisma.gameStats.update({
        where: {
          userId_gameType: {
            userId,
            gameType,
          },
        },
        data: {
          totalScore: { increment: data.score },
          gamesPlayed: { increment: 1 },
          gamesWon: data.won ? { increment: 1 } : undefined,
          currentStreak: newStreak,
          bestStreak: newBestStreak,
        },
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
      const stats = await prisma.gameStats.findMany({
        where: { userId },
        orderBy: { totalScore: 'desc' },
      });

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
      const leaderboard = await prisma.gameStats.findMany({
        where: { gameType },
        orderBy: [
          { totalScore: 'desc' },
          { gamesWon: 'desc' },
        ],
        take: limit,
      });

      return leaderboard;
    } catch (error) {
      logger.error('Failed to get leaderboard', { gameType, error });
      return [];
    }
  }

  /**
   * Reinicia la racha de un usuario (si no jugó ayer)
   */
  static async checkAndResetStreak(userId: string, gameType: GameType): Promise<void> {
    try {
      const stats = await this.getGameStats(userId, gameType);
      
      if (!stats || stats.currentStreak === 0) return;

      // Verificar última actualización
      const lastUpdate = stats.updatedAt;
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Si pasaron más de 1 día, resetear racha
      if (daysDiff > 1) {
        await prisma.gameStats.update({
          where: {
            userId_gameType: {
              userId,
              gameType,
            },
          },
          data: {
            currentStreak: 0,
          },
        });

        logger.info('Streak reset', { userId, gameType, daysDiff });
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
      const stats = await prisma.gameStats.aggregate({
        where: { gameType },
        _count: { userId: true },
        _sum: {
          gamesPlayed: true,
          gamesWon: true,
          totalScore: true,
        },
        _avg: {
          totalScore: true,
          gamesWon: true,
        },
        _max: {
          bestStreak: true,
          totalScore: true,
        },
      });

      return {
        totalPlayers: stats._count.userId,
        totalGamesPlayed: stats._sum.gamesPlayed || 0,
        totalGamesWon: stats._sum.gamesWon || 0,
        totalScore: stats._sum.totalScore || 0,
        averageScore: stats._avg.totalScore || 0,
        averageWins: stats._avg.gamesWon || 0,
        bestStreak: stats._max.bestStreak || 0,
        highestScore: stats._max.totalScore || 0,
      };
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
      const result = await prisma.gameStats.deleteMany({
        where: { userId },
      });

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
      const userStats = await this.getGameStats(userId, gameType);
      if (!userStats) return null;

      const rank = await prisma.gameStats.count({
        where: {
          gameType,
          totalScore: {
            gt: userStats.totalScore,
          },
        },
      });

      return rank + 1; // +1 porque count es 0-indexed
    } catch (error) {
      logger.error('Failed to get user rank', { userId, gameType, error });
      return null;
    }
  }
}
