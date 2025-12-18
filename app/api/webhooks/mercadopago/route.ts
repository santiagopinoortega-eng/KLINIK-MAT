// app/api/webhooks/mercadopago/route.ts
/**
 * Webhook de Mercado Pago
 * 
 * Recibe notificaciones de:
 * - Pagos (payment)
 * - Suscripciones (subscription_preapproval)
 * - Pagos autorizados de suscripción (subscription_authorized_payment)
 * 
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/your-integrations/notifications/webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  paymentClient,
  preApprovalClient,
  verifyWebhookSignature,
  mapMercadoPagoPaymentStatus,
  mapMercadoPagoSubscriptionStatus,
  WEBHOOK_TOPICS,
  type MercadoPagoWebhookEvent,
} from '@/lib/mercadopago';
import { SubscriptionService } from '@/services/subscription.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Headers de seguridad de Mercado Pago
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    
    // Parsear body
    const body = await req.json() as MercadoPagoWebhookEvent;
    
    console.log('📥 [MP WEBHOOK] Received:', {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
      userId: body.user_id,
    });

    // Guardar evento en DB para auditoría
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        eventType: body.type,
        action: body.action,
        mpId: body.data?.id?.toString(),
        mpUserId: body.user_id?.toString(),
        payload: body as any,
        processed: false,
      },
    });

    // Verificar firma (en producción)
    if (process.env.NODE_ENV === 'production' && xSignature && xRequestId) {
      const isValid = verifyWebhookSignature(
        xSignature,
        xRequestId,
        body.data?.id?.toString()
      );
      
      if (!isValid) {
        console.error('❌ [MP WEBHOOK] Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Procesar según el tipo de evento
    let result;
    
    switch (body.type) {
      case WEBHOOK_TOPICS.PAYMENT:
        result = await processPaymentEvent(body, webhookEvent.id);
        break;
        
      case WEBHOOK_TOPICS.SUBSCRIPTION:
      case WEBHOOK_TOPICS.SUBSCRIPTION_AUTHORIZED_PAYMENT:
        result = await processSubscriptionEvent(body, webhookEvent.id);
        break;
        
      default:
        console.log(`⏭️  [MP WEBHOOK] Skipping event type: ${body.type}`);
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ received: true });
    }

    // Marcar como procesado
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processed: true,
        processedAt: new Date(),
        paymentId: result && 'paymentId' in result ? result.paymentId : null,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [MP WEBHOOK] Processed in ${duration}ms`);

    return NextResponse.json({ received: true, processed: true });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [MP WEBHOOK] Error after ${duration}ms:`, error);
    
    // Intentar guardar el error
    try {
      const body = await req.json();
      await prisma.webhookEvent.create({
        data: {
          eventType: body.type || 'unknown',
          action: body.action || 'unknown',
          mpId: body.data?.id?.toString(),
          payload: body as any,
          processed: false,
          processingError: error.message,
        },
      });
    } catch (saveError) {
      console.error('❌ Failed to save error to DB:', saveError);
    }

    // Retornar 200 para evitar reintentos en errores no recuperables
    return NextResponse.json(
      { error: error.message },
      { status: 200 } // MP reintenta si no es 200
    );
  }
}

/**
 * Procesa eventos de pago
 */
