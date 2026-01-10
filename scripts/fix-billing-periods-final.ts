// scripts/fix-billing-periods-final.ts
/**
 * Actualiza planes con períodos antiguos antes de migración
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Limpiando períodos antiguos con SQL directo...');

  // 1. Ver qué hay en la base de datos
  const existing: any = await prisma.$queryRaw`
    SELECT DISTINCT "billingPeriod" FROM subscription_plans
  `;
  console.log('📊 Períodos existentes:', existing);

  // 2. Actualizar planes antiguos a MONTHLY
  const updated = await prisma.$executeRaw`
    UPDATE subscription_plans 
    SET "billingPeriod" = 'MONTHLY'::"BillingPeriod"
    WHERE "billingPeriod" IN ('QUARTERLY'::"BillingPeriod", 'YEARLY'::"BillingPeriod", 'BIANNUAL'::"BillingPeriod")
  `;

  console.log(`✅ ${updated} planes actualizados a MONTHLY`);

  // 3. Desactivar esos planes
  const deactivated = await prisma.$executeRaw`
    UPDATE subscription_plans 
    SET "isActive" = false 
    WHERE name IN ('QUARTERLY', 'YEARLY', 'BIANNUAL')
  `;

  console.log(`✅ ${deactivated} planes desactivados`);

  console.log('✅ Limpieza completada. Ahora ejecuta: npx prisma db push');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
