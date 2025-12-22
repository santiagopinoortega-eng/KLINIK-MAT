import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.subscriptionPlan.findMany({ 
    orderBy: { price: 'asc' } 
  });
  
  console.log(`\n📋 Total planes: ${plans.length}\n`);
  
  plans.forEach(p => {
    console.log(`${p.isActive ? '✅' : '❌'} ${p.name} - ${p.displayName}`);
    console.log(`   Precio: $${p.price} CLP - ${p.billingPeriod}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Activo: ${p.isActive}\n`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
