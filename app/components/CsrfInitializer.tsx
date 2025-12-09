// app/components/CsrfInitializer.tsx
'use client';

import { useEffect } from 'react';

/**
 * Componente que inicializa el token CSRF al cargar la aplicación
 * Hace un GET a /api/csrf que establece la cookie httpOnly
 */
export default function CsrfInitializer() {
  useEffect(() => {
    // Solo inicializar una vez al cargar la app
    fetch('/api/csrf', { credentials: 'include' })
      .then(() => {
        console.log('✅ CSRF token initialized');
      })
      .catch((error) => {
        console.error('❌ Failed to initialize CSRF token:', error);
      });
  }, []); // Solo ejecutar una vez

  return null; // Este componente no renderiza nada
}
