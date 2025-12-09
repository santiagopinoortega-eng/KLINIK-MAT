// lib/csrf.ts
// CSRF Protection usando Double Submit Cookie pattern
// Genera un token aleatorio que debe coincidir entre cookie y header

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Genera un token CSRF aleatorio
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Obtiene el token CSRF de las cookies o crea uno nuevo
 * SERVER-SIDE ONLY
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  if (!token) {
    token = generateToken();
  }

  return token;
}

/**
 * Valida el token CSRF comparando cookie vs header
 * SERVER-SIDE ONLY
 * Retorna true si es válido, false si no
 */
export async function validateCsrfToken(req: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  // Ambos deben existir y coincidir
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Comparación timing-safe para prevenir timing attacks
  return timingSafeEqual(cookieToken, headerToken);
}

/**
 * Middleware para validar CSRF en requests mutantes (POST, PUT, PATCH, DELETE)
 * SERVER-SIDE ONLY
 * Usar en API routes que modifican datos
 */
export async function requireCsrfToken(req: Request): Promise<NextResponse | null> {
  const method = req.method.toUpperCase();
  
  // Solo validar en métodos que modifican datos
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null; // No validar GET, HEAD, OPTIONS
  }

  const isValid = await validateCsrfToken(req);

  if (!isValid) {
    return NextResponse.json(
      { error: 'Token CSRF inválido o faltante' },
      { status: 403 }
    );
  }

  return null; // Validación exitosa
}

/**
 * Helper para agregar token CSRF a respuestas
 * SERVER-SIDE ONLY
 * Usar en GET de páginas que harán POST/PUT/PATCH/DELETE
 */
export async function setCsrfCookie(response: NextResponse): Promise<NextResponse> {
  const token = generateToken();
  
  response.cookies.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 horas
    path: '/',
  });

  return response;
}

/**
 * Comparación timing-safe de strings para prevenir timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
