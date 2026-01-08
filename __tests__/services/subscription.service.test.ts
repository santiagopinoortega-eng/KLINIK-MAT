// __tests__/services/subscription.service.test.ts
import { SubscriptionService } from '@/services/subscription.service';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { preApprovalClient, preferenceClient } from '@/lib/mercadopago';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscriptionPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    usageRecord: {
      count: jest.fn(),
      create: jest.fn(),
    },
    coupon: {
      findFirst: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    payment: jest.fn(),
  },
}));

jest.mock('@/lib/mercadopago', () => ({
  preApprovalClient: {
    create: jest.fn(),
    update: jest.fn(),
  },
  preferenceClient: {
    create: jest.fn(),
  },
  MERCADOPAGO_URLS: {
    success: 'http://localhost:3000/subscription/success',
    failure: 'http://localhost:3000/subscription/failure',
    pending: 'http://localhost:3000/subscription/pending',
    webhook: 'http://localhost:3000/api/webhooks/mercadopago',
  },
}));

describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivePlans', () => {
    it('should return active plans ordered by price', async () => {
      const mockPlans = [
        { id: 'plan-1', name: 'FREE', price: 0, isActive: true },
        { id: 'plan-2', name: 'PRO', price: 9990, isActive: true },
        { id: 'plan-3', name: 'ENTERPRISE', price: 29990, isActive: true },
      ];

      (prisma.subscriptionPlan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const result = await SubscriptionService.getActivePlans();

      expect(result).toEqual(mockPlans);
      expect(prisma.subscriptionPlan.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
    });

    it('should return empty array when no active plans', async () => {
      (prisma.subscriptionPlan.findMany as jest.Mock).mockResolvedValue([]);

      const result = await SubscriptionService.getActivePlans();

      expect(result).toEqual([]);
    });
  });

  describe('getUserSubscription', () => {
    it('should return active subscription with plan details', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        status: 'ACTIVE',
        plan: {
          id: 'plan-pro',
          name: 'PRO',
          displayName: 'Plan Pro',
          price: 9990,
        },
        createdAt: new Date('2024-01-01'),
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await SubscriptionService.getUserSubscription('user-123');

      expect(result).toEqual(mockSubscription);
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: { in: ['ACTIVE', 'TRIALING'] },
        },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return null when user has no active subscription', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await SubscriptionService.getUserSubscription('user-456');

      expect(result).toBeNull();
    });

    it('should include TRIALING status in query', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      await SubscriptionService.getUserSubscription('user-123');

      expect(prisma.subscription.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['ACTIVE', 'TRIALING'] },
          }),
        })
      );
    });
  });

  describe('canAccessFeature', () => {
    it('should allow feature when subscription has feature enabled', async () => {
      const mockSubscription = {
        id: 'sub-123',
        status: 'ACTIVE',
        plan: {
          features: { ai_chat: true, export_pdf: true },
        },
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await SubscriptionService.canAccessFeature('user-123', 'ai_chat');

      expect(result).toBe(true);
    });

    it('should deny feature when subscription lacks feature', async () => {
      const mockSubscription = {
        id: 'sub-123',
        status: 'ACTIVE',
        plan: {
          features: { basic_cases: true },
        },
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await SubscriptionService.canAccessFeature('user-123', 'ai_chat');

      expect(result).toBe(false);
    });

    it('should check FREE plan features when no subscription', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue({
        name: 'FREE',
        features: { basic_cases: true, ai_chat: false },
      });

      const hasBasic = await SubscriptionService.canAccessFeature('user-123', 'basic_cases');
      const hasAI = await SubscriptionService.canAccessFeature('user-123', 'ai_chat');

      expect(hasBasic).toBe(true);
      expect(hasAI).toBe(false);
    });

    it('should deny access when trial has expired', async () => {
      const expiredTrialEnd = new Date('2024-01-01');
      const mockSubscription = {
        id: 'sub-123',
        status: 'TRIALING',
        trialEnd: expiredTrialEnd,
        plan: {
          features: { ai_chat: true },
        },
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.subscription.update as jest.Mock).mockResolvedValue({});

      // Mock current date to be after trial end
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-02-01'));

      const result = await SubscriptionService.canAccessFeature('user-123', 'ai_chat');

      expect(result).toBe(false);
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        data: { status: 'EXPIRED' },
      });

      jest.useRealTimers();
    });

    it('should allow access when trial is still valid', async () => {
      const futureTrialEnd = new Date('2025-12-31');
      const mockSubscription = {
        id: 'sub-123',
        status: 'TRIALING',
        trialEnd: futureTrialEnd,
        plan: {
          features: { ai_chat: true },
        },
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-01'));

      const result = await SubscriptionService.canAccessFeature('user-123', 'ai_chat');

      expect(result).toBe(true);
      expect(prisma.subscription.update).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should handle null features gracefully', async () => {
      const mockSubscription = {
        id: 'sub-123',
        status: 'ACTIVE',
        plan: {
          features: null,
        },
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await SubscriptionService.canAccessFeature('user-123', 'ai_chat');

      expect(result).toBe(false);
    });
  });

  describe('checkUsageLimit', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should enforce FREE plan limit', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue({
        name: 'FREE',
        maxCasesPerMonth: 10,
      });
      (prisma.usageRecord.count as jest.Mock).mockResolvedValue(5);

      const result = await SubscriptionService.checkUsageLimit('user-123', 'CASE_COMPLETION');

      expect(result).toEqual({
        allowed: true,
        used: 5,
        limit: 10,
      });
    });

    it('should deny when FREE limit reached', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue({
        name: 'FREE',
        maxCasesPerMonth: 10,
      });
      (prisma.usageRecord.count as jest.Mock).mockResolvedValue(10);

      const result = await SubscriptionService.checkUsageLimit('user-123', 'CASE_COMPLETION');

      expect(result).toEqual({
        allowed: false,
        used: 10,
        limit: 10,
      });
    });

    it('should allow unlimited usage for plans with null limit', async () => {
      const mockSubscription = {
        id: 'sub-123',
        plan: {
          maxCasesPerMonth: null,
        },
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await SubscriptionService.checkUsageLimit('user-123', 'CASE_COMPLETION');

      expect(result).toEqual({
        allowed: true,
        used: 0,
        limit: null,
      });
    });

    it('should count usage within billing period for paid plan', async () => {
      const mockSubscription = {
        id: 'sub-123',
        plan: {
          maxCasesPerMonth: 100,
        },
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.usageRecord.count as jest.Mock).mockResolvedValue(45);

      const result = await SubscriptionService.checkUsageLimit('user-123', 'CASE_COMPLETION');

      expect(result).toEqual({
        allowed: true,
        used: 45,
        limit: 100,
      });

      expect(prisma.usageRecord.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          subscriptionId: 'sub-123',
          resourceType: 'CASE_COMPLETION',
          billingPeriodStart: { lte: expect.any(Date) },
          billingPeriodEnd: { gte: expect.any(Date) },
        },
      });
    });

    it('should query from start of month for FREE plan', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue({
        name: 'FREE',
        maxCasesPerMonth: 10,
      });
      (prisma.usageRecord.count as jest.Mock).mockResolvedValue(3);

      await SubscriptionService.checkUsageLimit('user-123', 'CASE_COMPLETION');

      const callArgs = (prisma.usageRecord.count as jest.Mock).mock.calls[0][0];
      const startOfMonth = callArgs.where.recordedAt.gte;

      expect(startOfMonth.getDate()).toBe(1);
      expect(startOfMonth.getHours()).toBe(0);
    });
  });

  describe('recordUsage', () => {
    it('should create usage record for user with subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        currentPeriodStart: new Date('2024-06-01'),
        currentPeriodEnd: new Date('2024-06-30'),
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.usageRecord.create as jest.Mock).mockResolvedValue({
        id: 'usage-123',
        userId: 'user-123',
      });

      await SubscriptionService.recordUsage('user-123', 'CASE_COMPLETION', 1, { caseId: 'case-1' });

      expect(prisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          subscriptionId: 'sub-123',
          resourceType: 'CASE_COMPLETION',
          quantity: 1,
          billingPeriodStart: mockSubscription.currentPeriodStart,
          billingPeriodEnd: mockSubscription.currentPeriodEnd,
          metadata: { caseId: 'case-1' },
        },
      });
    });

    it('should create usage record for user without subscription', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.usageRecord.create as jest.Mock).mockResolvedValue({
        id: 'usage-123',
      });

      await SubscriptionService.recordUsage('user-123', 'AI_REQUEST', 5);

      expect(prisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          subscriptionId: undefined,
          resourceType: 'AI_REQUEST',
          quantity: 5,
          billingPeriodStart: expect.any(Date),
          billingPeriodEnd: expect.any(Date),
          metadata: undefined,
        },
      });
    });

    it('should default quantity to 1 if not provided', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.usageRecord.create as jest.Mock).mockResolvedValue({});

      await SubscriptionService.recordUsage('user-123', 'EXPORT_REPORT');

      const callArgs = (prisma.usageRecord.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.quantity).toBe(1);
    });
  });

  describe('createSubscriptionPayment', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockPlan = {
      id: 'plan-pro',
      displayName: 'Plan Pro',
      price: 9990,
      currency: 'CLP',
      billingPeriod: 'MONTHLY',
      mpPreapprovalPlanId: null,
    };

    beforeEach(() => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    });

    it('should create payment preference for one-time payment', async () => {
      const mockPreference = {
        id: 'pref-123',
        init_point: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=pref-123',
        sandbox_init_point: null,
      };

      (preferenceClient.create as jest.Mock).mockResolvedValue(mockPreference);

      const result = await SubscriptionService.createSubscriptionPayment('user-123', 'plan-pro');

      expect(result).toEqual({
        initPoint: mockPreference.init_point,
        preferenceId: 'pref-123',
        externalReference: expect.stringMatching(/^SUB_user-123_plan-pro_\d+$/),
      });

      expect(preferenceClient.create).toHaveBeenCalledWith({
        body: expect.objectContaining({
          items: [
            {
              id: 'plan-pro',
              title: 'Plan Pro',
              quantity: 1,
              unit_price: 9990,
              currency_id: 'CLP',
            },
          ],
          payer: expect.objectContaining({
            email: expect.any(String),
          }),
        }),
      });
    });

    it('should throw error when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        SubscriptionService.createSubscriptionPayment('invalid-user', 'plan-pro')
      ).rejects.toThrow('User or plan not found');
    });

    it('should throw error when plan not found', async () => {
      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        SubscriptionService.createSubscriptionPayment('user-123', 'invalid-plan')
      ).rejects.toThrow('User or plan not found');
    });

    it('should use sandbox init point in test mode', async () => {
      const mockPreference = {
        id: 'pref-123',
        init_point: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=pref-123',
        sandbox_init_point: 'https://sandbox.mercadopago.cl/checkout/v1/redirect?pref_id=pref-123',
      };

      (preferenceClient.create as jest.Mock).mockResolvedValue(mockPreference);

      const result = await SubscriptionService.createSubscriptionPayment('user-123', 'plan-pro');

      // Should prefer sandbox_init_point if available
      expect(result.initPoint).toBe(mockPreference.sandbox_init_point);
    });

    it('should create preapproval for recurring monthly plan', async () => {
      const recurringPlan = {
        ...mockPlan,
        billingPeriod: 'MONTHLY',
        mpPreapprovalPlanId: 'preapproval-plan-123',
      };

      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(recurringPlan);

      const mockPreapproval = {
        id: 'preapproval-123',
        init_point: 'https://www.mercadopago.cl/subscriptions/checkout?preapproval_id=preapproval-123',
      };

      (preApprovalClient.create as jest.Mock).mockResolvedValue(mockPreapproval);

      const result = await SubscriptionService.createSubscriptionPayment('user-123', 'plan-pro');

      expect(result).toEqual({
        initPoint: mockPreapproval.init_point,
        preapprovalId: 'preapproval-123',
        externalReference: expect.stringMatching(/^SUB_user-123_plan-pro_\d+$/),
      });

      expect(preApprovalClient.create).toHaveBeenCalledWith({
        body: expect.objectContaining({
          preapproval_plan_id: 'preapproval-plan-123',
          auto_recurring: expect.objectContaining({
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 9990,
          }),
        }),
      });
    });

    it('should log payment creation', async () => {
      (preferenceClient.create as jest.Mock).mockResolvedValue({
        id: 'pref-123',
        init_point: 'https://mp.com/checkout',
        sandbox_init_point: null,
      });

      await SubscriptionService.createSubscriptionPayment('user-123', 'plan-pro');

      expect(logger.payment).toHaveBeenCalledWith('created', {
        userId: 'user-123',
        planId: 'plan-pro',
        amount: 9990,
        paymentId: 'pref-123',
      });
    });

    it('should handle Mercado Pago API errors', async () => {
      const mpError = new Error('MP API Error');
      (preferenceClient.create as jest.Mock).mockRejectedValue(mpError);

      await expect(
        SubscriptionService.createSubscriptionPayment('user-123', 'plan-pro')
      ).rejects.toThrow('MP API Error');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create MP payment preference',
        mpError,
        expect.objectContaining({
          userId: 'user-123',
          planId: 'plan-pro',
        })
      );
    });
  });

  describe('activateSubscription', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-01T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should create active subscription for monthly plan', async () => {
      const mockPlan = {
        id: 'plan-pro',
        billingPeriod: 'MONTHLY',
        trialDays: 0,
      };

      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        status: 'ACTIVE',
      });

      await SubscriptionService.activateSubscription('user-123', 'plan-pro');

      const callArgs = (prisma.subscription.create as jest.Mock).mock.calls[0][0];
      const periodStart = callArgs.data.currentPeriodStart;
      const periodEnd = callArgs.data.currentPeriodEnd;

      // Verify period end is approximately 1 month after start
      const monthDiff = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
      expect(monthDiff).toBeGreaterThanOrEqual(28); // Min days in a month
      expect(monthDiff).toBeLessThanOrEqual(32); // Max days after adding 1 month

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          planId: 'plan-pro',
          status: 'ACTIVE',
          trialStart: null,
          trialEnd: null,
          mpPreapprovalId: undefined,
        }),
      });
    });

    it('should create subscription with trial period', async () => {
      const mockPlan = {
        id: 'plan-pro',
        billingPeriod: 'MONTHLY',
        trialDays: 14,
      };

      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        status: 'TRIALING',
      });

      await SubscriptionService.activateSubscription('user-123', 'plan-pro');

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'TRIALING',
          trialStart: new Date('2024-06-01T00:00:00Z'),
          trialEnd: new Date('2024-06-15T00:00:00Z'), // +14 days
        }),
      });
    });

    it('should calculate quarterly period correctly', async () => {
      const mockPlan = {
        id: 'plan-quarterly',
        billingPeriod: 'QUARTERLY',
        trialDays: 0,
      };

      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.subscription.create as jest.Mock).mockResolvedValue({ id: 'sub-123' });

      await SubscriptionService.activateSubscription('user-123', 'plan-quarterly');

      const callArgs = (prisma.subscription.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.currentPeriodEnd).toEqual(new Date('2024-09-01T00:00:00Z')); // +3 months
    });

    it('should calculate yearly period correctly', async () => {
      const mockPlan = {
        id: 'plan-yearly',
        billingPeriod: 'YEARLY',
        trialDays: 0,
      };

      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.subscription.create as jest.Mock).mockResolvedValue({ id: 'sub-123' });

      await SubscriptionService.activateSubscription('user-123', 'plan-yearly');

      const callArgs = (prisma.subscription.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.currentPeriodEnd).toEqual(new Date('2025-06-01T00:00:00Z')); // +1 year
    });

    it('should throw error when plan not found', async () => {
      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        SubscriptionService.activateSubscription('user-123', 'invalid-plan')
      ).rejects.toThrow('Plan not found');
    });

    it('should store Mercado Pago preapproval ID', async () => {
      const mockPlan = {
        id: 'plan-pro',
        billingPeriod: 'MONTHLY',
        trialDays: 0,
      };

      (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.subscription.create as jest.Mock).mockResolvedValue({ id: 'sub-123' });

      await SubscriptionService.activateSubscription('user-123', 'plan-pro', 'mp-preapproval-456');

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mpPreapprovalId: 'mp-preapproval-456',
        }),
      });
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        mpPreapprovalId: null,
      };

      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.subscription.update as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        status: 'ACTIVE',
        cancelAtPeriodEnd: true,
      });

      await SubscriptionService.cancelSubscription('sub-123', true, 'User requested');

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        data: {
          status: 'ACTIVE',
          cancelAtPeriodEnd: true,
          canceledAt: expect.any(Date),
          cancelReason: 'User requested',
        },
      });
    });

    it('should cancel subscription immediately', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        mpPreapprovalId: null,
      };

      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.subscription.update as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        status: 'CANCELED',
      });

      await SubscriptionService.cancelSubscription('sub-123', false);

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        data: {
          status: 'CANCELED',
          cancelAtPeriodEnd: false,
          canceledAt: expect.any(Date),
          cancelReason: undefined,
        },
      });
    });

    it('should cancel Mercado Pago preapproval when present', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        mpPreapprovalId: 'mp-preapproval-456',
      };

      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (preApprovalClient.update as jest.Mock).mockResolvedValue({});
      (prisma.subscription.update as jest.Mock).mockResolvedValue({});

      await SubscriptionService.cancelSubscription('sub-123');

      expect(preApprovalClient.update).toHaveBeenCalledWith({
        id: 'mp-preapproval-456',
        body: { status: 'cancelled' },
      });

      expect(logger.info).toHaveBeenCalledWith('MP preapproval cancelled', {
        preapprovalId: 'mp-preapproval-456',
        userId: 'user-123',
      });
    });

    it('should continue cancellation even if MP preapproval fails', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        mpPreapprovalId: 'mp-preapproval-456',
      };

      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (preApprovalClient.update as jest.Mock).mockRejectedValue(new Error('MP API Error'));
      (prisma.subscription.update as jest.Mock).mockResolvedValue({});

      await SubscriptionService.cancelSubscription('sub-123');

      expect(logger.warn).toHaveBeenCalledWith('Failed to cancel MP preapproval', {
        preapprovalId: 'mp-preapproval-456',
        error: 'Error: MP API Error',
      });

      expect(prisma.subscription.update).toHaveBeenCalled();
    });

    it('should throw error when subscription not found', async () => {
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        SubscriptionService.cancelSubscription('invalid-sub')
      ).rejects.toThrow('Subscription not found');
    });

    it('should default to cancel at period end', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        mpPreapprovalId: null,
      };

      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.subscription.update as jest.Mock).mockResolvedValue({});

      await SubscriptionService.cancelSubscription('sub-123');

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          cancelAtPeriodEnd: true,
        }),
      });
    });
  });
});
