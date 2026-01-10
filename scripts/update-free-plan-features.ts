import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Actualizando features del plan FREE...\n')

  const correctFeatures = [
    '10 casos clínicos gratuitos',
    'Acceso a 6 áreas principales',
    'Preguntas interactivas',
    'Feedback inmediato',
    'Sin necesidad de tarjeta',
    'Ideal para probar la plataforma'
  ]

  const updated = await prisma.subscriptionPlan.updateMany({
    where: { name: 'FREE' },
    data: { 
      features: correctFeatures,
      description: 'Plan gratuito para explorar la plataforma - 10 casos clínicos sin compromiso'
    }
  })

  console.log(`✅ ${updated.count} plan FREE actualizado\n`)

  // Verificar
  const freePlan = await prisma.subscriptionPlan.findFirst({
    where: { name: 'FREE' },
    select: {
      displayName: true,
      description: true,
      features: true,
      maxCasesPerMonth: true
    }
  })

  console.log('📊 Plan FREE actualizado:')
  console.log(`  • Nombre: ${freePlan?.displayName}`)
  console.log(`  • Descripción: ${freePlan?.description}`)
  console.log(`  • Límite: ${freePlan?.maxCasesPerMonth} casos/mes`)
  console.log(`  • Features:`)
  freePlan?.features.forEach((f, i) => {
    console.log(`    ${i + 1}. ${f}`)
  })

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
