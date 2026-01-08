// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
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

  let user = await UserService.getUserProfile(userId);

  // Si el usuario no existe en la BD, crearlo automáticamente desde Clerk
  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      user = await UserService.syncUser({
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : undefined,
      });
    }
  }

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

  // Verificar que el usuario existe, si no, crearlo primero
  let user = await UserService.getUserProfile(userId);
  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      user = await UserService.syncUser({
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : undefined,
      });
    }
  }

  // Construir objeto de actualización con tipos correctos de Prisma
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.university !== undefined) updateData.university = data.university;
  if (data.yearOfStudy !== undefined) updateData.yearOfStudy = data.yearOfStudy;
  if (data.specialty !== undefined) updateData.specialty = data.specialty;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;

  const updatedUser = await UserService.updateUserProfile(userId, updateData);

  return NextResponse.json({
    success: true,
    user: updatedUser,
    message: 'Perfil actualizado exitosamente'
  });
});
