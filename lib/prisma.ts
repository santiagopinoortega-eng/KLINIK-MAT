// /lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declaramos una variable global para almacenar la instancia de Prisma.
// Esto es clave para evitar crear nuevas conexiones en cada hot-reload en desarrollo.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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