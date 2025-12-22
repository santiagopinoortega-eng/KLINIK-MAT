// scripts/seed-subscription-plans.ts
/**
 * Script para crear planes de suscripción en la base de datos
 * Precios reales de producción
 */

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Creando planes de suscripción...\n');

  // Limpiar planes existentes
  await prisma.subscriptionPlan.deleteMany({
    where: {
      name: { in: ['FREE', 'MONTHLY', 'QUARTERLY', 'BIANNUAL'] }
    }
  });

  // Plan FREE
  const planFree = await prisma.subscriptionPlan.create({
    data: {
      id: 'plan_free_v1',
      name: 'FREE',
      displayName: 'Plan Gratuito',
      description: 'Perfecto para empezar a estudiar',
      price: 0,
      currency: 'CLP',
      billingPeriod: 'MONTHLY',
      features: {
        unlimited_access: false,
        ai_feedback: false,
        advanced_stats: false,
        priority_support: false,
      },
      maxCasesPerMonth: 15,
      hasAI: false,
      hasAdvancedStats: false,
      hasPrioritySupport: false,
      trialDays: 0,
      isActive: true,
    },
  });
  console.log('✅ Plan FREE creado:', planFree.displayName);

  // Plan MENSUAL - $4.990
  const planMonthly = await prisma.subscriptionPlan.create({
    data: {
      id: 'plan_monthly_v1',
      name: 'MONTHLY',
      displayName: 'Plan Mensual',
      description: 'Menos que un pasaje de micro. $166/día',
      price: 4990,
      currency: 'CLP',
      billingPeriod: 'MONTHLY',
      features: {
        unlimited_access: true,
        ai_feedback: true,
        advanced_stats: true,
        priority_support: false,
        cost_per_day: 166,
      },
      maxCasesPerMonth: null, // Ilimitado
      hasAI: true,
      hasAdvancedStats: true,
      hasPrioritySupport: false,
      trialDays: 0,
      isActive: true,
    },
  });
  console.log('✅ Plan MENSUAL creado:', planMonthly.displayName, `- $${planMonthly.price}`);

  // Plan TRIMESTRAL - $11.490
  const planQuarterly = await prisma.subscriptionPlan.create({
    data: {
      id: 'plan_quarterly_v1',
      name: 'QUARTERLY',
      displayName: 'Plan Trimestral',
      description: 'Ahorras $3.480. Estudia todo el trimestre. $127/día',
      price: 11490,
      currency: 'CLP',
      billingPeriod: 'QUARTERLY',
      features: {
        unlimited_access: true,
        ai_feedback: true,
        advanced_stats: true,
        priority_support: true,
        savings: 3480,
        cost_per_day: 127,
      },
      maxCasesPerMonth: null, // Ilimitado
      hasAI: true,
      hasAdvancedStats: true,
      hasPrioritySupport: true,
      trialDays: 0,
      isActive: true,
    },
  });
  console.log('✅ Plan TRIMESTRAL creado:', planQuarterly.displayName, `- $${planQuarterly.price} (Ahorro: $3.480)`);

  // Plan SEMESTRAL - $16.490 (MÁS POPULAR)
  const planBiannual = await prisma.subscriptionPlan.create({
    data: {
      id: 'plan_biannual_v1',
      name: 'BIANNUAL',
      displayName: 'Plan Semestral',
      description: 'La mejor oferta. Ahorras $13.450 (¡Casi un 45% OFF!). $91/día',
      price: 16490,
      currency: 'CLP',
      billingPeriod: 'BIANNUAL',
      features: {
        unlimited_access: true,
        ai_feedback: true,
        advanced_stats: true,
        priority_support: true,
        popular: true,
        savings: 13450,
        discount_percentage: 45,
        cost_per_day: 91,
      },
      maxCasesPerMonth: null, // Ilimitado
      hasAI: true,
      hasAdvancedStats: true,
      hasPrioritySupport: true,
      trialDays: 0,
      isActive: true,
    },
  });
  console.log('✅ Plan SEMESTRAL creado:', planBiannual.displayName, `- $${planBiannual.price} (Ahorro: $13.450) ⭐`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ PLANES CREADOS EXITOSAMENTE\n');

  // Mostrar resumen
  const allPlans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: 'asc' },
  });

  console.log('📊 RESUMEN DE PLANES:\n');
  allPlans.forEach((plan) => {
    const features = plan.features as Record<string, any>;
    console.log(`${plan.displayName}:`);
    console.log(`   Precio: $${plan.price} CLP`);
    console.log(`   Período: ${plan.billingPeriod}`);
    console.log(`   Casos: ${plan.maxCasesPerMonth === null ? 'Ilimitado' : `${plan.maxCasesPerMonth}/mes`}`);
    if (features?.savings) {
      console.log(`   Ahorro: $${features.savings}`);
    }
    if (features?.popular) {
      console.log(`   ⭐ MÁS POPULAR`);
    }
    console.log('');
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
