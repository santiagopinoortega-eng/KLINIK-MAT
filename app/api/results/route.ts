// app/api/results/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/results
 * Guarda el resultado de un caso clínico completado
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      caseId, 
      caseTitle, 
      caseArea, 
      score, 
      totalPoints, 
      mode, 
      timeLimit, 
      timeSpent, 
      answers 
    } = body;

    // Validación básica
    if (!caseId || !caseTitle || score === undefined || totalPoints === undefined) {
      return NextResponse.json(
        { error: 'Datos incompletos. Se requiere: caseId, caseTitle, score, totalPoints' },
        { status: 400 }
      );
    }

    // Crear resultado en la base de datos
    const result = await prisma.studentResult.create({
      data: {
        id: `${userId}-${caseId}-${Date.now()}`, // ID único
        userId,
        caseId,
        caseTitle: caseTitle || 'Sin título',
        caseArea: caseArea || 'General',
        score: Math.round(score),
        totalPoints: Math.round(totalPoints),
        mode: mode || 'study',
        timeLimit: timeLimit || null,
        timeSpent: timeSpent || null,
        answers: answers ? JSON.stringify(answers) : undefined,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        result: {
          id: result.id,
          score: result.score,
          totalPoints: result.totalPoints,
          percentage: Math.round((result.score / result.totalPoints) * 100),
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error al guardar resultado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/results?area=ginecologia
 * Obtiene el historial de resultados del usuario actual
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const area = searchParams.get('area');
    const limit = parseInt(searchParams.get('limit') || '50');

    const results = await prisma.studentResult.findMany({
      where: {
        userId,
        ...(area && area !== 'all' ? { caseArea: area } : {}),
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        caseId: true,
        caseTitle: true,
        caseArea: true,
        score: true,
        totalPoints: true,
        mode: true,
        timeSpent: true,
        completedAt: true,
      },
    });

    // Calcular estadísticas
    const stats = {
      totalCompleted: results.length,
      averageScore: results.length > 0 
        ? Math.round(results.reduce((sum: number, r: typeof results[0]) => sum + (r.score / r.totalPoints * 100), 0) / results.length)
        : 0,
      byArea: {} as Record<string, number>,
      byMode: {} as Record<string, number>,
    };

    results.forEach((r: typeof results[0]) => {
      const area = r.caseArea || 'General';
      const mode = r.mode || 'study';
      stats.byArea[area] = (stats.byArea[area] || 0) + 1;
      stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      results,
      stats,
    });

  } catch (error: any) {
    console.error('Error al obtener resultados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
