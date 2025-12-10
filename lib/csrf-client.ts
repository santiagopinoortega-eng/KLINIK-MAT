// lib/csrf-client.ts
// Funciones CSRF para el cliente (browser)
'use client';

const CSRF_TOKEN_NAME = 'csrf-token';

// Token en memoria (más seguro que localStorage y funciona con httpOnly cookies)
let csrfTokenInMemory: string | null = null;

/**
 * Obtiene el token CSRF de las cookies del navegador
 * CLIENT-SIDE ONLY
 * 
 * Como la cookie es httpOnly (no accesible desde JS), intentamos:
 * 1. Leer de memoria (si ya lo obtuvimos)
 * 2. Leer de cookie (si no es httpOnly)
 */
export function getCsrfTokenFromCookie(): string | null {
  // Primero intentar desde memoria
  if (csrfTokenInMemory) {
    console.log('🔍 Token found in memory:', csrfTokenInMemory.substring(0, 10) + '...');
    return csrfTokenInMemory;
  }
  
  console.log('⚠️ No token in memory, trying cookie...');
  
  // Si no está en memoria, intentar leer de cookie (por si acaso no es httpOnly)
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith(`${CSRF_TOKEN_NAME}=`));
  
  if (!csrfCookie) {
    console.log('❌ No CSRF cookie found');
    return null;
  }
  
  const tokenFromCookie = csrfCookie.split('=')[1];
  console.log('📝 Token found in cookie:', tokenFromCookie?.substring(0, 10) + '...');
  return tokenFromCookie;
}

/**
 * Guarda el token CSRF en memoria
 * CLIENT-SIDE ONLY
 */
export function setCsrfTokenInMemory(token: string): void {
  csrfTokenInMemory = token;
  console.log('💾 Token saved in memory:', token.substring(0, 10) + '...');
}

/**
 * Limpia el token CSRF de memoria
 * CLIENT-SIDE ONLY
 */
export function clearCsrfToken(): void {
  csrfTokenInMemory = null;
}
