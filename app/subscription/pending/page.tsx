// app/subscription/pending/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PendingContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icono de pendiente */}
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago en proceso
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Esto puede tomar unos minutos dependiendo del método de pago seleccionado.
        </p>

        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left">
            <p className="text-gray-500 mb-1">ID de pago:</p>
            <p className="font-mono text-gray-800">{paymentId}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            ℹ️ Te enviaremos un correo cuando el pago sea confirmado.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/areas"
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Métodos de pago que pueden demorar:
          </p>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• Efectivo (PagoFácil, Rapipago)</li>
            <li>• Transferencia bancaria</li>
            <li>• Débito automático</li>
          </ul>
          
          <div className="mt-4">
            <Link
              href="mailto:soporte@klinikmat.cl"
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              ¿Tienes dudas? Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
