// lib/repositories/favorite.repository.ts
import { Favorite, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type FavoriteWithCase = Prisma.FavoriteGetPayload<{
  include: {
    case: true;
  };
}>;

export class FavoriteRepository extends BaseRepository<Favorite> {
  constructor() {
    super('favorite');
  }

  /**
   * Obtener favoritos de usuario con casos
   */
  async getUserFavorites(
    userId: string,
    page: number = 1,
    limit: number = 20,
    readOnly: boolean = true
  ): Promise<{
    favorites: FavoriteWithCase[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.executeQuery('getUserFavorites', async () => {
      const client = this.getClient(readOnly);

      const [favorites, total] = await Promise.all([
        client.favorite.findMany({
          where: { userId },
          include: {
            case: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        client.favorite.count({
          where: { userId },
        }),
      ]);

      return {
        favorites,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  /**
   * Verificar si un caso es favorito
   */
  async isFavorite(userId: string, casoId: string, readOnly: boolean = true): Promise<boolean> {
    return this.exists({ userId, casoId }, readOnly);
  }

  /**
   * Agregar favorito
   */
  async addFavorite(userId: string, casoId: string): Promise<Favorite> {
    return this.create({ userId, casoId });
  }

  /**
   * Eliminar favorito
   */
  async removeFavorite(userId: string, casoId: string): Promise<{ count: number }> {
    return this.deleteMany({ userId, casoId });
  }

  /**
   * Toggle favorito (agregar/eliminar)
   */
  async toggleFavorite(userId: string, casoId: string): Promise<{
    isFavorite: boolean;
    favorite?: Favorite;
  }> {
    return this.executeQuery('toggleFavorite', async () => {
      const existing = await this.findOne({ userId, casoId });

      if (existing) {
        await this.removeFavorite(userId, casoId);
        return { isFavorite: false };
      } else {
        const favorite = await this.addFavorite(userId, casoId);
        return { isFavorite: true, favorite };
      }
    });
  }

  /**
   * Obtener contador de favoritos por caso
   */
  async getFavoriteCount(casoId: string, readOnly: boolean = true): Promise<number> {
    return this.count({ casoId }, readOnly);
  }

  /**
   * Obtener casos más favoritos (trending)
   */
  async getTrendingCases(limit: number = 10, readOnly: boolean = true) {
    return this.executeQuery('getTrendingCases', async () => {
      const client = this.getClient(readOnly);

      const trending = await client.favorite.groupBy({
        by: ['caseId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: limit,
      });

      // Obtener información de casos
      const caseIds = trending.map((t: any) => t.caseId);
      const cases = await client.case.findMany({
        where: {
          id: { in: caseIds },
        },
      });

      // Combinar datos
      return trending.map((item: any, index: number) => {
        const caseData = cases.find((c: any) => c.id === item.caseId);
        return {
          rank: index + 1,
          case: caseData,
          favoriteCount: item._count.id,
        };
      });
    });
  }

  /**
   * Obtener IDs de favoritos de usuario (para quick checks)
   */
  async getFavoriteIds(userId: string, readOnly: boolean = true): Promise<string[]> {
    return this.executeQuery('getFavoriteIds', async () => {
      const client = this.getClient(readOnly);
      const favorites = await client.favorite.findMany({
        where: { userId },
        select: { caseId: true },
      });
      return favorites.map((f: any) => f.caseId);
    });
  }

  /**
   * Limpiar todos los favoritos de un usuario
   */
  async clearUserFavorites(userId: string): Promise<{ count: number }> {
    return this.deleteMany({ userId });
  }

  /**
   * Obtener favoritos por área
   */
  async getFavoritesByArea(userId: string, readOnly: boolean = true) {
    return this.executeQuery('getFavoritesByArea', async () => {
      const client = this.getClient(readOnly);

      const favorites = await client.favorite.findMany({
        where: { userId },
        include: {
          case: {
            select: {
              area: true,
            },
          },
        },
      });

      // Agrupar por área
      const byArea = favorites.reduce((acc: any, fav: any) => {
        const area = fav.case.area;
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(byArea).map(([area, count]) => ({
        area,
        count,
      }));
    });
  }
}

// Instancia singleton
export const favoriteRepository = new FavoriteRepository();
