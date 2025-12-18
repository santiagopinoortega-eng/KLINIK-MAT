// services/subscription.service.ts
/**
 * Servicio de gestión de suscripciones
 * Maneja toda la lógica de negocio relacionada con planes y suscripciones
 */

import { prisma } from '@/lib/prisma';
import { preApprovalClient, preferenceClient, MERCADOPAGO_URLS } from '@/lib/mercadopago';
import type { SubscriptionPlan, Subscription, User, Coupon } from '@prisma/client';

export class SubscriptionService {
  /**
   * Obtiene todos los planes activos
   */
  static async getActivePlans() {
    return await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Obtiene la suscripción activa de un usuario
   */
  static async getUserSubscription(userId: string) {
    return await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Verifica si un usuario puede acceder a una característica
   */
  static async canAccessFeature(
    userId: string,
    feature: string
  ): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      // Sin suscripción = solo acceso FREE
      const freePlan = await prisma.subscriptionPlan.findUnique({
        where: { name: 'FREE' },
      });
      const features = freePlan?.features as Record<string, unknown> | null;
      return features?.[feature] === true;
    }

    // Verificar si está en trial y no ha expirado
    if (subscription.status === 'TRIALING' && subscription.trialEnd) {
      if (new Date() > subscription.trialEnd) {
        // Trial expirado, actualizar estado
        await this.expireSubscription(subscription.id);
        return false;
      }
    }

    const features = subscription.plan.features as Record<string, unknown> | null;
    return features?.[feature] === true;
  }

  /**
   * Verifica límites de uso (ej: casos por mes)
   */
  static async checkUsageLimit(
    userId: string,
    resourceType: 'CASE_COMPLETION' | 'AI_REQUEST' | 'EXPORT_REPORT' | 'CUSTOM_CASE'
  ): Promise<{ allowed: boolean; used: number; limit: number | null }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      // Plan FREE
      const freePlan = await prisma.subscriptionPlan.findUnique({
        where: { name: 'FREE' },
      });
      const limit = freePlan?.maxCasesPerMonth || 10;
      
