// __tests__/services/user.service.test.ts
import { UserService } from '@/services/user.service';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    case: {
      count: jest.fn(),
    },
    studentResult: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    studySession: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'STUDENT',
        country: 'Chile',
        university: 'Universidad de Chile',
        yearOfStudy: 3,
        specialty: null,
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserService.getUserProfile('user-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
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

    it('should return null when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserService.getUserProfile('non-existent');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('User not found', { userId: 'non-existent' });
    });

    it('should propagate errors from database', async () => {
      const error = new Error('Database error');
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(error);

      await expect(UserService.getUserProfile('user-123')).rejects.toThrow('Database error');
      expect(logger.error).toHaveBeenCalledWith('Failed to get user profile', {
        userId: 'user-123',
        error,
      });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
        country: 'Argentina',
        university: 'UBA',
        yearOfStudy: 4,
        specialty: 'Medicina de Urgencia',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const updateData = {
        name: 'Updated Name',
        country: 'Argentina',
        university: 'UBA',
        yearOfStudy: 4,
        specialty: 'Medicina de Urgencia',
      };

      const result = await UserService.updateUserProfile('user-123', updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData,
      });
      expect(logger.info).toHaveBeenCalledWith('User profile updated', { userId: 'user-123' });
    });

    it('should propagate errors from update operation', async () => {
      const error = new Error('Update failed');
      (prisma.user.update as jest.Mock).mockRejectedValue(error);

      await expect(UserService.updateUserProfile('user-123', { name: 'Test' })).rejects.toThrow('Update failed');
      expect(logger.error).toHaveBeenCalledWith('Failed to update user profile', {
        userId: 'user-123',
        error,
      });
    });
  });

  describe('syncUser', () => {
    it('should create new user when user does not exist', async () => {
      const userData = {
        id: 'clerk-123',
        email: 'new@example.com',
        name: 'New User',
        avatar: 'https://example.com/avatar.jpg',
      };

      const mockCreatedUser = {
        ...userData,
        role: 'STUDENT',
        country: null,
        university: null,
        yearOfStudy: null,
        specialty: null,
        createdAt: new Date(),
      };

      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await UserService.syncUser(userData);

      expect(result).toEqual(mockCreatedUser);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
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
      expect(logger.info).toHaveBeenCalledWith('User synced', { userId: mockCreatedUser.id });
    });

    it('should update existing user on sync', async () => {
      const userData = {
        id: 'clerk-123',
        email: 'updated@example.com',
        name: 'Updated User',
        avatar: 'https://example.com/new-avatar.jpg',
      };

      const mockUpdatedUser = {
        ...userData,
        role: 'STUDENT',
        country: 'Chile',
        university: 'UC',
        yearOfStudy: 3,
        specialty: null,
        createdAt: new Date('2024-01-01'),
      };

      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await UserService.syncUser(userData);

      expect(result).toEqual(mockUpdatedUser);
      expect(logger.info).toHaveBeenCalledWith('User synced', { userId: mockUpdatedUser.id });
    });

    it('should handle sync without optional fields', async () => {
      const userData = {
        id: 'clerk-123',
        email: 'minimal@example.com',
      };

      const mockUser = {
        id: userData.id,
        email: userData.email,
        name: null,
        avatar: null,
        role: 'STUDENT',
        createdAt: new Date(),
      };

      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserService.syncUser(userData);

      expect(result).toEqual(mockUser);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: userData.id },
        update: {
          email: userData.email,
          name: undefined,
          avatar: undefined,
        },
        create: {
          id: userData.id,
          email: userData.email,
          name: undefined,
          avatar: undefined,
        },
      });
    });

    it('should propagate errors from sync operation', async () => {
      const error = new Error('Sync failed');
      const userData = { id: 'clerk-123', email: 'test@example.com' };
      
      (prisma.user.upsert as jest.Mock).mockRejectedValue(error);

      await expect(UserService.syncUser(userData)).rejects.toThrow('Sync failed');
      expect(logger.error).toHaveBeenCalledWith('Failed to sync user', {
        userData,
        error,
      });
    });
  });

  describe('getUserProgress', () => {
    it('should calculate user progress correctly', async () => {
      (prisma.case.count as jest.Mock).mockResolvedValue(50);
      (prisma.studentResult.count as jest.Mock).mockResolvedValue(25);
      (prisma.studentResult.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { score: 2500 } }) // Total score
        .mockResolvedValueOnce({ _avg: { score: 100 } }); // Average score
      (prisma.studentResult.groupBy as jest.Mock).mockResolvedValue([
        { caseArea: 'URGENCIAS', _count: { id: 10 }, _avg: { score: 95 } },
        { caseArea: 'GINECO_OBSTETRICIA', _count: { id: 15 }, _avg: { score: 105 } },
      ]);

      const result = await UserService.getUserProgress('user-123');

      expect(result).toEqual({
        totalCases: 50,
        completedCases: 25,
        completionPercentage: 50,
        totalScore: 2500,
        averageScore: 100,
        progressByArea: [
          { area: 'URGENCIAS', casesCompleted: 10, averageScore: 95 },
          { area: 'GINECO_OBSTETRICIA', casesCompleted: 15, averageScore: 105 },
        ],
      });
    });

    it('should handle zero completed cases', async () => {
      (prisma.case.count as jest.Mock).mockResolvedValue(50);
      (prisma.studentResult.count as jest.Mock).mockResolvedValue(0);
      (prisma.studentResult.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { score: null } })
        .mockResolvedValueOnce({ _avg: { score: null } });
      (prisma.studentResult.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await UserService.getUserProgress('user-123');

      expect(result).toEqual({
        totalCases: 50,
        completedCases: 0,
        completionPercentage: 0,
        totalScore: 0,
        averageScore: 0,
        progressByArea: [],
      });
    });

    it('should handle null aggregate values', async () => {
      (prisma.case.count as jest.Mock).mockResolvedValue(100);
      (prisma.studentResult.count as jest.Mock).mockResolvedValue(5);
      (prisma.studentResult.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { score: null } })
        .mockResolvedValueOnce({ _avg: { score: null } });
      (prisma.studentResult.groupBy as jest.Mock).mockResolvedValue([
        { caseArea: 'MEDICINA_INTERNA', _count: { id: 5 }, _avg: { score: null } },
      ]);

      const result = await UserService.getUserProgress('user-123');

      expect(result.totalScore).toBe(0);
      expect(result.averageScore).toBe(0);
      expect(result.progressByArea[0].averageScore).toBe(0);
    });

    it('should propagate errors from progress calculation', async () => {
      const error = new Error('Database error');
      (prisma.case.count as jest.Mock).mockRejectedValue(error);

      await expect(UserService.getUserProgress('user-123')).rejects.toThrow('Database error');
      expect(logger.error).toHaveBeenCalledWith('Failed to get user progress', {
        userId: 'user-123',
        error,
      });
    });
  });

  describe('getStudyStreak', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return 0 when no study sessions exist', async () => {
      (prisma.studySession.findMany as jest.Mock).mockResolvedValue([]);

      const result = await UserService.getStudyStreak('user-123');

      expect(result).toBe(0);
    });

    it('should return 0 when last session was more than 1 day ago', async () => {
      const today = new Date('2024-01-10T12:00:00Z');
      jest.setSystemTime(today);

      const sessions = [
        { date: new Date('2024-01-07') }, // 3 days ago - streak broken
      ];

      (prisma.studySession.findMany as jest.Mock).mockResolvedValue(sessions);

      const result = await UserService.getStudyStreak('user-123');

      expect(result).toBe(0);
    });

    it('should calculate streak for consecutive days', async () => {
      const today = new Date('2024-01-10T12:00:00Z');
      jest.setSystemTime(today);

      const sessions = [
        { date: new Date('2024-01-10') }, // Today
        { date: new Date('2024-01-09') }, // Yesterday
        { date: new Date('2024-01-08') }, // 2 days ago
        { date: new Date('2024-01-07') }, // 3 days ago
        { date: new Date('2024-01-05') }, // Break in streak
      ];

      (prisma.studySession.findMany as jest.Mock).mockResolvedValue(sessions);

      const result = await UserService.getStudyStreak('user-123');

      expect(result).toBe(4); // 4 consecutive days
    });

    it('should count streak starting from yesterday', async () => {
      const today = new Date('2024-01-10T12:00:00Z');
      jest.setSystemTime(today);

      const sessions = [
        { date: new Date('2024-01-09T12:00:00Z') }, // Yesterday (valid)
        { date: new Date('2024-01-08T12:00:00Z') },
        { date: new Date('2024-01-07T12:00:00Z') },
      ];

      (prisma.studySession.findMany as jest.Mock).mockResolvedValue(sessions);

      const result = await UserService.getStudyStreak('user-123');

      expect(result).toBe(3);
    });

    it('should count streak including today', async () => {
      const today = new Date('2024-01-10T12:00:00Z');
      jest.setSystemTime(today);

      const sessions = [
        { date: new Date('2024-01-10') }, // Today
        { date: new Date('2024-01-09') },
        { date: new Date('2024-01-08') },
      ];

      (prisma.studySession.findMany as jest.Mock).mockResolvedValue(sessions);

      const result = await UserService.getStudyStreak('user-123');

      expect(result).toBe(3);
    });

    it('should handle single day streak', async () => {
      const today = new Date('2024-01-10T12:00:00Z');
      jest.setSystemTime(today);

      const sessions = [
        { date: new Date('2024-01-10') }, // Today only
      ];

      (prisma.studySession.findMany as jest.Mock).mockResolvedValue(sessions);

      const result = await UserService.getStudyStreak('user-123');

      expect(result).toBe(1);
    });

    it('should return 0 on error', async () => {
      const error = new Error('Database error');
      (prisma.studySession.findMany as jest.Mock).mockRejectedValue(error);

      const result = await UserService.getStudyStreak('user-123');

      expect(result).toBe(0);
      expect(logger.error).toHaveBeenCalledWith('Failed to get study streak', {
        userId: 'user-123',
        error,
      });
    });
  });

  describe('recordStudySession', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should create new session when none exists for today', async () => {
      const today = new Date('2024-01-10T12:00:00Z');
      jest.setSystemTime(today);

      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);

      (prisma.studySession.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.studySession.create as jest.Mock).mockResolvedValue({
        id: 'session-123',
        userId: 'user-123',
        date: todayStart,
        casesStudied: 5,
        timeSpent: 1800,
      });

      await UserService.recordStudySession('user-123', {
        casesStudied: 5,
        timeSpent: 1800,
      });

      expect(prisma.studySession.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          date: { gte: todayStart },
        },
      });

      expect(prisma.studySession.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          date: todayStart,
          casesStudied: 5,
          timeSpent: 1800,
        },
      });

      expect(logger.info).toHaveBeenCalledWith('Study session recorded', {
        userId: 'user-123',
        data: { casesStudied: 5, timeSpent: 1800 },
      });
    });

    it('should update existing session for today', async () => {
      const today = new Date('2024-01-10T15:30:00Z');
      jest.setSystemTime(today);

      const existingSession = {
        id: 'session-123',
        userId: 'user-123',
        date: new Date('2024-01-10'),
        casesStudied: 3,
        timeSpent: 900,
      };

      (prisma.studySession.findFirst as jest.Mock).mockResolvedValue(existingSession);
      (prisma.studySession.update as jest.Mock).mockResolvedValue({
        ...existingSession,
        casesStudied: 8,
        timeSpent: 2700,
      });

      await UserService.recordStudySession('user-123', {
        casesStudied: 5,
        timeSpent: 1800,
      });

      expect(prisma.studySession.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: {
          casesStudied: { increment: 5 },
          timeSpent: { increment: 1800 },
        },
      });

      expect(logger.info).toHaveBeenCalledWith('Study session recorded', {
        userId: 'user-123',
        data: { casesStudied: 5, timeSpent: 1800 },
      });
    });

    it('should propagate errors from session recording', async () => {
      const error = new Error('Database error');
      (prisma.studySession.findFirst as jest.Mock).mockRejectedValue(error);

      await expect(
        UserService.recordStudySession('user-123', {
          casesStudied: 5,
          timeSpent: 1800,
        })
      ).rejects.toThrow('Database error');

      expect(logger.error).toHaveBeenCalledWith('Failed to record study session', {
        userId: 'user-123',
        error,
      });
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await UserService.userExists('user-123');

      expect(result).toBe(true);
      expect(prisma.user.count).toHaveBeenCalledWith({ where: { id: 'user-123' } });
    });

    it('should return false when user does not exist', async () => {
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      const result = await UserService.userExists('non-existent');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const error = new Error('Database error');
      (prisma.user.count as jest.Mock).mockRejectedValue(error);

      const result = await UserService.userExists('user-123');

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Failed to check user existence', {
        userId: 'user-123',
        error,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'deleted@example.com',
      });

      await UserService.deleteUser('user-123');

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-123' } });
      expect(logger.info).toHaveBeenCalledWith('User deleted', { userId: 'user-123' });
    });

    it('should propagate errors from delete operation', async () => {
      const error = new Error('Delete failed');
      (prisma.user.delete as jest.Mock).mockRejectedValue(error);

      await expect(UserService.deleteUser('user-123')).rejects.toThrow('Delete failed');
      expect(logger.error).toHaveBeenCalledWith('Failed to delete user', {
        userId: 'user-123',
        error,
      });
    });
  });
});
