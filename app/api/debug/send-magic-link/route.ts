import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getEmailServer } from '@/auth.config';

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
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, error: 'missing email' }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15min

    // store hashed token (SHA-256) for security
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.verificationToken.create({ data: { identifier: email, token: tokenHash, expires } });

    const callbackBase = process.env.NEXTAUTH_URL || `http://localhost:3000`;
    const callbackUrl = `${callbackBase}/api/auth/callback/email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL || callbackBase + '/casos'))}`;

    // send email (best-effort)
    try {
      const transporter = nodemailer.createTransport(getEmailServer() as any);
      await transporter.sendMail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `Magic link - KlinicMat (dev)` ,
        text: `Usa este enlace para acceder: ${callbackUrl}`,
        html: `<p>Usa este enlace para acceder: <a href="${callbackUrl}">${callbackUrl}</a></p>`,
      });
    } catch (e: any) {
      console.debug('debug: send email failed', e?.message);
    }

    console.debug('[debug] send-magic-link created token', { email, token, callbackUrl });

    return NextResponse.json({ ok: true, token, callbackUrl });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
