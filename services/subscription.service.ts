// services/subscription.service.ts
/**
 * Servicio de gestión de suscripciones
 * Maneja toda la lógica de negocio relacionada con planes y suscripciones
 * 
 * REFACTORED: Now uses subscription repositories
 * Educational platform: Manages payment plans and access control for Chilean students
 */

import {
  subscriptionRepository,
  subscriptionPlanRepository,
  couponRepository,
  paymentRepository,
  usageRecordRepository,
} from '@/lib/repositories';
import { logger } from '@/lib/logger';
import { preApprovalClient, preferenceClient, MERCADOPAGO_URLS } from '@/lib/mercadopago';
import type { SubscriptionPlan, Subscription, User, Coupon } from '@prisma/client';

export class SubscriptionService {
  /**
   * Obtiene todos los planes activos
   * Educational: Shows available subscription tiers (Free, Premium) for Chilean students
   */
  static async getActivePlans() {
    return await subscriptionPlanRepository.findAllActive();
  }

  /**
   * Obtiene la suscripción activa de un usuario
   */
  static async getUserSubscription(userId: string) {
    return await subscriptionRepository.findActiveByUser(userId);
  }

  /**
   * Verifica si un usuario puede acceder a una característica
   * Educational: Controls access to premium features for students
   */
  static async canAccessFeature(
    userId: string,
    feature: string
  ): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      // Sin suscripción = solo acceso FREE
      const freePlan = await subscriptionPlanRepository.findByName('FREE');
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
   * Educational: Enforces case limits for Free tier students
   */
  static async checkUsageLimit(
    userId: string,
    resourceType: 'CASE_COMPLETION' | 'AI_REQUEST' | 'EXPORT_REPORT' | 'CUSTOM_CASE'
  ): Promise<{ allowed: boolean; used: number; limit: number | null }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      // Plan FREE
      const freePlan = await subscriptionPlanRepository.findByName('FREE');
      const limit = freePlan?.maxCasesPerMonth || 10;
      
      // Contar uso del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const used = await usageRecordRepository.count({
        userId,
        resourceType,
        recordedAt: { gte: startOfMonth },
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
    const used = await usageRecordRepository.count({
      userId,
      subscriptionId: subscription.id,
      resourceType,
      billingPeriodStart: { lte: new Date() },
      billingPeriodEnd: { gte: new Date() },
    });

