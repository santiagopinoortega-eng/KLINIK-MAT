// lib/repositories/caso.repository.ts
import { Case, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type CaseWithOptions = Prisma.CaseGetPayload<{
  include: {
    questions: {
      include: {
        options: true;
      };
    };
  };
}>;

export interface CaseFilters {
  search?: string;
  area?: string;
  difficulty?: string | number;
  tags?: string[];
  page?: number;
  limit?: number;
}

export class CaseRepository extends BaseRepository<Case> {
  constructor() {
    super('case');
  }

  /**
   * Buscar casos con filtros avanzados
   */
  async findCases(filters: CaseFilters, readOnly: boolean = true): Promise<{
    cases: CaseWithOptions[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.executeQuery('findCases', async () => {
      const client = this.getClient(readOnly);
      const { search, area, difficulty, page = 1, limit = 20 } = filters;

      const where: Prisma.CaseWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(area && { area }),
        ...(difficulty !== undefined && { difficulty: Number(difficulty) }),
      };

      const [cases, total] = await Promise.all([
        client.case.findMany({
          where,
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        client.case.count({ where }),
      ]);

      return {
        cases,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  /**
   * Buscar caso con opciones
   */
  async findWithOptions(caseId: string, readOnly: boolean = true): Promise<CaseWithOptions | null> {
    return this.executeQuery('findWithOptions', async () => {
      const client = this.getClient(readOnly);
      return client.case.findUnique({
        where: { id: caseId },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      });
    });
  }

  /**
   * Buscar casos por área
   */
  async findByArea(area: string, limit: number = 20, readOnly: boolean = true): Promise<Case[]> {
    return this.findMany(
      {
        where: { area },
        take: limit,
        orderBy: { createdAt: 'desc' },
      },
      readOnly
    );
  }

  /**
   * Obtener estadísticas de casos
   */
  async getCaseStats(readOnly: boolean = true) {
    return this.executeQuery('getCaseStats', async () => {
      const client = this.getClient(readOnly);

      const [
        totalCases,
        casesByArea,
        casesByDifficulty,
      ] = await Promise.all([
        client.case.count(),
        client.case.groupBy({
          by: ['area'],
          _count: true,
        }),
        client.case.groupBy({
          by: ['difficulty'],
          _count: true,
        }),
      ]);

      return {
        totalCases,
        byArea: casesByArea.map((item: any) => ({
          area: item.area,
          count: item._count,
        })),
        byDifficulty: casesByDifficulty.map((item: any) => ({
          difficulty: item.difficulty,
          count: item._count,
        })),
      };
    });
  }
}

// Instancia singleton
export const caseRepository = new CaseRepository();
