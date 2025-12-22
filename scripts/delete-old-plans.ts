import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Planes correctos que deben permanecer
  const correctPlanIds = [
    'plan_free_v1',        // FREE - $0
    'plan_monthly_v1',     // MONTHLY - $4.990
    'plan_quarterly_v1',   // QUARTERLY - $11.490
    'plan_biannual_v1'     // BIANNUAL - $16.490
  ];

  // Primero verificar si hay suscripciones con estos planes
  const subscriptionsWithOldPlans = await prisma.subscription.findMany({
    where: {
      planId: {
        notIn: correctPlanIds
      }
    },
    select: {
      id: true,
      planId: true,
      status: true
    }
  });

  if (subscriptionsWithOldPlans.length > 0) {
    console.log(`\n⚠️  ADVERTENCIA: Hay ${subscriptionsWithOldPlans.length} suscripciones usando planes antiguos:`);
    subscriptionsWithOldPlans.forEach(s => {
      console.log(`   - Suscripción ${s.id}: Plan ${s.planId} (${s.status})`);
    });
    console.log('\n❌ No se pueden eliminar los planes. Actualiza o elimina estas suscripciones primero.\n');
    await prisma.$disconnect();
    return;
  }

  // Si no hay suscripciones, proceder a eliminar
  const plansToDelete = await prisma.subscriptionPlan.findMany({
    where: {
      id: {
        notIn: correctPlanIds
      }
    },
    select: {
      id: true,
      name: true,
      displayName: true
    }
  });

  console.log(`\n🗑️  Eliminando ${plansToDelete.length} planes antiguos:\n`);
  plansToDelete.forEach(p => {
    console.log(`   - ${p.name} (${p.displayName})`);
  });

  const result = await prisma.subscriptionPlan.deleteMany({
    where: {
      id: {
        notIn: correctPlanIds
      }
    }
  });

  console.log(`\n✅ Se eliminaron permanentemente ${result.count} planes\n`);

  // Mostrar planes restantes
  const remainingPlans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: 'asc' }
  });

  console.log(`📋 Planes en la base de datos (${remainingPlans.length}):\n`);
  remainingPlans.forEach(p => {
    console.log(`   ${p.name} - ${p.displayName} - $${p.price} - ${p.billingPeriod}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
