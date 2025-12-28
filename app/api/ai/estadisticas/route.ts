// app/api/ai/estadisticas/route.ts
// Endpoint para obtener estadísticas de uso de IA

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { obtenerEstadisticasIA } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Estadísticas de rate limit
    const rateLimitStats = obtenerEstadisticasIA(userId);

    // Uso histórico (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const usoHistorico = await prisma.aiUsage.groupBy({
      by: ['tipo'],
      where: {
        userId,
        createdAt: {
          gte: hace30Dias,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        tokensInput: true,
        tokensOutput: true,
      },
    });

    // Tokens totales
    const tokensTotal = usoHistorico.reduce(
      (acc, item) => ({
        input: acc.input + (item._sum.tokensInput || 0),
        output: acc.output + (item._sum.tokensOutput || 0),
      }),
      { input: 0, output: 0 }
    );

    // Calcular costo estimado (Gemini Flash)
    const costoEstimado = 
      (tokensTotal.input / 1_000_000) * 0.075 + 
      (tokensTotal.output / 1_000_000) * 0.30;

    const estadisticas = {
      hoy: rateLimitStats,
      ultimos30Dias: {
        usosPorTipo: usoHistorico.map(item => ({
          tipo: item.tipo,
          cantidad: item._count.id,
          tokensInput: item._sum.tokensInput || 0,
          tokensOutput: item._sum.tokensOutput || 0,
        })),
        tokensTotal,
        costoEstimadoUSD: costoEstimado.toFixed(4),
      },
    };

    return NextResponse.json(estadisticas);

  } catch (error: any) {
    logger.error('Error obteniendo estadísticas IA', {
      error: error.message,
    });

    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
