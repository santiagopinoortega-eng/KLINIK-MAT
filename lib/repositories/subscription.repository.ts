// lib/repositories/subscription.repository.ts
/**
 * Subscription Repository
 * 
 * Encapsulates all Prisma queries for subscription and payment management.
 * Handles subscription plans, active subscriptions, coupons, payments, and usage tracking.
 * 
 * @module SubscriptionRepository
 */

import { Subscription, SubscriptionPlan, Coupon, Payment, UsageRecord, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type SubscriptionWithPlan = Prisma.SubscriptionGetPayload<{
  include: {
    plan: true;
  };
}>;

export type SubscriptionWithRelations = Prisma.SubscriptionGetPayload<{
  include: {
    plan: true;
    user: true;
    payments: true;
  };
}>;

/**
 * Subscription Repository
 * 
 * Manages subscription data access for the educational platform payment system.
 */
export class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor() {
    super('subscription');
  }

  /**
   * Find active subscription for a user
   * Used to check user's current plan and access level
   */
  async findActiveByUser(userId: string, readOnly: boolean = true): Promise<SubscriptionWithPlan | null> {
    return this.executeQuery('findActiveByUser', async () => {
      const client = this.getClient(readOnly);
      return client.subscription.findFirst({
        where: {
          userId,
          status: { in: ['ACTIVE', 'TRIALING'] },
        },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Find subscription by external reference (Mercado Pago)
   * Used for payment webhooks
   */
  async findByExternalReference(
    externalReference: string,
    readOnly: boolean = true
  ): Promise<Subscription | null> {
    return this.findOne(
      { externalReference },
      undefined,
      readOnly
    );
  }

  /**
   * Find subscription by Mercado Pago preapproval ID
   * Used for subscription management
   */
  async findByPreapprovalId(
    preapprovalId: string,
    readOnly: boolean = true
  ): Promise<Subscription | null> {
    return this.findOne(
      { preapprovalId },
      undefined,
      readOnly
    );
  }

  /**
   * Find all subscriptions for a user (including expired)
   * Used for subscription history
   */
  async findAllByUser(
    userId: string,
    readOnly: boolean = true
  ): Promise<SubscriptionWithPlan[]> {
    return this.executeQuery('findAllByUser', async () => {
      const client = this.getClient(readOnly);
      return client.subscription.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Update subscription status
   * Used for payment confirmations, cancellations, renewals
   */
  async updateStatus(
    subscriptionId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'TRIALING' | 'EXPIRED' | 'PENDING'
  ): Promise<Subscription> {
    return this.update(subscriptionId, { status });
  }

  /**
   * Cancel subscription
   * Sets cancellation date and optionally immediate cancellation
   */
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false
  ): Promise<Subscription> {
    const data: Prisma.SubscriptionUpdateInput = {
      cancelledAt: new Date(),
    };

    if (immediate) {
      data.status = 'CANCELLED';
    }

    return this.update(subscriptionId, data);
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    return this.update(subscriptionId, {
      cancelledAt: null,
      status: 'ACTIVE',
    });
  }

  /**
   * Find expiring subscriptions
   * Used for renewal reminders
   */
  async findExpiringSoon(daysThreshold: number = 7, readOnly: boolean = true): Promise<Subscription[]> {
    return this.executeQuery('findExpiringSoon', async () => {
      const client = this.getClient(readOnly);
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + daysThreshold);

      return client.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lte: threshold,
            gte: new Date(),
          },
        },
      });
    });
  }
}

/**
 * Subscription Plan Repository
 */
export class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlan> {
  constructor() {
    super('subscriptionPlan');
  }

  /**
   * Get all active plans
   * Used for pricing page
   */
  async findAllActive(readOnly: boolean = true): Promise<SubscriptionPlan[]> {
    return this.findMany(
      {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
      readOnly
    );
  }

  /**
   * Find plan by name
   */
  async findByName(name: string, readOnly: boolean = true): Promise<SubscriptionPlan | null> {
    return this.findOne({ name }, undefined, readOnly);
  }

  /**
   * Find plan by Mercado Pago reason
   */
  async findByMercadoPagoReason(
    reason: string,
    readOnly: boolean = true
  ): Promise<SubscriptionPlan | null> {
    return this.findOne({ mercadoPagoReason: reason }, undefined, readOnly);
  }
}

/**
 * Coupon Repository
 */
export class CouponRepository extends BaseRepository<Coupon> {
  constructor() {
    super('coupon');
  }

  /**
   * Find coupon by code
   */
  async findByCode(code: string, readOnly: boolean = true): Promise<Coupon | null> {
    return this.findOne({ code }, undefined, readOnly);
  }

  /**
   * Find active coupons
   */
  async findAllActive(readOnly: boolean = true): Promise<Coupon[]> {
    return this.findMany(
      {
        where: {
          isActive: true,
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      },
      readOnly
    );
  }

  /**
   * Check if coupon is valid and usable
   */
  async isValidCoupon(code: string, readOnly: boolean = true): Promise<{ valid: boolean; coupon?: Coupon; reason?: string }> {
    const coupon = await this.findByCode(code, readOnly);

    if (!coupon) {
      return { valid: false, reason: 'Coupon not found' };
    }

    if (!coupon.isActive) {
      return { valid: false, coupon, reason: 'Coupon is not active' };
    }

    const now = new Date();

    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, coupon, reason: 'Coupon not yet valid' };
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, coupon, reason: 'Coupon expired' };
    }

    if (coupon.maxRedemptions !== null) {
      const count = await this.countUsages(coupon.id, readOnly);
      if (count >= coupon.maxRedemptions) {
        return { valid: false, coupon, reason: 'Coupon usage limit reached' };
      }
    }

    return { valid: true, coupon };
  }

  /**
   * Count coupon usages
   */
  async countUsages(couponId: string, readOnly: boolean = true): Promise<number> {
    return this.executeQuery('countUsages', async () => {
      const client = this.getClient(readOnly);
      return client.couponUsage.count({
        where: { couponId },
      });
    });
  }

  /**
   * Record coupon usage
   */
  async recordUsage(couponId: string, userId: string, subscriptionId: string) {
    return this.executeQuery('recordUsage', async () => {
      const client = this.getClient(false);
      return client.couponUsage.create({
        data: {
          couponId,
          userId,
          subscriptionId,
        },
      });
    });
  }
}

/**
 * Payment Repository
 */
export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payment');
  }

  /**
   * Find payment by Mercado Pago payment ID
   */
  async findByMercadoPagoId(
    mercadoPagoPaymentId: string,
    readOnly: boolean = true
  ): Promise<Payment | null> {
    return this.findOne({ mercadoPagoPaymentId }, undefined, readOnly);
  }

  /**
   * Find payments by user
   */
  async findByUser(
    userId: string,
    limit: number = 50,
    readOnly: boolean = true
  ): Promise<Payment[]> {
    return this.findMany(
      {
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      },
      readOnly
    );
  }

  /**
   * Find payments by subscription
   */
  async findBySubscription(
    subscriptionId: string,
    readOnly: boolean = true
  ): Promise<Payment[]> {
    return this.findMany(
      {
        where: { subscriptionId },
        orderBy: { createdAt: 'desc' },
      },
      readOnly
    );
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED'
  ): Promise<Payment> {
    return this.update(paymentId, { status });
  }
}

