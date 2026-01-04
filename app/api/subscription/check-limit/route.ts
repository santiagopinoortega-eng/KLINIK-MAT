import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkCaseAccessLimit } from '@/lib/subscription-limits';

/**
 * GET /api/subscription/check-limit
 * Verifica si el usuario puede acceder a un nuevo caso
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limitCheck = await checkCaseAccessLimit(userId);

    return NextResponse.json({
      allowed: limitCheck.allowed,
      reason: limitCheck.reason,
      usage: limitCheck.usageCount,
      limit: limitCheck.limit,
      planName: limitCheck.planName,
    });
  } catch (error) {
    console.error('[check-limit] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