    return {
      allowed: used < limit,
      used,
      limit,
    };
  }

  /**
   * Registra uso de un recurso
   * Educational: Tracks case completions and AI usage for billing
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

    return await usageRecordRepository.create({
      userId,
      subscriptionId: subscription?.id,
      resourceType,
      quantity,
      billingPeriodStart,
      billingPeriodEnd,
      metadata,
    });
  }

  /**
   * Crea una preferencia de pago para suscripción en Mercado Pago
   * Educational: Handles payment integration for Chilean students via Mercado Pago
   */
  static async createSubscriptionPayment(
    userId: string,
    planId: string,
    couponCode?: string
  ) {
    logger.debug('Looking for user', { userId });
    // Note: User lookup still uses userRepository which would need to be imported
    // For now, keeping direct import to avoid circular dependency
    const { userRepository } = await import('@/lib/repositories');
    const user = await userRepository.findById(userId);
    logger.debug('User lookup result', { found: !!user, email: user?.email });
    
    logger.debug('Looking for plan', { planId });
    const plan = await subscriptionPlanRepository.findById(planId);
    logger.debug('Plan lookup result', { found: !!plan, name: plan?.displayName });

    if (!user || !plan) {
      logger.error('Missing user or plan', undefined, { userFound: !!user, planFound: !!plan });
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
      // En TEST, usar email y RUT de prueba para evitar conflicto vendedor=comprador
      const isTestMode = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
      const payerEmail = isTestMode ? 'test_user_klinikmat@testuser.com' : user.email;
      const payerName = isTestMode ? 'Usuario' : (user.name || 'Usuario KlinikMat');
      const payerRut = '12345678-9'; // RUT válido genérico
      
      const preference = await preferenceClient.create({
        body: {
          items: [
            {
              id: plan.id,
              title: plan.displayName,
              quantity: 1,
              unit_price: finalPrice,
              currency_id: plan.currency,
            },
          ],
          payer: {
            email: payerEmail,
            name: payerName,
            surname: 'Prueba',
            identification: {
              type: 'RUT',
              number: payerRut,
            },
          },
          payment_methods: {
            excluded_payment_types: [
              { id: 'ticket' }, // Excluir pago en efectivo
            ],
            installments: 1, // Forzar 1 cuota
          },
          binary_mode: true, // Forzar aprobación/rechazo inmediato
          external_reference: externalReference,
          back_urls: {
            success: MERCADOPAGO_URLS.success,
            failure: MERCADOPAGO_URLS.failure,
            pending: MERCADOPAGO_URLS.pending,
          },
          auto_return: 'approved',
          notification_url: MERCADOPAGO_URLS.webhook,
        },
      });

      logger.payment('created', {
        userId: user.id,
        planId: plan.id,
        amount: finalPrice,
        paymentId: preference.id,
      });

      // Usar sandbox_init_point en TEST, init_point en producción
      const initPoint = preference.sandbox_init_point || preference.init_point;

      return {
        initPoint,
        preferenceId: preference.id,
        externalReference,
      };
    } catch (error) {
      logger.error('Failed to create MP payment preference', error, {
        userId, planId, finalPrice
      });
      throw error;
    }
  }

  /**
   * Valida y retorna un cupón si es válido
   * Educational: Supports promotional codes for student discounts
   */
  private static async validateCoupon(
    code: string,
    planId: string,
    userId: string
  ): Promise<Coupon | null> {
    const coupon = await couponRepository.findByCode(code.toUpperCase());

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
      const approvedCount = await paymentRepository.count({
        userId,
        status: 'APPROVED',
      });
      if (approvedCount > 0) return null;
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
   * Educational: Grants premium access after successful payment
   */
  static async activateSubscription(
    userId: string,
    planId: string,
    mpPreapprovalId?: string,
    mpPaymentId?: string
  ) {
    const plan = await subscriptionPlanRepository.findById(planId);
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const periodEnd = new Date();

    // Calcular fecha de fin según el período
    switch (plan.billingPeriod) {
      case 'MONTHLY':
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
      case 'SEMIANNUAL':
        periodEnd.setMonth(periodEnd.getMonth() + 6);
        break;
      case 'ANNUAL':
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

    return await subscriptionRepository.create({
      userId,
      planId,
      status: plan.trialDays > 0 ? 'TRIALING' : 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialStart,
      trialEnd,
      mpPreapprovalId,
    });
  }

  /**
   * Cancela una suscripción
   * Educational: Allows students to cancel premium subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
    reason?: string
  ) {
    const subscription = await subscriptionRepository.findById(subscriptionId);

    if (!subscription) throw new Error('Subscription not found');

    // Si tiene preapproval en MP, cancelarlo también
    if (subscription.mpPreapprovalId) {
      try {
        await preApprovalClient.update({
          id: subscription.mpPreapprovalId,
          body: { status: 'cancelled' },
        });
        logger.info('MP preapproval cancelled', {
          preapprovalId: subscription.mpPreapprovalId,
          userId: subscription.userId,
        });
      } catch (error) {
        logger.warn('Failed to cancel MP preapproval', {
          preapprovalId: subscription.mpPreapprovalId,
          error: String(error),
        });
      }
    }

    return await subscriptionRepository.update(subscriptionId, {
      status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELED',
      cancelAtPeriodEnd,
      canceledAt: new Date(),
      cancelReason: reason,
    });
  }

  /**
   * Marca una suscripción como expirada
   */
  private static async expireSubscription(subscriptionId: string) {
    return await subscriptionRepository.update(subscriptionId, {
      status: 'EXPIRED',
    });
  }
}
