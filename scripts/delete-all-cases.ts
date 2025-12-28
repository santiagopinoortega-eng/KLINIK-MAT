// scripts/delete-all-cases.ts
// Script para eliminar TODOS los casos clínicos de la base de datos

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllCases() {
  console.log('🗑️  Eliminando todos los casos clínicos de la base de datos...\n');

  try {
    // Eliminar en orden (por foreign keys)
    const deletedOptions = await prisma.option.deleteMany({});
    console.log(`✅ Eliminadas ${deletedOptions.count} opciones`);

    const deletedQuestionImages = await prisma.questionImage.deleteMany({});
    console.log(`✅ Eliminadas ${deletedQuestionImages.count} imágenes de preguntas`);

    const deletedQuestions = await prisma.question.deleteMany({});
    console.log(`✅ Eliminadas ${deletedQuestions.count} preguntas`);

    const deletedCaseImages = await prisma.caseImage.deleteMany({});
    console.log(`✅ Eliminadas ${deletedCaseImages.count} imágenes de casos`);

    const deletedResults = await prisma.studentResult.deleteMany({});
    console.log(`✅ Eliminados ${deletedResults.count} resultados de estudiantes`);

    const deletedFavorites = await prisma.favorite.deleteMany({});
    console.log(`✅ Eliminados ${deletedFavorites.count} favoritos`);

    const deletedEngagement = await prisma.engagementMetric.deleteMany({});
    console.log(`✅ Eliminadas ${deletedEngagement.count} métricas de engagement`);

    // Eliminar relaciones many-to-many (si existen)
    await prisma.$executeRaw`DELETE FROM "_CaseNorms"`;
    console.log(`✅ Eliminadas relaciones Case-Norms`);

    // Finalmente eliminar los casos
    const deletedCases = await prisma.case.deleteMany({});
    console.log(`✅ Eliminados ${deletedCases.count} casos clínicos`);

    console.log('\n✨ Base de datos limpiada exitosamente. Lista para nueva estructura.');
  } catch (error) {
    console.error('❌ Error eliminando casos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllCases()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
