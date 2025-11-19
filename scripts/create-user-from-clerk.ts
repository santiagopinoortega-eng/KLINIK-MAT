// scripts/create-user-from-clerk.ts
// Script para crear un usuario manualmente desde Clerk
import { config } from 'dotenv';
config(); // Cargar variables de entorno

import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../lib/prisma';

async function main() {
  const client = await clerkClient();
  
  // Obtener todos los usuarios de Clerk
  const users = await client.users.getUserList();
  
  console.log(`\n📋 Usuarios encontrados en Clerk: ${users.data.length}\n`);
  
  for (const clerkUser of users.data) {
    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;
    
    if (!email) {
      console.log(`⚠️  Usuario ${clerkUser.id} no tiene email`);
      continue;
    }
    
    console.log(`Procesando: ${email} (${clerkUser.id})`);
    
    // Verificar si ya existe en Prisma
    const existingUser = await prisma.user.findUnique({
      where: { id: clerkUser.id },
    });
    
    if (existingUser) {
      console.log(`  ✓ Ya existe en la base de datos\n`);
      continue;
    }
    
    // Crear el usuario en Prisma
    try {
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null;
      
      await prisma.user.create({
        data: {
          id: clerkUser.id,
          email,
          name,
          role: 'STUDENT', // Por defecto STUDENT, luego puedes cambiar a ADMIN
          emailVerified: new Date(),
        },
      });
      
      console.log(`  ✅ Creado en la base de datos con rol STUDENT\n`);
    } catch (error: any) {
      console.error(`  ❌ Error al crear: ${error.message}\n`);
    }
  }
  
  console.log('✨ Sincronización completada\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
