// __tests__/lib/repositories/favorite.repository.test.ts
import { FavoriteRepository } from '@/lib/repositories/favorite.repository';
import { prisma, prismaRO } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    favorite: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      groupBy: jest.fn(),
    },
    case: {
      findMany: jest.fn(),
    },
  },
  prismaRO: {
    favorite: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    case: {
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

describe('FavoriteRepository', () => {
  let repository: FavoriteRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new FavoriteRepository();
  });

  describe('getUserFavorites', () => {
    it('debería obtener favoritos de usuario con paginación', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-123',
          casoId: 'case-1',
          case: { id: 'case-1', title: 'Caso 1' },
          createdAt: new Date(),
        },
      ];

      (prismaRO.favorite.findMany as jest.Mock).mockResolvedValue(mockFavorites);
      (prismaRO.favorite.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.getUserFavorites('user-123', 1, 20);

      expect(result).toEqual({
        favorites: mockFavorites,
        total: 1,
        page: 1,
        totalPages: 1,
      });

      expect(prismaRO.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { case: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('debería calcular páginas correctamente', async () => {
      (prismaRO.favorite.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.favorite.count as jest.Mock).mockResolvedValue(50);

      const result = await repository.getUserFavorites('user-123', 2, 10);

      expect(result.totalPages).toBe(5);
      expect(prismaRO.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('debería retornar array vacío si no hay favoritos', async () => {
      (prismaRO.favorite.findMany as jest.Mock).mockResolvedValue([]);
      (prismaRO.favorite.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.getUserFavorites('user-123');

      expect(result.favorites).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('isFavorite', () => {
    it('debería retornar true si es favorito', async () => {
      (prismaRO.favorite.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.isFavorite('user-123', 'case-123');

      expect(result).toBe(true);
    });

    it('debería retornar false si no es favorito', async () => {
      (prismaRO.favorite.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.isFavorite('user-123', 'case-123');

      expect(result).toBe(false);
    });
  });

  describe('addFavorite', () => {
    it('debería agregar favorito correctamente', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-123',
        casoId: 'case-123',
        createdAt: new Date(),
      };

      (prisma.favorite.create as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await repository.addFavorite('user-123', 'case-123');

      expect(result).toEqual(mockFavorite);
      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          casoId: 'case-123',
        },
        include: undefined,
      });
    });
  });

  describe('removeFavorite', () => {
    it('debería eliminar favorito', async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repository.removeFavorite('user-123', 'case-123');

      expect(result).toEqual({ count: 1 });
      expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          casoId: 'case-123',
        },
      });
    });

    it('debería retornar count 0 si no existe', async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await repository.removeFavorite('user-123', 'case-123');

      expect(result.count).toBe(0);
    });
  });

  describe('toggleFavorite', () => {
    it('debería agregar favorito si no existe', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-123',
        caseId: 'case-123',
        createdAt: new Date(),
      };

      (prismaRO.favorite.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.favorite.create as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await repository.toggleFavorite('user-123', 'case-123');

      expect(result).toEqual({
        isFavorite: true,
        favorite: mockFavorite,
      });
    });

    it('debería eliminar favorito si ya existe', async () => {
      const existingFavorite = {
        id: 'fav-1',
        userId: 'user-123',
        caseId: 'case-123',
      };

      (prismaRO.favorite.findFirst as jest.Mock).mockResolvedValue(existingFavorite);
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repository.toggleFavorite('user-123', 'case-123');

      expect(result).toEqual({
        isFavorite: false,
      });
      expect(prisma.favorite.deleteMany).toHaveBeenCalled();
    });
  });

  describe('getFavoriteCount', () => {
    it('debería contar favoritos de un caso', async () => {
      (prismaRO.favorite.count as jest.Mock).mockResolvedValue(15);

      const result = await repository.getFavoriteCount('case-123');

      expect(result).toBe(15);
      expect(prismaRO.favorite.count).toHaveBeenCalledWith({
        where: { casoId: 'case-123' },
      });
    });

    it('debería retornar 0 si no hay favoritos', async () => {
      (prismaRO.favorite.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.getFavoriteCount('case-123');

      expect(result).toBe(0);
    });
  });

  describe('getTrendingCases', () => {
    it('debería obtener casos más favoritos', async () => {
      const mockGroupBy = [
        { caseId: 'case-1', _count: { id: 25 } },
        { caseId: 'case-2', _count: { id: 15 } },
      ];

      const mockCases = [
        { id: 'case-1', title: 'Caso Popular' },
        { id: 'case-2', title: 'Caso Trending' },
      ];

      (prismaRO.favorite.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue(mockCases);

      const result = await repository.getTrendingCases(10);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        rank: 1,
        case: mockCases[0],
        favoriteCount: 25,
      });
      expect(result[1]).toEqual({
        rank: 2,
        case: mockCases[1],
        favoriteCount: 15,
      });
    });

    it('debería respetar límite especificado', async () => {
      (prismaRO.favorite.groupBy as jest.Mock).mockResolvedValue([]);
      (prismaRO.case.findMany as jest.Mock).mockResolvedValue([]);

      await repository.getTrendingCases(5);

      expect(prismaRO.favorite.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });

  describe('getFavoriteIds', () => {
    it('debería obtener IDs de favoritos', async () => {
      const mockFavorites = [
        { caseId: 'case-1' },
        { caseId: 'case-2' },
        { caseId: 'case-3' },
      ];

      (prismaRO.favorite.findMany as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await repository.getFavoriteIds('user-123');

      expect(result).toEqual(['case-1', 'case-2', 'case-3']);
      expect(prismaRO.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { caseId: true },
      });
    });

    it('debería retornar array vacío si no hay favoritos', async () => {
      (prismaRO.favorite.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.getFavoriteIds('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('clearUserFavorites', () => {
    it('debería eliminar todos los favoritos del usuario', async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await repository.clearUserFavorites('user-123');

      expect(result).toEqual({ count: 5 });
      expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('debería retornar count 0 si no hay favoritos', async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await repository.clearUserFavorites('user-123');

      expect(result.count).toBe(0);
    });
  });

  describe('getFavoritesByArea', () => {
    it('debería agrupar favoritos por área', async () => {
      const mockFavorites = [
        { case: { area: 'Cardiología' } },
        { case: { area: 'Cardiología' } },
        { case: { area: 'Neurología' } },
      ];

      (prismaRO.favorite.findMany as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await repository.getFavoritesByArea('user-123');

      expect(result).toEqual([
        { area: 'Cardiología', count: 2 },
        { area: 'Neurología', count: 1 },
      ]);
    });

    it('debería retornar array vacío si no hay favoritos', async () => {
      (prismaRO.favorite.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.getFavoritesByArea('user-123');

      expect(result).toEqual([]);
    });
  });
});
