import { NextResponse, NextRequest } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, withValidation, withQueryValidation, type ApiContext } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PomodoroService } from '@/services/pomodoro.service';
import { z } from 'zod';

// Validation schemas
const startPomodoroSchema = z.object({
  type: z.enum(['WORK', 'SHORT_BREAK', 'LONG_BREAK']).default('WORK'),
  duration: z.number().min(1).max(120).default(25),
  caseId: z.string().optional(),
  caseTitle: z.string().optional(),
  notes: z.string().optional(),
});

const historyQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
});

/**
 * POST /api/pomodoro - Start a new Pomodoro session
 */
async function startPomodoro(req: NextRequest, context: ApiContext) {
  const session = await PomodoroService.startSession({
    userId: context.userId!,
    ...context.body,
  });

  return NextResponse.json({
    success: true,
    session,
  });
}

/**
 * GET /api/pomodoro - Get user's Pomodoro history
 */
async function getPomodoroHistory(req: NextRequest, context: ApiContext) {
  const page = parseInt(context.query?.page || '1');
  const limit = parseInt(context.query?.limit || '10');

  const result = await PomodoroService.getSessionHistory(context.userId!, page, limit);

  return NextResponse.json({
    success: true,
    ...result,
  });
}

// Export with middleware
export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withValidation(startPomodoroSchema),
  withLogging
)(startPomodoro);

export const GET = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withQueryValidation(historyQuerySchema),
  withLogging
)(getPomodoroHistory);

