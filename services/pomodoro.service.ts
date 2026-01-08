// services/pomodoro.service.ts
/**
 * Pomodoro Service
 * 
 * Capa de lógica de negocio para el sistema Pomodoro
 * Maneja validaciones, reglas de negocio y orquestación
 */

import { pomodoroRepository, type PomodoroStats, type WeeklyStats } from '@/lib/repositories/pomodoro.repository';
import { logger } from '@/lib/logger';
import type { PomodoroSession } from '@prisma/client';

export interface CreatePomodoroParams {
  userId: string;
  type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
  duration: number;
  caseId?: string;
  caseTitle?: string;
}

export interface UpdatePomodoroParams {
  timeRemaining: number;
  timeSpent: number;
}

export class PomodoroService {
  /**
   * Obtener o crear sesión activa
   * Si hay una sesión activa/pausada, la devuelve
   * Si no, devuelve null (el cliente debe crear una nueva)
   */
  static async getActiveSession(userId: string): Promise<PomodoroSession | null> {
    try {
      const session = await pomodoroRepository.getActiveSession(userId);
      
      if (session) {
        logger.info('Active Pomodoro session found', {
          userId,
          sessionId: session.id,
          status: session.status,
        });
      }

      return session;
    } catch (error) {
      logger.error('Failed to get active session', { userId, error });
      throw error;
    }
  }

  /**
   * Iniciar nueva sesión Pomodoro
   */
  static async startSession(params: CreatePomodoroParams): Promise<PomodoroSession> {
    try {
      // Verificar que no haya sesión activa
      const activeSession = await pomodoroRepository.getActiveSession(params.userId);
      
      if (activeSession) {
        logger.warn('User already has active session', {
          userId: params.userId,
          activeSessionId: activeSession.id,
        });
        throw new Error('Ya tienes una sesión Pomodoro activa. Complétala o cancélala primero.');
      }

      // Validar duración
      if (params.duration < 1 || params.duration > 120) {
        throw new Error('La duración debe estar entre 1 y 120 minutos');
      }

      // Crear sesión
      const session = await pomodoroRepository.createSession(params);

      logger.info('Pomodoro session started', {
        userId: params.userId,
        sessionId: session.id,
        type: params.type,
        duration: params.duration,
      });

      return session;
    } catch (error) {
      logger.error('Failed to start Pomodoro session', { params, error });
      throw error;
    }
  }

  /**
   * Actualizar tiempo de sesión
   */
  static async updateSession(
    sessionId: string,
    params: UpdatePomodoroParams
  ): Promise<PomodoroSession> {
    try {
      const session = await pomodoroRepository.updateTimeRemaining(
        sessionId,
        params.timeRemaining,
        params.timeSpent
      );

      return session;
    } catch (error) {
      logger.error('Failed to update Pomodoro session', { sessionId, error });
      throw error;
    }
  }

  /**
   * Pausar sesión
   */
  static async pauseSession(sessionId: string, userId: string): Promise<PomodoroSession> {
    try {
      const session = await pomodoroRepository.pauseSession(sessionId);

      logger.info('Pomodoro session paused', {
        userId,
        sessionId,
      });

      return session;
    } catch (error) {
      logger.error('Failed to pause Pomodoro session', { sessionId, error });
      throw error;
    }
  }

  /**
   * Reanudar sesión
   */
  static async resumeSession(sessionId: string, userId: string): Promise<PomodoroSession> {
    try {
      const session = await pomodoroRepository.resumeSession(sessionId);

      logger.info('Pomodoro session resumed', {
        userId,
        sessionId,
      });

      return session;
    } catch (error) {
      logger.error('Failed to resume Pomodoro session', { sessionId, error });
      throw error;
    }
  }

  /**
   * Completar sesión
   */
  static async completeSession(
    sessionId: string,
    userId: string,
    timeSpent: number,
    notes?: string
  ): Promise<PomodoroSession> {
    try {
      const session = await pomodoroRepository.completeSession(sessionId, timeSpent, notes);

      logger.info('Pomodoro session completed', {
        userId,
        sessionId,
        timeSpent,
        type: session.type,
      });

      // TODO: Crear recompensas/achievements aquí si es necesario

      return session;
    } catch (error) {
      logger.error('Failed to complete Pomodoro session', { sessionId, error });
      throw error;
    }
  }

  /**
   * Cancelar sesión
   */
  static async cancelSession(sessionId: string, userId: string): Promise<PomodoroSession> {
    try {
      const session = await pomodoroRepository.cancelSession(sessionId);

      logger.info('Pomodoro session cancelled', {
        userId,
        sessionId,
      });

      return session;
    } catch (error) {
      logger.error('Failed to cancel Pomodoro session', { sessionId, error });
      throw error;
    }
  }

  /**
   * Obtener historial de sesiones
   */
  static async getSessionHistory(
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const offset = (page - 1) * limit;
      const result = await pomodoroRepository.getSessionHistory(userId, limit, offset);

      logger.info('Pomodoro history fetched', {
        userId,
        page,
        total: result.total,
      });

      return {
        sessions: result.sessions,
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      logger.error('Failed to fetch Pomodoro history', { userId, error });
      throw error;
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  static async getUserStats(userId: string): Promise<PomodoroStats> {
    try {
      const stats = await pomodoroRepository.getUserStats(userId);

      logger.info('Pomodoro stats fetched', {
        userId,
        totalSessions: stats.totalSessions,
        completedSessions: stats.completedSessions,
      });

      return stats;
    } catch (error) {
      logger.error('Failed to fetch Pomodoro stats', { userId, error });
      throw error;
    }
  }

  /**
   * Obtener estadísticas semanales
   */
  static async getWeeklyStats(userId: string): Promise<WeeklyStats[]> {
    try {
      const stats = await pomodoroRepository.getWeeklyStats(userId);

      logger.info('Weekly Pomodoro stats fetched', {
        userId,
        weeks: stats.length,
      });

      return stats;
    } catch (error) {
      logger.error('Failed to fetch weekly Pomodoro stats', { userId, error });
      throw error;
    }
  }

  /**
   * Limpieza de sesiones antiguas (tarea programada)
   */
  static async cleanupOldSessions(daysOld: number = 90): Promise<number> {
    try {
      const deletedCount = await pomodoroRepository.cleanupOldSessions(daysOld);

      logger.info('Old Pomodoro sessions cleaned up', {
        deletedCount,
        daysOld,
      });

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old Pomodoro sessions', { error });
      throw error;
    }
  }
}
