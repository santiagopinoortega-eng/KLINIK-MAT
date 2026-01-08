import { NextResponse, NextRequest } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, type ApiContext } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PomodoroService } from '@/services/pomodoro.service';

/**
 * GET /api/pomodoro/stats/weekly - Get weekly Pomodoro statistics
 */
async function getWeeklyStats(req: NextRequest, context: ApiContext) {
  const stats = await PomodoroService.getWeeklyStats(context.userId!);

  return NextResponse.json({
    success: true,
    stats,
  });
}

export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withLogging
)(getWeeklyStats);
