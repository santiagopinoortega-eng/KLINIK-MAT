// app/api/subscription/create-preference/route.ts
/**
 * API para crear preferencias de pago en Mercado Pago (Legacy endpoint)
 * Arquitectura: Services + DTOs + Middleware composable + Error handling
 * 
 * POST /api/subscription/create-preference
 * Body: { planId: string, couponCode?: string }
 * 
 * Nota: Este endpoint es similar a create-payment, mantenido por compatibilidad
 * Se recomienda usar /api/subscription/create-payment para nuevas integraciones
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { preferenceClient, MERCADOPAGO_URLS } from '@/lib/mercadopago';
import { RATE_LIMITS } from '@/lib/ratelimit';
import {
  compose,
  withAuth,
  withRateLimit,
  withValidation,
  withLogging,
  type ApiContext,
} from '@/lib/middleware/api-middleware';
import { withStrictCSRF } from '@/lib/middleware/csrf-middleware';
import { withIdempotency } from '@/lib/idempotency';
import { sanitizeMetadata } from '@/lib/sanitize-payment';
import { CreatePreferenceDto } from '@/lib/dtos/subscription.dto';
import { NotFoundError, ValidationError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/logger';
import { validateAndApplyCoupon, generatePaymentReference, preparePayer } from '@/lib/payment-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/subscription/create-preference
 * Crear preferencia de pago en Mercado Pago (Legacy)
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withStrictCSRF - Protección CSRF crítica para pagos
 * @middleware withRateLimit - 5 req/min (protección contra spam)
 * @middleware withValidation - Valida body con CreatePreferenceDto
 * @middleware withLogging - Log de requests/responses
 */
export const POST = compose(
  withAuth,
  withStrictCSRF,
  withIdempotency(86400),
  withRateLimit({ windowMs: 60_000, maxRequests: 5 }),
  withValidation(CreatePreferenceDto),
  withLogging
)(async (req: NextRequest, context: ApiContext) => {
  const userId = context.userId!;
  const { planId, couponCode } = context.body;

  logger.info('[CREATE-PREFERENCE] Nueva solicitud', {
    userId,
    planId,
    hasCoupon: !!couponCode,
  });

  // 1. Obtener usuario y plan en paralelo
  const [user, plan] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    }),
    prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { subscriptions: false },
    }),
  ]);

  if (!user) {
    throw new NotFoundError('User');
  }

  if (!plan || !plan.isActive) {
    throw new NotFoundError('Plan or plan is inactive');
  }

  // 2. Calcular precio final con descuento
  let finalPrice = Number(plan.price);
  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const couponResult = await validateAndApplyCoupon(couponCode, planId, userId, finalPrice);
    if (couponResult.valid) {
      appliedCoupon = couponResult.coupon;
      discountAmount = couponResult.discount ?? 0;
      finalPrice -= discountAmount;

      logger.info('[CREATE-PREFERENCE] Cupón aplicado', {
        code: couponCode,
        discount: discountAmount,
        finalPrice,
      });
    } else {
      logger.warn('[CREATE-PREFERENCE] Cupón inválido', {
        code: couponCode,
        reason: couponResult.reason,
      });
    }
  }

  // 3. Validar precio final
  if (finalPrice < 0) {
    throw new ValidationError('Price cannot be negative after discount');
  }

  // 4. Generar referencia única y preparar pagador
  const externalReference = generatePaymentReference(userId, planId);
  const isTestMode = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
  const payer = preparePayer(user, isTestMode);

  logger.info('[CREATE-PREFERENCE] Creando preferencia MP', {
    externalReference,
    finalPrice,
    environment: isTestMode ? 'TEST' : 'PROD',
  });

  // 5. Crear preferencia en Mercado Pago
  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: plan.id,
          title: `KlinikMat - ${plan.displayName}`,
          description: plan.description || `Plan ${plan.billingPeriod === 'MONTHLY' ? 'Mensual' : 'Anual'}`,
          category_id: 'education',
          quantity: 1,
          unit_price: finalPrice,
          currency_id: plan.currency,
        },
      ],
      payer: {
        name: payer.firstName,
        surname: payer.lastName,
        email: payer.email,
        phone: {
          area_code: '56',
          number: '',
        },
        identification: {
          type: 'RUT',
          number: '12345678-9',
        },
        address: {
          zip_code: '',
          street_name: '',
        },
      },
      back_urls: {
        success: `${MERCADOPAGO_URLS.success}?plan_id=${planId}&ref=${externalReference}`,
        failure: `${MERCADOPAGO_URLS.failure}?plan_id=${planId}&ref=${externalReference}`,
        pending: `${MERCADOPAGO_URLS.pending}?plan_id=${planId}&ref=${externalReference}`,
      },
      auto_return: 'approved',
      notification_url: MERCADOPAGO_URLS.webhook,
      external_reference: externalReference,
      statement_descriptor: 'KLINIKMAT',
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' },
          { id: 'atm' },
        ],
        excluded_payment_methods: [
          { id: 'rapipago' },
          { id: 'pagofacil' },
          { id: 'servipag' },
        ],
        installments: plan.billingPeriod === 'MONTHLY' ? 1 : 12,
      },
      binary_mode: true,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      metadata: sanitizeMetadata({
        user_id: userId,
        plan_id: planId,
        plan_name: plan.displayName,
        billing_period: plan.billingPeriod,
        original_price: plan.price,
        final_price: finalPrice,
        discount_amount: discountAmount,
        coupon_code: couponCode || null,
        trial_days: plan.trialDays,
        features: JSON.stringify(plan.features),
        timestamp: new Date().toISOString(),
      }),
    },
  });

  if (!preference.id || !preference.init_point) {
    throw new Error('Failed to create Mercado Pago preference');
  }

  logger.info('[CREATE-PREFERENCE] Preferencia creada', {
    preferenceId: preference.id,
  });

  // 6. Retornar datos para el frontend
  const initPoint = isTestMode
    ? (preference.sandbox_init_point || preference.init_point)
    : preference.init_point;

  return NextResponse.json({
    success: true,
    preferenceId: preference.id,
    initPoint,
    externalReference,
    payment: {
      amount: finalPrice,
      originalAmount: Number(plan.price),
      discount: discountAmount,
      currency: plan.currency,
      planName: plan.displayName,
      billingPeriod: plan.billingPeriod,
      expiresIn: 30, // minutes
    },
    coupon: appliedCoupon
      ? {
          code: appliedCoupon.code,
          discountType: appliedCoupon.discountType,
          discountValue: Number(appliedCoupon.discountValue),
          applied: true,
        }
      : null,
  });
});
