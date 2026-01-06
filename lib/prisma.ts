// /lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declaramos una variable global para almacenar la instancia de Prisma.
// Esto es clave para evitar crear nuevas conexiones en cada hot-reload en desarrollo.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRO: PrismaClient | undefined;
};

// 🔥 OPTIMIZACIÓN: Connection pooling para Neon.tech serverless
// Con Neon Free Tier (20 conexiones), limitamos a 5 por instancia
// Esto permite ~4 lambdas activas simultáneas sin agotar el pool
const prismaConfig: any = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

// Exportamos una única instancia de PrismaClient.
// Si ya existe en el objeto global, la reutilizamos. Si no, creamos una nueva.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaConfig);

// En entornos que no son de producción, asignamos la instancia de Prisma al objeto global.
// Esto asegura que la misma instancia se reutilice en las recargas de la aplicación.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Optional read-only replica support. If DATABASE_URL_READONLY is provided,
// create a separate PrismaClient bound to that URL. Otherwise reuse the main
// `prisma` instance as `prismaRO` for convenience.
export const prismaRO =
  globalForPrisma.prismaRO ??
  (process.env.DATABASE_URL_READONLY
    ? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    : prisma);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaRO = prismaRO;
}

// 🔥 OPTIMIZACIÓN: Auto-disconnect en serverless para liberar conexiones
// En Vercel, las lambdas viven ~5min. Cerramos conexiones idle para liberar slots
if (process.env.NODE_ENV === 'production') {
  // Cerrar conexiones después de 30s de inactividad
  const cleanupInterval = setInterval(async () => {
    try {
      await prisma.$disconnect();
      await prismaRO.$disconnect();
    } catch (error) {
      console.error('Error disconnecting Prisma:', error);
    }
  }, 30_000);

  // Limpiar interval si el proceso termina
  process.on('beforeExit', () => {
    clearInterval(cleanupInterval);
    prisma.$disconnect();
    prismaRO.$disconnect();
  });
}

// 🔥 HELPER: Ejecutar query con timeout automático
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10_000,
  errorMessage: string = 'Database query timeout'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}