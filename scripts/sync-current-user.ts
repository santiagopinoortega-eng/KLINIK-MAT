// scripts/sync-current-user.ts
import { createClerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncCurrentUser() {
  try {
    console.log('🔄 Sincronizando usuario actual de Clerk...\n');

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Obtener el usuario actual de Clerk (necesitarás el ID)
    // Por ahora, obtendremos todos los usuarios de Clerk
    const clerkUsers = await clerkClient.users.getUserList();
    
    console.log(`📋 Encontrados ${clerkUsers.data.length} usuarios en Clerk\n`);

    for (const clerkUser of clerkUsers.data) {
      const email = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      if (!email) {
        console.log(`⚠️  Usuario ${clerkUser.id} no tiene email, saltando...`);
        continue;
      }

      // Verificar si ya existe en la base de datos
      const existingUser = await prisma.user.findUnique({
        where: { id: clerkUser.id },
      });

      if (existingUser) {
        console.log(`✅ Usuario ${email} ya existe en la BD`);
        continue;
      }

      // Crear el usuario en la base de datos
      const newUser = await prisma.user.create({
        data: {
          id: clerkUser.id,
          email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
          role: (clerkUser.publicMetadata as any)?.role || 'STUDENT',
        },
      });

      console.log(`✨ Usuario ${email} creado en la BD con ID: ${newUser.id}`);
    }

    console.log('\n✅ Sincronización completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncCurrentUser();
