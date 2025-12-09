// lib/csrf-client.ts
// Funciones CSRF para el cliente (browser)
'use client';

const CSRF_TOKEN_NAME = 'csrf-token';

/**
 * Obtiene el token CSRF de las cookies del navegador
 * CLIENT-SIDE ONLY
 * 
 * Uso en fetch desde el cliente:
 * ```ts
 * const token = getCsrfTokenFromCookie();
 * fetch('/api/results', {
 *   method: 'POST',
 *   headers: {
 *     'x-csrf-token': token,
 *   },
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith(`${CSRF_TOKEN_NAME}=`));
  
  if (!csrfCookie) return null;
  
  return csrfCookie.split('=')[1];
}
