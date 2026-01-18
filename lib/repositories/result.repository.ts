// lib/repositories/result.repository.ts
import { StudentResult, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type ResultWithCase = Prisma.StudentResultGetPayload<{
  include: {
    case: true;
  };
}>;

export interface ResultFilters {
  userId: string;
  caseArea?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class ResultRepository extends BaseRepository<StudentResult> {
  constructor() {
    super('studentResult');
  }

  /**
   * Crear resultado
   */
  async createResult(data: {
    id: string;
    userId: string;
    caseId: string;
    score: number;
    mode?: string;
    timeSpent?: number;
    answers?: any;
    caseArea?: string;
    caseTitle?: string;
    totalPoints?: number;
  }): Promise<StudentResult> {
    return this.create(data);
  }

  /**
   * Obtener resultados de usuario con filtros y paginación
   */
  async getUserResults(filters: ResultFilters, readOnly: boolean = true): Promise<{
    results: ResultWithCase[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.executeQuery('getUserResults', async () => {
      const client = this.getClient(readOnly);
      const { userId, caseArea, startDate, endDate, page = 1, limit = 20 } = filters;

      const where: Prisma.StudentResultWhereInput = {
        userId,
        ...(caseArea && { caseArea }),
        ...(startDate && { completedAt: { gte: startDate } }),
        ...(endDate && { completedAt: { lte: endDate } }),
      };

      const [results, total] = await Promise.all([
        client.studentResult.findMany({
          where,
          include: {
            case: true,
          },
          orderBy: {
            completedAt: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        client.studentResult.count({ where }),
      ]);

      return {
        results,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  /**
   * Obtener estadísticas de usuario
   * Educational: Comprehensive stats for student progress tracking
   */
  async getUserStats(userId: string, readOnly: boolean = true) {
    return this.executeQuery('getUserStats', async () => {
      const client = this.getClient(readOnly);

      const [
        totalCases,
        aggregates,
        totalTimeSpent,
      ] = await Promise.all([
        client.studentResult.count({ where: { userId } }),
        client.studentResult.aggregate({
          where: { userId },
          _avg: { score: true },
          _sum: { totalPoints: true },
          _max: { score: true },
          _min: { score: true },
        }),
        client.studentResult.aggregate({
          where: { userId, timeSpent: { not: null } },
          _avg: { timeSpent: true },
        }),
      ]);

      return {
        totalCases,
        averageScore: aggregates._avg.score || 0,
        totalPoints: aggregates._sum.totalPoints || 0,
        bestScore: aggregates._max.score || 0,
        worstScore: aggregates._min.score || 0,
        timeAverage: totalTimeSpent._avg.timeSpent || 0,
      };
    });
  }

  /**
   * Obtener estadísticas por área
   * Educational: Shows student performance across obstetrics topics
   */
  async getStatsByArea(userId: string, readOnly: boolean = true) {
    return this.executeQuery('getStatsByArea', async () => {
      const client = this.getClient(readOnly);

      const results = await client.studentResult.groupBy({
        by: ['caseArea'],
        where: { userId },
        _count: { id: true },
        _avg: { score: true },
        _sum: { totalPoints: true },
      });

      return results.map((stat: any) => ({
        area: stat.caseArea,
        casesCompleted: stat._count.id,
        averageScore: stat._avg.score || 0,
        totalPoints: stat._sum.totalPoints || 0,
      }));
    });
  }

  /**
   * Obtener leaderboard
   * Educational: Ranks Chilean medical students by total score
   */
  async getLeaderboard(
    area?: string,
    limit: number = 20,
    readOnly: boolean = true
  ): Promise<Array<{ userId: string; totalScore: number; casesCompleted: number }>> {
    return this.executeQuery('getLeaderboard', async () => {
      const client = this.getClient(readOnly);

      const where: Prisma.StudentResultWhereInput = area ? { caseArea: area } : {};

      const results = await client.studentResult.groupBy({
        by: ['userId'],
        where,
        _count: { id: true },
        _sum: { score: true },
        orderBy: {
          _sum: { score: 'desc' },
        },
        take: limit,
      });

      return results.map((entry: any) => ({
        userId: entry.userId,
        totalScore: entry._sum.score || 0,
        casesCompleted: entry._count.id,
      }));
    });
  }

  /**
   * Verificar si usuario ya resolvió un caso
   */
  async hasAttempted(userId: string, caseId: string, readOnly: boolean = true): Promise<boolean> {
    return this.exists({ userId, caseId }, readOnly);
  }

  /**
   * Verificar si usuario completó un caso (alias for service compatibility)
   */
  async hasCompletedCase(userId: string, caseId: string, readOnly: boolean = true): Promise<boolean> {
    return this.hasAttempted(userId, caseId, readOnly);
  }

  /**
   * Obtener historial de intentos de un caso
   * Educational: Shows all student attempts for specific case
   */
  async getCaseHistory(userId: string, caseId: string, readOnly: boolean = true): Promise<StudentResult[]> {
    return this.executeQuery('getCaseHistory', async () => {
      const client = this.getClient(readOnly);
      return client.studentResult.findMany({
        where: { userId, caseId },
        orderBy: { completedAt: 'desc' },
      });
    });
  }

  /**
   * Obtener mejor resultado de un caso
   * Educational: Highest score achieved by student on a case
   */
  async getBestResult(userId: string, caseId: string, readOnly: boolean = true): Promise<StudentResult | null> {
    return this.findOne(
      { userId, caseId },
      { orderBy: { score: 'desc' } },
      readOnly
    );
  }

  /**
   * Obtener último resultado de un caso
   */
  async getLastAttempt(
    userId: string,
    caseId: string,
    readOnly: boolean = true
  ): Promise<StudentResult | null> {
    return this.findOne(
      { userId, caseId },
      { orderBy: { completedAt: 'desc' } },
      readOnly
    );
  }

  /**
   * Eliminar todos los resultados de un usuario
   */
  async deleteUserResults(userId: string): Promise<{ count: number }> {
    return this.deleteMany({ userId });
  }
}

// Instancia singleton
export const resultRepository = new ResultRepository();
