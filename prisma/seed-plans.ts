// prisma/seed-plans.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding subscription plans...');

  // Plan Free - Siempre gratuito
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'FREE' },
    update: {},
    create: {
      name: 'FREE',
      displayName: 'Plan Gratuito',
      description: 'Acceso básico a casos clínicos para estudiantes',
      price: 0,
      currency: 'CLP',
      billingPeriod: 'MONTHLY',
      trialDays: 0,
      isActive: true,
      features: {
        casesPerMonth: 10,
        aiEnabled: false,
        customReports: false,
        advancedStats: false,
        prioritySupport: false,
        exportPDF: false,
        offlineMode: false,
      },
      maxCasesPerMonth: 10,
      hasAI: false,
      hasAdvancedStats: false,
      hasPrioritySupport: false,
    },
  });
  console.log('✅ Plan FREE created:', freePlan.id);

  // Plan Basic - $10,000 CLP/mes
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'BASIC' },
    update: {},
    create: {
      name: 'BASIC',
      displayName: 'Plan Básico',
      description: 'Acceso completo a todos los casos clínicos sin límites',
      price: 10000, // $10,000 CLP
      currency: 'CLP',
      billingPeriod: 'MONTHLY',
      trialDays: 14, // 14 días de prueba
      isActive: true,
      features: {
        casesPerMonth: -1, // Ilimitado
        aiEnabled: false,
        customReports: true,
        advancedStats: true,
        prioritySupport: false,
        exportPDF: true,
        offlineMode: true,
      },
      maxCasesPerMonth: null, // Ilimitado
      hasAI: false,
      hasAdvancedStats: true,
      hasPrioritySupport: false,
    },
  });
  console.log('✅ Plan BASIC created:', basicPlan.id);

  // Plan Premium - $20,000 CLP/mes
  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'PREMIUM' },
    update: {},
    create: {
      name: 'PREMIUM',
      displayName: 'Plan Premium',
      description: 'Todo lo del Plan Básico + IA para análisis y feedback personalizado',
      price: 20000, // $20,000 CLP
      currency: 'CLP',
      billingPeriod: 'MONTHLY',
      trialDays: 14,
      isActive: true,
      features: {
        casesPerMonth: -1, // Ilimitado
        aiEnabled: true,
        aiRequestsPerMonth: 100,
        customReports: true,
        advancedStats: true,
        prioritySupport: true,
        exportPDF: true,
        offlineMode: true,
        customCases: true,
      },
      maxCasesPerMonth: null, // Ilimitado
      hasAI: true,
      hasAdvancedStats: true,
      hasPrioritySupport: true,
    },
  });
  console.log('✅ Plan PREMIUM created:', premiumPlan.id);

  // Plan Anual Básico (descuento ~15%)
  const basicYearlyPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'BASIC_YEARLY' },
    update: {},
    create: {
      name: 'BASIC_YEARLY',
      displayName: 'Plan Básico Anual',
      description: 'Plan Básico con pago anual - ahorra $18,000 CLP al año',
      price: 102000, // $102,000 CLP/año (vs $120,000)
      currency: 'CLP',
      billingPeriod: 'YEARLY',
      trialDays: 14,
      isActive: true,
      features: {
        casesPerMonth: -1,
        aiEnabled: false,
        customReports: true,
        advancedStats: true,
        prioritySupport: false,
        exportPDF: true,
        offlineMode: true,
      },
      maxCasesPerMonth: null,
      hasAI: false,
      hasAdvancedStats: true,
      hasPrioritySupport: false,
    },
  });
  console.log('✅ Plan BASIC_YEARLY created:', basicYearlyPlan.id);

  // Plan Anual Premium (descuento ~15%)
  const premiumYearlyPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'PREMIUM_YEARLY' },
    update: {},
    create: {
      name: 'PREMIUM_YEARLY',
      displayName: 'Plan Premium Anual',
      description: 'Plan Premium con pago anual - ahorra $36,000 CLP al año',
      price: 204000, // $204,000 CLP/año (vs $240,000)
      currency: 'CLP',
      billingPeriod: 'YEARLY',
      trialDays: 14,
      isActive: true,
      features: {
        casesPerMonth: -1,
        aiEnabled: true,
        aiRequestsPerMonth: 1500,
        customReports: true,
        advancedStats: true,
        prioritySupport: true,
        exportPDF: true,
        offlineMode: true,
        customCases: true,
      },
      maxCasesPerMonth: null,
      hasAI: true,
      hasAdvancedStats: true,
      hasPrioritySupport: true,
    },
  });
  console.log('✅ Plan PREMIUM_YEARLY created:', premiumYearlyPlan.id);

  // Plan Enterprise (para instituciones)
  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'ENTERPRISE' },
    update: {},
    create: {
      name: 'ENTERPRISE',
      displayName: 'Plan Institucional',
      description: 'Para universidades y centros de formación - contactar ventas',
      price: 0, // Precio personalizado
      currency: 'CLP',
      billingPeriod: 'YEARLY',
      trialDays: 30,
      isActive: true,
      features: {
        casesPerMonth: -1,
        aiEnabled: true,
        aiRequestsPerMonth: -1,
        customReports: true,
        advancedStats: true,
        prioritySupport: true,
        exportPDF: true,
        offlineMode: true,
        customCases: true,
        dedicatedSupport: true,
        customBranding: true,
        ssoIntegration: true,
        bulkLicenses: true,
      },
      maxCasesPerMonth: null,
      maxStudents: null, // Ilimitado
      hasAI: true,
      hasAdvancedStats: true,
      hasPrioritySupport: true,
    },
  });
  console.log('✅ Plan ENTERPRISE created:', enterprisePlan.id);

  console.log('');
  console.log('📊 Summary:');
  console.log('  - Plan FREE: $0/mes');
  console.log('  - Plan BASIC: $10,000/mes');
  console.log('  - Plan PREMIUM: $20,000/mes (con IA)');
  console.log('  - Plan BASIC_YEARLY: $102,000/año (ahorro 15%)');
  console.log('  - Plan PREMIUM_YEARLY: $204,000/año (ahorro 15%)');
  console.log('  - Plan ENTERPRISE: Precio personalizado');
  console.log('');
  console.log('🎉 Subscription plans seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
