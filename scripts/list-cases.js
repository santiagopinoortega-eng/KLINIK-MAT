// scripts/list-cases.js
// Lista los últimos 25 casos usando .env.local (dotenv)
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

(async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.case.count();
    console.log('count =', count);
    const rows = await prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: { id: true, title: true, area: true, difficulty: true, createdAt: true }
    });
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('Error listando casos:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
