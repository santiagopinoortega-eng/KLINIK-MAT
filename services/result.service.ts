// services/result.service.ts
/**
 * Servicio de gestión de resultados de casos
 * Maneja toda la lógica de negocio relacionada con resultados de estudiantes
 * 
 * REFACTORED: Now uses ResultRepository and CaseRepository
 * Educational platform: Critical for tracking Chilean obstetrics student progress
 */

import { resultRepository } from '@/lib/repositories';
import { StaticCaseRepository as CaseRepo } from '@/lib/repositories';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';
import type { StudentResult, Prisma } from '@prisma/client';

export type CreateResultData = {
  userId: string;
  caseId: string;
  caseTitle: string;
  caseArea: string;
  score: number;
  totalPoints: number;
  mode: string;
  timeSpent?: number;
  timeLimit?: number;
  answers?: any;
};

export type ResultStats = {
  totalCases: number;
  averageScore: number;
  totalPoints: number;
  bestScore: number;
  worstScore: number;
  timeAverage: number;
};

export class ResultService {
  /**
   * Crea un nuevo resultado de caso
   */
  static async createResult(data: CreateResultData): Promise<StudentResult> {
    try {
      // Validar que el caso existe usando repository
      const caseExists = await CaseRepo.findByIdMinimal(data.caseId);

      if (!caseExists) {
        throw new Error('Case not found');
      }

      if (!caseExists.isPublic) {
        throw new Error('Case is not public');
      }

      // Generar UUID para el resultado
      const resultId = randomUUID();

      // Crear resultado usando repository
      const result = await resultRepository.createResult({
        id: resultId,
        userId: data.userId,
        caseId: data.caseId,
        caseTitle: data.caseTitle,
        caseArea: data.caseArea,
        score: data.score,
        totalPoints: data.totalPoints,
        mode: data.mode,
        timeSpent: data.timeSpent,
        answers: data.answers || {},
      });

      logger.info('Result created', { userId: data.userId, caseId: data.caseId, score: data.score });
      return result;
    } catch (error) {
      logger.error('Failed to create result', { data, error });
      throw error;
    }
  }

  /**
   * Obtiene todos los resultados de un usuario
   * Educational: Student's case completion history
   */
  static async getUserResults(
    userId: string,
    options?: {
      limit?: number;
      area?: string;
      sortBy?: 'date' | 'score';
    }
  ): Promise<StudentResult[]> {
    try {
      const result = await resultRepository.getUserResults({
        userId,
        caseArea: options?.area,
        limit: options?.limit || 50,
      });
      return result.results;
    } catch (error) {
      logger.error('Failed to get user results', { userId, error });
      throw error;
    }
  }

  /**
   * Obtiene el mejor resultado de un usuario para un caso
   */
  static async getBestResult(userId: string, caseId: string): Promise<StudentResult | null> {
    try {
      return await resultRepository.getBestResult(userId, caseId);
    } catch (error) {
      logger.error('Failed to get best result', { userId, caseId, error });
      return null;
    }
  }

  /**
   * Obtiene estadísticas de resultados de un usuario
   * Educational: Critical metrics for student progress tracking
   */
  static async getUserStats(userId: string, area?: string): Promise<ResultStats> {
    try {
      const stats = await resultRepository.getUserStats(userId);
      return stats;
    } catch (error) {
      logger.error('Failed to get user stats', { userId, error });
      throw error;
    }
  }

  /**
   * Obtiene estadísticas por área
   * Educational: Shows student performance by obstetrics topic
   */
  static async getStatsByArea(userId: string) {
    try {
      return await resultRepository.getStatsByArea(userId);
    } catch (error) {
      logger.error('Failed to get stats by area', { userId, error });
      return [];
    }
  }

  /**
   * Obtiene el historial de resultados de un caso específico
   */
  static async getCaseHistory(userId: string, caseId: string): Promise<StudentResult[]> {
    try {
      return await resultRepository.getCaseHistory(userId, caseId);
    } catch (error) {
      logger.error('Failed to get case history', { userId, caseId, error });
      return [];
    }
  }

  /**
   * Verifica si un usuario ha completado un caso
   */
  static async hasCompletedCase(userId: string, caseId: string): Promise<boolean> {
    try {
      return await resultRepository.hasCompletedCase(userId, caseId);
    } catch (error) {
      logger.error('Failed to check case completion', { userId, caseId, error });
      return false;
    }
  }

  /**
   * Obtiene el ranking de usuarios por puntuación
   * Educational: Leaderboard for Chilean medical students
   */
  static async getLeaderboard(options?: {
    area?: string;
    limit?: number;
  }): Promise<Array<{ userId: string; totalScore: number; casesCompleted: number }>> {
    try {
      return await resultRepository.getLeaderboard(options?.area, options?.limit);
    } catch (error) {
      logger.error('Failed to get leaderboard', { error });
      return [];
    }
  }

  /**
   * Elimina todos los resultados de un usuario
   */
  static async deleteUserResults(userId: string): Promise<number> {
    try {
      const result = await resultRepository.deleteUserResults(userId);
      logger.info('User results deleted', { userId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to delete user results', { userId, error });
      throw error;
    }
  }

  /**
   * Obtiene resultados recientes del usuario
   */
  static async getRecentResults(userId: string, limit: number = 10): Promise<StudentResult[]> {
    try {
      const result = await resultRepository.getUserResults({
        userId,
        limit,
      });
      return result.results;
    } catch (error) {
      logger.error('Failed to get recent results', { userId, error });
      return [];
    }
  }
}
