/* Dev helper moved from app/api - complete-magic
   Usage: node scripts/dev_helpers/complete-magic.js --email=you@example.com --token=PLAINTOKEN
*/
const { prisma } = require('../../lib/prisma');
const crypto = require('crypto');

async function run() {
  const email = process.argv.find(a => a.startsWith('--email='))?.split('=')[1];
  const token = process.argv.find(a => a.startsWith('--token='))?.split('=')[1];
  if (!email || !token) {
    console.error('Usage: node complete-magic.js --email=you@example.com --token=PLAINTOKEN');
    process.exit(1);
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const vt = await prisma.verificationToken.findFirst({ where: { identifier: email, token: tokenHash } });
  if (!vt) {
    console.error('No matching token');
    process.exit(2);
  }
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) user = await prisma.user.create({ data: { email, emailVerified: new Date() } });
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });
  console.log('Session created, token:', sessionToken);
}

run().catch(e => { console.error(e); process.exit(1); });
