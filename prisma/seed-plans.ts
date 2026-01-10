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

  // Plan Semestral - $22,990 CLP/6 meses (25% descuento)
  const semestralPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'SEMIANNUAL' },
    update: {},
    create: {
      name: 'SEMIANNUAL',
      displayName: 'Plan Semestral',
      description: '6 meses con 25% de descuento - Ahorra $7,000 CLP',
      price: 22990,
      currency: 'CLP',
      billingPeriod: 'SEMIANNUAL',
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
        certificateDownload: true
      },
      maxCasesPerMonth: null,
      hasAI: false,
      hasAdvancedStats: true,
      hasPrioritySupport: true,
    },
  });
  console.log('✅ Plan SEMIANNUAL created:', semestralPlan.id);

  // Plan Anual (12 meses) - $35,990 CLP/12 meses (40% descuento) - MEJOR VALOR
  const annualPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'ANNUAL' },
    update: {},
    create: {
      name: 'ANNUAL',
      displayName: 'Plan Anual',
      description: '12 meses con 40% de descuento - Ahorra $24,000 CLP',
      price: 35990,
      currency: 'CLP',
      billingPeriod: 'ANNUAL',
      trialDays: 14,
      isActive: true,
      features: {
        casesPerMonth: -1,
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
  console.log('✅ Plan ANNUAL created:', annualPlan.id);

  console.log('');
  console.log('📊 Summary:');
  console.log('  - Plan FREE: GRATIS (10 casos/mes, solo PubMed)');
  console.log('  - Plan MONTHLY: $4,990/mes (~$4,990/mes real)');
  console.log('  - Plan SEMIANNUAL: $22,990/6 meses (~$3,832/mes real) - 25% desc');
  console.log('  - Plan ANNUAL: $35,990/12 meses (~$2,999/mes real) - 40% desc ⭐ MEJOR VALOR');
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
