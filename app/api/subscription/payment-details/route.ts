import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Buscar el pago por mpPaymentId
    const payment = await prisma.payment.findFirst({
      where: {
        mpPaymentId: paymentId,
        userId: userId,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!payment || !payment.subscription) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const { subscription } = payment;
    const { plan } = subscription;

    return NextResponse.json({
      success: true,
      payment: {
        paymentId: payment.mpPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
        planName: plan.displayName,
        planId: plan.id,
        billingPeriod: plan.billingPeriod,
        nextBillingDate: subscription.currentPeriodEnd,
        subscriptionId: subscription.id,
      },
    });
  } catch (error: any) {
    console.error('❌ [PAYMENT-DETAILS] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching payment details' },
      { status: 500 }
    );
  }
}
