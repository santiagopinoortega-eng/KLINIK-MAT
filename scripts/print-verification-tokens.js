#!/usr/bin/env node
/* prints verification_tokens from the database for debugging */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const toks = await p.verificationToken.findMany({ orderBy: { expires: 'asc' } });
  console.log(JSON.stringify(toks, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
