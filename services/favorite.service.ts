// services/favorite.service.ts
/**
 * Servicio de gestión de favoritos
 * Maneja toda la lógica de negocio relacionada con casos favoritos
 * 
 * REFACTORED: Now uses FavoriteRepository for data access
 * Educational platform: Students bookmark clinical cases for later study
 */

import { favoriteRepository, casoRepository } from '@/lib/repositories';
import { logger } from '@/lib/logger';
import type { Favorite, Case } from '@prisma/client';

export type FavoriteWithCase = Favorite & {
  case: Pick<Case, 'id' | 'title' | 'area' | 'difficulty' | 'summary'>;
};

export class FavoriteService {
  /**
   * Obtiene todos los favoritos de un usuario
   * Educational: Student's bookmarked cases for review
   */
  static async getUserFavorites(userId: string): Promise<FavoriteWithCase[]> {
    try {
      const result = await favoriteRepository.getUserFavorites(userId, 1, 100);
      return result.favorites;
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
      return await favoriteRepository.isFavorite(userId, caseId);
    } catch (error) {
      logger.error('Failed to check if favorite', { userId, caseId, error });
      return false;
    }
  }

  /**
   * Agrega un caso a favoritos
   * Educational: Student bookmarks case for later study
   */
  static async addFavorite(userId: string, caseId: string): Promise<Favorite> {
    try {
      // Verificar que el caso existe usando repository
      const caseExists = await casoRepository.exists({ id: caseId });

      if (!caseExists) {
        throw new Error('Case not found');
      }

      // Crear favorito usando repository
      const favorite = await favoriteRepository.addFavorite(userId, caseId);

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
      await favoriteRepository.removeFavorite(userId, caseId);
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
      return await favoriteRepository.toggleFavorite(userId, caseId);
    } catch (error) {
      logger.error('Failed to toggle favorite', { userId, caseId, error });
      throw error;
    }
  }

  /**
   * Obtiene el conteo de favoritos de un caso
   * Educational: Shows popularity of clinical cases
   */
  static async getFavoriteCount(caseId: string): Promise<number> {
    try {
      return await favoriteRepository.getFavoriteCount(caseId);
    } catch (error) {
      logger.error('Failed to get favorite count', { caseId, error });
      return 0;
    }
  }

  /**
   * Obtiene casos más populares (más favoritos)
   * Educational: Recommends popular cases to students
   */
  static async getTrendingCases(limit: number = 10) {
    try {
      const result = await favoriteRepository.getTrendingCases(limit);
      return result;
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
      const result = await favoriteRepository.clearUserFavorites(userId);
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
      return await favoriteRepository.getFavoriteIds(userId);
    } catch (error) {
      logger.error('Failed to get favorite IDs', { userId, error });
      return [];
    }
  }
}
