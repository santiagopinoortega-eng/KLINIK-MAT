import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { paymentClient } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, token, paymentMethodId, issuerId, installments } = body;

    if (!planId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    // En TEST, usar email del comprador de prueba MP
    const isTestMode = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
    const payerEmail = isTestMode ? 'TESTUSER503198759396796542@testuser.com' : user.email;

    // Crear pago con Mercado Pago
    const payment = await paymentClient.create({
      body: {
        token,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId,
        installments: installments || 1,
        transaction_amount: finalPrice,
        description: plan.displayName,
        payer: {
          email: payerEmail,
        },
        external_reference: `SUB_${userId}_${planId}_${Date.now()}`,
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
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() +
              (plan.billingPeriod === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000
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
  } catch (error: any) {
    console.error('❌ [PROCESS-PAYMENT] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing payment' },
      { status: 500 }
    );
  }
}
