import { NextResponse } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging } from '@/lib/middleware/api-middleware';
import { checkCaseAccessLimit } from '@/lib/subscription-limits';
import { RATE_LIMITS } from '@/lib/ratelimit';

/**
 * GET /api/subscription/check-limit
 * Verifica si el usuario puede acceder a un nuevo caso
 */
export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;

  const limitCheck = await checkCaseAccessLimit(userId);

  return NextResponse.json({
    success: true,
    allowed: limitCheck.allowed,
    reason: limitCheck.reason,
    usage: limitCheck.usageCount,
    limit: limitCheck.limit,
    planName: limitCheck.planName,
  });
});