/**
 * Usage Record Repository
 */
export class UsageRecordRepository extends BaseRepository<UsageRecord> {
  constructor() {
    super('usageRecord');
  }

  /**
   * Count usage for a user in current billing period
   */
  async countUserUsage(
    userId: string,
    resourceType: 'CASE_COMPLETION' | 'AI_REQUEST' | 'EXPORT_REPORT' | 'CUSTOM_CASE',
    subscriptionId?: string,
    readOnly: boolean = true
  ): Promise<number> {
    return this.executeQuery('countUserUsage', async () => {
      const client = this.getClient(readOnly);

      const where: Prisma.UsageRecordWhereInput = {
        userId,
        resourceType,
      };

      if (subscriptionId) {
        where.subscriptionId = subscriptionId;
        where.billingPeriodStart = { lte: new Date() };
        where.billingPeriodEnd = { gte: new Date() };
      } else {
        // Free plan - count from start of month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        where.recordedAt = { gte: startOfMonth };
      }

      return client.usageRecord.count({ where });
    });
  }

  /**
   * Record usage of a resource
   */
  async recordUsage(data: {
    userId: string;
    subscriptionId?: string;
    resourceType: 'CASE_COMPLETION' | 'AI_REQUEST' | 'EXPORT_REPORT' | 'CUSTOM_CASE';
    quantity: number;
    billingPeriodStart?: Date;
    billingPeriodEnd?: Date;
    metadata?: any;
  }): Promise<UsageRecord> {
    return this.create(data);
  }

  /**
   * Get usage stats for a user
   */
  async getUserUsageStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    readOnly: boolean = true
  ) {
    return this.executeQuery('getUserUsageStats', async () => {
      const client = this.getClient(readOnly);

      const where: Prisma.UsageRecordWhereInput = { userId };

      if (startDate || endDate) {
        where.recordedAt = {};
        if (startDate) where.recordedAt.gte = startDate;
        if (endDate) where.recordedAt.lte = endDate;
      }

      const stats = await client.usageRecord.groupBy({
        by: ['resourceType'],
        where,
        _sum: { quantity: true },
        _count: { id: true },
      });

      return stats.map(stat => ({
        resourceType: stat.resourceType,
        totalQuantity: stat._sum.quantity || 0,
        recordCount: stat._count.id,
      }));
    });
  }
}

// Singleton instances
export const subscriptionRepository = new SubscriptionRepository();
export const subscriptionPlanRepository = new SubscriptionPlanRepository();
export const couponRepository = new CouponRepository();
export const paymentRepository = new PaymentRepository();
export const usageRecordRepository = new UsageRecordRepository();
