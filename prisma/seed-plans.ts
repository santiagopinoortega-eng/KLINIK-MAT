// prisma/seed-plans.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding subscription plans...');

  // Plan FREE - Gratuito con límites
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'FREE' },
    update: {},
    create: {
      name: 'FREE',
      displayName: 'Plan Gratuito',
      description: 'Acceso limitado para explorar la plataforma',
      price: 0,
      currency: 'CLP',
      billingPeriod: 'MONTHLY',
      trialDays: 0,
      isActive: true,
      features: {
        casesPerMonth: 10, // Solo 10 casos al mes
        allAreas: false,
        minsal: false,
        pubmed: true, // SOLO PubMed en recursos
        anticonceptivos: false,
        customReports: false,
        advancedStats: false,
        exportPDF: false,
        offlineMode: false,
      },
      maxCasesPerMonth: 10, // Límite estricto
      hasAI: false,
      hasAdvancedStats: false,
      hasPrioritySupport: false,
    },
  });
  console.log('✅ Plan FREE created:', freePlan.id);

  // Plan Mensual - $4,990 CLP/mes
  const monthlyPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'MONTHLY' },
    update: {},
    create: {
      name: 'MONTHLY',
      displayName: 'Plan Mensual',
      description: 'Acceso completo a todos los casos clínicos y recursos',
      price: 4990,
      currency: 'CLP',
      billingPeriod: 'MONTHLY',
      trialDays: 7,
      isActive: true,
      features: {
        casesPerMonth: -1, // Ilimitado
        allAreas: true,
        minsal: true,
        pubmed: true,
        anticonceptivos: true,
        customReports: true,
        advancedStats: true,
        exportPDF: true,
        offlineMode: true,
      },
      maxCasesPerMonth: null, // Ilimitado
      hasAI: false,
      hasAdvancedStats: true,
      hasPrioritySupport: false,
    },
  });
  console.log('✅ Plan MONTHLY created:', monthlyPlan.id);

  // Plan Trimestral - $11,230 CLP/3 meses (25% descuento)
  const quarterlyPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'QUARTERLY' },
    update: {},
    create: {
      name: 'QUARTERLY',
      displayName: 'Plan Trimestral',
      description: '3 meses con 25% de descuento - Ahorra $3,740 CLP',
      price: 11230, // $14,970 - 25% = $11,230
      currency: 'CLP',
      billingPeriod: 'QUARTERLY',
      trialDays: 7,
      isActive: true,
      features: {
        casesPerMonth: -1, // Ilimitado
        allAreas: true,
        minsal: true,
        pubmed: true,
        anticonceptivos: true,
        customReports: true,
        advancedStats: true,
        exportPDF: true,
        offlineMode: true,
        prioritySupport: true,
      },
      maxCasesPerMonth: null, // Ilimitado
      hasAI: false,
      hasAdvancedStats: true,
      hasPrioritySupport: true,
    },
  });
  console.log('✅ Plan QUARTERLY created:', quarterlyPlan.id);

  // Plan Semestral (6 meses) - $24,700 CLP/6 meses (17% descuento) - MEJOR VALOR
  const biannualPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'BIANNUAL' },
    update: {},
    create: {
      name: 'BIANNUAL',
      displayName: 'Plan Semestral (6 meses)',
      description: '6 meses - Mejor valor con acceso anticipado',
      price: 24700, // $44,910 - 45% = $24,700
      currency: 'CLP',
      billingPeriod: 'BIANNUAL',
      trialDays: 14, // Período de prueba más largo
      isActive: true,
      features: {
        casesPerMonth: -1, // Ilimitado
        allAreas: true,
        minsal: true,
        pubmed: true,
        anticonceptivos: true,
        customReports: true,
        advancedStats: true,
        exportPDF: true,
        offlineMode: true,
        prioritySupport: true,
        certificateDownload: true,
        earlyAccess: true,
      },
      maxCasesPerMonth: null,
      hasAI: false,
      hasAdvancedStats: true,
      hasPrioritySupport: true,
    },
  });
  console.log('✅ Plan BIANNUAL (6 meses) created:', biannualPlan.id);

  console.log('');
  console.log('📊 Summary:');
  console.log('  - Plan FREE: GRATIS (10 casos/mes, solo PubMed)');
  console.log('  - Plan MONTHLY: $4,990/mes (~$4,990/mes real)');
  console.log('  - Plan QUARTERLY: $11,230/3 meses (~$3,743/mes real) - Ahorro 25%');
  console.log('  - Plan BIANNUAL: $24,700/6 meses (~$4,117/mes real) - 17% desc ⭐ MEJOR VALOR');
  console.log('');
  console.log('💰 Ahorro máximo con Plan Semestral: $5,240 CLP');
  console.log('');
  console.log('📦 Planes pagos incluyen:');
  console.log('  ✅ Casos clínicos ilimitados (8 áreas)');
  console.log('  ✅ Guía interactiva de anticonceptivos');
  console.log('  ✅ Normativas MINSAL');
  console.log('  ✅ Búsqueda PubMed integrada');
  console.log('  ✅ Estadísticas avanzadas');
  console.log('  ✅ Exportar a PDF');
  console.log('  ✅ Modo offline');
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
