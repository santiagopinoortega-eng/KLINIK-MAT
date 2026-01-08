// services/caso.service.ts

// Asegúrate de usar la importación { prisma } directamente,
// ya que es la única instancia exportada de forma segura
import { prisma, prismaRO } from '@/lib/prisma';
import { logger } from '@/lib/logger';
// Usamos los tipos que definiste en tu nuevo schema.
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
 */
export class CasoService {
  /**
   * Obtiene casos con filtros avanzados y paginación
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
      const skip = (page - 1) * limit;

      // Query base - solo casos públicos
      const whereClause: any = { isPublic: true };

      // Filtrar por área
      if (area) {
        whereClause.area = area;
      }

      // Filtrar por dificultad
      if (difficulty) {
        whereClause.difficulty = difficulty;
      }

      // Si hay búsqueda, buscar en múltiples campos
      if (search && search.length > 0) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { vignette: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          {
            questions: {
              some: {
                text: { contains: search, mode: 'insensitive' }
              }
            }
          }
        ];
      }

      // Consultar BD con prismaRO (read-only optimizado)
      const [data, total] = await Promise.all([
        prismaRO.case.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          select: { 
            id: true, 
            title: true, 
            area: true,
            modulo: true,
            difficulty: true, 
            createdAt: true,
            summary: true,
            isPublic: true,
            _count: {
              select: { questions: true }
            }
          },
          skip,
          take: limit,
        }),
        prismaRO.case.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        },
        filters: {
          search: search || null,
          area: area || null,
          difficulty: difficulty || null
        }
      };
    } catch (error) {
      logger.error('Failed to get cases', { params, error });
      throw error;
    }
  }
}

/**
 * Función que obtiene el listado de casos activos para el catálogo principal.
 * @returns Promesa de una lista de objetos de casos (CasoListItem[]).
 */
export async function getCasosActivos(): Promise<CasoListItem[]> {
  try {
    const casos = await prisma.case.findMany({
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        area: true,
        modulo: true, // Para filtros por submódulo
        difficulty: true,
        summary: true, // Nuevo campo 'summary'
        norms: {
          select: {
            name: true,
            code: true,
          },
        },
        // Si necesitas contar los pasos:
        // _count: { select: { steps: true } } 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // La aserción de tipo es válida aquí, ya que el 'select' fuerza la estructura.
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