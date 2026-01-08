import { NextResponse } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging } from '@/lib/middleware/api-middleware';
import { canAccessNewCase, getUserUsageStats } from '@/lib/subscription';
import { RATE_LIMITS } from '@/lib/ratelimit';

export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withLogging
)(async (req, context) => {
  const userId = context.userId!;

  // Obtener acceso y estadísticas en paralelo
  const [accessInfo, usageStats] = await Promise.all([
    canAccessNewCase(userId),
    getUserUsageStats(userId)
  ]);

  return NextResponse.json({
    success: true,
    canAccess: accessInfo.canAccess,
    ...usageStats,
  });
});
