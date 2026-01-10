import { PrismaClient, BillingPeriod } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreSemiannualPlan() {
  console.log('🔧 Restaurando plan SEMIANNUAL...\n');

  try {
    // Verificar si existe
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { 
        billingPeriod: BillingPeriod.SEMIANNUAL,
        isActive: true 
      }
    });

    if (existing) {
      console.log('✅ Plan SEMIANNUAL ya existe:', existing);
      return existing;
    }

    // Crear plan SEMIANNUAL
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: 'SEMIANNUAL',
        displayName: 'Plan Semestral',
        description: 'Acceso completo por 6 meses con descuento especial',
        price: 22990,
        currency: 'CLP',
        billingPeriod: BillingPeriod.SEMIANNUAL,
        trialDays: 0,
        isActive: true,
        features: {
          casesPerMonth: 1000,
          aiEnabled: true,
          customReports: true,
          prioritySupport: true,
          discount: '20%'
        },
        maxCasesPerMonth: 1000,
        hasAI: true,
        hasAdvancedStats: true,
        hasPrioritySupport: true
      }
    });

    console.log('✅ Plan SEMIANNUAL creado:', plan);

    // Mostrar todos los planes activos
    const allPlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' }
    });

    console.log('\n📊 Planes activos:');
    allPlans.forEach(p => {
      console.log(`  - ${p.displayName} (${p.billingPeriod}): $${p.price} ${p.currency}`);
    });

    return plan;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restoreSemiannualPlan();
