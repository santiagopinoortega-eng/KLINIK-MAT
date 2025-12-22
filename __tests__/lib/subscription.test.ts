/**
 * Tests Unitarios - Sistema de Suscripciones y Límites
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  getUserCaseLimit, 
  getCasesCompletedThisMonth, 
  canAccessNewCase,
  getUserUsageStats 
} from '@/lib/subscription';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findFirst: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
    studentResult: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = require('@/lib/prisma').prisma;

describe('Sistema de Límites de Casos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCaseLimit', () => {
    it('debe retornar 15 para usuario FREE sin suscripción', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      
      const limit = await getUserCaseLimit('user_free_123');
      
      expect(limit).toBe(15);
    });

    it('debe retornar null (ilimitado) para usuario PREMIUM', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub_123',
        userId: 'user_premium_123',
        planId: 'plan_premium',
        status: 'ACTIVE',
        plan: {
          id: 'plan_premium',
          name: 'PREMIUM',
          maxCasesPerMonth: null,
        },
      });

      const limit = await getUserCaseLimit('user_premium_123');
      
      expect(limit).toBeNull();
    });

    it('debe retornar null (ilimitado) para usuario BASIC', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub_456',
        userId: 'user_basic_123',
        planId: 'plan_basic',
        status: 'ACTIVE',
        plan: {
          id: 'plan_basic',
          name: 'BASIC',
          maxCasesPerMonth: null,
        },
      });

      const limit = await getUserCaseLimit('user_basic_123');
      
      expect(limit).toBeNull();
    });

    it('debe retornar 15 para suscripción expirada', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub_789',
        userId: 'user_expired_123',
        planId: 'plan_premium',
        status: 'EXPIRED',
      });

      const limit = await getUserCaseLimit('user_expired_123');
      
      expect(limit).toBe(15);
    });
  });

  describe('getCasesCompletedThisMonth', () => {
    it('debe contar casos del mes actual', async () => {
      mockPrisma.studentResult.count.mockResolvedValue(5);

      const count = await getCasesCompletedThisMonth('user_123');

      expect(count).toBe(5);
      expect(mockPrisma.studentResult.count).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
          completedAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
      });
    });

    it('debe retornar 0 si no hay casos', async () => {
      mockPrisma.studentResult.count.mockResolvedValue(0);

      const count = await getCasesCompletedThisMonth('user_new_123');

      expect(count).toBe(0);
    });

    it('debe usar rango de fechas correcto (día 1 al último del mes)', async () => {
      mockPrisma.studentResult.count.mockResolvedValue(3);

      await getCasesCompletedThisMonth('user_123');

      const callArgs = mockPrisma.studentResult.count.mock.calls[0][0];
      const startDate = callArgs.where.completedAt.gte;
      const endDate = callArgs.where.completedAt.lte;

      // Verificar que startDate es día 1 del mes actual
      expect(startDate.getDate()).toBe(1);
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);

      // Verificar que endDate es último día del mes
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      expect(endDate.getDate()).toBe(lastDay.getDate());
    });
  });

  describe('canAccessNewCase', () => {
    it('debe permitir acceso si usuario está dentro del límite (5/15)', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.studentResult.count.mockResolvedValue(5);

      const result = await canAccessNewCase('user_123');

      expect(result.canAccess).toBe(true);
      expect(result.casesUsed).toBe(5);
      expect(result.caseLimit).toBe(15);
      expect(result.remaining).toBe(10);
    });

    it('debe bloquear acceso si usuario alcanzó el límite (15/15)', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.studentResult.count.mockResolvedValue(15);

      const result = await canAccessNewCase('user_123');

      expect(result.canAccess).toBe(false);
      expect(result.casesUsed).toBe(15);
      expect(result.caseLimit).toBe(15);
      expect(result.remaining).toBe(0);
    });

    it('debe bloquear acceso si usuario excedió el límite (16/15)', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.studentResult.count.mockResolvedValue(16);

      const result = await canAccessNewCase('user_123');

      expect(result.canAccess).toBe(false);
      expect(result.casesUsed).toBe(16);
      expect(result.caseLimit).toBe(15);
      expect(result.remaining).toBe(0);
    });

    it('debe permitir acceso ilimitado para usuario PREMIUM', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        plan: { name: 'PREMIUM', maxCasesPerMonth: null },
      });
      mockPrisma.studentResult.count.mockResolvedValue(100);

      const result = await canAccessNewCase('user_premium_123');

      expect(result.canAccess).toBe(true);
      expect(result.casesUsed).toBe(100);
      expect(result.caseLimit).toBeNull();
      expect(result.remaining).toBeNull();
    });

    it('debe permitir acceso en caso límite (14/15)', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.studentResult.count.mockResolvedValue(14);

      const result = await canAccessNewCase('user_123');

      expect(result.canAccess).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('getUserUsageStats', () => {
    it('debe calcular estadísticas correctas para usuario FREE (12/15)', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        plan: {
          name: 'FREE',
          displayName: 'Gratuito',
          maxCasesPerMonth: 15,
        },
      });
      mockPrisma.studentResult.count.mockResolvedValue(12);

      const stats = await getUserUsageStats('user_123');

      expect(stats.planName).toBe('Gratuito');
      expect(stats.planType).toBe('FREE');
      expect(stats.isUnlimited).toBe(false);
      expect(stats.caseLimit).toBe(15);
      expect(stats.casesUsed).toBe(12);
      expect(stats.remaining).toBe(3);
      expect(stats.percentage).toBe(80); // 12/15 * 100
      expect(stats.isPremium).toBe(false);
    });

    it('debe calcular estadísticas para usuario PREMIUM', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        plan: {
          name: 'PREMIUM',
          displayName: 'Premium',
          maxCasesPerMonth: null,
        },
      });
      mockPrisma.studentResult.count.mockResolvedValue(50);

      const stats = await getUserUsageStats('user_premium_123');

      expect(stats.planName).toBe('Premium');
      expect(stats.planType).toBe('PREMIUM');
      expect(stats.isUnlimited).toBe(true);
      expect(stats.caseLimit).toBeNull();
      expect(stats.casesUsed).toBe(50);
      expect(stats.remaining).toBeNull();
      expect(stats.percentage).toBe(0);
      expect(stats.isPremium).toBe(true);
    });

    it('debe manejar usuario sin casos completados', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.studentResult.count.mockResolvedValue(0);

      const stats = await getUserUsageStats('user_new_123');

      expect(stats.casesUsed).toBe(0);
      expect(stats.remaining).toBe(15);
      expect(stats.percentage).toBe(0);
    });

    it('debe calcular porcentaje correcto en límite (15/15 = 100%)', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.studentResult.count.mockResolvedValue(15);

      const stats = await getUserUsageStats('user_123');

      expect(stats.percentage).toBe(100);
      expect(stats.remaining).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('debe manejar valores negativos de manera segura', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);
      mockPrisma.studentResult.count.mockResolvedValue(-1);

      const result = await canAccessNewCase('user_123');

      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('debe manejar errores de base de datos', async () => {
      mockPrisma.subscription.findFirst.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(getUserCaseLimit('user_123')).rejects.toThrow();
    });

    it('debe manejar suscripción sin plan asociado', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub_123',
        userId: 'user_123',
        planId: null,
        plan: null,
      });

      const limit = await getUserCaseLimit('user_123');

      expect(limit).toBe(15); // Default a FREE
    });
  });
});
