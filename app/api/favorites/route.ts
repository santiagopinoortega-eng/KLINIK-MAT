// app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/ratelimit';
import { requireCsrfToken } from '@/lib/csrf';
import { sanitizeCaseId } from '@/lib/sanitize';
import type { FavoriteWithCase, FavoriteResponse } from '@/lib/types/api-types';

// GET /api/favorites - Obtener todos los favoritos del usuario
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitCheck = checkRateLimit(req, RATE_LIMITS.AUTHENTICATED);
    if (!rateLimitCheck.ok) {
      return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 });
    }

    // Buscar favoritos con información del caso
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            area: true,
            difficulty: true,
            summary: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      favorites: favorites.map((f: FavoriteWithCase): FavoriteResponse => ({
        id: f.id,
        caseId: f.caseId,
        createdAt: f.createdAt,
        case: f.case
      }))
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Error al obtener favoritos' }, { status: 500 });
  }
}

// POST /api/favorites - Agregar un caso a favoritos
export async function POST(req: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = await requireCsrfToken(req);
    if (csrfError) return csrfError;

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitCheck = checkRateLimit(req, RATE_LIMITS.WRITE);
    if (!rateLimitCheck.ok) {
      return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 });
    }

    const body = await req.json();
    const { caseId } = body;

    if (!caseId || typeof caseId !== 'string') {
      return NextResponse.json({ error: 'caseId es requerido' }, { status: 400 });
    }

    // Sanitize caseId
    let sanitizedCaseId: string;
    try {
      sanitizedCaseId = sanitizeCaseId(caseId);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Verificar que el caso existe
    const caseExists = await prisma.case.findUnique({
      where: { id: sanitizedCaseId }
    });

    if (!caseExists) {
      return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario existe en la BD
    const user = await currentUser();
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Crear o encontrar usuario
    const dbUser = await prisma.user.upsert({
      where: { email: user.primaryEmailAddress.emailAddress },
      update: { updatedAt: new Date() },
      create: {
        id: userId,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.firstName || 'Usuario',
        updatedAt: new Date()
      }
    });

    // Crear favorito (upsert para evitar duplicados)
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_caseId: {
          userId: dbUser.id,
          caseId
        }
      },
      update: {},
      create: {
        userId: dbUser.id,
        caseId
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            area: true,
            difficulty: true,
            summary: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      favorite: {
        id: favorite.id,
        caseId: favorite.caseId,
        createdAt: favorite.createdAt,
        case: favorite.case
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Error al agregar favorito' }, { status: 500 });
  }
}

// DELETE /api/favorites?caseId=xxx - Eliminar un favorito
export async function DELETE(req: NextRequest) {
  try {
    // CSRF Protection
    const csrfError = await requireCsrfToken(req);
    if (csrfError) return csrfError;

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitCheck = checkRateLimit(req, RATE_LIMITS.WRITE);
    if (!rateLimitCheck.ok) {
      return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ error: 'caseId es requerido' }, { status: 400 });
    }

    // Sanitize caseId
    let sanitizedCaseId: string;
    try {
      sanitizedCaseId = sanitizeCaseId(caseId);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Eliminar favorito
    const deleted = await prisma.favorite.deleteMany({
      where: {
        userId,
        caseId: sanitizedCaseId
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Favorito no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Favorito eliminado'
    });

  } catch (error) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json({ error: 'Error al eliminar favorito' }, { status: 500 });
  }
}
