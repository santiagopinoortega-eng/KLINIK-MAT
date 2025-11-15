/* Dev helper moved from app/api - send-magic-link
   Usage: node scripts/dev_helpers/send-magic-link.js --email=you@example.com
*/
const { prisma } = require('../../lib/prisma');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { getEmailServer } = require('../../auth.config');

async function run() {
  const email = process.argv.find(a => a.startsWith('--email='))?.split('=')[1];
  if (!email) {
    console.error('Usage: node send-magic-link.js --email=you@example.com');
    process.exit(1);
  }
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.verificationToken.create({ data: { identifier: email, token: tokenHash, expires } });
  const callbackBase = process.env.NEXTAUTH_URL || `http://localhost:3000`;
  const callbackUrl = `${callbackBase}/api/auth/callback/email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  try {
    const transporter = nodemailer.createTransport(getEmailServer());
    await transporter.sendMail({ to: email, from: process.env.EMAIL_FROM, subject: 'Magic link (dev)', text: `Link: ${callbackUrl}`, html: `<a href="${callbackUrl}">${callbackUrl}</a>` });
    console.log('Sent preview link:', callbackUrl);
  } catch (e) {
    console.error('Send mail failed:', e?.message || e);
    console.log('Link (fallback):', callbackUrl);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
