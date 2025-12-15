// scripts/test-db-connection.ts
// Script para verificar conexión a la base de datos

import { prisma } from '../lib/prisma';

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Raw query to verify connection
    console.log('Test 1: Verificando conexión básica...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión a DB exitosa\n');
    
    // Test 2: Count users
    console.log('Test 2: Contando usuarios en DB...');
    const userCount = await prisma.user.count();
    console.log(`✅ Total usuarios: ${userCount}\n`);
    
    // Test 3: List last 5 users
    console.log('Test 3: Últimos 5 usuarios registrados:');
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    });
    
    if (recentUsers.length === 0) {
      console.log('⚠️ No hay usuarios en la base de datos');
    } else {
      recentUsers.forEach((user, i) => {
        console.log(`${i + 1}. ${user.email} - ${user.name || 'Sin nombre'} - ${user.role} - ${user.createdAt.toISOString()}`);
      });
    }
    
    console.log('\n✅ Todas las pruebas pasaron exitosamente');
    
  } catch (error: any) {
    console.error('\n❌ Error de conexión a la base de datos:');
    console.error('Mensaje:', error?.message);
    console.error('Código:', error?.code);
    console.error('Meta:', error?.meta);
    
    if (error?.code === 'P1001') {
      console.error('\n💡 TIP: Verifica que DATABASE_URL esté correctamente configurado');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
