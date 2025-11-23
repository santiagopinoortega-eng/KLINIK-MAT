import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando caso duplicado de migraña...');
  
  // Buscar el caso por título (el del seed viejo)
  const oldCase = await prisma.case.findFirst({
    where: {
      title: 'Anticoncepción en paciente con migraña con aura',
      // El del seed viejo no tiene 'id' personalizado, viene con cuid
      id: { not: 'ac-media-migrana-aura' }
    },
    include: { questions: true }
  });

  if (oldCase) {
    console.log('🗑️  Caso duplicado encontrado:', {
      id: oldCase.id,
      title: oldCase.title,
      questions: oldCase.questions.length
    });
    
    // Eliminar opciones primero
    for (const question of oldCase.questions) {
      await prisma.option.deleteMany({
        where: { questionId: question.id }
      });
    }
    
    // Eliminar preguntas
    await prisma.question.deleteMany({
      where: { caseId: oldCase.id }
    });
    
    // Eliminar el caso
    await prisma.case.delete({
      where: { id: oldCase.id }
    });
    
    console.log('✅ Caso duplicado eliminado exitosamente');
  } else {
    console.log('ℹ️  No se encontró el caso duplicado (puede que ya esté eliminado)');
  }
  
  // Contar casos totales
  const totalCases = await prisma.case.count();
  console.log(`📊 Total de casos en la BD: ${totalCases}`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
