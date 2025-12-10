// lib/fetch-with-csrf.ts
// Helper para hacer fetch con CSRF token automático
'use client';

import { getCsrfTokenFromCookie, setCsrfTokenInMemory } from './csrf-client';

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
  
  if (needsCsrf) {
    if (token) {
      headers.set('x-csrf-token', token);
      console.log('🔑 CSRF token added to request:', token.substring(0, 10) + '...');
    } else {
      console.warn('⚠️ No CSRF token available for', method, url);
    }
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
    let token = getCsrfTokenFromCookie();
    
    // Si no hay token, obtener uno nuevo
    if (!token) {
      console.log('🔑 No CSRF token found, fetching new one...');
      const csrfResponse = await fetch('/api/csrf', { 
        credentials: 'include',
        cache: 'no-store' 
      });
      
      if (!csrfResponse.ok) {
        console.error('❌ Failed to fetch CSRF endpoint:', csrfResponse.status);
        return {
          ok: false,
          error: 'No se pudo obtener el token de seguridad. Recarga la página.',
        };
      }
      
      // Leer el token del body de la respuesta
      const csrfData = await csrfResponse.json();
      token = csrfData.token;
      
      if (!token) {
        console.error('❌ CSRF token not in response');
        return {
          ok: false,
          error: 'No se pudo obtener el token de seguridad. Recarga la página.',
        };
      }
      
      // Guardar en memoria para próximas requests
      setCsrfTokenInMemory(token);
      console.log('✅ CSRF token obtained and stored in memory');
    }
    
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
        error: json.error || `Error ${response.status}: ${response.statusText}`,
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
    let token = getCsrfTokenFromCookie();
    console.log('🔧 patchJSON called:', { url, hasToken: !!token });
    
    // Si no hay token, obtener uno nuevo
    if (!token) {
      console.log('🔑 No CSRF token found, fetching new one...');
      const csrfResponse = await fetch('/api/csrf', { 
        credentials: 'include',
        cache: 'no-store' 
      });
      
      if (!csrfResponse.ok) {
        console.error('❌ Failed to fetch CSRF endpoint:', csrfResponse.status);
        return {
          ok: false,
          error: 'No se pudo obtener el token de seguridad. Recarga la página.',
        };
      }
      
      // Leer el token del body de la respuesta
      const csrfData = await csrfResponse.json();
      token = csrfData.token;
      console.log('🔍 CSRF response:', { hasToken: !!token, tokenPreview: token?.substring(0, 10) });
      
      if (!token) {
        console.error('❌ CSRF token not in response');
        return {
          ok: false,
          error: 'No se pudo obtener el token de seguridad. Recarga la página.',
        };
      }
      
      // Guardar en memoria para próximas requests
      setCsrfTokenInMemory(token);
      console.log('✅ CSRF token obtained and stored in memory');
    } else {
      console.log('✅ Using existing token from memory');
    }
    
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
        error: json.error || `Error ${response.status}: ${response.statusText}`,
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
    let token = getCsrfTokenFromCookie();
    
    // Si no hay token, obtener uno nuevo
    if (!token) {
      console.log('🔑 No CSRF token found, fetching new one...');
      const csrfResponse = await fetch('/api/csrf', { 
        credentials: 'include',
        cache: 'no-store' 
      });
      
      if (!csrfResponse.ok) {
        console.error('❌ Failed to fetch CSRF endpoint:', csrfResponse.status);
        return {
          ok: false,
          error: 'No se pudo obtener el token de seguridad. Recarga la página.',
        };
      }
      
      // Leer el token del body de la respuesta
      const csrfData = await csrfResponse.json();
      token = csrfData.token;
      
      if (!token) {
        console.error('❌ CSRF token not in response');
        return {
          ok: false,
          error: 'No se pudo obtener el token de seguridad. Recarga la página.',
        };
      }
      
      // Guardar en memoria para próximas requests
      setCsrfTokenInMemory(token);
      console.log('✅ CSRF token obtained and stored in memory');
    }
    
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
