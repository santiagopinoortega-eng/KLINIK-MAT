import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // Require explicit opt-in AND a secret dev key to run this endpoint.
  if (process.env.ENABLE_NEXTAUTH_DEV !== 'true' || !process.env.NEXTAUTH_DEV_KEY) {
    return NextResponse.json({ ok: false, error: 'dev endpoint disabled' }, { status: 403 });
  }

  const provided = req.headers.get('x-nextauth-dev-key');
  if (!provided || provided !== process.env.NEXTAUTH_DEV_KEY) {
    return NextResponse.json({ ok: false, error: 'invalid dev key' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const email: string = body?.email;
    const callbackUrl = body?.callbackUrl || (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/casos';

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, error: 'missing email' }, { status: 400 });
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, emailVerified: new Date() } });
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });

    const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

    const res = NextResponse.json({ ok: true, redirect: callbackUrl });
    // Set cookie (HttpOnly) for the session token
    res.headers.set('Set-Cookie', `${cookieName}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`);
    return res;
  } catch (e: any) {
    console.error('instant-login error', e);
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
