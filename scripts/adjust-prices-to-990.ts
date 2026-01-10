import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('💰 Ajustando precios para que terminen en 990...\n')

  // Actualizar plan SEMIANNUAL
  console.log('1️⃣  Actualizando precio SEMIANNUAL: $22,455 → $22,990')
  await prisma.subscriptionPlan.updateMany({
    where: { billingPeriod: 'SEMIANNUAL' },
    data: { price: 22990 }
  })
  console.log('   ✅ Plan SEMIANNUAL actualizado\n')

  // Actualizar plan ANNUAL
  console.log('2️⃣  Actualizando precio ANNUAL: $35,928 → $35,990')
  await prisma.subscriptionPlan.updateMany({
    where: { billingPeriod: 'ANNUAL' },
    data: { price: 35990 }
  })
  console.log('   ✅ Plan ANNUAL actualizado\n')

  // Verificar resultados
  console.log('📊 Precios actualizados:\n')
  const allPlans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
    select: {
      displayName: true,
      billingPeriod: true,
      price: true
    }
  })

  console.table(
    allPlans.map(p => ({
      Plan: p.displayName,
      Periodo: p.billingPeriod,
      'Precio (CLP)': `$${p.price.toLocaleString('es-CL')}`
    }))
  )

  console.log('\n✅ Todos los precios ahora terminan en 990!')
  
  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
