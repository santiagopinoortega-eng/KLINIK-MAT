// lib/fetch-with-csrf.ts
// Helper para hacer fetch con CSRF token automático
'use client';

import { getCsrfTokenFromCookie } from './csrf-client';

/**
 * Fetch con CSRF token automático
 * Wrapper de fetch() nativo que agrega el header x-csrf-token automáticamente
 */
export async function fetchWithCsrf(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const token = getCsrfTokenFromCookie();
  
  // Solo agregar CSRF token en métodos de mutación
  const method = options?.method?.toUpperCase() || 'GET';
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  const headers = new Headers(options?.headers || {});
  
  if (needsCsrf && token) {
    headers.set('x-csrf-token', token);
  }

  // Asegurar Content-Type para JSON
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper para POST con JSON + CSRF
 */
export async function postJSON<T = any>(
  url: string,
  data: any
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const response = await fetchWithCsrf(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: json.error || `Error ${response.status}`,
      };
    }

    return {
      ok: true,
      data: json,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Helper para PATCH con JSON + CSRF
 */
export async function patchJSON<T = any>(
  url: string,
  data: any
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const response = await fetchWithCsrf(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: json.error || `Error ${response.status}`,
      };
    }

    return {
      ok: true,
      data: json,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Helper para DELETE con CSRF
 */
export async function deleteRequest<T = any>(
  url: string
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const response = await fetchWithCsrf(url, {
      method: 'DELETE',
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: json.error || `Error ${response.status}`,
      };
    }

    return {
      ok: true,
      data: json,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
