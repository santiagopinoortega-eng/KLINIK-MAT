// lib/env.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
};
if (!env.DATABASE_URL) throw new Error('DATABASE_URL no definida');
if (!env.NEXT_PUBLIC_SITE_URL) throw new Error('NEXT_PUBLIC_SITE_URL no definida');