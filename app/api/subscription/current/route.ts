// app/api/subscription/current/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, getUserPaymentHistory } from '@/lib/subscription';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Obtiene la suscripción actual del usuario con historial de pagos
 * GET /api/subscription/current
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener suscripción activa
    const subscription = await getUserSubscription(userId);

    // Obtener historial de pagos
    const paymentHistory = await getUserPaymentHistory(userId);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        hasSubscription: false,
        subscription: null,
        paymentHistory: paymentHistory.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          description: payment.description,
          paidAt: payment.paidAt,
          planName: payment.subscription?.plan.displayName,
        })),
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
      paymentHistory: paymentHistory.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        paidAt: payment.paidAt,
        planName: payment.subscription?.plan.displayName,
      })),
    });

  } catch (error: any) {
    console.error('❌ Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
