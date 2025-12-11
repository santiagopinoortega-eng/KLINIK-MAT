// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/ratelimit';
import { requireCsrfToken } from '@/lib/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/profile
 * Obtiene el perfil completo del usuario actual
 */
export async function GET(req: Request) {
  try {
    // Rate limiting - límite generoso para lectura
    const rateLimit = checkRateLimit(req, RATE_LIMITS.AUTHENTICATED);
    if (!rateLimit.ok) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener información del usuario desde Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Buscar usuario en la base de datos
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        country: true,
        university: true,
        yearOfStudy: true,
        specialty: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Si no existe en la DB, crearlo automáticamente
    if (!dbUser) {
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
          avatar: clerkUser.imageUrl || null,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        user: newUser,
      });
    }

    return NextResponse.json({
      success: true,
      user: dbUser,
    });

  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Actualiza información demográfica del usuario
 */
export async function PATCH(req: Request) {
  try {
    // CSRF Protection
    const csrfError = await requireCsrfToken(req);
    if (csrfError) return csrfError;

    // Rate limiting - límite moderado para escritura
    const rateLimit = checkRateLimit(req, RATE_LIMITS.WRITE);
    if (!rateLimit.ok) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { country, university, yearOfStudy, specialty, bio } = body;

    // Validación del año de estudio
    if (yearOfStudy !== undefined && yearOfStudy !== null) {
      if (!Number.isInteger(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 7) {
        return NextResponse.json(
          { error: 'El año de estudio debe ser un número entre 1 y 7' },
          { status: 400 }
        );
      }
    }

    // Obtener información del usuario desde Clerk para caso de creación
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Si se está actualizando la especialidad, también guardarla en Clerk metadata
    if (specialty !== undefined) {
      await client.users.updateUserMetadata(userId, {
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          specialty: specialty,
        },
      });
    }

    // Actualizar usuario en la base de datos
    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        country: country || null,
        university: university || null,
        yearOfStudy: yearOfStudy || null,
        specialty: specialty || null,
        bio: bio || null,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        country: country || null,
        university: university || null,
        yearOfStudy: yearOfStudy || null,
        specialty: specialty || null,
        bio: bio || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
