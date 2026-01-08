// app/api/subscription/cancel/route.ts
/**
 * Endpoint para cancelar y reactivar suscripciones
 * Arquitectura: DTOs + Middleware composable + Error handling
 */

import { NextResponse } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, withValidation, withQueryValidation } from '@/lib/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { NotFoundError } from '@/lib/errors/app-errors';
import { CancelSubscriptionDto, ReactivateSubscriptionQueryDto } from '@/lib/dtos/subscription.dto';

/**
 * POST /api/subscription/cancel
 * Cancelar suscripción activa (al final del período)
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withRateLimit - Protección contra spam
 * @middleware withValidation - Valida body con CancelSubscriptionDto
 * @middleware withLogging - Log de requests/responses
 */
export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withValidation(CancelSubscriptionDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const { subscriptionId, reason } = context.body;

  // Verificar que la suscripción pertenece al usuario
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId: userId,
      status: 'ACTIVE',
    },
  });

  if (!subscription) {
    throw new NotFoundError('Subscription or already cancelled');
  }

  // Marcar para cancelar al final del período
  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
      cancelReason: reason || null,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Subscription will be cancelled at the end of the billing period',
    subscription: {
      id: updatedSubscription.id,
      cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      currentPeriodEnd: updatedSubscription.currentPeriodEnd,
    },
  });
});

/**
 * DELETE /api/subscription/cancel?subscription_id=xxx
 * Reactivar suscripción cancelada
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withRateLimit - Protección contra spam
 * @middleware withQueryValidation - Valida query con ReactivateSubscriptionQueryDto
 * @middleware withLogging - Log de requests/responses
 */
export const DELETE = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withQueryValidation(ReactivateSubscriptionQueryDto),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;
  const { subscription_id: subscriptionId } = context.query;

  // Verificar que la suscripción pertenece al usuario
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId: userId,
      cancelAtPeriodEnd: true,
    },
  });

  if (!subscription) {
    throw new NotFoundError('Subscription not marked for cancellation');
  }

  // Reactivar suscripción
  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      cancelAtPeriodEnd: false,
      canceledAt: null,
      cancelReason: null,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Subscription reactivated successfully',
    subscription: {
      id: updatedSubscription.id,
      cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
    },
  });
});
