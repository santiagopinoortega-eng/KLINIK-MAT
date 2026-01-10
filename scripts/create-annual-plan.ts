import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando si existe plan ANNUAL...')
  
  const annualPlan = await prisma.subscriptionPlan.findFirst({
    where: { billingPeriod: 'ANNUAL' }
  })
  
  if (!annualPlan) {
    console.log('📝 Creando plan ANNUAL...\n')
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: 'ANNUAL',
        displayName: 'Plan Anual',
        description: '12 meses de acceso completo - Asegura tu internado completo',
        price: 35928,
        currency: 'CLP',
        billingPeriod: 'ANNUAL',
        trialDays: 0,
        isActive: true,
        features: [
          'Acceso ilimitado a casos clínicos',
          'Seguimiento personalizado',
          'Certificado de finalización',
          'Acceso anticipado a nuevas funciones',
          'Soporte prioritario'
        ],
        maxCasesPerMonth: null,
        maxStudents: null,
        hasAI: true,
        hasAdvancedStats: true,
        hasPrioritySupport: true
      }
    })
    
    console.log('✅ Plan ANNUAL creado exitosamente!')
    console.log(`   • Nombre: ${plan.displayName}`)
    console.log(`   • Precio: $${plan.price.toLocaleString('es-CL')} CLP`)
    console.log(`   • Periodo: ${plan.billingPeriod}`)
    console.log(`   • Activo: ${plan.isActive}\n`)
  } else {
    console.log('ℹ️  Plan ANNUAL ya existe\n')
  }
  
  // Mostrar todos los planes activos
  console.log('📊 Planes activos actuales:\n')
  const activePlans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
    select: {
      name: true,
      displayName: true,
      billingPeriod: true,
      price: true,
      maxCasesPerMonth: true
    }
  })
  
  console.table(activePlans)
  
  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
