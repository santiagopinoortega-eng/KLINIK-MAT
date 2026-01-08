import { NextResponse, NextRequest } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, type ApiContext } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PomodoroService } from '@/services/pomodoro.service';

/**
 * POST /api/pomodoro/:id/resume - Resume paused Pomodoro session
 */
async function resumePomodoro(req: NextRequest, context: ApiContext) {
  const session = await PomodoroService.resumeSession(
    context.params?.id,
    context.userId!
  );

  return NextResponse.json({
    success: true,
    session,
  });
}

export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withLogging
)(resumePomodoro);
