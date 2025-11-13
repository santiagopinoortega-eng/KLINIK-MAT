// services/caso.service.ts
import { prisma } from '@/lib/prisma';
import type { Case, MinsalNorm } from '@prisma/client';

// Define el tipo de retorno limpio.
// Nota: Hemos actualizado los nombres de los campos para que coincidan con el schema.prisma (title, summary)
// y hemos cambiado 'referencias' por 'norms' para reflejar la relación real.
export type CasoListItem = Pick<Case, 'id' | 'title' | 'area' | 'difficulty' | 'summary'> & {
  norms: Pick<MinsalNorm, 'name' | 'code'>[];
};

/**
 * Función que obtiene el listado de casos activos para el catálogo principal.
 */
export async function getCasosActivos(): Promise<CasoListItem[]> {
  try {
    // Usamos la instancia única y optimizada de Prisma.
    const casos = await prisma.case.findMany({
      where: {
        isPublic: true,
      },
      // Seleccionamos los campos correctos y la relación 'norms'
      select: {
        id: true,
        title: true,
        area: true,
        difficulty: true,
        summary: true,
        norms: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Prisma ya devuelve la forma que necesitamos, solo hacemos una aserción de tipo.
    return casos as CasoListItem[];
  } catch (error) {
    console.error("Error al obtener casos activos:", error);
    // Lanzar un error para que el 'error.tsx' de Next.js lo maneje
    throw new Error("No se pudo cargar el listado de casos clínicos.");
  }
}
// services/caso.service.ts (Añadir al final del archivo)

import { Option } from '@prisma/client';

/**
 * Función para obtener los detalles de una opción seleccionada (incluyendo corrección y feedback).
 * @param optionId El ID de la opción que el usuario seleccionó.
 * @returns Los detalles completos de la Opción.
 */
export async function getOptionDetails(optionId: string): Promise<Option | null> {
  // Usamos prisma para obtener el detalle de la opción
  return await prisma.option.findUnique({
    where: { id: optionId },
  });
}