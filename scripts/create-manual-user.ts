// scripts/create-manual-user.ts
import { config } from 'dotenv';
config();

import { prisma } from '../lib/prisma';

async function main() {
  const email = 'santiagopinoortega@gmail.com';
  
  console.log('\n🔍 Obteniendo tu User ID de Clerk...');
  console.log('Ve a tu app web, haz clic en tu perfil y copia el User ID (user_...)');
  console.log('\nO ejecuta este comando en otra terminal:');
  console.log(`curl -X GET https://api.clerk.com/v1/users -H "Authorization: Bearer sk_test_8XQqN8F1jSWjWWXj0AomlTBam31T8bHQ0wMQmzYHpX" | jq '.[] | select(.email_addresses[].email_address == "${email}")'`);
  
  // Por ahora, solicita el user ID manualmente
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('\n❌ Uso: npx tsx scripts/create-manual-user.ts <USER_ID>');
    console.log('Ejemplo: npx tsx scripts/create-manual-user.ts user_2abc123def\n');
    process.exit(1);
  }
  
  console.log(`\n📝 Creando usuario en la base de datos...`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Email:   ${email}`);
  
  try {
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name: 'Santiago Pino Ortega',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });
    
    console.log(`\n✅ Usuario creado exitosamente!`);
    console.log(`   ID:    ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role:  ${user.role}\n`);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`\n⚠️  El usuario ya existe en la base de datos`);
      
      // Actualizar a ADMIN
      const updated = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      
      console.log(`✅ Actualizado a rol ADMIN\n`);
    } else {
      console.error(`\n❌ Error:`, error.message, '\n');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
