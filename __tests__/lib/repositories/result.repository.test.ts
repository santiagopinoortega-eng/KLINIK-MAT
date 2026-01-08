// __tests__/lib/repositories/result.repository.test.ts
import { ResultRepository } from '@/lib/repositories/result.repository';
import { prisma, prismaRO } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    studentResult: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
  prismaRO: {
    studentResult: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
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

describe('ResultRepository', () => {
  let repository: ResultRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ResultRepository();
  });

  describe('createResult', () => {
    it('debería crear resultado correctamente', async () => {
      const mockData = {
        userId: 'user-123',
        caseId: 'case-123',
        score: 85,
        mode: 'exam',
        timeSpent: 1800,
        caseArea: 'Cardiología',
        caseTitle: 'IAM',
        totalPoints: 100,
      };

      const mockResult = {
        id: 'result-1',
        ...mockData,
        completedAt: new Date(),
      };

      (prisma.studentResult.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await repository.createResult(mockData);

      expect(result).toEqual(mockResult);
      expect(prisma.studentResult.create).toHaveBeenCalledWith({
        data: mockData,
      });
    });
  });

  describe('getUserResults', () => {
    it('debería obtener resultados con filtros y paginación', async () => {
      const mockResults = [
        {
          id: 'result-1',
          userId: 'user-123',
          score: 85,
          case: { id: 'case-1', title: 'Caso 1' },
        },
      ];

      (prismaRO.studentResult.findMany as jest.Mock).mockResolvedValue(mockResults);
      (prismaRO.studentResult.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.getUserResults({
        userId: 'user-123',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        results: mockResults,
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it('debería filtrar por área', async () => {
      (prismaRO.studentResult.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.studentResult.count as jest.Mock).mockResolvedValue(0);

      await repository.getUserResults({
        userId: 'user-123',
        caseArea: 'Cardiología',
      });

      expect(prismaRO.studentResult.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            caseArea: 'Cardiología',
          }),
        })
      );
    });

    it('debería filtrar por fechas', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      (prismaRO.studentResult.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.studentResult.count as jest.Mock).mockResolvedValue(0);

      await repository.getUserResults({
        userId: 'user-123',
        startDate,
        endDate,
      });

      // El where debería incluir solo lte porque startDate genera gte solo si está presente
      const call = (prismaRO.studentResult.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.completedAt).toBeDefined();
      expect(call.where.completedAt.lte).toEqual(endDate);
    });

    it('debería calcular paginación correctamente', async () => {
      (prismaRO.studentResult.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.studentResult.count as jest.Mock).mockResolvedValue(50);

      const result = await repository.getUserResults({
        userId: 'user-123',
        page: 3,
        limit: 10,
      });

      expect(result.totalPages).toBe(5);
      expect(prismaRO.studentResult.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });
  });

  describe('getUserStats', () => {
    it('debería calcular estadísticas de usuario', async () => {
      (prismaRO.studentResult.count as jest.Mock).mockResolvedValue(10);
      (prismaRO.studentResult.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _avg: { score: 85.5 } })
        .mockResolvedValueOnce({ _sum: { timeSpent: 18000 } });

      const result = await repository.getUserStats('user-123');

      expect(result).toEqual({
        totalAttempts: 10,
        averageScore: 85.5,
        totalTimeSpent: 18000,
        averageTimePerCase: 1800,
      });
    });

    it('debería manejar usuario sin intentos', async () => {
      (prismaRO.studentResult.count as jest.Mock).mockResolvedValue(0);
      (prismaRO.studentResult.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _avg: { score: null } })
        .mockResolvedValueOnce({ _sum: { timeSpent: null } });

      const result = await repository.getUserStats('user-123');

      expect(result).toEqual({
        totalAttempts: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        averageTimePerCase: 0,
      });
    });

    it('debería redondear promedios correctamente', async () => {
      (prismaRO.studentResult.count as jest.Mock).mockResolvedValue(3);
      (prismaRO.studentResult.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _avg: { score: 85.666666 } })
        .mockResolvedValueOnce({ _sum: { timeSpent: 5400 } });

      const result = await repository.getUserStats('user-123');

      expect(result.averageScore).toBe(85.67);
      expect(result.averageTimePerCase).toBe(1800);
    });
  });

  describe('getStatsByArea', () => {
    it('debería obtener estadísticas por área', async () => {
      const mockStats = [
        { caseArea: 'Cardiología', _count: 5, _avg: { score: 85 } },
        { caseArea: 'Neurología', _count: 3, _avg: { score: 78.5 } },
      ];

      (prismaRO.studentResult.groupBy as jest.Mock).mockResolvedValue(mockStats);

      const result = await repository.getStatsByArea('user-123');

      expect(result).toEqual([
        { area: 'Cardiología', total: 5, averageScore: 85 },
        { area: 'Neurología', total: 3, averageScore: 78.5 },
      ]);
    });

    it('debería retornar array vacío si no hay resultados', async () => {
      (prismaRO.studentResult.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await repository.getStatsByArea('user-123');

      expect(result).toEqual([]);
    });

    it('debería redondear promedios', async () => {
      const mockStats = [
        { caseArea: 'Cardiología', _count: 5, _avg: { score: 85.666666 } },
      ];

      (prismaRO.studentResult.groupBy as jest.Mock).mockResolvedValue(mockStats);

      const result = await repository.getStatsByArea('user-123');

      expect(result[0].averageScore).toBe(85.67);
    });
  });

  describe('getLeaderboard', () => {
    it('debería obtener leaderboard global', async () => {
      const mockGroupBy = [
        { userId: 'user-1', _count: { id: 20 }, _avg: { score: 90 } },
        { userId: 'user-2', _count: { id: 15 }, _avg: { score: 85 } },
      ];

      const mockUsers = [
        { id: 'user-1', name: 'Juan', imageUrl: 'url1' },
        { id: 'user-2', name: 'María', imageUrl: 'url2' },
      ];

      (prismaRO.studentResult.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);
      (prismaRO.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await repository.getLeaderboard(undefined, 10);

      expect(result).toEqual([
        {
          rank: 1,
          userId: 'user-1',
          userName: 'Juan',
          userImage: 'url1',
          totalCases: 20,
          averageScore: 90,
        },
        {
          rank: 2,
          userId: 'user-2',
          userName: 'María',
          userImage: 'url2',
          totalCases: 15,
          averageScore: 85,
        },
      ]);
    });

    it('debería filtrar por área', async () => {
      (prismaRO.studentResult.groupBy as jest.Mock).mockResolvedValue([]);
      (prismaRO.user.findMany as jest.Mock).mockResolvedValue([]);

      await repository.getLeaderboard('Cardiología', 10);

      expect(prismaRO.studentResult.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { caseArea: 'Cardiología' },
        })
      );
    });

    it('debería usar nombre por defecto si usuario no encontrado', async () => {
      const mockGroupBy = [
        { userId: 'user-1', _count: { id: 20 }, _avg: { score: 90 } },
      ];

      (prismaRO.studentResult.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);
      (prismaRO.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.getLeaderboard();

      expect(result[0].userName).toBe('Usuario');
    });
  });

  describe('hasAttempted', () => {
    it('debería retornar true si usuario ya intentó caso', async () => {
      (prismaRO.studentResult.findFirst as jest.Mock).mockResolvedValue({
        id: 'result-1',
      });

      const result = await repository.hasAttempted('user-123', 'case-123');

      expect(result).toBe(true);
    });

    it('debería retornar false si no ha intentado', async () => {
      // Necesitamos resetear el mock para este test específico
      (prismaRO.studentResult.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.hasAttempted('user-123', 'case-123');

      expect(result).toBe(false);
    });
  });

  describe('getLastAttempt', () => {
    it('debería obtener último intento', async () => {
      const mockResult = {
        id: 'result-1',
        userId: 'user-123',
        caseId: 'case-123',
        score: 85,
        completedAt: new Date(),
      };

      (prismaRO.studentResult.findFirst as jest.Mock).mockResolvedValue(mockResult);

      const result = await repository.getLastAttempt('user-123', 'case-123');

      expect(result).toEqual(mockResult);
      expect(prismaRO.studentResult.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-123', caseId: 'case-123' },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('debería retornar null si no hay intentos', async () => {
      (prismaRO.studentResult.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.getLastAttempt('user-123', 'case-123');

      expect(result).toBeNull();
    });
  });

  describe('deleteUserResults', () => {
    it('debería eliminar todos los resultados del usuario', async () => {
      (prisma.studentResult.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });

      const result = await repository.deleteUserResults('user-123');

      expect(result).toEqual({ count: 10 });
      expect(prisma.studentResult.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('debería retornar count 0 si no hay resultados', async () => {
      (prisma.studentResult.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await repository.deleteUserResults('user-123');

      expect(result.count).toBe(0);
    });
  });
});
