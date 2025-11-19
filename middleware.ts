// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define rutas protegidas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  '/casos(.*)',      // Requiere login para ver casos clínicos
  '/mi-progreso(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protege rutas que requieren autenticación
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};