      // Contar uso del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const used = await prisma.usageRecord.count({
        where: {
          userId,
          resourceType,
          recordedAt: { gte: startOfMonth },
        },
      });

      return {
        allowed: used < limit,
        used,
        limit,
      };
    }

    // Plan de pago
    const limit = subscription.plan.maxCasesPerMonth;

    if (limit === null) {
      // Ilimitado
      return { allowed: true, used: 0, limit: null };
    }

    // Contar uso del período actual
    const used = await prisma.usageRecord.count({
      where: {
        userId,
        subscriptionId: subscription.id,
        resourceType,
        billingPeriodStart: { lte: new Date() },
        billingPeriodEnd: { gte: new Date() },
      },
    });

    return {
      allowed: used < limit,
      used,
      limit,
    };
  }

  /**
   * Registra uso de un recurso
   */
  static async recordUsage(
    userId: string,
    resourceType: 'CASE_COMPLETION' | 'AI_REQUEST' | 'EXPORT_REPORT' | 'CUSTOM_CASE',
    quantity: number = 1,
    metadata?: any
  ) {
    const subscription = await this.getUserSubscription(userId);

    const billingPeriodStart = subscription?.currentPeriodStart || new Date();
    const billingPeriodEnd = subscription?.currentPeriodEnd || new Date();

    return await prisma.usageRecord.create({
      data: {
        userId,
        subscriptionId: subscription?.id,
        resourceType,
        quantity,
        billingPeriodStart,
        billingPeriodEnd,
        metadata,
      },
    });
  }

  /**
   * Crea una preferencia de pago para suscripción en Mercado Pago
   */
  static async createSubscriptionPayment(
    userId: string,
    planId: string,
    couponCode?: string
  ) {
    console.log('🔍 [SUBSCRIPTION-SERVICE] Looking for user:', userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log('👤 [SUBSCRIPTION-SERVICE] User found:', user ? `${user.email} (${user.id})` : 'NOT FOUND');
    
    console.log('🔍 [SUBSCRIPTION-SERVICE] Looking for plan:', planId);
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    console.log('📦 [SUBSCRIPTION-SERVICE] Plan found:', plan ? `${plan.displayName} (${plan.id})` : 'NOT FOUND');

    if (!user || !plan) {
      console.error('❌ [SUBSCRIPTION-SERVICE] Missing:', { userFound: !!user, planFound: !!plan });
      throw new Error('User or plan not found');
    }

    let finalPrice = Number(plan.price);
    let discount = 0;

    // Aplicar cupón si existe
    if (couponCode) {
      const coupon = await this.validateCoupon(couponCode, planId, userId);
      if (coupon) {
        discount = await this.calculateDiscount(coupon, finalPrice);
        finalPrice -= discount;
      }
    }

    // Crear referencia única
    const externalReference = `SUB_${userId}_${planId}_${Date.now()}`;

    try {
      // Para suscripciones recurrentes
      if (plan.billingPeriod === 'MONTHLY' && plan.mpPreapprovalPlanId) {
        const preapproval = await preApprovalClient.create({
          body: {
            preapproval_plan_id: plan.mpPreapprovalPlanId,
            reason: plan.displayName,
            external_reference: externalReference,
            payer_email: user.email,
            card_token_id: undefined, // Usuario seleccionará en MP
            auto_recurring: {
              frequency: 1,
              frequency_type: 'months',
              transaction_amount: finalPrice,
              currency_id: plan.currency,
              start_date: new Date().toISOString(),
              end_date: undefined, // Sin fecha de fin
            },
            back_url: MERCADOPAGO_URLS.success,
            status: 'pending',
          },
        });

        return {
          initPoint: preapproval.init_point,
          preapprovalId: preapproval.id,
          externalReference,
        };
      }

      // Para pagos únicos (anual o sin plan recurrente)
      const preference = await preferenceClient.create({
        body: {
          items: [
            {
              id: plan.id,
              title: plan.displayName,
              description: plan.description || undefined,
              quantity: 1,
              unit_price: finalPrice,
              currency_id: plan.currency,
            },
          ],
          payer: {
            email: user.email,
            name: user.name || 'Usuario KlinikMat',
            identification: {
              type: 'RUT',
              number: '11111111-1', // RUT genérico para testing
            },
            address: {
              zip_code: '8320000',
              street_name: 'Santiago',
            },
          },
          payment_methods: {
            excluded_payment_types: [],
            installments: 1,
          },
          external_reference: externalReference,
          notification_url: MERCADOPAGO_URLS.webhook,
          back_urls: {
            success: MERCADOPAGO_URLS.success,
            failure: MERCADOPAGO_URLS.failure,
            pending: MERCADOPAGO_URLS.pending,
          },
          auto_return: 'approved',
          statement_descriptor: 'KLINIKMAT',
          metadata: {
            user_id: userId,
            plan_id: planId,
            coupon_code: couponCode,
            discount_amount: discount,
          },
        },
      });

      console.log('✅ [MP] Preference created:', {
        id: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      });

      // Usar sandbox_init_point en TEST, init_point en producción
      const initPoint = preference.sandbox_init_point || preference.init_point;

      return {
        initPoint,
        preferenceId: preference.id,
        externalReference,
      };
    } catch (error) {
      console.error('❌ Error creating MP payment:', error);
      throw error;
    }
  }

  /**
   * Valida y retorna un cupón si es válido
   */
  private static async validateCoupon(
    code: string,
    planId: string,
    userId: string
  ): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
    });

    if (!coupon) return null;

    // Verificar límite de usos
    if (coupon.maxRedemptions && coupon.redemptionsCount >= coupon.maxRedemptions) {
      return null;
    }

    // Verificar si el plan es aplicable
    if (!coupon.applicablePlans.includes('all') && !coupon.applicablePlans.includes(planId)) {
      return null;
    }

    // Verificar si es solo primera compra
    if (coupon.firstPurchaseOnly) {
      const hasPreviousPurchase = await prisma.payment.findFirst({
        where: { userId, status: 'APPROVED' },
      });
      if (hasPreviousPurchase) return null;
    }

    return coupon;
  }

  /**
   * Calcula el monto de descuento
   */
  private static async calculateDiscount(coupon: Coupon, price: number): Promise<number> {
    if (coupon.discountType === 'PERCENTAGE') {
      return (price * Number(coupon.discountValue)) / 100;
    } else {
      return Math.min(Number(coupon.discountValue), price);
    }
  }

  /**
   * Activa una suscripción después de pago exitoso
   */
  static async activateSubscription(
    userId: string,
    planId: string,
    mpPreapprovalId?: string,
    mpPaymentId?: string
  ) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const periodEnd = new Date();

    // Calcular fecha de fin según el período
    switch (plan.billingPeriod) {
      case 'MONTHLY':
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
      case 'QUARTERLY':
        periodEnd.setMonth(periodEnd.getMonth() + 3);
        break;
      case 'YEARLY':
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        break;
    }

    // Calcular trial si aplica
    let trialStart: Date | null = null;
    let trialEnd: Date | null = null;

    if (plan.trialDays > 0) {
      trialStart = now;
      trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + plan.trialDays);
    }

    return await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: plan.trialDays > 0 ? 'TRIALING' : 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialStart,
        trialEnd,
        mpPreapprovalId,
      },
    });
  }

  /**
   * Cancela una suscripción
   */
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
    reason?: string
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) throw new Error('Subscription not found');

    // Si tiene preapproval en MP, cancelarlo también
    if (subscription.mpPreapprovalId) {
      try {
        await preApprovalClient.update({
          id: subscription.mpPreapprovalId,
          body: { status: 'cancelled' },
        });
      } catch (error) {
        console.error('❌ Error canceling MP preapproval:', error);
      }
    }

    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELED',
        cancelAtPeriodEnd,
        canceledAt: new Date(),
        cancelReason: reason,
      },
    });
  }

  /**
   * Marca una suscripción como expirada
   */
  private static async expireSubscription(subscriptionId: string) {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'EXPIRED' },
    });
  }
}
