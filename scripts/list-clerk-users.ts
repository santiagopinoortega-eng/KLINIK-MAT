import { createClerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAndSyncClerkUsers() {
  const clerkClient = createClerkClient({ 
    secretKey: process.env.CLERK_SECRET_KEY 
  });
  
  console.log('🔄 Listando TODOS los usuarios de Clerk...\n');
  
  const clerkUsers = await clerkClient.users.getUserList({ limit: 100 });
  
  console.log(`📋 Total usuarios en Clerk: ${clerkUsers.totalCount}\n`);
  
  for (const user of clerkUsers.data) {
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );
    
    console.log(`Clerk User ID: ${user.id}`);
    console.log(`  Email: ${primaryEmail?.emailAddress || 'N/A'}`);
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    
    // Check if exists in DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    if (dbUser) {
      console.log(`  ✅ Existe en BD\n`);
    } else {
      console.log(`  ❌ NO existe en BD - CREANDO...\n`);
      
      // Create user
      await prisma.user.create({
        data: {
          id: user.id,
          email: primaryEmail?.emailAddress || `${user.id}@clerk.local`,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
          role: 'STUDENT',
        },
      });
      
      console.log(`  ✅ Usuario creado en BD\n`);
    }
  }
  
  await prisma.$disconnect();
  console.log('✅ Sincronización completada');
}

listAndSyncClerkUsers().catch(console.error);
