// scripts/delete-case.js
// Usage: node scripts/delete-case.js <caseId>
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node scripts/delete-case.js <caseId>');
    process.exit(2);
  }

  try {
    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      console.log('No existe case con id:', id);
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log('Encontrado caso:', existing.id, existing.title);
    // Delete related options and questions (cascade handled in Prisma? but ensure cleanup)
    const questions = await prisma.question.findMany({ where: { caseId: id }, select: { id: true } });
    const qIds = questions.map(q => q.id);
    if (qIds.length) {
      await prisma.option.deleteMany({ where: { questionId: { in: qIds } } });
      await prisma.question.deleteMany({ where: { id: { in: qIds } } });
    }

    // Disconnect norms relation
    await prisma.case.update({ where: { id }, data: { norms: { set: [] } } });

    // Finally delete case
    await prisma.case.delete({ where: { id } });
    console.log('Caso eliminado:', id);
  } catch (e) {
    console.error('Error eliminando caso:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
