// lib/repositories/game.repository.ts
/**
 * Game Repository
 * 
 * Encapsulates all Prisma queries for gamification features in the educational platform.
 * Handles student game statistics, streaks, leaderboards, and engagement metrics.
 * 
 * @module GameRepository
 */

import { GameStats, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type GameType = 'wordsearch' | 'hangman';

export interface UpdateGameStatsData {
  won: boolean;
  score: number;
  streak?: number;
}

export class GameRepository extends BaseRepository<GameStats> {
  constructor() {
    super('gameStats');
  }

  /**
   * Find game stats by user and game type
   * Used to get current stats before updating
   */
  async findByUserAndType(
    userId: string,
    gameType: GameType,
    readOnly: boolean = true
  ): Promise<GameStats | null> {
    return this.executeQuery('findByUserAndType', async () => {
      const client = this.getClient(readOnly);
      return client.gameStats.findUnique({
        where: {
          userId_gameType: {
            userId,
            gameType,
          },
        },
      });
    });
  }

  /**
   * Create initial game stats for a user
   * Called when user plays a game for the first time
   */
  async createInitialStats(userId: string, gameType: GameType): Promise<GameStats> {
    return this.create({
      userId,
      gameType,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      bestStreak: 0,
      currentStreak: 0,
    });
  }

  /**
   * Update game stats after a game
   * Increments counters and updates streaks
   */
  async updateStats(
    userId: string,
    gameType: GameType,
    data: {
      scoreIncrement: number;
      gamesPlayedIncrement: number;
      gamesWonIncrement: number;
      currentStreak: number;
      bestStreak: number;
    }
  ): Promise<GameStats> {
    return this.executeQuery('updateStats', async () => {
      const model = this.getModel(false);
      return model.update({
        where: {
          userId_gameType: {
            userId,
            gameType,
          },
        },
        data: {
          totalScore: { increment: data.scoreIncrement },
          gamesPlayed: { increment: data.gamesPlayedIncrement },
          gamesWon: { increment: data.gamesWonIncrement },
          currentStreak: data.currentStreak,
          bestStreak: data.bestStreak,
        },
      });
    });
  }

  /**
   * Get all game stats for a user
   * Used for user profile/dashboard
   */
  async findAllByUser(userId: string, readOnly: boolean = true): Promise<GameStats[]> {
    return this.findMany(
      {
        where: { userId },
        orderBy: { totalScore: 'desc' },
      },
      readOnly
    );
  }

  /**
   * Get leaderboard for a specific game
   * Used to show top players
   */
  async getLeaderboard(
    gameType: GameType,
    limit: number = 20,
    readOnly: boolean = true
  ): Promise<GameStats[]> {
    return this.findMany(
      {
        where: { gameType },
        orderBy: [
          { totalScore: 'desc' },
          { gamesWon: 'desc' },
        ],
        take: limit,
      },
      readOnly
    );
  }

  /**
   * Reset streak for a user/game
   * Called when user hasn't played in more than 1 day
   */
  async resetStreak(userId: string, gameType: GameType): Promise<GameStats> {
    return this.executeQuery('resetStreak', async () => {
      const model = this.getModel(false);
      return model.update({
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
    });
  }

  /**
   * Get global statistics for a game
   * Used for analytics dashboard
   */
  async getGlobalStats(gameType: GameType, readOnly: boolean = true) {
    return this.executeQuery('getGlobalStats', async () => {
      const client = this.getClient(readOnly);
      
      const aggregate = await client.gameStats.aggregate({
        where: { gameType },
        _count: { userId: true },
        _sum: {
          totalScore: true,
          gamesPlayed: true,
          gamesWon: true,
        },
        _avg: {
          totalScore: true,
          gamesPlayed: true,
          bestStreak: true,
        },
        _max: {
          totalScore: true,
          bestStreak: true,
        },
      });

      return {
        totalPlayers: aggregate._count.userId,
        totalGamesPlayed: aggregate._sum.gamesPlayed || 0,
        totalGamesWon: aggregate._sum.gamesWon || 0,
        totalScore: aggregate._sum.totalScore || 0,
        averageScore: aggregate._avg.totalScore || 0,
        averageGamesPlayed: aggregate._avg.gamesPlayed || 0,
        averageBestStreak: aggregate._avg.bestStreak || 0,
        highestScore: aggregate._max.totalScore || 0,
        highestStreak: aggregate._max.bestStreak || 0,
      };
    });
  }

  /**
   * Get user rank in game leaderboard
   * Used to show "You are rank #X out of Y players"
   */
  async getUserRank(
    userId: string,
    gameType: GameType,
    readOnly: boolean = true
  ): Promise<number> {
    return this.executeQuery('getUserRank', async () => {
      const client = this.getClient(readOnly);
      
      const userStats = await client.gameStats.findUnique({
        where: {
          userId_gameType: {
            userId,
            gameType,
          },
        },
      });

      if (!userStats) return 0;

      // Count how many players have higher score
      const rank = await client.gameStats.count({
        where: {
          gameType,
          totalScore: { gt: userStats.totalScore },
        },
      });

      return rank + 1; // +1 because rank 1 means 0 players above
    });
  }

  /**
   * Delete all stats for a user
   * Used when user deletes account
   */
  async deleteUserStats(userId: string): Promise<{ count: number }> {
    return this.deleteMany({ userId });
  }

  /**
   * Check if stats need streak reset (last update > 1 day ago)
   * Returns true if streak should be reset
   */
  async needsStreakReset(
    userId: string,
    gameType: GameType,
    readOnly: boolean = true
  ): Promise<boolean> {
    const stats = await this.findByUserAndType(userId, gameType, readOnly);
    
    if (!stats || stats.currentStreak === 0) return false;

    const lastUpdate = stats.updatedAt;
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysDiff > 1;
  }
}

// Singleton instance
export const gameRepository = new GameRepository();
