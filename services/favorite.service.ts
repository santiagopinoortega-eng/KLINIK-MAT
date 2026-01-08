// services/favorite.service.ts
/**
 * Servicio de gestión de favoritos
 * Maneja toda la lógica de negocio relacionada con casos favoritos
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Favorite, Case } from '@prisma/client';

export type FavoriteWithCase = Favorite & {
  case: Pick<Case, 'id' | 'title' | 'area' | 'difficulty' | 'summary'>;
};

export class FavoriteService {
  /**
   * Obtiene todos los favoritos de un usuario
   */
  static async getUserFavorites(userId: string): Promise<FavoriteWithCase[]> {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
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

      return favorites;
    } catch (error) {
      logger.error('Failed to get user favorites', { userId, error });
      throw error;
    }
  }

  /**
   * Verifica si un caso es favorito del usuario
   */
  static async isFavorite(userId: string, caseId: string): Promise<boolean> {
    try {
      const count = await prisma.favorite.count({
        where: {
          userId,
          caseId,
        },
      });

      return count > 0;
    } catch (error) {
      logger.error('Failed to check if favorite', { userId, caseId, error });
      return false;
    }
  }

  /**
   * Agrega un caso a favoritos
   */
  static async addFavorite(userId: string, caseId: string): Promise<Favorite> {
    try {
      // Verificar que el caso existe
      const caseExists = await prisma.case.findUnique({
        where: { id: caseId },
        select: { id: true },
      });

      if (!caseExists) {
        throw new Error('Case not found');
      }

      // Crear favorito (upsert para evitar duplicados)
      const favorite = await prisma.favorite.upsert({
        where: {
          userId_caseId: {
            userId,
            caseId,
          },
        },
        update: {}, // No actualizar nada si ya existe
        create: {
          userId,
          caseId,
        },
      });

      logger.info('Favorite added', { userId, caseId });
      return favorite;
    } catch (error) {
      logger.error('Failed to add favorite', { userId, caseId, error });
      throw error;
    }
  }

  /**
   * Elimina un caso de favoritos
   */
  static async removeFavorite(userId: string, caseId: string): Promise<void> {
    try {
      await prisma.favorite.delete({
        where: {
          userId_caseId: {
            userId,
            caseId,
          },
        },
      });

      logger.info('Favorite removed', { userId, caseId });
    } catch (error) {
      // Si no existe, no es un error crítico
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        logger.warn('Favorite not found for deletion', { userId, caseId });
        return;
      }
      
      logger.error('Failed to remove favorite', { userId, caseId, error });
      throw error;
    }
  }

  /**
   * Alterna el estado de favorito (agregar/eliminar)
   */
  static async toggleFavorite(userId: string, caseId: string): Promise<{ isFavorite: boolean }> {
    try {
      const exists = await this.isFavorite(userId, caseId);

      if (exists) {
        await this.removeFavorite(userId, caseId);
        return { isFavorite: false };
      } else {
        await this.addFavorite(userId, caseId);
        return { isFavorite: true };
      }
    } catch (error) {
      logger.error('Failed to toggle favorite', { userId, caseId, error });
      throw error;
    }
  }

  /**
   * Obtiene el conteo de favoritos de un caso
   */
  static async getFavoriteCount(caseId: string): Promise<number> {
    try {
      const count = await prisma.favorite.count({
        where: { caseId },
      });

      return count;
    } catch (error) {
      logger.error('Failed to get favorite count', { caseId, error });
      return 0;
    }
  }

  /**
   * Obtiene casos más populares (más favoritos)
   */
  static async getTrendingCases(limit: number = 10) {
    try {
      const trending = await prisma.favorite.groupBy({
        by: ['caseId'],
        _count: { id: true },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: limit,
      });

      // Obtener información completa de los casos
      const caseIds = trending.map(t => t.caseId);
      const cases = await prisma.case.findMany({
        where: {
          id: { in: caseIds },
          isPublic: true,
        },
        select: {
          id: true,
          title: true,
          area: true,
          difficulty: true,
          summary: true,
        },
      });

      // Combinar con conteo de favoritos
      return cases.map(caso => {
        const trend = trending.find(t => t.caseId === caso.id);
        return {
          ...caso,
          favoriteCount: trend?._count.id || 0,
        };
      });
    } catch (error) {
      logger.error('Failed to get trending cases', { error });
      return [];
    }
  }

  /**
   * Elimina todos los favoritos de un usuario
   */
  static async clearUserFavorites(userId: string): Promise<number> {
    try {
      const result = await prisma.favorite.deleteMany({
        where: { userId },
      });

      logger.info('User favorites cleared', { userId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to clear user favorites', { userId, error });
      throw error;
    }
  }

  /**
   * Obtiene IDs de casos favoritos (para quick checks)
   */
  static async getFavoriteIds(userId: string): Promise<string[]> {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        select: { caseId: true },
      });

      return favorites.map(f => f.caseId);
    } catch (error) {
      logger.error('Failed to get favorite IDs', { userId, error });
      return [];
    }
  }
}
