// __tests__/services/favorite.service.test.ts
import { FavoriteService } from '@/services/favorite.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    favorite: {
      findMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      groupBy: jest.fn(),
    },
    case: {
      findUnique: jest.fn(),
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

describe('FavoriteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserFavorites', () => {
    it('debería obtener favoritos del usuario con casos', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-123',
          caseId: 'case-1',
          case: {
            id: 'case-1',
            title: 'Caso 1',
            area: 'Cardiología',
            difficulty: 'medium',
            summary: 'Resumen',
          },
          createdAt: new Date(),
        },
      ];

      (prisma.favorite.findMany as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await FavoriteService.getUserFavorites('user-123');

      expect(result).toEqual(mockFavorites);
      expect(prisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          case: {
            select: {
              id: true,
              title: true,
              area: true,
              difficulty: true,
              summary: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debería propagar error si falla', async () => {
      (prisma.favorite.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(FavoriteService.getUserFavorites('user-123')).rejects.toThrow('DB Error');
    });
  });

  describe('isFavorite', () => {
    it('debería retornar true si es favorito', async () => {
      (prisma.favorite.count as jest.Mock).mockResolvedValue(1);

      const result = await FavoriteService.isFavorite('user-123', 'case-123');

      expect(result).toBe(true);
      expect(prisma.favorite.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          caseId: 'case-123',
        },
      });
    });

    it('debería retornar false si no es favorito', async () => {
      (prisma.favorite.count as jest.Mock).mockResolvedValue(0);

      const result = await FavoriteService.isFavorite('user-123', 'case-123');

      expect(result).toBe(false);
    });

    it('debería retornar false si hay error', async () => {
      (prisma.favorite.count as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await FavoriteService.isFavorite('user-123', 'case-123');

      expect(result).toBe(false);
    });
  });

  describe('addFavorite', () => {
    it('debería agregar favorito si caso existe', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-123',
        caseId: 'case-123',
        createdAt: new Date(),
      };

      (prisma.case.findUnique as jest.Mock).mockResolvedValue({ id: 'case-123' });
      (prisma.favorite.upsert as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await FavoriteService.addFavorite('user-123', 'case-123');

      expect(result).toEqual(mockFavorite);
      expect(prisma.case.findUnique).toHaveBeenCalledWith({
        where: { id: 'case-123' },
        select: { id: true },
      });
      expect(prisma.favorite.upsert).toHaveBeenCalled();
    });

    it('debería lanzar error si caso no existe', async () => {
      (prisma.case.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(FavoriteService.addFavorite('user-123', 'case-123')).rejects.toThrow(
        'Case not found'
      );
    });

    it('debería propagar error de BD', async () => {
      (prisma.case.findUnique as jest.Mock).mockResolvedValue({ id: 'case-123' });
      (prisma.favorite.upsert as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(FavoriteService.addFavorite('user-123', 'case-123')).rejects.toThrow(
        'DB Error'
      );
    });
  });

  describe('removeFavorite', () => {
    it('debería eliminar favorito correctamente', async () => {
      (prisma.favorite.delete as jest.Mock).mockResolvedValue({});

      await FavoriteService.removeFavorite('user-123', 'case-123');

      expect(prisma.favorite.delete).toHaveBeenCalledWith({
        where: {
          userId_caseId: {
            userId: 'user-123',
            caseId: 'case-123',
          },
        },
      });
    });

    it('debería manejar caso donde favorito no existe', async () => {
      const error = new Error('Record to delete does not exist');
      (prisma.favorite.delete as jest.Mock).mockRejectedValue(error);

      // No debería lanzar error
      await expect(FavoriteService.removeFavorite('user-123', 'case-123')).resolves.toBeUndefined();
    });

    it('debería propagar otros errores', async () => {
      (prisma.favorite.delete as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(FavoriteService.removeFavorite('user-123', 'case-123')).rejects.toThrow(
        'DB Error'
      );
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

      (prisma.favorite.count as jest.Mock).mockResolvedValue(0);
      (prisma.case.findUnique as jest.Mock).mockResolvedValue({ id: 'case-123' });
      (prisma.favorite.upsert as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await FavoriteService.toggleFavorite('user-123', 'case-123');

      expect(result).toEqual({ isFavorite: true });
    });

    it('debería eliminar favorito si ya existe', async () => {
      (prisma.favorite.count as jest.Mock).mockResolvedValue(1);
      (prisma.favorite.delete as jest.Mock).mockResolvedValue({});

      const result = await FavoriteService.toggleFavorite('user-123', 'case-123');

      expect(result).toEqual({ isFavorite: false });
    });

    it('debería propagar errores de addFavorite', async () => {
      (prisma.favorite.count as jest.Mock).mockResolvedValue(0);
      (prisma.case.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(FavoriteService.toggleFavorite('user-123', 'case-123')).rejects.toThrow(
        'Case not found'
      );
    });
  });

  describe('getFavoriteCount', () => {
    it('debería obtener conteo de favoritos', async () => {
      (prisma.favorite.count as jest.Mock).mockResolvedValue(15);

      const result = await FavoriteService.getFavoriteCount('case-123');

      expect(result).toBe(15);
      expect(prisma.favorite.count).toHaveBeenCalledWith({
        where: { caseId: 'case-123' },
      });
    });

    it('debería retornar 0 si hay error', async () => {
      (prisma.favorite.count as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await FavoriteService.getFavoriteCount('case-123');

      expect(result).toBe(0);
    });
  });

  describe('getTrendingCases', () => {
    it('debería obtener casos trending con conteo', async () => {
      const mockGroupBy = [
        { caseId: 'case-1', _count: { id: 25 } },
        { caseId: 'case-2', _count: { id: 15 } },
      ];

      const mockCases = [
        {
          id: 'case-1',
          title: 'Caso Popular',
          area: 'Cardiología',
          difficulty: 'medium',
          summary: 'Resumen',
        },
      ];

      (prisma.favorite.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);
      (prisma.case.findMany as jest.Mock).mockResolvedValue(mockCases);

      const result = await FavoriteService.getTrendingCases(10);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockCases[0],
        favoriteCount: 25,
      });
    });

    it('debería retornar array vacío si hay error', async () => {
      (prisma.favorite.groupBy as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await FavoriteService.getTrendingCases();

      expect(result).toEqual([]);
    });
  });

  describe('clearUserFavorites', () => {
    it('debería eliminar todos los favoritos del usuario', async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await FavoriteService.clearUserFavorites('user-123');

      expect(result).toBe(5);
      expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('debería propagar error', async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(FavoriteService.clearUserFavorites('user-123')).rejects.toThrow('DB Error');
    });
  });

  describe('getFavoriteIds', () => {
    it('debería obtener IDs de favoritos', async () => {
      const mockFavorites = [{ caseId: 'case-1' }, { caseId: 'case-2' }];

      (prisma.favorite.findMany as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await FavoriteService.getFavoriteIds('user-123');

      expect(result).toEqual(['case-1', 'case-2']);
      expect(prisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { caseId: true },
      });
    });

    it('debería retornar array vacío si hay error', async () => {
      (prisma.favorite.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await FavoriteService.getFavoriteIds('user-123');

      expect(result).toEqual([]);
    });
  });
});
