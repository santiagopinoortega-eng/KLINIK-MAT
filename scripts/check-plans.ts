// scripts/check-plans.ts
// Script para verificar los planes en la base de datos

import { prisma } from '../lib/prisma';

async function checkPlans() {
  console.log('🔍 Checking subscription plans in database...\n');

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });

    console.log(`📊 Total plans found: ${plans.length}\n`);

    if (plans.length === 0) {
      console.log('❌ No plans found in database!');
      console.log('Run: npx tsx prisma/seed-plans.ts');
    } else {
      plans.forEach((plan) => {
        console.log(`✅ ${plan.name} (${plan.slug})`);
        console.log(`   Price: $${plan.price} ${plan.interval}`);
        console.log(`   Active: ${plan.isActive}`);
        console.log(`   ID: ${plan.id}\n`);
      });
    }

    // Check active plans
    const activePlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    console.log(`\n✅ Active plans: ${activePlans.length}`);
    
  } catch (error) {
    console.error('❌ Error checking plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();
