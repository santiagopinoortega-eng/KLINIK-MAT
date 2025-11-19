// scripts/check-users.ts
import { prisma } from '../lib/prisma';

async function main() {
  console.log('\n🔍 Verificando usuarios en la base de datos...\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  
  if (users.length === 0) {
    console.log('❌ No hay usuarios en la base de datos\n');
    
    // Verificar conexión a la BD
    console.log('📊 Verificando conexión a la base de datos...');
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Conexión a la base de datos OK\n');
    } catch (error: any) {
      console.error('❌ Error de conexión:', error.message, '\n');
    }
  } else {
    console.log(`✅ Encontrados ${users.length} usuario(s):\n`);
    users.forEach((user) => {
      console.log(`  ID:    ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name:  ${user.name || 'N/A'}`);
      console.log(`  Role:  ${user.role}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('  ---');
    });
    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
