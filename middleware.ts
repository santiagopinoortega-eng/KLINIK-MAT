// middleware.ts
// VERSIÓN CORRECTA PARA AUTH.JS (V5)

import NextAuth from 'next-auth';
// 1. Importa la configuración de V5 que creamos en la raíz
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client'; // Importa tu Enum

// 2. Obtiene la función 'auth' desde la configuración de V5
const { auth } = NextAuth(authConfig);

/**
 * El middleware de V5 usa el helper 'auth'
 */
export default auth((req) => {
  // 3. OBTENEMOS EL TOKEN (la sintaxis de V5 es diferente)
  // 'req.auth.user' existe si el usuario está logueado
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
// Aquí es donde le decimos al middleware en QUÉ RUTAS debe ejecutarse.
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