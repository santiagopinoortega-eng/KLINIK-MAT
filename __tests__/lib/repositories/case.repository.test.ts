// __tests__/lib/repositories/case.repository.test.ts
import { CaseRepository } from '@/lib/repositories/caso.repository';
import { prisma, prismaRO } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    case: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  prismaRO: {
    case: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
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

describe('CaseRepository', () => {
  let repository: CaseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new CaseRepository();
  });

  describe('findCases', () => {
    it('debería encontrar casos con filtros básicos', async () => {
      const mockCases = [
        {
          id: 'case-1',
          title: 'Caso de Cardiología',
          area: 'Cardiología',
          difficulty: 2,
          questions: [],
        },
      ];

      (prismaRO.case.findMany as jest.Mock).mockResolvedValue(mockCases);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findCases({
        area: 'Cardiología',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        cases: mockCases,
        total: 1,
        page: 1,
        totalPages: 1,
      });

      expect(prismaRO.case.findMany).toHaveBeenCalledWith({
        where: { area: 'Cardiología' },
        include: {
          questions: {
            include: { options: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('debería filtrar por dificultad', async () => {
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(0);

      await repository.findCases({
        difficulty: 3,
        page: 1,
        limit: 20,
      });

      expect(prismaRO.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { difficulty: 3 },
        })
      );
    });

    it('debería buscar por texto', async () => {
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(0);

      await repository.findCases({
        search: 'hipertensión',
        page: 1,
        limit: 20,
      });

      expect(prismaRO.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'hipertensión', mode: 'insensitive' } },
              { summary: { contains: 'hipertensión', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('debería manejar paginación correctamente', async () => {
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(100);

      const result = await repository.findCases({
        page: 3,
        limit: 10,
      });

      expect(result.totalPages).toBe(10);
      expect(prismaRO.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (page 3 - 1) * limit 10
          take: 10,
        })
      );
    });
  });

  describe('findWithOptions', () => {
    it('debería encontrar caso con preguntas y opciones', async () => {
      const mockCase = {
        id: 'case-1',
        title: 'Caso Test',
        questions: [
          {
            id: 'q1',
            text: '¿Cuál es el diagnóstico?',
            options: [
              { id: 'opt1', text: 'Opción 1', isCorrect: true },
              { id: 'opt2', text: 'Opción 2', isCorrect: false },
            ],
          },
        ],
      };

      (prismaRO.case.findUnique as jest.Mock).mockResolvedValue(mockCase);

      const result = await repository.findWithOptions('case-1');

      expect(result).toEqual(mockCase);
      expect(prismaRO.case.findUnique).toHaveBeenCalledWith({
        where: { id: 'case-1' },
        include: {
          questions: {
            include: { options: true },
          },
        },
      });
    });

    it('debería retornar null si no encuentra caso', async () => {
      (prismaRO.case.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findWithOptions('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByArea', () => {
    it('debería encontrar casos por área', async () => {
      const mockCases = [
        { id: 'case-1', area: 'Cardiología', title: 'Caso 1' },
        { id: 'case-2', area: 'Cardiología', title: 'Caso 2' },
      ];

      (prismaRO.case.findMany as jest.Mock).mockResolvedValue(mockCases);

      const result = await repository.findByArea('Cardiología', 20);

      expect(result).toEqual(mockCases);
      expect(prismaRO.case.findMany).toHaveBeenCalledWith({
        where: { area: 'Cardiología' },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debería respetar el límite especificado', async () => {
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);

      await repository.findByArea('Neurología', 5);

      expect(prismaRO.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });

  describe('getCaseStats', () => {
    it('debería obtener estadísticas de casos', async () => {
      const mockAreaStats = [
        { area: 'Cardiología', _count: 25 },
        { area: 'Neurología', _count: 15 },
      ];

      const mockDifficultyStats = [
        { difficulty: 1, _count: 10 },
        { difficulty: 2, _count: 20 },
        { difficulty: 3, _count: 10 },
      ];

      (prismaRO.case.count as jest.Mock).mockResolvedValue(40);
      (prismaRO.case.groupBy as jest.Mock)
        .mockResolvedValueOnce(mockAreaStats)
        .mockResolvedValueOnce(mockDifficultyStats);

      const result = await repository.getCaseStats();

      expect(result).toEqual({
        totalCases: 40,
        byArea: [
          { area: 'Cardiología', count: 25 },
          { area: 'Neurología', count: 15 },
        ],
        byDifficulty: [
          { difficulty: 1, count: 10 },
          { difficulty: 2, count: 20 },
          { difficulty: 3, count: 10 },
        ],
      });
    });

    it('debería manejar caso sin casos', async () => {
      (prismaRO.case.count as jest.Mock).mockResolvedValue(0);
      (prismaRO.case.groupBy as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await repository.getCaseStats();

      expect(result.totalCases).toBe(0);
      expect(result.byArea).toEqual([]);
      expect(result.byDifficulty).toEqual([]);
    });
  });
});
