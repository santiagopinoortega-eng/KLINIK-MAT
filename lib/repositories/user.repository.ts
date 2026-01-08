// lib/repositories/user.repository.ts
import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    subscriptions: {
      include: {
        plan: true;
      };
    };
  };
}>;

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('user');
  }

  /**
   * Buscar usuario por clerk ID
   */
  async findByClerkId(clerkId: string, readOnly: boolean = true): Promise<User | null> {
    return this.findOne({ clerkId }, undefined, readOnly);
  }

  /**
   * Obtener perfil de usuario (campos seguros)
   * Educational: Student profile for Chilean obstetrics students
   */
  async findProfileById(userId: string, readOnly: boolean = true) {
    return this.executeQuery('findProfileById', async () => {
      const client = this.getClient(readOnly);
      return client.user.findUnique({
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
    });
  }

  /**
   * Upsert user (sync from Clerk)
   */
  async upsert(userData: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  }): Promise<User> {
    return this.executeQuery('upsert', async () => {
      const client = this.getClient(false); // Write operation
      return client.user.upsert({
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
    });
  }

  /**
   * Buscar usuario con su suscripción activa
   */
  async findWithSubscription(userId: string, readOnly: boolean = true): Promise<UserWithRelations | null> {
    return this.executeQuery('findWithSubscription', async () => {
      const client = this.getClient(readOnly);
      return client.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            where: {
              status: 'active',
            },
            include: {
              plan: true,
            },
          },
        },
      });
    });
  }

  /**
   * Actualizar racha de estudio
   */
  async updateStudyStreak(userId: string, streak: number): Promise<User> {
    return this.update(userId, {
      studyStreak: streak,
      lastStudyDate: new Date(),
    });
  }

  /**
   * Buscar usuarios con suscripción activa
   */
  async findActiveSubscribers(readOnly: boolean = true): Promise<User[]> {
    return this.executeQuery('findActiveSubscribers', async () => {
      const client = this.getClient(readOnly);
      return client.user.findMany({
        where: {
          subscriptions: {
            some: {
              status: 'active',
            },
          },
        },
      });
    });
  }

  /**
   * Actualizar preferencias de usuario
   */
  async updatePreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      weeklyReports?: boolean;
    }
  ): Promise<User> {
    return this.update(userId, preferences);
  }

  /**
   * Obtener estadísticas de la plataforma
   */
  async getPlatformStats(readOnly: boolean = true) {
    return this.executeQuery('getPlatformStats', async () => {
      const client = this.getClient(readOnly);
      
      const [totalUsers, activeUsers, premiumUsers] = await Promise.all([
        client.user.count(),
        client.user.count({
          where: {
            lastStudyDate: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Última semana
            },
          },
        }),
        client.user.count({
          where: {
            subscriptions: {
              some: {
                status: 'active',
              },
            },
          },
        }),
      ]);

      return {
        totalUsers,
        activeUsers,
        premiumUsers,
        freeUsers: totalUsers - premiumUsers,
      };
    });
  }
}

// Instancia singleton
export const userRepository = new UserRepository();
