import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Planes correctos que deben permanecer activos
  const correctPlanIds = [
    'plan_free_v1',        // FREE - $0
    'plan_monthly_v1',     // MONTHLY - $4.990
    'plan_quarterly_v1',   // QUARTERLY - $11.490
    'plan_biannual_v1'     // BIANNUAL - $16.490
  ];

  // Desactivar todos los planes que NO están en la lista correcta
  const result = await prisma.subscriptionPlan.updateMany({
    where: {
      id: {
        notIn: correctPlanIds
      }
    },
    data: {
      isActive: false
    }
  });

  console.log(`\n✅ Se desactivaron ${result.count} planes antiguos\n`);

  // Mostrar planes activos
  const activePlans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });

  console.log(`📋 Planes activos (${activePlans.length}):\n`);
  activePlans.forEach(p => {
    console.log(`✅ ${p.name} - ${p.displayName} - $${p.price} - ${p.billingPeriod}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
