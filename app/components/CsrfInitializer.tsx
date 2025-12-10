// app/components/CsrfInitializer.tsx
'use client';

import { useEffect } from 'react';
import { setCsrfTokenInMemory } from '@/lib/csrf-client';

/**
 * Componente que inicializa el token CSRF al cargar la aplicación
 * Hace un GET a /api/csrf que establece la cookie httpOnly
 * Y guarda el token en memoria para usarlo en requests
 */
export default function CsrfInitializer() {
  useEffect(() => {
    // Solo inicializar una vez al cargar la app
    fetch('/api/csrf', { credentials: 'include' })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            setCsrfTokenInMemory(data.token);
            console.log('✅ CSRF token initialized and stored');
          }
        }
      })
      .catch((error) => {
        console.error('❌ Failed to initialize CSRF token:', error);
      });
  }, []); // Solo ejecutar una vez

  return null; // Este componente no renderiza nada
}
