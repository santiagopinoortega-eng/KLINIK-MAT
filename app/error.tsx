// app/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div 
        className="max-w-md w-full p-8 rounded-2xl text-center"
        style={{
          background: 'white',
          border: '2px solid var(--km-cardinal)',
          boxShadow: '0 8px 32px rgba(165, 29, 42, 0.15)',
        }}
      >
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="var(--km-cardinal)"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 
          className="text-2xl font-bold mb-3"
          style={{ color: 'var(--km-cardinal)' }}
        >
          Algo salió mal
        </h2>

        <p 
          className="mb-6 text-sm leading-relaxed"
          style={{ color: 'var(--km-text-700)' }}
        >
          {error.message || 'Ocurrió un error inesperado. Nuestro equipo fue notificado automáticamente.'}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: 'var(--km-cardinal)',
              color: 'white',
            }}
          >
            Intentar nuevamente
          </button>

          <a
            href="/"
            className="px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: 'var(--km-beige)',
              color: 'var(--km-text-900)',
            }}
          >
            Volver al inicio
          </a>
        </div>

        {error.digest && (
          <p 
            className="mt-4 text-xs font-mono"
            style={{ color: 'var(--km-text-500)' }}
          >
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
