// scripts/find-duplicates.js
// Usage: node scripts/find-duplicates.js "Exact Case Title"
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const title = process.argv[2];
  if (!title) {
    console.error('Usage: node scripts/find-duplicates.js "Exact Case Title"');
    process.exit(2);
  }

  const rows = await prisma.case.findMany({
    where: { title },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, vignette: true, createdAt: true, updatedAt: true }
  });

  if (rows.length === 0) {
    console.log('No se encontraron casos con ese título.');
  } else {
    console.log(`Encontrados ${rows.length} caso(s) con título exacto: "${title}"`);
    rows.forEach((r, i) => {
      console.log('---');
      console.log(`index: ${i}`);
      console.log(`id: ${r.id}`);
      console.log(`createdAt: ${r.createdAt.toISOString()}`);
      console.log(`updatedAt: ${r.updatedAt ? r.updatedAt.toISOString() : 'N/A'}`);
      console.log(`vignette (trunc): ${String(r.vignette || '').slice(0,200).replace(/\n/g,' ')}${(r.vignette||'').length>200?'...':''}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); process.exit(1)});
