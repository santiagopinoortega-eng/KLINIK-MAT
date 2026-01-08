// services/user.service.ts
/**
 * Servicio de gestión de usuarios
 * Maneja toda la lógica de negocio relacionada con usuarios
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { User, Prisma } from '@prisma/client';

export type UserProfile = Pick<User, 'id' | 'email' | 'name' | 'role' | 'country' | 'university' | 'yearOfStudy' | 'specialty' | 'avatar' | 'createdAt'>;

export class UserService {
  /**
   * Obtiene el perfil completo de un usuario
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
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
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        logger.warn('User not found', { userId });
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Failed to get user profile', { userId, error });
      throw error;
    }
  }

  /**
   * Actualiza el perfil de un usuario
   */
  static async updateUserProfile(
    userId: string,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
      });

      logger.info('User profile updated', { userId });
      return user;
    } catch (error) {
      logger.error('Failed to update user profile', { userId, error });
      throw error;
    }
  }

  /**
   * Crea o actualiza un usuario (sincronización con Clerk)
   */
  static async syncUser(userData: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  }): Promise<User> {
    try {
      const user = await prisma.user.upsert({
        where: { id: userData.id },
        update: {
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
        },
        create: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
        },
      });

      logger.info('User synced', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to sync user', { userData, error });
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de progreso del usuario
   */
  static async getUserProgress(userId: string) {
    try {
      const [totalCases, completedCases, totalScore, avgScore] = await Promise.all([
        // Total de casos disponibles
        prisma.case.count({ where: { isPublic: true } }),
        
        // Casos completados por el usuario
        prisma.studentResult.count({ where: { userId } }),
        
        // Puntuación total
        prisma.studentResult.aggregate({
          where: { userId },
          _sum: { score: true },
        }),
        
        // Promedio de puntuación
        prisma.studentResult.aggregate({
          where: { userId },
          _avg: { score: true },
        }),
      ]);

      // Calcular progreso por área
      const progressByArea = await prisma.studentResult.groupBy({
        by: ['caseArea'],
        where: { userId },
        _count: { id: true },
        _avg: { score: true },
      });

      return {
        totalCases,
        completedCases,
        completionPercentage: (completedCases / totalCases) * 100,
        totalScore: totalScore._sum.score || 0,
        averageScore: avgScore._avg.score || 0,
        progressByArea: progressByArea.map(area => ({
          area: area.caseArea,
          casesCompleted: area._count.id,
          averageScore: area._avg.score || 0,
        })),
      };
    } catch (error) {
      logger.error('Failed to get user progress', { userId, error });
      throw error;
    }
  }

  /**
   * Obtiene la racha de estudio del usuario (días consecutivos)
   */
  static async getStudyStreak(userId: string): Promise<number> {
    try {
      const sessions = await prisma.studySession.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 100, // Últimos 100 días
      });

      if (sessions.length === 0) return 0;

      let streak = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar si hay sesión hoy o ayer
      const lastSession = new Date(sessions[0].date);
      lastSession.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
      
      // Si la última sesión fue hace más de 1 día, la racha se rompió
      if (daysDiff > 1) return 0;

      // Contar días consecutivos
      for (let i = 1; i < sessions.length; i++) {
        const current = new Date(sessions[i - 1].date);
        current.setHours(0, 0, 0, 0);
        
        const previous = new Date(sessions[i].date);
        previous.setHours(0, 0, 0, 0);
        
        const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      logger.error('Failed to get study streak', { userId, error });
      return 0;
    }
  }

  /**
   * Registra una sesión de estudio
   */
  static async recordStudySession(
    userId: string,
    data: {
      casesStudied: number;
      timeSpent: number;
    }
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar sesión existente del día
      const existingSession = await prisma.studySession.findFirst({
        where: {
          userId,
          date: {
            gte: today,
          },
        },
      });

      if (existingSession) {
        // Actualizar sesión existente
        await prisma.studySession.update({
          where: { id: existingSession.id },
          data: {
            casesStudied: { increment: data.casesStudied },
            timeSpent: { increment: data.timeSpent },
          },
        });
      } else {
        // Crear nueva sesión
        await prisma.studySession.create({
          data: {
            userId,
            date: today,
            casesStudied: data.casesStudied,
            timeSpent: data.timeSpent,
          },
        });
      }

      logger.info('Study session recorded', { userId, data });
    } catch (error) {
      logger.error('Failed to record study session', { userId, error });
      throw error;
    }
  }

  /**
   * Verifica si el usuario existe
   */
  static async userExists(userId: string): Promise<boolean> {
    try {
      const count = await prisma.user.count({ where: { id: userId } });
      return count > 0;
    } catch (error) {
      logger.error('Failed to check user existence', { userId, error });
      return false;
    }
  }

  /**
   * Elimina un usuario y todos sus datos asociados
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      // Prisma maneja las cascadas automáticamente
      await prisma.user.delete({ where: { id: userId } });
      logger.info('User deleted', { userId });
    } catch (error) {
      logger.error('Failed to delete user', { userId, error });
      throw error;
    }
  }
}
