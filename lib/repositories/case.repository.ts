/**
 * Case Repository
 * 
 * Encapsulates all Prisma queries for clinical cases (obstetrics educational content).
 * Provides a clean interface for case browsing, filtering, and retrieval for Chilean medical students.
 * 
 * @module CaseRepository
 */

import { prisma, prismaRO } from '@/lib/prisma';
import type { Case, MinsalNorm, Prisma } from '@prisma/client';

/**
 * Case with related data for listing
 */
export type CaseListItem = Pick<Case, 'id' | 'title' | 'area' | 'difficulty' | 'summary' | 'modulo' | 'createdAt' | 'isPublic'> & {
  norms: Pick<MinsalNorm, 'name' | 'code'>[];
  _count: {
    questions: number;
  };
};

/**
 * Case with full details for student viewing
 */
export type CaseDetail = Case & {
  questions: any[];
  images: any[];
  norms: MinsalNorm[];
};

/**
 * Filters for case queries
 */
export interface CaseFilters {
  search?: string;
  area?: string;
  modulo?: string;
  difficulty?: number;
  isPublic?: boolean;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
}

/**
 * Case Repository
 * 
 * Provides data access methods for clinical cases in the educational platform.
 * All methods use read-only replica (prismaRO) for queries where possible to improve performance.
 */
export class CaseRepository {
  /**
   * Find multiple cases with filters and pagination
   * Used for case browsing by students
   */
  static async findMany(
    filters: CaseFilters = {},
    options: PaginationOptions = {}
  ): Promise<CaseListItem[]> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const cases = await prismaRO.case.findMany({
      where,
      select: {
        id: true,
        title: true,
        area: true,
        modulo: true,
        difficulty: true,
        summary: true,
        createdAt: true,
        isPublic: true,
        norms: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return cases;
  }

  /**
   * Count cases with filters
   * Used for pagination
   */
  static async count(filters: CaseFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prismaRO.case.count({ where });
  }

  /**
   * Find case by ID with full details
   * Used when student opens a specific case
   */
  static async findById(caseId: string): Promise<CaseDetail | null> {
    return prisma.case.findUnique({
      where: { id: caseId },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
            images: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        norms: true,
      },
    });
  }

  /**
   * Find case by ID (minimal data)
   * Used for validation checks
   */
  static async findByIdMinimal(caseId: string): Promise<Pick<Case, 'id' | 'isPublic'> | null> {
    return prismaRO.case.findUnique({
      where: { id: caseId },
      select: { id: true, isPublic: true },
    });
  }

  /**
   * Find all public cases (active catalog)
   * Used for main case list
   */
  static async findAllPublic(options: PaginationOptions = {}): Promise<CaseListItem[]> {
    return this.findMany({ isPublic: true }, options);
  }

  /**
   * Find cases by area (obstetrics topic)
   * Used for filtering by clinical area
   */
  static async findByArea(area: string, options: PaginationOptions = {}): Promise<CaseListItem[]> {
    return this.findMany({ area, isPublic: true }, options);
  }

  /**
   * Find cases by difficulty level
   * Used for adaptive learning (1=Baja, 2=Media, 3=Alta)
   */
  static async findByDifficulty(difficulty: number, options: PaginationOptions = {}): Promise<CaseListItem[]> {
    return this.findMany({ difficulty, isPublic: true }, options);
  }

  /**
   * Find cases by area and difficulty
   * Used for targeted practice
   */
  static async findByAreaAndDifficulty(
    area: string,
    difficulty: number,
    options: PaginationOptions = {}
  ): Promise<CaseListItem[]> {
    return this.findMany({ area, difficulty, isPublic: true }, options);
  }

  /**
   * Search cases by text
   * Searches in title, vignette, summary, and questions
   * Used for student search functionality
   */
  static async search(searchTerm: string, options: PaginationOptions = {}): Promise<CaseListItem[]> {
    return this.findMany({ search: searchTerm, isPublic: true }, options);
  }

  /**
   * Get recommended cases for a student
   * Based on weak areas identified from their results
   * 
   * @param weakAreas - Areas where student needs improvement
   * @param completedCaseIds - Cases already completed (to exclude)
   * @param limit - Max number of recommendations
   */
  static async findRecommendations(
    weakAreas: string[],
    completedCaseIds: string[] = [],
    limit: number = 5
  ): Promise<CaseListItem[]> {
    const where: Prisma.CaseWhereInput = {
      isPublic: true,
      area: { in: weakAreas },
      id: { notIn: completedCaseIds },
    };

    const cases = await prismaRO.case.findMany({
      where,
      select: {
        id: true,
        title: true,
        area: true,
        modulo: true,
        difficulty: true,
        summary: true,
        createdAt: true,
        isPublic: true,
        norms: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: { questions: true },
          },
      },
      orderBy: { difficulty: 'asc' }, // Start with easier cases
      take: limit,
    });

    return cases;
  }

  /**
   * Get trending cases (most favorited recently)
   * Used for homepage recommendations
   * 
   * @param days - Number of days to look back (default: 7)
   * @param limit - Max number of trending cases
   */
  static async findTrending(days: number = 7, limit: number = 10): Promise<CaseListItem[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get case IDs with most favorites in the period
    const trendingIds = await prismaRO.favorite.groupBy({
      by: ['caseId'],
      where: {
        createdAt: { gte: dateThreshold },
      },
      _count: { caseId: true },
      orderBy: { _count: { caseId: 'desc' } },
      take: limit,
    });

    if (trendingIds.length === 0) {
      // Fallback to most recent cases
      return this.findAllPublic({ limit });
    }

    const caseIds = trendingIds.map(item => item.caseId);

    return this.findManyByIds(caseIds);
  }

  /**
   * Find multiple cases by IDs
   * Used internally for trending/recommendations
   */
  static async findManyByIds(caseIds: string[]): Promise<CaseListItem[]> {
    const cases = await prismaRO.case.findMany({
      where: { id: { in: caseIds } },
      select: {
        id: true,
        title: true,
        area: true,
        modulo: true,
        difficulty: true,
        summary: true,
        createdAt: true,
        isPublic: true,
        norms: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    return cases;
  }

  /**
   * Get distinct areas (for filter dropdowns)
   */
  static async getDistinctAreas(): Promise<string[]> {
    const cases = await prismaRO.case.findMany({
      where: { isPublic: true },
      distinct: ['area'],
      select: { area: true },
    });

    return cases.map(c => c.area);
  }

  /**
   * Get distinct modules for a specific area
   */
  static async getDistinctModules(area?: string): Promise<string[]> {
    const where: Prisma.CaseWhereInput = {
      isPublic: true,
      modulo: { not: null },
    };

    if (area) {
      where.area = area;
    }

    const cases = await prismaRO.case.findMany({
      where,
      distinct: ['modulo'],
      select: { modulo: true },
    });

    return cases.filter(c => c.modulo !== null).map(c => c.modulo!);
  }

  /**
   * Build where clause from filters
   * Internal helper method
   */
  private static buildWhereClause(filters: CaseFilters): Prisma.CaseWhereInput {
    const where: Prisma.CaseWhereInput = {};

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.area) {
      where.area = filters.area;
    }

    if (filters.modulo) {
      where.modulo = filters.modulo;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.search && filters.search.length > 0) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { vignette: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
        {
          questions: {
            some: {
              text: { contains: filters.search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    return where;
  }
}
