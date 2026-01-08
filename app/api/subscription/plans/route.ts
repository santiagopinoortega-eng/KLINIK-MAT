// app/api/subscription/plans/route.ts
import { NextResponse } from 'next/server';
import { compose, withRateLimit, withLogging } from '@/lib/middleware/api-middleware';
import { SubscriptionService } from '@/services/subscription.service';
import { RATE_LIMITS } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Obtiene todos los planes activos
 * GET /api/subscription/plans
 */
export const GET = compose(
  withRateLimit(RATE_LIMITS.PUBLIC),
  withLogging
)(async () => {
  const plans = await SubscriptionService.getActivePlans();
  
  return NextResponse.json({
    success: true,
    plans,
  });
});
