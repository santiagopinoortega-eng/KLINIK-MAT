/* Dev helper (moved from app/api) - run with node scripts/dev_helpers/instant-login.js --email=dev@local.test
   Requires environment variables and project DB access (same as server).
*/
const { prisma } = require('../../lib/prisma');
const crypto = require('crypto');

async function run() {
  const email = process.argv.find(a => a.startsWith('--email='))?.split('=')[1];
  if (!email) {
    console.error('Usage: node instant-login.js --email=you@example.com');
    process.exit(1);
  }
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, emailVerified: new Date() } });
  }
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });
  console.log('Created sessionToken:', sessionToken);
}

run().catch(e => { console.error(e); process.exit(1); });
