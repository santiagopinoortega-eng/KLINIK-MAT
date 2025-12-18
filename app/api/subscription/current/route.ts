// app/api/subscription/current/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SubscriptionService } from '@/services/subscription.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Obtiene la suscripción actual del usuario
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

    const subscription = await SubscriptionService.getUserSubscription(userId);
    
    return NextResponse.json({
      success: true,
      subscription,
    });

  } catch (error: any) {
    console.error('❌ Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
