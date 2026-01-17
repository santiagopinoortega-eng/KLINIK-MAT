// scripts/clean-old-cases.ts
// Script temporal para limpiar casos antiguos antes del seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Limpiando casos antiguos del módulo 01-control-normal...\n');

  // Eliminar casos que NO están en nuestro archivo actual
  const casosActuales = [
    'tema1-01-ingreso-prenatal-n1',
    'tema1-01-vigilancia-n2',
    'tema1-01-fisiologia-parto-n3'
  ];

  // Buscar todos los casos del módulo
  const casosEnDB = await prisma.case.findMany({
    where: {
      modulo: {
        contains: '1.1 Control Prenatal Normal'
      }
    },
    select: {
      id: true,
      title: true
    }
  });

  console.log(`📊 Casos encontrados en BD: ${casosEnDB.length}`);
  casosEnDB.forEach(c => console.log(`   - ${c.id}: ${c.title}`));
  console.log('');

  // Identificar casos a eliminar (los que NO están en casosActuales)
  const casosAEliminar = casosEnDB.filter(c => !casosActuales.includes(c.id));

  if (casosAEliminar.length === 0) {
    console.log('✅ No hay casos antiguos para eliminar.\n');
    return;
  }

  console.log(`🗑️  Casos a eliminar: ${casosAEliminar.length}`);
  casosAEliminar.forEach(c => console.log(`   ❌ ${c.id}: ${c.title}`));
  console.log('');

  // Eliminar opciones de preguntas de estos casos
  for (const caso of casosAEliminar) {
    const deleted = await prisma.option.deleteMany({
      where: {
        question: {
          caseId: caso.id
        }
      }
    });
    console.log(`   🗑️  Eliminadas ${deleted.count} opciones del caso ${caso.id}`);
  }

  // Eliminar preguntas de estos casos
  for (const caso of casosAEliminar) {
    const deleted = await prisma.question.deleteMany({
      where: {
        caseId: caso.id
      }
    });
    console.log(`   🗑️  Eliminadas ${deleted.count} preguntas del caso ${caso.id}`);
  }

  // Eliminar los casos
  const result = await prisma.case.deleteMany({
    where: {
      id: {
        in: casosAEliminar.map(c => c.id)
      }
    }
  });

  console.log(`\n✅ Eliminados ${result.count} casos antiguos.\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
