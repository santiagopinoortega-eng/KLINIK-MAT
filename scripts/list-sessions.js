#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const sessions = await p.session.findMany();
  console.log(JSON.stringify(sessions, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
