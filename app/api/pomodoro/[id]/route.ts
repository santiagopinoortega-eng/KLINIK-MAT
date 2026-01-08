import { NextResponse, NextRequest } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, withValidation, type ApiContext } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PomodoroService } from '@/services/pomodoro.service';
import { z } from 'zod';

// Validation schema for updating session
const updatePomodoroSchema = z.object({
  timeRemaining: z.number().min(0),
  timeSpent: z.number().min(0),
  status: z.enum(['ACTIVE', 'PAUSED']).optional(),
});

/**
 * PATCH /api/pomodoro/:id - Update Pomodoro session (sync time)
 */
async function updatePomodoro(req: NextRequest, context: ApiContext) {
  const session = await PomodoroService.updateSession(
    context.params?.id,
    context.body
  );

  return NextResponse.json({
    success: true,
    session,
  });
}

/**
 * DELETE /api/pomodoro/:id - Delete Pomodoro session
 */
async function deletePomodoro(req: NextRequest, context: ApiContext) {
  await PomodoroService.cancelSession(context.params?.id, context.userId!);

  return NextResponse.json({
    success: true,
    message: 'Session cancelled successfully',
  });
}

export const PATCH = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withValidation(updatePomodoroSchema),
  withLogging
)(updatePomodoro);

export const DELETE = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withLogging
)(deletePomodoro);
