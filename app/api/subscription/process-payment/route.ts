import { NextRequest, NextResponse } from 'next/server';
import { paymentClient } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';
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
import { sanitizePaymentData, maskSensitivePaymentData } from '@/lib/sanitize-payment';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DTO para validación
const ProcessPaymentDto = z.object({
  planId: z.string().min(1),
  token: z.string().min(1),
  paymentMethodId: z.string().optional(),
  issuerId: z.string().optional(),
  installments: z.number().int().min(1).max(12).optional(),
}).strict();

/**
 * POST /api/subscription/process-payment
 * Procesar pago con MercadoPago Card Payment Brick
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withStrictCSRF - Protección CSRF crítica
 * @middleware withRateLimit - 5 req/min
 * @middleware withValidation - Valida datos de pago
 * @middleware withLogging - Auditoría completa
 */
export const POST = compose(
  withAuth,
  withStrictCSRF,
  withIdempotency(86400), // 24 horas
  withRateLimit({ windowMs: 60_000, maxRequests: 5 }),
  withValidation(ProcessPaymentDto),
  withLogging
)(async (req: NextRequest, context: ApiContext) => {
  const userId = context.userId!;
  const { planId, token, paymentMethodId, issuerId, installments } = context.body;

  // Buscar usuario y plan
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });

  if (!user || !plan) {
    return NextResponse.json(
      { error: 'User or plan not found' },
      { status: 404 }
    );
  }

  const finalPrice = Number(plan.price);

  // En TEST, generar email aleatorio para evitar conflicto vendedor=comprador
  const isTestMode = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
  const randomID = Math.floor(Math.random() * 10000000);
  const payerEmail = isTestMode 
    ? `cliente${randomID}@example.com` 
    : user.email;

  console.log('💳 [PROCESS-PAYMENT] Email del payer:', payerEmail);

  // Sanitizar datos de pago
  const sanitizedData = sanitizePaymentData({
    planDisplayName: plan.displayName,
    payerEmail,
    payerName: user.name || undefined,
    externalReference: `SUB_${userId}_${planId}_${Date.now()}`,
    paymentMethodId,
    issuerId,
    token,
    installments,
    amount: finalPrice,
  });

  console.log('🔒 [PROCESS-PAYMENT] Datos sanitizados:', 
    maskSensitivePaymentData(sanitizedData)
  );

  // Crear pago con Mercado Pago
  const payment = await paymentClient.create({
    body: {
      token: sanitizedData.token,
      payment_method_id: sanitizedData.paymentMethodId,
      issuer_id: (sanitizedData.issuerId as unknown) as number | undefined,
      installments: sanitizedData.installments,
      transaction_amount: sanitizedData.amount,
      description: sanitizedData.description,
      payer: {
        email: sanitizedData.payerEmail,
        identification: {
          type: 'RUT',
          number: '11111111-1',
        },
      },
      external_reference: sanitizedData.externalReference,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    },
  });

  console.log('✅ [PROCESS-PAYMENT] Payment created:', {
    id: payment.id,
    status: payment.status,
    statusDetail: payment.status_detail,
  });

  // Si el pago fue aprobado, crear suscripción
  if (payment.status === 'approved') {
    // Calcular días según el período
    let daysToAdd = 30; // Por defecto mensual
    if (plan.billingPeriod === 'SEMIANNUAL') daysToAdd = 180; // 6 meses
    if (plan.billingPeriod === 'ANNUAL') daysToAdd = 365; // 12 meses

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() + daysToAdd * 24 * 60 * 60 * 1000
        ),
      },
    });

    // Crear registro de pago
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        userId: user.id,
        amount: finalPrice.toString(),
        currency: plan.currency,
        status: 'APPROVED',
        mpPaymentId: payment.id?.toString() || '',
        mpStatus: payment.status,
        mpStatusDetail: payment.status_detail,
        description: plan.displayName,
        paidAt: new Date(),
      },
    });

    console.log('✅ [PROCESS-PAYMENT] Subscription created:', subscription.id);
  }

  return NextResponse.json({
    success: true,
    paymentId: payment.id,
    status: payment.status,
    statusDetail: payment.status_detail,
  });
});
