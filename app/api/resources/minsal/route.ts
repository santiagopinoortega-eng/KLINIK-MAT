/**
 * API Route: Obtener recursos MINSAL
 * GET /api/resources/minsal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResources, getResourceStats } from '@/lib/data/minsal-resources';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const querySchema = z.object({
  category: z.string().optional(),
  source: z.string().optional(),
  search: z.string().optional(),
  stats: z.enum(['true', 'false']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Parsear query params
    const params = {
      category: searchParams.get('category') || undefined,
      source: searchParams.get('source') || undefined,
      search: searchParams.get('search') || undefined,
      stats: searchParams.get('stats') || undefined,
    };

    // Validar
    const validatedParams = querySchema.parse(params);

    // Si se solicitan solo estadísticas
    if (validatedParams.stats === 'true') {
      const stats = getResourceStats();
      return NextResponse.json(stats, { status: 200 });
    }

    // Obtener recursos con filtros
    const resources = getResources({
      category: validatedParams.category,
      source: validatedParams.source,
      search: validatedParams.search,
    });

    return NextResponse.json(
      {
        success: true,
        count: resources.length,
        resources,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en /api/resources/minsal:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Parámetros inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
