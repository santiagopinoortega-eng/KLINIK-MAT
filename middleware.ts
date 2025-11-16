// middleware.ts
// Middleware ligera que evita importar la configuración completa
// de NextAuth (que podría arrastrar nodemailer al bundle Edge).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Matcher: rutas protegidas por sesión
// Nota: `/casos` se deja público según decisión del producto.
const PROTECTED_PATHS = ['/mi-progreso', '/admin'];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  // No hacer nada para assets, api u otras rutas públicas
  if (!isProtectedPath(pathname)) return NextResponse.next();

  // Comprobación ligera: presencia de cookie de sesión
  // Este middleware es deliberadamente simple para evitar
  // cargar librerías Node-only en el runtime Edge.
  const sessionCookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  const token = cookies.get(sessionCookieName)?.value;

  if (!token) {
    // Redirigir al login si no hay token
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/mi-progreso',
    '/admin/:path*',
  ],
};