async function processPaymentEvent(
  event: MercadoPagoWebhookEvent,
  webhookEventId: string
) {
  const paymentId = event.data?.id?.toString();
  if (!paymentId) {
    throw new Error('Payment ID not found in event');
  }

  console.log(`💳 [MP WEBHOOK] Processing payment: ${paymentId}`);

  // Obtener datos completos del pago desde MP
  const mpPayment = await paymentClient.get({ id: paymentId });

  // Extraer metadata
  const metadata = mpPayment.metadata;
  const userId = metadata?.user_id as string;
  const planId = metadata?.plan_id as string;
  const couponCode = metadata?.coupon_code as string;
  const discountAmount = metadata?.discount_amount as number;

  if (!userId) {
    throw new Error('User ID not found in payment metadata');
  }

  // Buscar si ya existe el pago
  let payment = await prisma.payment.findUnique({
    where: { mpPaymentId: paymentId },
  });

  const status = mapMercadoPagoPaymentStatus(mpPayment.status!);

  if (payment) {
    // Actualizar pago existente
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        mpStatus: mpPayment.status,
        mpStatusDetail: mpPayment.status_detail,
        paidAt: mpPayment.status === 'approved' ? new Date() : undefined,
      },
    });
  } else {
    // Crear nuevo pago
    payment = await prisma.payment.create({
      data: {
        userId,
        amount: mpPayment.transaction_amount!,
        currency: mpPayment.currency_id!,
        status,
        paymentMethod: mapPaymentMethod(mpPayment.payment_method_id),
        mpPaymentId: paymentId,
        mpStatus: mpPayment.status,
        mpStatusDetail: mpPayment.status_detail,
        mpExternalReference: mpPayment.external_reference,
        description: mpPayment.description,
        paidAt: mpPayment.status === 'approved' ? new Date() : undefined,
      },
    });
  }

  // Si el pago fue aprobado y hay un plan, activar suscripción
  if (status === 'APPROVED' && planId) {
    console.log(`✅ [MP WEBHOOK] Payment approved, activating subscription for user ${userId}`);
    
    await SubscriptionService.activateSubscription(
      userId,
      planId,
      undefined, // mpPreapprovalId (para pagos únicos no aplica)
      paymentId
    );

    // Registrar uso de cupón si existe
    if (couponCode && discountAmount) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon) {
        await prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId,
            discountAmount,
            originalAmount: mpPayment.transaction_amount! + discountAmount,
            finalAmount: mpPayment.transaction_amount!,
          },
        });

        // Incrementar contador de usos
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { redemptionsCount: { increment: 1 } },
        });
      }
    }
  }

  return { paymentId: payment.id };
}

/**
 * Procesa eventos de suscripción
 */
async function processSubscriptionEvent(
  event: MercadoPagoWebhookEvent,
  webhookEventId: string
) {
  const preapprovalId = event.data?.id?.toString();
  if (!preapprovalId) {
    throw new Error('Preapproval ID not found in event');
  }

  console.log(`📋 [MP WEBHOOK] Processing subscription: ${preapprovalId}`);

  // Obtener datos completos de la suscripción desde MP
  const mpPreapproval = await preApprovalClient.get({ id: preapprovalId });

  // Buscar suscripción en DB
  const subscription = await prisma.subscription.findUnique({
    where: { mpPreapprovalId: preapprovalId },
  });

  if (!subscription) {
    console.warn(`⚠️  [MP WEBHOOK] Subscription not found in DB: ${preapprovalId}`);
    return { subscriptionId: null };
  }

  const status = mapMercadoPagoSubscriptionStatus(mpPreapproval.status!);

  // Actualizar suscripción
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status,
      mpStatus: mpPreapproval.status,
      mpLastPaymentDate: mpPreapproval.last_modified ? new Date(mpPreapproval.last_modified) : undefined,
    },
  });

  console.log(`✅ [MP WEBHOOK] Subscription updated: ${subscription.id} -> ${status}`);

  return { subscriptionId: subscription.id };
}

/**
 * Mapea método de pago de MP a enum de Prisma
 */
function mapPaymentMethod(mpMethod: string | undefined): 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'DIGITAL_WALLET' | 'OTHER' | undefined {
  if (!mpMethod) return undefined;

  if (mpMethod.includes('credit')) return 'CREDIT_CARD';
  if (mpMethod.includes('debit')) return 'DEBIT_CARD';
  if (mpMethod.includes('bank')) return 'BANK_TRANSFER';
  if (mpMethod.includes('cash') || mpMethod.includes('efectivo')) return 'CASH';
  if (mpMethod.includes('wallet') || mpMethod.includes('account_money')) return 'DIGITAL_WALLET';
  
  return 'OTHER';
}

// Endpoint GET para verificar que el webhook está activo
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'mercadopago-webhook',
    timestamp: new Date().toISOString(),
  });
}
