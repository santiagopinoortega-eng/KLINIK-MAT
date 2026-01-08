// lib/repositories/pomodoro.repository.ts
/**
 * Pomodoro Repository
 * 
 * Maneja todas las operaciones de base de datos para sesiones Pomodoro
 * Arquitectura elite con query optimization y type safety
 */

import { PomodoroSession, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type PomodoroWithCase = Prisma.PomodoroSessionGetPayload<{
  include: {
    case: {
      select: {
        id: true;
        title: true;
        area: true;
      };
    };
  };
}>;

export interface PomodoroStats {
  totalSessions: number;
  completedSessions: number;
  totalTimeSpent: number; // en segundos
  averageSessionTime: number;
  workSessions: number;
  breakSessions: number;
  focusScore: number; // % de sesiones completadas
  weeklyAverage: number; // minutos por semana
  dailyStreak: number;
}

export interface WeeklyStats {
  week: string; // ISO week
  totalMinutes: number;
  completedSessions: number;
  days: {
    date: Date;
    minutes: number;
    sessions: number;
  }[];
}

export class PomodoroRepository extends BaseRepository<PomodoroSession> {
  constructor() {
    super('pomodoroSession');
  }

  /**
   * Obtener sesión activa del usuario
   */
  async getActiveSession(userId: string, readOnly: boolean = true): Promise<PomodoroWithCase | null> {
    return this.executeQuery('getActiveSession', async () => {
      const client = this.getClient(readOnly);
      return client.pomodoroSession.findFirst({
        where: {
          userId,
          status: {
            in: ['ACTIVE', 'PAUSED'],
          },
        },
        include: {
          case: {
            select: {
              id: true,
              title: true,
              area: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  }

  /**
   * Crear nueva sesión Pomodoro
   */
  async createSession(data: {
    userId: string;
    type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
    duration: number;
    caseId?: string;
    caseTitle?: string;
  }): Promise<PomodoroSession> {
    return this.create({
      ...data,
      timeRemaining: data.duration * 60, // convertir minutos a segundos
      status: 'ACTIVE',
    });
  }

  /**
   * Actualizar tiempo restante de sesión
   */
  async updateTimeRemaining(
    sessionId: string,
    timeRemaining: number,
    timeSpent: number
  ): Promise<PomodoroSession> {
    return this.update(sessionId, {
      timeRemaining,
      timeSpent,
    });
  }

  /**
   * Pausar sesión
   */
  async pauseSession(sessionId: string): Promise<PomodoroSession> {
    return this.update(sessionId, {
      status: 'PAUSED',
    });
  }

  /**
   * Reanudar sesión
   */
  async resumeSession(sessionId: string): Promise<PomodoroSession> {
    return this.update(sessionId, {
      status: 'ACTIVE',
    });
  }

  /**
   * Completar sesión
   */
  async completeSession(
    sessionId: string,
    timeSpent: number,
    notes?: string
  ): Promise<PomodoroSession> {
    return this.update(sessionId, {
      status: 'COMPLETED',
      timeSpent,
      completedAt: new Date(),
      ...(notes && { notes }),
    });
  }

  /**
   * Cancelar sesión
   */
  async cancelSession(sessionId: string): Promise<PomodoroSession> {
    return this.update(sessionId, {
      status: 'CANCELLED',
    });
  }

  /**
   * Obtener historial de sesiones
   */
  async getSessionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    readOnly: boolean = true
  ): Promise<{ sessions: PomodoroWithCase[]; total: number }> {
    return this.executeQuery('getSessionHistory', async () => {
      const client = this.getClient(readOnly);

      const [sessions, total] = await Promise.all([
        client.pomodoroSession.findMany({
          where: { userId },
          include: {
            case: {
              select: {
                id: true,
                title: true,
                area: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: offset,
          take: limit,
        }),
        client.pomodoroSession.count({
          where: { userId },
        }),
      ]);

      return { sessions, total };
    });
  }

  /**
   * Obtener estadísticas generales del usuario
   */
  async getUserStats(userId: string, readOnly: boolean = true): Promise<PomodoroStats> {
    return this.executeQuery('getUserStats', async () => {
      const client = this.getClient(readOnly);

      const [totalSessions, completedSessions, aggregates, weeklyData] = await Promise.all([
        // Total de sesiones
        client.pomodoroSession.count({
          where: { userId },
        }),

        // Sesiones completadas
        client.pomodoroSession.count({
          where: { userId, status: 'COMPLETED' },
        }),

        // Agregados de tiempo
        client.pomodoroSession.aggregate({
          where: { userId, status: 'COMPLETED' },
          _sum: {
            timeSpent: true,
          },
          _avg: {
            timeSpent: true,
          },
        }),

        // Estadísticas semanales (últimos 7 días)
        this.getWeeklyAverage(userId, true),
      ]);

      const workSessions = await client.pomodoroSession.count({
        where: { userId, type: 'WORK', status: 'COMPLETED' },
      });

      const breakSessions = completedSessions - workSessions;
      const totalTimeSpent = aggregates._sum.timeSpent || 0;
      const averageSessionTime = aggregates._avg.timeSpent || 0;
      const focusScore = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // Calcular racha diaria
      const dailyStreak = await this.calculateDailyStreak(userId, true);

      return {
        totalSessions,
        completedSessions,
        totalTimeSpent,
        averageSessionTime,
        workSessions,
        breakSessions,
        focusScore,
        weeklyAverage: weeklyData,
        dailyStreak,
      };
    });
  }

  /**
   * Obtener promedio semanal de estudio (en minutos)
   */
  private async getWeeklyAverage(userId: string, readOnly: boolean = true): Promise<number> {
    const client = this.getClient(readOnly);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await client.pomodoroSession.aggregate({
      where: {
        userId,
        status: 'COMPLETED',
        type: 'WORK',
        completedAt: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        timeSpent: true,
      },
    });

    const totalSeconds = result._sum.timeSpent || 0;
    return Math.round(totalSeconds / 60); // convertir a minutos
  }

  /**
   * Calcular racha de días consecutivos con sesiones
   */
  private async calculateDailyStreak(userId: string, readOnly: boolean = true): Promise<number> {
    const client = this.getClient(readOnly);

    const sessions = await client.pomodoroSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        type: 'WORK',
      },
      select: {
        completedAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 100, // últimos 100 para optimizar
    });

    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar si hay sesión hoy o ayer
    const lastSession = new Date(sessions[0].completedAt!);
    lastSession.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));

    // Si la última sesión fue hace más de 1 día, la racha se rompió
    if (daysDiff > 1) return 0;

    // Contar días consecutivos
    const uniqueDays = new Set<string>();
    for (const session of sessions) {
      const date = new Date(session.completedAt!);
      date.setHours(0, 0, 0, 0);
      uniqueDays.add(date.toISOString().split('T')[0]);
    }

    const sortedDays = Array.from(uniqueDays).sort().reverse();
    streak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const current = new Date(sortedDays[i - 1]);
      const previous = new Date(sortedDays[i]);
      const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Obtener estadísticas por semana (últimas 4 semanas)
   */
  async getWeeklyStats(userId: string, readOnly: boolean = true): Promise<WeeklyStats[]> {
    return this.executeQuery('getWeeklyStats', async () => {
      const client = this.getClient(readOnly);

      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const sessions = await client.pomodoroSession.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          type: 'WORK',
          completedAt: {
            gte: fourWeeksAgo,
          },
        },
        select: {
          completedAt: true,
          timeSpent: true,
        },
        orderBy: {
          completedAt: 'desc',
        },
      });

      // Agrupar por semana
      const weeklyMap = new Map<string, { totalMinutes: number; sessions: number; days: Map<string, { minutes: number; sessions: number }> }>();

      sessions.forEach((session: { completedAt: Date | null; timeSpent: number }) => {
        const date = new Date(session.completedAt!);
        const weekKey = this.getWeekKey(date);
        const dayKey = date.toISOString().split('T')[0];

        if (!weeklyMap.has(weekKey)) {
          weeklyMap.set(weekKey, {
            totalMinutes: 0,
            sessions: 0,
            days: new Map(),
          });
        }

        const weekData = weeklyMap.get(weekKey)!;
        weekData.totalMinutes += Math.round(session.timeSpent / 60);
        weekData.sessions++;

        if (!weekData.days.has(dayKey)) {
          weekData.days.set(dayKey, { minutes: 0, sessions: 0 });
        }

        const dayData = weekData.days.get(dayKey)!;
        dayData.minutes += Math.round(session.timeSpent / 60);
        dayData.sessions++;
      });

      // Convertir a array
      return Array.from(weeklyMap.entries()).map(([week, data]) => ({
        week,
        totalMinutes: data.totalMinutes,
        completedSessions: data.sessions,
        days: Array.from(data.days.entries()).map(([dateStr, dayData]) => ({
          date: new Date(dateStr),
          minutes: dayData.minutes,
          sessions: dayData.sessions,
        })),
      }));
    });
  }

  /**
   * Obtener clave de semana ISO (YYYY-Www)
   */
  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const onejan = new Date(year, 0, 1);
    const week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Eliminar sesiones antiguas (limpieza de BD)
   */
  async cleanupOldSessions(daysOld: number = 90): Promise<number> {
    return this.executeQuery('cleanupOldSessions', async () => {
      const client = this.getClient(false); // write operation
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await client.pomodoroSession.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          status: {
            in: ['COMPLETED', 'CANCELLED'],
          },
        },
      });

      return result.count;
    });
  }
}

// Singleton instance
export const pomodoroRepository = new PomodoroRepository();
