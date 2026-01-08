// __tests__/lib/repositories/user.repository.test.ts
import { UserRepository } from '@/lib/repositories/user.repository';
import { prisma, prismaRO } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  },
  prismaRO: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserRepository();
  });

  describe('findByClerkId', () => {
    it('debería encontrar usuario por clerkId', async () => {
      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk_abc',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
      };

      (prismaRO.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findByClerkId('clerk_abc');

      expect(result).toEqual(mockUser);
      expect(prismaRO.user.findFirst).toHaveBeenCalled();
    });

    it('debería retornar null si no encuentra usuario', async () => {
      (prismaRO.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByClerkId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findWithSubscription', () => {
    it('debería encontrar usuario con suscripción activa', async () => {
      const mockUserWithSub = {
        id: 'user-123',
        email: 'test@example.com',
        subscriptions: [
          {
            id: 'sub-123',
            status: 'active',
            plan: {
              id: 'plan-1',
              name: 'Premium',
              casesPerMonth: 100,
            },
          },
        ],
      };

      (prismaRO.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithSub);

      const result = await repository.findWithSubscription('user-123');

      expect(result).toEqual(mockUserWithSub);
      expect(prismaRO.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          subscriptions: {
            where: { status: 'active' },
            include: { plan: true },
          },
        },
      });
    });

    it('debería retornar null si no encuentra usuario', async () => {
      (prismaRO.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findWithSubscription('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateStudyStreak', () => {
    it('debería actualizar racha de estudio', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        studyStreak: 5,
        lastStudyDate: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.updateStudyStreak('user-123', 5);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          studyStreak: 5,
          lastStudyDate: expect.any(Date),
        },
      });
    });

    it('debería actualizar racha a 0', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        studyStreak: 0,
        lastStudyDate: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.updateStudyStreak('user-123', 0);

      expect(result.studyStreak).toBe(0);
    });
  });

  describe('findActiveSubscribers', () => {
    it('debería encontrar usuarios con suscripción activa', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ];

      (prismaRO.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await repository.findActiveSubscribers();

      expect(result).toEqual(mockUsers);
      expect(prismaRO.user.findMany).toHaveBeenCalledWith({
        where: {
          subscriptions: {
            some: { status: 'active' },
          },
        },
      });
    });

    it('debería retornar array vacío si no hay suscriptores', async () => {
      (prismaRO.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findActiveSubscribers();

      expect(result).toEqual([]);
    });
  });

  describe('updatePreferences', () => {
    it('debería actualizar preferencias de usuario', async () => {
      const preferences = {
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
      };

      const mockUpdatedUser = {
        id: 'user-123',
        ...preferences,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.updatePreferences('user-123', preferences);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: preferences,
      });
    });

    it('debería actualizar solo algunas preferencias', async () => {
      const preferences = {
        emailNotifications: false,
      };

      const mockUpdatedUser = {
        id: 'user-123',
        emailNotifications: false,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.updatePreferences('user-123', preferences);

      expect(result.emailNotifications).toBe(false);
    });
  });

  describe('getPlatformStats', () => {
    it('debería obtener estadísticas de la plataforma', async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      (prismaRO.user.count as jest.Mock)
        .mockResolvedValueOnce(1000) // totalUsers
        .mockResolvedValueOnce(250)  // activeUsers
        .mockResolvedValueOnce(50);  // premiumUsers

      const result = await repository.getPlatformStats();

      expect(result).toEqual({
        totalUsers: 1000,
        activeUsers: 250,
        premiumUsers: 50,
        freeUsers: 950,
      });

      expect(prismaRO.user.count).toHaveBeenCalledTimes(3);
    });

    it('debería manejar caso sin usuarios activos', async () => {
      (prismaRO.user.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await repository.getPlatformStats();

      expect(result.activeUsers).toBe(0);
      expect(result.premiumUsers).toBe(0);
      expect(result.freeUsers).toBe(100);
    });
  });
});
