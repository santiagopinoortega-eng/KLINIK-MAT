// app/api/subscription/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SubscriptionService } from '@/services/subscription.service';

export const runtime = 'nodejs';

/**
 * Crea una preferencia de pago en Mercado Pago
 * POST /api/subscription/create-payment
 * Body: { planId: string, couponCode?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planId, couponCode } = body;

    console.log('🔍 [CREATE-PAYMENT] Request data:', { userId, planId, couponCode });

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Crear preferencia de pago en Mercado Pago
    const paymentData = await SubscriptionService.createSubscriptionPayment(
      userId,
      planId,
      couponCode
    );
    
    console.log('✅ [CREATE-PAYMENT] Payment created successfully:', paymentData.preferenceId);

    return NextResponse.json({
      success: true,
      initPoint: paymentData.initPoint,
      preferenceId: paymentData.preferenceId,
      externalReference: paymentData.externalReference,
    });

  } catch (error: any) {
    console.error('❌ Error creating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
