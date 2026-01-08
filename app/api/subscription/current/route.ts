// app/api/subscription/current/route.ts
import { NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { compose, withAuth, withRateLimit, withLogging } from '@/lib/middleware/api-middleware';
import { getUserSubscription, getUserPaymentHistory } from '@/lib/subscription';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Obtiene la suscripción actual del usuario con historial de pagos
 * GET /api/subscription/current
 */
export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;

  // Obtener suscripción activa y historial en paralelo
  const [subscription, paymentHistory] = await Promise.all([
    getUserSubscription(userId),
    getUserPaymentHistory(userId)
  ]);

  // Formatear historial de pagos
  const formattedHistory = paymentHistory.map(payment => ({
    id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    description: payment.description,
    paidAt: payment.paidAt,
    planName: payment.subscription?.plan.displayName,
  }));

  // Si no tiene suscripción
  if (!subscription) {
    return NextResponse.json({
      success: true,
      hasSubscription: false,
      subscription: null,
      paymentHistory: formattedHistory,
    });
  }

  // Calcular días restantes
  const daysRemaining = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return NextResponse.json({
    success: true,
    hasSubscription: true,
    subscription: {
      id: subscription.id,
      planId: subscription.planId,
      planName: subscription.plan.displayName,
      planType: subscription.plan.name,
      price: subscription.plan.price,
      billingPeriod: subscription.plan.billingPeriod,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      daysRemaining,
      features: {
        hasAI: subscription.plan.hasAI,
        hasAdvancedStats: subscription.plan.hasAdvancedStats,
        hasPrioritySupport: subscription.plan.hasPrioritySupport,
        maxCasesPerMonth: subscription.plan.maxCasesPerMonth,
      },
    },
    paymentHistory: formattedHistory,
  });
});
