// __tests__/services/game.service.test.ts
import { GameService } from '@/services/game.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    gameStats: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('GameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGameStats', () => {
    it('debería obtener estadísticas del juego', async () => {
      const mockStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'wordsearch',
        totalScore: 500,
        gamesPlayed: 10,
        gamesWon: 8,
        bestStreak: 5,
        currentStreak: 3,
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(mockStats);

      const result = await GameService.getGameStats('user-123', 'wordsearch');

      expect(result).toEqual(mockStats);
      expect(prisma.gameStats.findUnique).toHaveBeenCalledWith({
        where: {
          userId_gameType: {
            userId: 'user-123',
            gameType: 'wordsearch',
          },
        },
      });
    });

    it('debería retornar null si no hay estadísticas', async () => {
      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await GameService.getGameStats('user-123', 'wordsearch');

      expect(result).toBeNull();
    });

    it('debería retornar null si hay error', async () => {
      (prisma.gameStats.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await GameService.getGameStats('user-123', 'wordsearch');

      expect(result).toBeNull();
    });
  });

  describe('createInitialStats', () => {
    it('debería crear estadísticas iniciales', async () => {
      const mockStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'hangman',
        totalScore: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        bestStreak: 0,
        currentStreak: 0,
      };

      (prisma.gameStats.create as jest.Mock).mockResolvedValue(mockStats);

      const result = await GameService.createInitialStats('user-123', 'hangman');

      expect(result).toEqual(mockStats);
      expect(prisma.gameStats.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          gameType: 'hangman',
          totalScore: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          bestStreak: 0,
          currentStreak: 0,
        },
      });
    });

    it('debería propagar error', async () => {
      (prisma.gameStats.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(GameService.createInitialStats('user-123', 'hangman')).rejects.toThrow(
        'DB Error'
      );
    });
  });

  describe('updateGameStats', () => {
    it('debería actualizar estadísticas después de ganar', async () => {
      const existingStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'wordsearch',
        totalScore: 500,
        gamesPlayed: 10,
        gamesWon: 8,
        bestStreak: 5,
        currentStreak: 3,
      };

      const updatedStats = {
        ...existingStats,
        totalScore: 600,
        gamesPlayed: 11,
        gamesWon: 9,
        currentStreak: 4,
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(existingStats);
      (prisma.gameStats.update as jest.Mock).mockResolvedValue(updatedStats);

      const result = await GameService.updateGameStats('user-123', 'wordsearch', {
        won: true,
        score: 100,
      });

      expect(result).toEqual(updatedStats);
      expect(prisma.gameStats.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalScore: { increment: 100 },
            gamesPlayed: { increment: 1 },
            gamesWon: { increment: 1 },
            currentStreak: 4,
          }),
        })
      );
    });

    it('debería resetear racha si pierde', async () => {
      const existingStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'wordsearch',
        totalScore: 500,
        gamesPlayed: 10,
        gamesWon: 8,
        bestStreak: 5,
        currentStreak: 3,
      };

      const updatedStats = {
        ...existingStats,
        totalScore: 550,
        gamesPlayed: 11,
        currentStreak: 0,
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(existingStats);
      (prisma.gameStats.update as jest.Mock).mockResolvedValue(updatedStats);

      const result = await GameService.updateGameStats('user-123', 'wordsearch', {
        won: false,
        score: 50,
      });

      expect(result.currentStreak).toBe(0);
      expect(prisma.gameStats.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentStreak: 0,
          }),
        })
      );
    });

    it('debería crear estadísticas si no existen', async () => {
      const newStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'hangman',
        totalScore: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        bestStreak: 0,
        currentStreak: 0,
      };

      const updatedStats = {
        ...newStats,
        totalScore: 100,
        gamesPlayed: 1,
        gamesWon: 1,
        currentStreak: 1,
        bestStreak: 1,
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.gameStats.create as jest.Mock).mockResolvedValue(newStats);
      (prisma.gameStats.update as jest.Mock).mockResolvedValue(updatedStats);

      const result = await GameService.updateGameStats('user-123', 'hangman', {
        won: true,
        score: 100,
      });

      expect(prisma.gameStats.create).toHaveBeenCalled();
      expect(prisma.gameStats.update).toHaveBeenCalled();
    });

    it('debería actualizar bestStreak si la racha es nueva', async () => {
      const existingStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'wordsearch',
        totalScore: 500,
        gamesPlayed: 10,
        gamesWon: 8,
        bestStreak: 3,
        currentStreak: 3,
      };

      const updatedStats = {
        ...existingStats,
        currentStreak: 4,
        bestStreak: 4,
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(existingStats);
      (prisma.gameStats.update as jest.Mock).mockResolvedValue(updatedStats);

      await GameService.updateGameStats('user-123', 'wordsearch', {
        won: true,
        score: 100,
      });

      expect(prisma.gameStats.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bestStreak: 4,
          }),
        })
      );
    });
  });

  describe('getAllUserStats', () => {
    it('debería obtener todas las estadísticas del usuario', async () => {
      const mockStats = [
        {
          id: 'stats-1',
          userId: 'user-123',
          gameType: 'wordsearch',
          totalScore: 500,
        },
        {
          id: 'stats-2',
          userId: 'user-123',
          gameType: 'hangman',
          totalScore: 300,
        },
      ];

      (prisma.gameStats.findMany as jest.Mock).mockResolvedValue(mockStats);

      const result = await GameService.getAllUserStats('user-123');

      expect(result).toEqual(mockStats);
      expect(prisma.gameStats.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { totalScore: 'desc' },
      });
    });

    it('debería retornar array vacío si hay error', async () => {
      (prisma.gameStats.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await GameService.getAllUserStats('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getLeaderboard', () => {
    it('debería obtener leaderboard del juego', async () => {
      const mockLeaderboard = [
        {
          id: 'stats-1',
          userId: 'user-1',
          gameType: 'wordsearch',
          totalScore: 1000,
          gamesWon: 50,
        },
        {
          id: 'stats-2',
          userId: 'user-2',
          gameType: 'wordsearch',
          totalScore: 800,
          gamesWon: 40,
        },
      ];

      (prisma.gameStats.findMany as jest.Mock).mockResolvedValue(mockLeaderboard);

      const result = await GameService.getLeaderboard('wordsearch', 20);

      expect(result).toEqual(mockLeaderboard);
      expect(prisma.gameStats.findMany).toHaveBeenCalledWith({
        where: { gameType: 'wordsearch' },
        orderBy: [{ totalScore: 'desc' }, { gamesWon: 'desc' }],
        take: 20,
      });
    });

    it('debería retornar array vacío si hay error', async () => {
      (prisma.gameStats.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await GameService.getLeaderboard('wordsearch');

      expect(result).toEqual([]);
    });
  });

  describe('checkAndResetStreak', () => {
    it('debería resetear racha si pasó más de 1 día', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);

      const mockStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'wordsearch',
        currentStreak: 5,
        updatedAt: yesterday,
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(mockStats);
      (prisma.gameStats.update as jest.Mock).mockResolvedValue({});

      await GameService.checkAndResetStreak('user-123', 'wordsearch');

      expect(prisma.gameStats.update).toHaveBeenCalledWith({
        where: {
          userId_gameType: {
            userId: 'user-123',
            gameType: 'wordsearch',
          },
        },
        data: {
          currentStreak: 0,
        },
      });
    });

    it('no debería resetear si la racha ya es 0', async () => {
      const mockStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'wordsearch',
        currentStreak: 0,
        updatedAt: new Date(),
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(mockStats);

      await GameService.checkAndResetStreak('user-123', 'wordsearch');

      expect(prisma.gameStats.update).not.toHaveBeenCalled();
    });

    it('no debería resetear si no pasó más de 1 día', async () => {
      const mockStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'wordsearch',
        currentStreak: 5,
        updatedAt: new Date(),
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(mockStats);

      await GameService.checkAndResetStreak('user-123', 'wordsearch');

      expect(prisma.gameStats.update).not.toHaveBeenCalled();
    });
  });

  describe('getGlobalStats', () => {
    it('debería obtener estadísticas globales', async () => {
      const mockAggregate = {
        _count: { userId: 100 },
        _sum: {
          gamesPlayed: 1000,
          gamesWon: 750,
          totalScore: 50000,
        },
        _avg: {
          totalScore: 500,
          gamesWon: 7.5,
        },
        _max: {
          bestStreak: 25,
          totalScore: 2000,
        },
      };

      (prisma.gameStats.aggregate as jest.Mock).mockResolvedValue(mockAggregate);

      const result = await GameService.getGlobalStats('wordsearch');

      expect(result).toEqual({
        totalPlayers: 100,
        totalGamesPlayed: 1000,
        totalGamesWon: 750,
        totalScore: 50000,
        averageScore: 500,
        averageWins: 7.5,
        bestStreak: 25,
        highestScore: 2000,
      });
    });

    it('debería manejar valores null en aggregate', async () => {
      const mockAggregate = {
        _count: { userId: 0 },
        _sum: {
          gamesPlayed: null,
          gamesWon: null,
          totalScore: null,
        },
        _avg: {
          totalScore: null,
          gamesWon: null,
        },
        _max: {
          bestStreak: null,
          totalScore: null,
        },
      };

      (prisma.gameStats.aggregate as jest.Mock).mockResolvedValue(mockAggregate);

      const result = await GameService.getGlobalStats('wordsearch');

      expect(result).toEqual({
        totalPlayers: 0,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
        totalScore: 0,
        averageScore: 0,
        averageWins: 0,
        bestStreak: 0,
        highestScore: 0,
      });
    });

    it('debería retornar null si hay error', async () => {
      (prisma.gameStats.aggregate as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await GameService.getGlobalStats('wordsearch');

      expect(result).toBeNull();
    });
  });

  describe('deleteUserStats', () => {
    it('debería eliminar estadísticas del usuario', async () => {
      (prisma.gameStats.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await GameService.deleteUserStats('user-123');

      expect(result).toBe(2);
      expect(prisma.gameStats.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('debería propagar error', async () => {
      (prisma.gameStats.deleteMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(GameService.deleteUserStats('user-123')).rejects.toThrow('DB Error');
    });
  });

  describe('getUserRank', () => {
    it('debería obtener posición del usuario', async () => {
      const mockStats = {
        id: 'stats-1',
        userId: 'user-123',
        gameType: 'wordsearch',
        totalScore: 500,
      };

      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(mockStats);
      (prisma.gameStats.count as jest.Mock).mockResolvedValue(3);

      const result = await GameService.getUserRank('user-123', 'wordsearch');

      expect(result).toBe(4); // 3 usuarios con más score + 1
      expect(prisma.gameStats.count).toHaveBeenCalledWith({
        where: {
          gameType: 'wordsearch',
          totalScore: {
            gt: 500,
          },
        },
      });
    });

    it('debería retornar null si usuario no tiene stats', async () => {
      (prisma.gameStats.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await GameService.getUserRank('user-123', 'wordsearch');

      expect(result).toBeNull();
    });

    it('debería retornar null si hay error', async () => {
      (prisma.gameStats.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await GameService.getUserRank('user-123', 'wordsearch');

      expect(result).toBeNull();
    });
  });
});
