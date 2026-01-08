// app/api/cases/[id]/route.ts
import { NextResponse } from 'next/server';
import { compose, withRateLimit, withLogging } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { prismaRO } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors/app-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const GET = compose(
  withRateLimit(RATE_LIMITS.PUBLIC),
  withLogging
)(async (req, context, params: { id: string }) => {
  const caseData = await prismaRO.case.findUnique({
    where: { id: params.id },
  });

  if (!caseData) {
    throw new NotFoundError('Case');
  }

  return NextResponse.json(
    {
      success: true,
      data: caseData,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
});