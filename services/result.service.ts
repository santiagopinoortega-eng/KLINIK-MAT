// services/result.service.ts
/**
 * Servicio de gestión de resultados de casos
 * Maneja toda la lógica de negocio relacionada con resultados de estudiantes
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
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
      // Validar que el caso existe
      const caseExists = await prisma.case.findUnique({
        where: { id: data.caseId },
        select: { id: true, isPublic: true },
      });

      if (!caseExists) {
        throw new Error('Case not found');
      }

      if (!caseExists.isPublic) {
        throw new Error('Case is not public');
      }

      // Crear resultado
      const result = await prisma.studentResult.create({
        data: {
          id: `result_${Date.now()}_${data.userId.slice(0, 8)}`,
          userId: data.userId,
          caseId: data.caseId,
          caseTitle: data.caseTitle,
          caseArea: data.caseArea,
          score: data.score,
          totalPoints: data.totalPoints,
          mode: data.mode,
          timeSpent: data.timeSpent,
          timeLimit: data.timeLimit,
          answers: data.answers || {},
        },
      });

      // Registrar métrica de engagement
      await prisma.engagementMetric.create({
        data: {
          userId: data.userId,
          caseId: data.caseId,
          source: 'case_completion',
          action: 'complete',
          sessionDuration: data.timeSpent,
        },
      }).catch(error => {
        // No es crítico si falla el engagement
        logger.warn('Failed to create engagement metric', { error });
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
      const where: Prisma.StudentResultWhereInput = { userId };
      
      if (options?.area) {
        where.caseArea = options.area;
      }

      const results = await prisma.studentResult.findMany({
        where,
        orderBy: options?.sortBy === 'score' 
          ? { score: 'desc' }
          : { completedAt: 'desc' },
        take: options?.limit || 50,
      });

      return results;
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
      const result = await prisma.studentResult.findFirst({
        where: { userId, caseId },
        orderBy: { score: 'desc' },
      });

      return result;
    } catch (error) {
      logger.error('Failed to get best result', { userId, caseId, error });
      return null;
    }
  }

  /**
   * Obtiene estadísticas de resultados de un usuario
   */
  static async getUserStats(userId: string, area?: string): Promise<ResultStats> {
    try {
      const where: Prisma.StudentResultWhereInput = { userId };
      if (area) where.caseArea = area;

      const [count, aggregate, timeAggregate] = await Promise.all([
        prisma.studentResult.count({ where }),
        prisma.studentResult.aggregate({
          where,
          _avg: { score: true },
          _sum: { totalPoints: true },
          _max: { score: true },
          _min: { score: true },
        }),
        prisma.studentResult.aggregate({
          where: { ...where, timeSpent: { not: null } },
          _avg: { timeSpent: true },
        }),
      ]);

      return {
        totalCases: count,
        averageScore: aggregate._avg.score || 0,
        totalPoints: aggregate._sum.totalPoints || 0,
        bestScore: aggregate._max.score || 0,
        worstScore: aggregate._min.score || 0,
        timeAverage: timeAggregate._avg.timeSpent || 0,
      };
    } catch (error) {
      logger.error('Failed to get user stats', { userId, error });
      throw error;
    }
  }

  /**
   * Obtiene estadísticas por área
   */
  static async getStatsByArea(userId: string) {
    try {
      const stats = await prisma.studentResult.groupBy({
        by: ['caseArea'],
        where: { userId },
        _count: { id: true },
        _avg: { score: true },
        _sum: { totalPoints: true },
      });

      return stats.map(stat => ({
        area: stat.caseArea,
        casesCompleted: stat._count.id,
        averageScore: stat._avg.score || 0,
        totalPoints: stat._sum.totalPoints || 0,
      }));
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
      const results = await prisma.studentResult.findMany({
        where: { userId, caseId },
        orderBy: { completedAt: 'desc' },
      });

      return results;
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
      const count = await prisma.studentResult.count({
        where: { userId, caseId },
      });

      return count > 0;
    } catch (error) {
      logger.error('Failed to check case completion', { userId, caseId, error });
      return false;
    }
  }

  /**
   * Obtiene el ranking de usuarios por puntuación
   */
  static async getLeaderboard(options?: {
    area?: string;
    limit?: number;
  }): Promise<Array<{ userId: string; totalScore: number; casesCompleted: number }>> {
    try {
      const where: Prisma.StudentResultWhereInput = {};
      if (options?.area) where.caseArea = options.area;

      const leaderboard = await prisma.studentResult.groupBy({
        by: ['userId'],
        where,
        _count: { id: true },
        _sum: { score: true },
        orderBy: {
          _sum: { score: 'desc' },
        },
        take: options?.limit || 20,
      });

      return leaderboard.map(entry => ({
        userId: entry.userId,
        totalScore: entry._sum.score || 0,
        casesCompleted: entry._count.id,
      }));
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
      const result = await prisma.studentResult.deleteMany({
        where: { userId },
      });

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
      const results = await prisma.studentResult.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: limit,
      });

      return results;
    } catch (error) {
      logger.error('Failed to get recent results', { userId, error });
      return [];
    }
  }
}
