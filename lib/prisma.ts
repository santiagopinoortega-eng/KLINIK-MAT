// /lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declaramos una variable global para almacenar la instancia de Prisma.
// Esto es clave para evitar crear nuevas conexiones en cada hot-reload en desarrollo.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRO: PrismaClient | undefined;
};

// Exportamos una única instancia de PrismaClient.
// Si ya existe en el objeto global, la reutilizamos. Si no, creamos una nueva.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Opcional: Log de errores en desarrollo. En producción, es mejor usar un servicio de logging.
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

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