import { NextResponse, NextRequest } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, type ApiContext } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PomodoroService } from '@/services/pomodoro.service';

/**
 * GET /api/pomodoro/stats - Get user's Pomodoro statistics
 */
async function getPomodoroStats(req: NextRequest, context: ApiContext) {
  const stats = await PomodoroService.getUserStats(context.userId!);

  return NextResponse.json({
    success: true,
    stats,
  });
}

export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withLogging
)(getPomodoroStats);
