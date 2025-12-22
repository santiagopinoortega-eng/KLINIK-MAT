import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldPlanIds = {
    'cmj936qdt0001aezs2eun47ym': 'plan_monthly_v1', // BASIC ($10.000) -> MONTHLY ($4.990)
    'cmj936qwk0002aezsipmc1wgv': 'plan_monthly_v1', // PREMIUM ($20.000) -> MONTHLY ($4.990)
    'cmj936ris0003aezs0v7hzfxz': 'plan_monthly_v1', // BASIC_YEARLY -> MONTHLY
    'cmj936s140004aezsgskqtaot': 'plan_monthly_v1', // PREMIUM_YEARLY -> MONTHLY
    'cmj936sji0005aezsgics3f7v': 'plan_free_v1',    // ENTERPRISE -> FREE
  };

  // Migrar suscripciones antiguas al plan FREE
  for (const [oldId, newId] of Object.entries(oldPlanIds)) {
    const count = await prisma.subscription.updateMany({
      where: { planId: oldId },
      data: { planId: newId }
    });
    
    if (count.count > 0) {
      console.log(`✅ Migradas ${count.count} suscripciones de ${oldId} -> ${newId}`);
    }
  }

  // Ahora eliminar los planes viejos
  const correctPlanIds = [
    'plan_free_v1',
    'plan_monthly_v1',
    'plan_quarterly_v1',
    'plan_biannual_v1'
  ];

  const result = await prisma.subscriptionPlan.deleteMany({
    where: {
      id: { notIn: correctPlanIds }
    }
  });

  console.log(`\n🗑️  Eliminados ${result.count} planes antiguos\n`);

  // Verificar resultado
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: 'asc' }
  });

  console.log(`📋 Planes finales (${plans.length}):\n`);
  plans.forEach(p => {
    console.log(`   ${p.name} - ${p.displayName} - $${p.price} - ${p.billingPeriod}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
