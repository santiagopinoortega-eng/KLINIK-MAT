// app/subscription/failure/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FailureContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icono de error */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago no completado
        </h1>
        
        <p className="text-gray-600 mb-6">
          No pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, datos incorrectos o un problema con tu método de pago.
        </p>

        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left">
            <p className="text-gray-500 mb-1">ID de referencia:</p>
            <p className="font-mono text-gray-800">{paymentId}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Intentar nuevamente
          </Link>
          
          <Link
            href="/areas"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Problemas comunes:
          </p>
          <ul className="text-sm text-gray-600 text-left space-y-2">
            <li>• Verifica que tu tarjeta tenga fondos</li>
            <li>• Confirma que los datos sean correctos</li>
            <li>• Intenta con otro método de pago</li>
          </ul>
          
          <div className="mt-4">
            <Link
              href="mailto:soporte@klinikmat.cl"
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Contactar soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}
