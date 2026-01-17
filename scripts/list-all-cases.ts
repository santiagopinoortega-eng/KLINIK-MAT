// scripts/list-all-cases.ts
// Script para listar todos los casos en la base de datos

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Listando todos los casos en la base de datos...\n');

  const casos = await prisma.case.findMany({
    select: {
      id: true,
      title: true,
      area: true,
      modulo: true,
      difficulty: true,
      dificultad: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`📊 Total de casos: ${casos.length}\n`);
  
  casos.forEach((c, idx) => {
    console.log(`${idx + 1}. ID: ${c.id}`);
    console.log(`   Título: ${c.title}`);
    console.log(`   Área: ${c.area || 'N/A'}`);
    console.log(`   Módulo: ${c.modulo || 'N/A'}`);
    console.log(`   Dificultad: ${c.dificultad || c.difficulty}`);
    console.log(`   Creado: ${c.createdAt.toLocaleString()}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
