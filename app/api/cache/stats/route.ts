// app/api/cache/stats/route.ts
import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { compose, withAuth, withLogging } from '@/lib/middleware/api-middleware';

export const runtime = 'nodejs';

/**
 * GET /api/cache/stats
 * Endpoint de monitoreo para estadísticas de caché
 * 
 * Requiere autenticación para evitar exponer métricas públicamente
 */
export const GET = compose(
  withAuth,
  withLogging
)(async () => {
  const stats = await cache.stats();
  
  // Calcular eficiencia del caché
  const efficiency = stats.hitRate >= 80 
    ? 'excellent' 
    : stats.hitRate >= 60 
    ? 'good' 
    : stats.hitRate >= 40 
    ? 'fair' 
    : 'poor';

  const response = {
    success: true,
    cache: {
      ...stats,
      hitRateFormatted: `${stats.hitRate.toFixed(2)}%`,
      efficiency,
      recommendations: getRecommendations(stats),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
});

/**
 * Generar recomendaciones basadas en métricas
 */
function getRecommendations(stats: {
  hitRate: number;
  size: number;
  maxEntries: number;
}): string[] {
  const recommendations: string[] = [];

  if (stats.hitRate < 50) {
    recommendations.push('⚠️ Hit rate bajo (<50%). Considerar incrementar TTL o revisar estrategia de invalidación.');
  }

  if (stats.hitRate >= 80) {
    recommendations.push('✅ Excelente hit rate (≥80%). Caché funcionando óptimamente.');
  }

  if (stats.size > 0 && stats.maxEntries > 0 && stats.size > stats.maxEntries * 0.8) {
    recommendations.push('⚠️ Caché cerca del límite (>80%). Considerar incrementar maxEntries o limpiar datos obsoletos.');
  }

  if (stats.size === 0) {
    recommendations.push('ℹ️ Caché vacío. Es normal en desarrollo o después de un reinicio.');
  }

  return recommendations;
}
