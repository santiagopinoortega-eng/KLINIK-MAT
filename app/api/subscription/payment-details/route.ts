// app/api/subscription/payment-details/route.ts
/**
 * API REAL DE PRODUCCIÓN - Obtener Detalles de un Pago
 * 
 * GET /api/subscription/payment-details?payment_id=XXX&collection_id=YYY
 * 
 * Retorna información completa de un pago procesado
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentClient } from '@/lib/mercadopago';

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
        { error: 'payment_id o collection_id es requerido' },
        { status: 400 }
      );
    }

    console.log(`🔍 [PAYMENT-DETAILS] Buscando pago: ${mpPaymentId} para usuario: ${userId}`);

    // Buscar el pago en nuestra DB
    const payment = await prisma.payment.findFirst({
      where: {
        mpPaymentId: mpPaymentId,
        userId: userId,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!payment) {
      console.warn(`⚠️  [PAYMENT-DETAILS] Pago no encontrado en DB, consultando MP directamente`);
      
      // Si no está en DB, consultar directamente en Mercado Pago
      try {
        const mpPayment = await paymentClient.get({ id: mpPaymentId });
        
        // Verificar que el pago pertenece al usuario
        const mpUserId = mpPayment.metadata?.user_id;
        if (mpUserId !== userId) {
          return NextResponse.json(
            { error: 'Pago no encontrado' },
            { status: 404 }
          );
        }

        // Buscar el plan
        const planId = mpPayment.metadata?.plan_id as string;
        const plan = planId ? await prisma.subscriptionPlan.findUnique({
          where: { id: planId }
        }) : null;

        return NextResponse.json({
          success: true,
          payment: {
            id: mpPayment.id,
            amount: mpPayment.transaction_amount || 0,
            currency: mpPayment.currency_id || 'CLP',
            status: mapMPStatus(mpPayment.status || 'pending'),
            mpStatus: mpPayment.status,
            statusDetail: mpPayment.status_detail,
            paymentMethod: mpPayment.payment_method_id,
            paidAt: mpPayment.date_approved || mpPayment.date_created,
            plan: plan ? {
              name: plan.displayName,
              displayName: plan.displayName,
              billingPeriod: plan.billingPeriod,
            } : {
              name: 'Plan Desconocido',
              displayName: 'Plan Desconocido',
              billingPeriod: 'MONTHLY',
            },
            inDatabase: false,
            subscriptionActive: false,
          },
          warning: 'El pago aún no ha sido procesado por el webhook. Puede tardar unos segundos.',
        });

      } catch (mpError: any) {
        console.error('❌ [PAYMENT-DETAILS] Error consultando MP:', mpError);
        return NextResponse.json(
          { error: 'Pago no encontrado' },
          { status: 404 }
        );
      }
    }

    // Pago encontrado en DB
    console.log(`✅ [PAYMENT-DETAILS] Pago encontrado:`, {
      id: payment.id,
      status: payment.status,
      hasSubscription: !!payment.subscription,
    });

    const formatPrice = (amount: string | number, currency: string) => {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: currency === 'CLP' ? 'CLP' : 'USD',
        minimumFractionDigits: 0,
      }).format(num);
    };

    const response: any = {
      success: true,
      payment: {
        id: payment.mpPaymentId,
        paymentId: payment.mpPaymentId,
        amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : Number(payment.amount),
        amountFormatted: formatPrice(Number(payment.amount), payment.currency),
        currency: payment.currency,
        status: payment.status,
        mpStatus: payment.mpStatus,
        statusDetail: payment.mpStatusDetail,
        paymentMethod: payment.paymentMethod || 'unknown',
        description: payment.description,
        externalReference: payment.mpExternalReference,
        paidAt: payment.paidAt?.toISOString(),
        createdAt: payment.createdAt.toISOString(),
        inDatabase: true,
      },
    };

    // Información del plan y suscripción
    if (payment.subscription?.plan) {
      const { plan } = payment.subscription;
      response.payment.plan = {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        billingPeriod: plan.billingPeriod,
        description: plan.description,
      };

      response.payment.subscription = {
        id: payment.subscription.id,
        status: payment.subscription.status,
        currentPeriodStart: payment.subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: payment.subscription.currentPeriodEnd.toISOString(),
        nextBillingDate: payment.subscription.currentPeriodEnd.toISOString(),
        isActive: ['ACTIVE', 'TRIALING'].includes(payment.subscription.status),
      };

      response.payment.subscriptionActive = ['ACTIVE', 'TRIALING'].includes(payment.subscription.status);
    } else {
      // Pago sin suscripción asociada (posiblemente webhook pendiente)
      response.payment.subscriptionActive = false;
      response.warning = 'La suscripción aún no ha sido activada. El proceso puede tardar unos segundos.';
    }

    // Información del usuario
    if (payment.user) {
      response.payment.user = {
        email: payment.user.email,
        name: payment.user.name,
      };
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ [PAYMENT-DETAILS] Error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    return NextResponse.json(
      { 
        error: 'Error al obtener detalles del pago',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Mapea estados de Mercado Pago a nuestros estados
 */
function mapMPStatus(mpStatus: string): 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED' {
  switch (mpStatus) {
    case 'approved':
    case 'authorized':
      return 'APPROVED';
    case 'pending':
    case 'in_process':
    case 'in_mediation':
      return 'PENDING';
    case 'rejected':
      return 'REJECTED';
    case 'cancelled':
      return 'CANCELLED';
    case 'refunded':
    case 'charged_back':
      return 'REFUNDED';
    default:
      return 'PENDING';
  }
}
