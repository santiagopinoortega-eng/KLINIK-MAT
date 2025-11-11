// /lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaRO?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : (['error'] as const),
  });

export const prismaRO =
  globalForPrisma.prismaRO ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_READONLY || process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'production' ? [] : (['error'] as const),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaRO = prismaRO;
}