// middleware.ts
// VERSIÓN CORREGIDA Y DEFINITIVA (V5)

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// 1. IMPORTAR EL TIPO (Igual que en auth.ts)
//    Esto asegura que TypeScript sepa exactamente qué es authConfig.
import type { AuthConfig } from '@auth/core/types'; 

import { NextResponse } from 'next/server';
import { Role } from '@prisma/client'; // Importa tu Enum

// 2. HACER EL "CAST" (Igual que en auth.ts)
//    Pasamos la config con el tipo explícito.
const { auth } = NextAuth(authConfig as AuthConfig); 

/**
 * El middleware de V5 usa el helper 'auth'
 */
export default auth((req) => {
  // 3. 'req' ahora tendrá el tipo correcto, y 'req.auth' será reconocido
  //    (una vez que 'npm install' arregle las dependencias duplicadas).
  const token = req.auth?.user; 

  // 4. LÓGICA DE AUTORIZACIÓN (Roles)
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/admin')) {
    // Si intenta entrar a /admin pero no es Admin, lo negamos.
    if (token?.role !== Role.ADMIN) {
      return new NextResponse('Acceso Denegado: No eres Administrador', {
        status: 403,
      });
    }
  }

  // 5. SI LLEGA AQUÍ, ESTÁ AUTENTICADO Y AUTORIZADO
  // Dejamos que continúe a la página que solicitó (ej: /casos/123)
  return NextResponse.next();
});

// 6. EL MATCHER (Tu matcher original está bien)
export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas estas rutas protegidas:
     */
    '/casos/:path*', // Todas las páginas de casos individuales
    '/mi-progreso', // Una futura página de perfil/progreso
    '/admin/:path*', // Todas las rutas de administración
  ],
};