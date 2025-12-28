// services/caso.service.ts

// Asegúrate de usar la importación { prisma } directamente,
// ya que es la única instancia exportada de forma segura
import { prisma } from '@/lib/prisma';
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
    console.error("Error al obtener casos activos:", error);
    // Lanzar un error controlado para que Next.js lo capte
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
    // Captura cualquier fallo de conexión/consulta y lo reporta
    console.error(`Error al obtener detalles de la opción ID: ${optionId}`, error);
    return null; // En este caso, devolvemos null, asumiendo que la opción no existe o hubo un fallo de DB
  }
}