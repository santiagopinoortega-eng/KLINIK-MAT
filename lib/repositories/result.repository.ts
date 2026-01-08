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
   */
  async getUserStats(userId: string, readOnly: boolean = true) {
    return this.executeQuery('getUserStats', async () => {
      const client = this.getClient(readOnly);

      const [
        totalAttempts,
        avgScore,
        totalTimeSpent,
      ] = await Promise.all([
        client.studentResult.count({ where: { userId } }),
        client.studentResult.aggregate({
          where: { userId },
          _avg: { score: true },
        }),
        client.studentResult.aggregate({
          where: { userId },
          _sum: { timeSpent: true },
        }),
      ]);

      const averageScore = avgScore._avg.score || 0;
      const totalTime = totalTimeSpent._sum.timeSpent || 0;

      return {
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        totalTimeSpent: totalTime,
        averageTimePerCase: totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0,
      };
    });
  }

  /**
   * Obtener estadísticas por área
   */
  async getStatsByArea(userId: string, readOnly: boolean = true) {
    return this.executeQuery('getStatsByArea', async () => {
      const client = this.getClient(readOnly);

      const results = await client.studentResult.groupBy({
        by: ['caseArea'],
        where: { userId },
        _count: true,
        _avg: { score: true },
      });

      return results.map((stat: any) => ({
        area: stat.caseArea,
        total: stat._count,
        averageScore: Math.round((stat._avg.score || 0) * 100) / 100,
      }));
    });
  }

  /**
   * Obtener leaderboard
   */
  async getLeaderboard(
    area?: string,
    limit: number = 10,
    readOnly: boolean = true
  ) {
    return this.executeQuery('getLeaderboard', async () => {
      const client = this.getClient(readOnly);

      const where: Prisma.StudentResultWhereInput = area ? { caseArea: area } : {};

      const results = await client.studentResult.groupBy({
        by: ['userId'],
        where,
        _count: {
          id: true,
        },
        _avg: {
          score: true,
        },
        orderBy: {
          _avg: {
            score: 'desc',
          },
        },
        take: limit,
      });

      // Obtener información de usuarios
      const userIds = results.map((r: any) => r.userId);
      const users = await client.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      });

      // Combinar datos
      return results.map((result: any, index: number) => {
        const user = users.find((u: any) => u.id === result.userId);
        return {
          rank: index + 1,
          userId: result.userId,
          userName: user?.name || 'Usuario',
          userImage: user?.imageUrl,
          totalCases: result._count.id,
          averageScore: Math.round((result._avg.score || 0) * 100) / 100,
        };
      });
    });
  }

  /**
   * Verificar si usuario ya resolvió un caso
   */
  async hasAttempted(userId: string, caseId: string, readOnly: boolean = true): Promise<boolean> {
    return this.exists({ userId, caseId }, readOnly);
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
