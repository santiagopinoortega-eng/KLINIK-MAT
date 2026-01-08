import { NextResponse, NextRequest } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, withValidation, type ApiContext } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PomodoroService } from '@/services/pomodoro.service';
import { z } from 'zod';

const completeSchema = z.object({
  timeSpent: z.number().min(0),
  notes: z.string().optional(),
});

/**
 * POST /api/pomodoro/:id/complete - Complete active Pomodoro session
 */
async function completePomodoro(req: NextRequest, context: ApiContext) {
  const session = await PomodoroService.completeSession(
    context.params?.id,
    context.userId!,
    context.body?.timeSpent,
    context.body?.notes
  );

  return NextResponse.json({
    success: true,
    session,
  });
}

export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withValidation(completeSchema),
  withLogging
)(completePomodoro);
