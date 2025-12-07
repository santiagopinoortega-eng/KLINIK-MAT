// scripts/create-temp-user.ts
import { config } from 'dotenv';
config();

import { prisma } from '../lib/prisma';

async function main() {
  const userId = 'temp-user-dev';
  const email = 'temp-dev@klinikmat.local';
  
  console.log('\n🔧 Creando usuario temporal para desarrollo...');
  
  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: email,
        name: 'Usuario Temporal Dev',
        role: 'STUDENT',
      },
      create: {
        id: userId,
        email: email,
        name: 'Usuario Temporal Dev',
        role: 'STUDENT',
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log(`✅ Usuario temporal creado/actualizado exitosamente!`);
    console.log(`   ID:    ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role:  ${user.role}\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
