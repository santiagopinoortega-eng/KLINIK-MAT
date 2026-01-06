require('dotenv').config();
const fs = require('fs');

console.log('\n🔍 AUDITORÍA KLINIK-MAT - Capacidad 6-7 usuarios\n');
console.log('═══════════════════════════════════════════════\n');

// 1. Database
console.log('1️⃣  BASE DE DATOS (Neon PostgreSQL)');
const dbUrl = process.env.DATABASE_URL || '';
const directUrl = process.env.DIRECT_URL || '';
console.log('   ✅ DATABASE_URL con pooling:', dbUrl.includes('pgbouncer=true') && dbUrl.includes('-pooler') ? '✓' : '✗ ERROR');
console.log('   ✅ DIRECT_URL sin pooling:', directUrl && !directUrl.includes('-pooler') ? '✓' : '✗ ERROR');
console.log('   ✅ SSL habilitado:', dbUrl.includes('sslmode=require') ? '✓' : '⚠️  Falta');

// 2. Prisma
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
console.log('\n2️⃣  PRISMA ORM');
console.log('   ✅ directUrl en schema:', schema.includes('directUrl') ? '✓' : '✗ ERROR');
console.log('   ✅ Generator correcto:', schema.includes('prisma-client-js') ? '✓' : '✗ ERROR');

const prismaLib = fs.readFileSync('lib/prisma.ts', 'utf8');
console.log('   ✅ Singleton pattern:', prismaLib.includes('globalForPrisma') ? '✓' : '✗ ERROR');

// 3. Auth
console.log('\n3️⃣  AUTENTICACIÓN (Clerk)');
console.log('   ✅ Webhook secret:', process.env.CLERK_WEBHOOK_SECRET ? '✓' : '⚠️  Falta');

// 4. Payments
console.log('\n4️⃣  PAGOS (MercadoPago)');
console.log('   ✅ Access Token:', process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('APP_USR-7003') ? '✓ PROD' : '⚠️  Revisar');
console.log('   ✅ Public Key:', process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ? '✓' : '⚠️  Falta');

// 5. Monitoring
console.log('\n5️⃣  MONITOREO');
console.log('   ✅ Sentry DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN ? '✓' : '⚠️  Falta');

// 6. AI
console.log('\n6️⃣  INTELIGENCIA ARTIFICIAL');
console.log('   ✅ Gemini API:', process.env.GEMINI_API_KEY ? '✓' : '⚠️  Falta');
console.log('   ✅ PubMed API:', process.env.PUBMED_API_KEY ? '✓' : '⚠️  Falta');

// 7. Rate Limiting
console.log('\n7️⃣  PROTECCIÓN (6-7 usuarios concurrentes)');
console.log('   ✅ Rate limiting:', fs.existsSync('lib/ratelimit.ts') ? '✓' : '⚠️  No encontrado');
console.log('   ✅ CSRF protection:', fs.existsSync('lib/csrf.ts') ? '✓' : '⚠️  Falta');

// 8. Dependencies
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('\n8️⃣  DEPENDENCIAS');
console.log('   ✅ Next.js:', pkg.dependencies.next);
console.log('   ✅ Prisma:', pkg.dependencies.prisma);
console.log('   ✅ Clerk:', pkg.dependencies['@clerk/nextjs']);

console.log('\n═══════════════════════════════════════════════');
console.log('✅ Auditoría completada\n');
