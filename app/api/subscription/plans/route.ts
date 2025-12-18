// app/api/subscription/plans/route.ts
import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Obtiene todos los planes activos
 * GET /api/subscription/plans
 */
export async function GET() {
  try {
    const plans = await SubscriptionService.getActivePlans();
    
    return NextResponse.json({
      success: true,
      plans,
    });

  } catch (error: any) {
    console.error('❌ Error fetching plans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
