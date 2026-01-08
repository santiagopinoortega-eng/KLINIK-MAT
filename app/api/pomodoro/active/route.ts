import { NextResponse, NextRequest } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, type ApiContext } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PomodoroService } from '@/services/pomodoro.service';

/**
 * GET /api/pomodoro/active - Get active Pomodoro session
 */
async function getActiveSession(req: NextRequest, context: ApiContext) {
  const session = await PomodoroService.getActiveSession(context.userId!);

  return NextResponse.json({
    success: true,
    session,
  });
}

export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withLogging
)(getActiveSession);
