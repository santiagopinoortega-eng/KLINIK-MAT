// app/api/game-stats/route.ts
import { NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { compose, withAuth, withRateLimit, withLogging, withValidation, withQueryValidation } from '@/lib/middleware/api-middleware';
import { GameService } from '@/services/game.service';
import { GetGameStatsQueryDto, UpdateGameStatsDto } from '@/lib/dtos/game.dto';

// GET - Obtener estadísticas del usuario
export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withQueryValidation(GetGameStatsQueryDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const { gameType } = context.query;

  const stats = await GameService.getGameStats(userId, gameType);

  return NextResponse.json({
    success: true,
    stats
  });
});

// POST - Actualizar estadísticas después de un juego
export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withValidation(UpdateGameStatsDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const { gameType, won, score } = context.body;

  const updatedStats = await GameService.updateGameStats(userId, {
    gameType,
    won,
    score
  });

  return NextResponse.json({
    success: true,
    stats: updatedStats,
    message: 'Estadísticas actualizadas exitosamente'
  });
});
