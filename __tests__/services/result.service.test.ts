// __tests__/services/result.service.test.ts
import { ResultService } from '@/services/result.service';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    case: {
      findUnique: jest.fn(),
    },
    studentResult: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    engagementMetric: {
      create: jest.fn(),
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

describe('ResultService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createResult', () => {
    it('debería crear resultado exitosamente', async () => {
      const mockCase = {
        id: 'case-123',
        isPublic: true,
      };

      const mockResult = {
        id: 'result_123',
        userId: 'user-123',
        caseId: 'case-123',
        caseTitle: 'Caso Test',
        caseArea: 'Cardiología',
        score: 85,
        totalPoints: 100,
        mode: 'exam',
        timeSpent: 1800,
      };

      (prisma.case.findUnique as jest.Mock).mockResolvedValue(mockCase);
      (prisma.studentResult.create as jest.Mock).mockResolvedValue(mockResult);
      (prisma.engagementMetric.create as jest.Mock).mockResolvedValue({});

      const result = await ResultService.createResult({
        userId: 'user-123',
        caseId: 'case-123',
        caseTitle: 'Caso Test',
        caseArea: 'Cardiología',
        score: 85,
        totalPoints: 100,
        mode: 'exam',
        timeSpent: 1800,
      });

      expect(result).toEqual(mockResult);
      expect(prisma.case.findUnique).toHaveBeenCalledWith({
        where: { id: 'case-123' },
        select: { id: true, isPublic: true },
      });
      expect(prisma.studentResult.create).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Result created',
        expect.objectContaining({ userId: 'user-123', caseId: 'case-123' })
      );
    });

    it('debería fallar si caso no existe', async () => {
      (prisma.case.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        ResultService.createResult({
          userId: 'user-123',
          caseId: 'nonexistent',
          caseTitle: 'Test',
          caseArea: 'Test',
          score: 85,
          totalPoints: 100,
          mode: 'exam',
        })
      ).rejects.toThrow('Case not found');
    });

    it('debería fallar si caso no es público', async () => {
      const mockCase = {
        id: 'case-123',
        isPublic: false,
      };

      (prisma.case.findUnique as jest.Mock).mockResolvedValue(mockCase);

      await expect(
        ResultService.createResult({
          userId: 'user-123',
          caseId: 'case-123',
          caseTitle: 'Test',
          caseArea: 'Test',
          score: 85,
          totalPoints: 100,
          mode: 'exam',
        })
      ).rejects.toThrow('Case is not public');
    });

    it('debería crear resultado aunque falle engagement metric', async () => {
      const mockCase = { id: 'case-123', isPublic: true };
      const mockResult = { id: 'result_123', userId: 'user-123' };

      (prisma.case.findUnique as jest.Mock).mockResolvedValue(mockCase);
      (prisma.studentResult.create as jest.Mock).mockResolvedValue(mockResult);
      (prisma.engagementMetric.create as jest.Mock).mockRejectedValue(
        new Error('Engagement failed')
      );

      const result = await ResultService.createResult({
        userId: 'user-123',
        caseId: 'case-123',
        caseTitle: 'Test',
        caseArea: 'Test',
        score: 85,
        totalPoints: 100,
        mode: 'exam',
      });

      expect(result).toEqual(mockResult);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('getUserResults', () => {
    it('debería obtener resultados de usuario', async () => {
      const mockResults = [
        {
          id: 'result-1',
          userId: 'user-123',
          score: 85,
          completedAt: new Date(),
        },
        {
          id: 'result-2',
          userId: 'user-123',
          score: 90,
          completedAt: new Date(),
        },
      ];

      (prisma.studentResult.findMany as jest.Mock).mockResolvedValue(mockResults);

      const results = await ResultService.getUserResults('user-123');

      expect(results).toEqual(mockResults);
      expect(prisma.studentResult.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { completedAt: 'desc' },
        take: 50,
      });
    });

    it('debería filtrar por área', async () => {
      (prisma.studentResult.findMany as jest.Mock).mockResolvedValue([]);

      await ResultService.getUserResults('user-123', {
        area: 'Cardiología',
      });

      expect(prisma.studentResult.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          caseArea: 'Cardiología',
        },
        orderBy: { completedAt: 'desc' },
        take: 50,
      });
    });

    it('debería ordenar por score', async () => {
      (prisma.studentResult.findMany as jest.Mock).mockResolvedValue([]);

      await ResultService.getUserResults('user-123', {
        sortBy: 'score',
      });

      expect(prisma.studentResult.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { score: 'desc' },
        })
      );
    });

    it('debería respetar límite personalizado', async () => {
      (prisma.studentResult.findMany as jest.Mock).mockResolvedValue([]);

      await ResultService.getUserResults('user-123', {
        limit: 10,
      });

      expect(prisma.studentResult.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });
  });

  describe('getBestResult', () => {
    it('debería obtener mejor resultado', async () => {
      const mockResult = {
        id: 'result-1',
        userId: 'user-123',
        caseId: 'case-123',
        score: 95,
      };

      (prisma.studentResult.findFirst as jest.Mock).mockResolvedValue(mockResult);

      const result = await ResultService.getBestResult('user-123', 'case-123');

      expect(result).toEqual(mockResult);
      expect(prisma.studentResult.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-123', caseId: 'case-123' },
        orderBy: { score: 'desc' },
      });
    });

    it('debería retornar null si no hay resultados', async () => {
      (prisma.studentResult.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await ResultService.getBestResult('user-123', 'case-123');

      expect(result).toBeNull();
    });

    it('debería manejar errores y retornar null', async () => {
      (prisma.studentResult.findFirst as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await ResultService.getBestResult('user-123', 'case-123');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('debería obtener estadísticas de usuario', async () => {
      (prisma.studentResult.count as jest.Mock).mockResolvedValue(10);
      (prisma.studentResult.aggregate as jest.Mock)
        .mockResolvedValueOnce({
          _avg: { score: 85.5 },
          _sum: { totalPoints: 850 },
          _max: { score: 95 },
          _min: { score: 70 },
        })
        .mockResolvedValueOnce({
          _avg: { timeSpent: 1500 },
        });

      const stats = await ResultService.getUserStats('user-123');

      expect(stats).toEqual({
        totalCases: 10,
        averageScore: 85.5,
        totalPoints: 850,
        bestScore: 95,
        worstScore: 70,
        timeAverage: 1500,
      });
    });

    it('debería filtrar por área', async () => {
      (prisma.studentResult.count as jest.Mock).mockResolvedValue(5);
      (prisma.studentResult.aggregate as jest.Mock)
        .mockResolvedValueOnce({
          _avg: { score: 80 },
          _sum: { totalPoints: 400 },
          _max: { score: 90 },
          _min: { score: 70 },
        })
        .mockResolvedValueOnce({
          _avg: { timeSpent: 1200 },
        });

      await ResultService.getUserStats('user-123', 'Cardiología');

      expect(prisma.studentResult.count).toHaveBeenCalledWith({
        where: { userId: 'user-123', caseArea: 'Cardiología' },
      });
    });
  });
});
