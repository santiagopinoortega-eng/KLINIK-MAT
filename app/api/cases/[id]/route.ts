// app/api/cases/[id]/route.ts
import { prismaRO } from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request, ctx: { params: { id: string } }) {
  try {
    // Rate limiting - límite generoso para lectura pública
    const rateLimit = checkRateLimit(req, RATE_LIMITS.PUBLIC);
    if (!rateLimit.ok) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const c = await prismaRO.case.findUnique({
      where: { id: ctx.params.id },
    });
    if (!c) {
      return new Response(JSON.stringify({ ok: false, error: 'not_found' }), {
        status: 404,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }
    return new Response(JSON.stringify({ ok: true, data: c }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'X-RateLimit-Limit': RATE_LIMITS.PUBLIC.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}