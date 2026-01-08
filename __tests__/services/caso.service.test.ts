// __tests__/services/caso.service.test.ts
import { CasoService, getCasosActivos, getOptionDetails } from '@/services/caso.service';
import { prisma, prismaRO } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    case: {
      findMany: jest.fn(),
    },
    option: {
      findUnique: jest.fn(),
    },
  },
  prismaRO: {
    case: {
      findMany: jest.fn(),
      count: jest.fn(),
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

describe('CasoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCases', () => {
    it('debería obtener casos con paginación', async () => {
      const mockCases = [
        {
          id: 'case-1',
          title: 'Caso de Cardiología',
          area: 'Cardiología',
          difficulty: 2,
          _count: { questions: 5 },
        },
      ];

      (prismaRO.case.findMany as jest.Mock).mockResolvedValue(mockCases);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(1);

      const result = await CasoService.getCases({
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockCases,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasMore: false,
        },
        filters: {
          search: null,
          area: null,
          difficulty: null,
        },
      });
    });

    it('debería filtrar por área', async () => {
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(0);

      await CasoService.getCases({
        area: 'Cardiología',
        page: 1,
        limit: 20,
      });

      expect(prismaRO.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublic: true,
            area: 'Cardiología',
          }),
        })
      );
    });

    it('debería filtrar por dificultad', async () => {
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(0);

      await CasoService.getCases({
        difficulty: 2,
        page: 1,
        limit: 20,
      });

      expect(prismaRO.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            difficulty: 2,
          }),
        })
      );
    });

    it('debería buscar por texto', async () => {
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(0);

      await CasoService.getCases({
        search: 'hipertensión',
        page: 1,
        limit: 20,
      });

      expect(prismaRO.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'hipertensión', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('debería calcular paginación correctamente', async () => {
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.case.count as jest.Mock).mockResolvedValue(50);

      const result = await CasoService.getCases({
        page: 2,
        limit: 10,
      });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasMore: true,
      });

      expect(prismaRO.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * limit 10
          take: 10,
        })
      );
    });

    it('debería manejar errores correctamente', async () => {
      (prismaRO.case.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        CasoService.getCases({ page: 1, limit: 20 })
      ).rejects.toThrow('Database error');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get cases',
        expect.anything()
      );
    });
  });

  describe('getCasosActivos', () => {
    it('debería obtener casos activos', async () => {
      const mockCases = [
        {
          id: 'case-1',
          title: 'Caso Test',
          area: 'Cardiología',
          modulo: 'Módulo 1',
          difficulty: 2,
          summary: 'Resumen del caso',
          norms: [
            { name: 'Norma 1', code: 'N001' },
          ],
        },
      ];

      (prisma.case.findMany as jest.Mock).mockResolvedValue(mockCases);

      const result = await getCasosActivos();

      expect(result).toEqual(mockCases);
      expect(prisma.case.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        select: {
          id: true,
          title: true,
          area: true,
          modulo: true,
          difficulty: true,
          summary: true,
          norms: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debería retornar array vacío si no hay casos', async () => {
      (prisma.case.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getCasosActivos();

      expect(result).toEqual([]);
    });

    it('debería manejar errores y lanzar error personalizado', async () => {
      (prisma.case.findMany as jest.Mock).mockRejectedValue(
        new Error('DB connection failed')
      );

      await expect(getCasosActivos()).rejects.toThrow(
        'No se pudo cargar el listado de casos clínicos. (DB Error)'
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch active cases',
        expect.any(Error)
      );
    });
  });

  describe('getOptionDetails', () => {
    it('debería obtener detalles de opción', async () => {
      const mockOption = {
        id: 'opt-1',
        text: 'Opción correcta',
        isCorrect: true,
        feedback: 'Bien hecho',
      };

      (prisma.option.findUnique as jest.Mock).mockResolvedValue(mockOption);

      const result = await getOptionDetails('opt-1');

      expect(result).toEqual(mockOption);
      expect(prisma.option.findUnique).toHaveBeenCalledWith({
        where: { id: 'opt-1' },
      });
    });

    it('debería retornar null si no encuentra opción', async () => {
      (prisma.option.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getOptionDetails('nonexistent');

      expect(result).toBeNull();
    });

    it('debería manejar errores y retornar null', async () => {
      (prisma.option.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await getOptionDetails('opt-1');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch option details: opt-1',
        expect.any(Error)
      );
    });
  });
});
