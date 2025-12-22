// app/api/subscription/payment-status/route.ts
/**
 * API para verificar estado de un pago en Mercado Pago
 * 
 * GET /api/subscription/payment-status?payment_id=XXX
 * 
 * Retorna el estado actual del pago desde Mercado Pago directamente
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { paymentClient } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('payment_id');
    const collectionId = searchParams.get('collection_id');

    const mpPaymentId = paymentId || collectionId;

    if (!mpPaymentId) {
      return NextResponse.json(
        { error: 'payment_id o collection_id requerido' },
        { status: 400 }
      );
    }

    console.log(`🔍 [PAYMENT-STATUS] Checking payment: ${mpPaymentId}`);

    // Obtener pago desde Mercado Pago
    const mpPayment = await paymentClient.get({ id: mpPaymentId });

    // Buscar en nuestra DB
    const dbPayment = await prisma.payment.findUnique({
      where: { mpPaymentId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    // Si no existe en DB, puede ser que el webhook no haya llegado aún
    if (!dbPayment && mpPayment.status === 'approved') {
      console.warn(`⚠️  [PAYMENT-STATUS] Payment approved but not in DB yet: ${mpPaymentId}`);
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: mpPayment.id,
        status: mpPayment.status,
        statusDetail: mpPayment.status_detail,
        amount: mpPayment.transaction_amount,
        currency: mpPayment.currency_id,
        paymentMethod: mpPayment.payment_method_id,
        dateCreated: mpPayment.date_created,
        dateApproved: mpPayment.date_approved,
        dbStatus: dbPayment?.status || 'PENDING',
        subscriptionActive: dbPayment?.subscription?.status === 'ACTIVE',
        plan: dbPayment?.subscription?.plan ? {
          name: dbPayment.subscription.plan.displayName,
          billingPeriod: dbPayment.subscription.plan.billingPeriod,
        } : null,
      },
    });

  } catch (error: any) {
    console.error('❌ [PAYMENT-STATUS] Error:', error);
    return NextResponse.json(
      { 
        error: 'Error al verificar estado del pago',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
