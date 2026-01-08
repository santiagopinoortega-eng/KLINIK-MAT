// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { compose, withAuth, withRateLimit, withLogging, withValidation } from '@/lib/middleware/api-middleware';
import { UserService } from '@/services/user.service';
import { UpdateUserProfileDto } from '@/lib/dtos/user.dto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/profile
 * Obtiene el perfil completo del usuario actual
 */
export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;

  const user = await UserService.getUserProfile(userId);

  return NextResponse.json({
    success: true,
    user
  });
});

/**
 * PATCH /api/profile
 * Actualiza información demográfica del usuario
 */
export const PATCH = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withValidation(UpdateUserProfileDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const data = context.body;

  const updatedUser = await UserService.updateUserProfile(userId, data);

  return NextResponse.json({
    success: true,
    user: updatedUser,
    message: 'Perfil actualizado exitosamente'
  });
});
