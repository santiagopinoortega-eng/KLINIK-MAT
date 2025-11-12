// scripts/check-env.mjs
import { config } from 'dotenv';
import { existsSync } from 'fs';

// Carga de entorno (si existe localmente)
// Esto asegura que podemos leer las variables definidas en .env.local
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

// 1. Definir los requerimientos CLAVE (El proyecto no funciona sin ellas)
const required = [
  "DATABASE_URL", // Conexión a Neon.tech
  "NEXTAUTH_SECRET", // Clave de seguridad para la gestión de sesiones (Auth.js)
];

// 2. Definir los requerimientos CONDICIONALES (Recomendados para escalabilidad/arquitectura)
const recommended = [
  "DATABASE_URL_READONLY", // Opcional para la réplica de lectura (prismaRO)
];

// --- Lógica de Validación ---

// Verificar las variables requeridas
const missingRequired = required.filter(k => !process.env[k]);

if (missingRequired.length) {
  console.error(\n❌ ERROR CRÍTICO: Faltan variables esenciales: ${missingRequired.join(", ")});
  console.error("   La compilación se detiene. Asegúrate de que las tienes en .env.local o Vercel Secrets.");
  process.exit(1);
}

// Verificar las variables recomendadas (no detiene el build, solo advierte)
const missingRecommended = recommended.filter(k => !process.env[k]);

if (missingRecommended.length) {
  console.warn(\n⚠️ Advertencia: Faltan variables recomendadas: ${missingRecommended.join(", ")});
  console.warn("   Considera definir DATABASE_URL_READONLY para mejorar la escalabilidad en producción (prismaRO usará DATABASE_URL como fallback).");
}

console.log("\n✅ Variables de entorno OK");