// auth.ts (CORREGIDO PARA EVITAR BUCLE INFINITO)

// auth.ts (CORREGIDO Y DEFINITIVO)

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import type { AuthConfig } from '@auth/core/types';

// 💡 IMPORTACIONES FALTANTES AÑADIDAS:
import { PrismaAdapter } from '@auth/prisma-adapter'; 
import { prisma } from '@/lib/prisma'; // Asegúrate de que esta ruta sea correcta: '@/lib/prisma'

// 1. Inicializa la instancia completa de NextAuth.
const NextAuthInstance = NextAuth({
  secret: process.env.AUTH_SECRET, 
  
  // 2. AÑADE EL ADAPTADOR Y LA ESTRATEGIA DE SESIÓN (SOLUCIÓN AL MissingAdapter)
  adapter: PrismaAdapter(prisma), // ✅ ESTO YA FUNCIONARÁ CON LA IMPORTACIÓN
  session: { strategy: 'database' }, 
  
  // 3. AÑADE EL RESTO DE LA CONFIGURACIÓN (El spread es necesario, y asumimos que
  //    la configuración de recursividad se resolvió en auth.config.ts)
  ...authConfig 
  
} as AuthConfig);

// 4. Exporta las propiedades clave
export const handlers = NextAuthInstance.handlers; 
export const auth = NextAuthInstance.auth;
export const signIn = NextAuthInstance.signIn;
export const signOut = NextAuthInstance.signOut;