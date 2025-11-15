// auth.ts (CORREGIDO PARA EVITAR BUCLE INFINITO)

// auth.ts (CORREGIDO Y DEFINITIVO)

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import type { AuthConfig } from '@auth/core/types';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// 1. Inicializa la instancia completa de NextAuth.
// Create Prisma adapter
const baseAdapter = PrismaAdapter(prisma) as any;

// SECURITY: Override createVerificationToken to store only a SHA-256 hash
baseAdapter.createVerificationToken = async (tokenData: { identifier: string; token: string; expires: Date }) => {
  const tokenHash = crypto.createHash('sha256').update(tokenData.token).digest('hex');
  return prisma.verificationToken.create({ data: { identifier: tokenData.identifier, token: tokenHash, expires: tokenData.expires } });
};

// SECURITY: Override useVerificationToken to verify by hashing the incoming token
baseAdapter.useVerificationToken = async (tokenData: { identifier: string; token: string }) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(tokenData.token).digest('hex');
    const vt = await prisma.verificationToken.findFirst({ where: { identifier: tokenData.identifier, token: tokenHash } });
    if (!vt) return null;
    // delete token to prevent reuse
    await prisma.verificationToken.deleteMany({ where: { identifier: tokenData.identifier, token: tokenHash } });
    return { identifier: vt.identifier, token: vt.token, expires: vt.expires };
  } catch (e: any) {
    console.error('useVerificationToken error', e?.message || e);
    return null;
  }
};

// Minimal logging wrappers (no verbose token debug in production)
const origCreateUser = baseAdapter.createUser?.bind(baseAdapter);
if (origCreateUser) {
  baseAdapter.createUser = async (data: any) => {
    if (process.env.NODE_ENV !== 'production') console.debug('[auth][debug] createUser', { args: [data] });
    return origCreateUser(data);
  };
}

const origCreateSession = baseAdapter.createSession?.bind(baseAdapter);
if (origCreateSession) {
  baseAdapter.createSession = async (data: any) => {
    if (process.env.NODE_ENV !== 'production') console.debug('[auth][debug] createSession', { args: [data] });
    return origCreateSession(data);
  };
}

// Inicializa NextAuth usando la forma "lazy" para mantener compatibilidad con
// el runtime y permitir acceder al request si fuera necesario.
const NextAuthInstance = (NextAuth as any)((req: any) => {
  // Merge la configuración existente con los ajustes necesarios para Prisma
  const merged = {
    ...authConfig,
    secret: process.env.NEXTAUTH_SECRET,
    adapter: baseAdapter,
    session: { strategy: 'database' },
  } as AuthConfig;
  return merged;
});

// 4. Exporta handlers y helper mínimos usados por las rutas
export const handlers = NextAuthInstance.handlers;
export const auth = NextAuthInstance.auth;
export const signIn = NextAuthInstance.signIn;
export const signOut = NextAuthInstance.signOut;