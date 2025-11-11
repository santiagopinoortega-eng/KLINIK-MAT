// app/middleware.ts
// app/middleware.ts
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/:path*'], // solo APIs
};

export function middleware() {
  // Aquí no aplicamos el rate-limit (lo hacemos en cada route),
  // pero este matcher te asegura que el middleware solo corre en /api/*
  return NextResponse.next();
}