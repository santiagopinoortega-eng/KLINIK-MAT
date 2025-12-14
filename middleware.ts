// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define rutas protegidas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  '/areas(.*)',      // Requiere login para elegir áreas
  '/casos(.*)',      // Requiere login para ver casos clínicos
  '/mi-progreso(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protege rutas que requieren autenticación
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Agregar headers de seguridad y optimización
  const response = NextResponse.next();
  
  // Security headers (compatibles con Clerk/Turnstile)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // X-Frame-Options removido - interfiere con Clerk/Turnstile
  // En su lugar, usa CSP frame-ancestors en next.config.mjs
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};