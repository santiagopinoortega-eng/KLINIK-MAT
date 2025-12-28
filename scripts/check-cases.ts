// scripts/check-cases.ts
// Verificar casos en la base de datos

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCases() {
  console.log('🔍 Verificando casos en la base de datos...\n');

  const cases = await prisma.case.findMany({
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });

  console.log(`📊 Total de casos: ${cases.length}\n`);

  if (cases.length === 0) {
    console.log('❌ No hay casos en la base de datos.');
    return;
  }

  for (const caso of cases) {
    console.log(`📋 ${caso.title}`);
    console.log(`   🆔 ID: ${caso.id}`);
    console.log(`   📚 Área: ${caso.area}`);
    console.log(`   🎯 Dificultad: ${caso.dificultad} (${caso.difficulty})`);
    console.log(`   🔓 Público: ${caso.isPublic}`);
    console.log(`   📝 Preguntas: ${caso.questions.length}`);
    
    let mcqCount = 0;
    let shortCount = 0;
    let totalOptions = 0;
    
    for (const q of caso.questions) {
      if (q.tipo === 'mcq') mcqCount++;
      if (q.tipo === 'short') shortCount++;
      totalOptions += q.options.length;
    }
    
    console.log(`      - ${mcqCount} MCQ (${totalOptions} opciones)`);
    console.log(`      - ${shortCount} SHORT`);
    console.log('');
  }

  await prisma.$disconnect();
}

checkCases().catch(console.error);
