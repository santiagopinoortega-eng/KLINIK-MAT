// app/api/game-stats/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener estadísticas del usuario
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');

    if (!gameType || !['wordsearch', 'hangman'].includes(gameType)) {
      return NextResponse.json(
        { error: 'Tipo de juego inválido' },
        { status: 400 }
      );
    }

    let stats = await prisma.gameStats.findFirst({
      where: {
        userId,
        gameType
      }
    });

    // Si no existe, crear stats iniciales
    if (!stats) {
      stats = await prisma.gameStats.create({
        data: {
          userId,
          gameType,
          totalScore: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          bestStreak: 0,
          currentStreak: 0
        }
      });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}

// POST - Actualizar estadísticas después de un juego
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameType, won, score, streak } = body;

    if (!gameType || !['wordsearch', 'hangman'].includes(gameType)) {
      return NextResponse.json(
        { error: 'Tipo de juego inválido' },
        { status: 400 }
      );
    }

    // Buscar stats existentes
    let stats = await prisma.gameStats.findFirst({
      where: {
        userId,
        gameType
      }
    });

    if (!stats) {
      // Crear nuevas stats
      stats = await prisma.gameStats.create({
        data: {
          userId,
          gameType,
          totalScore: score || 0,
          gamesPlayed: 1,
          gamesWon: won ? 1 : 0,
          bestStreak: streak || 0,
          currentStreak: won ? (streak || 1) : 0
        }
      });
    } else {
      // Actualizar stats existentes
      const newTotalScore = stats.totalScore + (score || 0);
      const newGamesPlayed = stats.gamesPlayed + 1;
      const newGamesWon = won ? stats.gamesWon + 1 : stats.gamesWon;
      const newCurrentStreak = won ? (stats.currentStreak + 1) : 0;
      const newBestStreak = Math.max(stats.bestStreak, newCurrentStreak);

      stats = await prisma.gameStats.update({
        where: {
          id: stats.id
        },
        data: {
          totalScore: newTotalScore,
          gamesPlayed: newGamesPlayed,
          gamesWon: newGamesWon,
          bestStreak: newBestStreak,
          currentStreak: newCurrentStreak
        }
      });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error updating game stats:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estadísticas' },
      { status: 500 }
    );
  }
}
