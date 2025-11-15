import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const runtime = 'nodejs';

function matchesToken(dbToken: string, incoming: string) {
  if (!dbToken || !incoming) return false;
  if (dbToken === incoming) return true;
  try {
    const hashedDb = crypto.createHash('sha256').update(dbToken).digest('hex');
    if (hashedDb === incoming) return true;
  } catch (e) {}
  try {
    const hashedIncoming = crypto.createHash('sha256').update(incoming).digest('hex');
    if (hashedIncoming === dbToken) return true;
  } catch (e) {}
  try {
    const asBase64 = Buffer.from(dbToken, 'hex').toString('base64');
    if (asBase64 === incoming) return true;
  } catch (e) {}
  try {
    const incomingHex = Buffer.from(incoming, 'base64').toString('hex');
    if (incomingHex === dbToken) return true;
  } catch (e) {}
  return false;
}

export async function GET(req: Request) {
  // Require explicit opt-in AND a secret dev key to run this endpoint.
  if (process.env.ENABLE_NEXTAUTH_DEV !== 'true' || !process.env.NEXTAUTH_DEV_KEY) {
    return NextResponse.json({ ok: false, error: 'dev endpoint disabled' }, { status: 403 });
  }
  const provided = req.headers.get('x-nextauth-dev-key');
  if (!provided || provided !== process.env.NEXTAUTH_DEV_KEY) {
    return NextResponse.json({ ok: false, error: 'invalid dev key' }, { status: 403 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');
  const callbackUrl = url.searchParams.get('callbackUrl') || '/';

  if (!token || !email) {
    return NextResponse.json({ ok: false, error: 'missing token or email' }, { status: 400 });
  }

  // Verify by hashing incoming token (adapter expects SHA-256 in DB)
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const matched = await prisma.verificationToken.findFirst({ where: { identifier: email, token: tokenHash } });

  if (!matched) {
    return NextResponse.redirect(new URL('/login/error?error=Verification', url.origin));
  }

  // delete matched token(s)
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  // Ensure user exists
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, emailVerified: new Date() } });
  }

  // create session
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const session = await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });

  // set cookie name consistent with auth.config (dev)
  const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

  const res = NextResponse.redirect(callbackUrl);
  res.headers.set('Set-Cookie', `${cookieName}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`);

  return res;
}
