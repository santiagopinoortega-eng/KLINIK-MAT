// services/caso.service.ts
/**
 * REFACTORED: Now uses StaticCaseRepository for data access
 * Educational platform: Core service for Chilean obstetrics case browsing
 */

import { StaticCaseRepository as CaseRepo } from '@/lib/repositories';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Case, MinsalNorm, Option } from '@prisma/client';

// ----------------------------------------------------------------------
// 1. Tipado de la lista de Casos (CasoListItem)
// ----------------------------------------------------------------------

// Usamos Omit para excluir campos que no queremos exponer y Pick para los esenciales
export type CasoListItem = Pick<Case, 'id' | 'title' | 'area' | 'difficulty' | 'summary'> & {
  // Campo módulo para filtros granulares
  modulo: string | null;
  // Las normas vienen anidadas
  norms: Pick<MinsalNorm, 'name' | 'code'>[];
  // Opcional: Si quieres contar el total de pasos para la UI, asegúrate de contarlos en la DB.
  // stepCount?: number; 
};

/**
 * CasoService - Servicio centralizado para gestión de casos clínicos
 * Educational: Manages 300+ obstetrics cases for Chilean medical students
 */
export class CasoService {
  /**
   * Obtiene casos con filtros avanzados y paginación
   * Educational: Core case browsing by area, difficulty, search terms
   */
  static async getCases(params: {
    search?: string;
    area?: string;
    difficulty?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const { search, area, difficulty, page = 1, limit = 20 } = params;

      // Use repository for data access
      const [data, total] = await Promise.all([
        CaseRepo.findMany(
          {
            search,
            area,
            difficulty,
            isPublic: true,
          },
          { page, limit }
        ),
        CaseRepo.count({
          search,
          area,
          difficulty,
          isPublic: true,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
        filters: {
          search: search || null,
          area: area || null,
          difficulty: difficulty || null,
        },
      };
    } catch (error) {
      logger.error('Failed to get cases', { params, error });
      throw error;
    }
  }
}

/**
 * Función que obtiene el listado de casos activos para el catálogo principal.
 * Educational: Main catalog of obstetrics cases for students
 * @returns Promesa de una lista de objetos de casos (CasoListItem[]).
 */
export async function getCasosActivos(): Promise<CasoListItem[]> {
  try {
    const casos = await CaseRepo.findAllPublic();
    return casos as CasoListItem[];
  } catch (error) {
    logger.error('Failed to fetch active cases', error);
    throw new Error("No se pudo cargar el listado de casos clínicos. (DB Error)");
  }
}

// ----------------------------------------------------------------------
// 2. Función para Obtener Detalles de Opción (Mejora de Manejo de Errores)
// ----------------------------------------------------------------------

/**
 * Función para obtener los detalles de una opción seleccionada (incluyendo corrección y feedback).
 * @param optionId El ID de la opción que el usuario seleccionó.
 * @returns Los detalles completos de la Opción o null.
 */
export async function getOptionDetails(optionId: string): Promise<Option | null> {
  try {
    // Usamos prisma para obtener el detalle de la opción
    return await prisma.option.findUnique({
      where: { id: optionId },
    });
  } catch (error) {
    logger.error(`Failed to fetch option details: ${optionId}`, error);
    return null;
  }
}