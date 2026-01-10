/**
 * Script para actualizar los periodos de facturación en la base de datos
 * QUARTERLY → deactivar (isActive = false)
 * BIANNUAL → SEMIANNUAL con nuevo precio
 * YEARLY → ANNUAL con nuevo precio
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Iniciando actualización de periodos de facturación...\n')

    // 0. Agregar nuevos valores al enum (si no existen)
    console.log('0️⃣  Agregando nuevos valores al enum BillingPeriod...')
    try {
      await prisma.$executeRaw`
        ALTER TYPE "BillingPeriod" ADD VALUE IF NOT EXISTS 'SEMIANNUAL'
      `
      console.log('   ✅ Valor SEMIANNUAL agregado')
    } catch (error) {
      console.log('   ℹ️  SEMIANNUAL ya existe')
    }
    
    try {
      await prisma.$executeRaw`
        ALTER TYPE "BillingPeriod" ADD VALUE IF NOT EXISTS 'ANNUAL'
      `
      console.log('   ✅ Valor ANNUAL agregado\n')
    } catch (error) {
      console.log('   ℹ️  ANNUAL ya existe\n')
    }

    // 1. Desactivar planes QUARTERLY
    console.log('1️⃣  Desactivando planes QUARTERLY...')
    const deactivatedQuarterly = await prisma.$executeRaw`
      UPDATE subscription_plans 
      SET "isActive" = false 
      WHERE "billingPeriod" = 'QUARTERLY'
    `
    console.log(`   ✅ ${deactivatedQuarterly} planes QUARTERLY desactivados\n`)

    // 2. Actualizar BIANNUAL a SEMIANNUAL con nuevo precio (25% descuento)
    console.log('2️⃣  Actualizando BIANNUAL → SEMIANNUAL...')
    const updatedSemiannual = await prisma.$executeRaw`
      UPDATE subscription_plans 
      SET 
        "billingPeriod" = 'SEMIANNUAL',
        price = 22455,
        description = '6 meses de acceso completo - Asegura tu práctica semestral'
      WHERE "billingPeriod" = 'BIANNUAL'
    `
    console.log(`   ✅ ${updatedSemiannual} planes actualizados a SEMIANNUAL ($22,455 CLP)\n`)

    // 3. Actualizar YEARLY a ANNUAL con nuevo precio (40% descuento)
    console.log('3️⃣  Actualizando YEARLY → ANNUAL...')
    const updatedAnnual = await prisma.$executeRaw`
      UPDATE subscription_plans 
      SET 
        "billingPeriod" = 'ANNUAL',
        price = 35928,
        description = '12 meses de acceso completo - Asegura tu internado completo'
      WHERE "billingPeriod" = 'YEARLY'
    `
    console.log(`   ✅ ${updatedAnnual} planes actualizados a ANNUAL ($35,928 CLP)\n`)

    // 4. Actualizar límite del plan FREE a 10 casos
    console.log('4️⃣  Actualizando límite de casos del plan FREE...')
    const updatedFree = await prisma.$executeRaw`
      UPDATE subscription_plans 
      SET "maxCasesPerMonth" = 10
      WHERE name = 'FREE'
    `
    console.log(`   ✅ ${updatedFree} plan FREE actualizado a 10 casos por mes\n`)

    // 5. Verificar resultados
    console.log('5️⃣  Verificando planes actualizados...')
    const allPlans = await prisma.$queryRaw<
      Array<{
        name: string
        billingPeriod: string
        price: number
        isActive: boolean
        maxCasesPerMonth: number
      }>
    >`
      SELECT name, "billingPeriod", price, "isActive", "maxCasesPerMonth"
      FROM subscription_plans 
      ORDER BY price ASC
    `

    console.log('\n📊 Planes actuales en la base de datos:\n')
    console.table(allPlans)

    console.log('\n✅ Actualización completada exitosamente!')
  } catch (error) {
    console.error('\n❌ Error durante la actualización:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
