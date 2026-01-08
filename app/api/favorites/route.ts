// app/api/favorites/route.ts
import { NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { compose, withAuth, withRateLimit, withLogging, withValidation, withQueryValidation } from '@/lib/middleware/api-middleware';
import { FavoriteService } from '@/services/favorite.service';
import { GetFavoritesQueryDto, AddFavoriteDto, RemoveFavoriteDto } from '@/lib/dtos/favorite.dto';
import { NotFoundError } from '@/lib/errors/app-errors';

// GET /api/favorites - Obtener todos los favoritos del usuario
export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withQueryValidation(GetFavoritesQueryDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;

  const favorites = await FavoriteService.getUserFavorites(userId);

  return NextResponse.json({
    success: true,
    favorites,
    meta: {
      total: favorites.length,
      userId
    }
  });
});

// POST /api/favorites - Agregar un caso a favoritos
export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withValidation(AddFavoriteDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const { caseId } = context.body;

  const favorite = await FavoriteService.addFavorite(userId, caseId);

  return NextResponse.json({
    success: true,
    favorite,
    message: 'Favorito agregado exitosamente'
  }, { status: 201 });
});

// DELETE /api/favorites?caseId=xxx - Eliminar un favorito
export const DELETE = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withQueryValidation(RemoveFavoriteDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const { caseId } = context.query;

  await FavoriteService.removeFavorite(userId, caseId);

  return NextResponse.json({
    success: true,
    message: 'Favorito eliminado exitosamente'
  });
});
