// scripts/test-clerk.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testClerkKeys() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  console.log('\n🔐 Verificando claves de Clerk...\n');
  
  console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', publishableKey ? '✅ Configurada' : '❌ Faltante');
  console.log('CLERK_SECRET_KEY:', secretKey ? '✅ Configurada' : '❌ Faltante');
  
  if (!publishableKey || !secretKey) {
    console.log('\n❌ Error: Claves de Clerk no configuradas correctamente');
    process.exit(1);
  }

  // Intentar hacer una petición simple a la API de Clerk
  try {
    const response = await fetch('https://api.clerk.com/v1/users?limit=1', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('\n✅ Claves de Clerk VÁLIDAS - Conexión exitosa');
      const data = await response.json();
      console.log(`📊 Usuarios en el sistema: ${data.length >= 0 ? 'Accesibles' : 'Sin datos'}`);
    } else {
      console.log('\n❌ Claves de Clerk INVÁLIDAS o EXPIRADAS');
      console.log(`Status: ${response.status} ${response.statusText}`);
      const error = await response.text();
      console.log('Error:', error);
    }
  } catch (error: any) {
    console.log('\n❌ Error al conectar con Clerk API:', error.message);
  }
}

testClerkKeys();
