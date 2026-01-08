import { NextResponse, NextRequest } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, withValidation, type ApiContext } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PomodoroService } from '@/services/pomodoro.service';
import { z } from 'zod';

const pauseSchema = z.object({
  timeRemaining: z.number().min(0),
  timeSpent: z.number().min(0),
});

/**
 * POST /api/pomodoro/:id/pause - Pause active Pomodoro session
 */
async function pausePomodoro(req: NextRequest, context: ApiContext) {
  const session = await PomodoroService.pauseSession(
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
  withValidation(pauseSchema),
  withLogging
)(pausePomodoro);
