'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface PaymentDetails {
  paymentId: string;
  amount: string;
  currency: string;
  planName: string;
  billingPeriod: string;
  status: string;
  paidAt: string;
  nextBillingDate: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push('/login');
      return;
    }

    const paymentId = searchParams.get('payment_id');
    
    if (!paymentId) {
      setError('No se encontró información del pago');
      setLoading(false);
      return;
    }

    // Obtener detalles del pago
    fetch(`/api/subscription/payment-details?payment_id=${paymentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPaymentDetails(data.payment);
        } else {
          setError(data.error || 'Error al cargar los detalles');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching payment details:', err);
        setError('Error al cargar los detalles del pago');
        setLoading(false);
      });
  }, [isLoaded, userId, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#D2691E] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/pricing"
            className="inline-block bg-[#D2691E] hover:bg-[#B8621E] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver a planes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Animación de éxito */}
        <div className="text-center mb-8 animate-slideUp">
          <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[#8B4513] mb-3">
            ¡Pago Exitoso! 🎉
          </h1>
          <p className="text-xl text-[#A0522D]">
            Tu suscripción ha sido activada correctamente
          </p>
        </div>

        {/* Detalles del pago */}
        {paymentDetails && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-fadeIn">
            {/* Header del plan */}
            <div className="bg-gradient-to-r from-[#D2691E] to-[#B8621E] text-white px-8 py-6">
              <h2 className="text-2xl font-bold mb-2">{paymentDetails.planName}</h2>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">
                  ${parseInt(paymentDetails.amount).toLocaleString('es-CL')}
                </span>
                <span className="text-white/80 ml-2">
                  {paymentDetails.currency} / {paymentDetails.billingPeriod === 'YEARLY' ? 'año' : 'mes'}
                </span>
              </div>
            </div>

            {/* Detalles */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID de Pago</p>
                  <p className="font-semibold text-gray-900">#{paymentDetails.paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estado</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Aprobado
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fecha de Pago</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(paymentDetails.paidAt).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Próximo Cobro</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(paymentDetails.nextBillingDate).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Beneficios activos */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ahora tienes acceso a:</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Casos clínicos ilimitados de todas las dificultades</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Estadísticas avanzadas de tu progreso</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Asistente de IA para resolver dudas</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Soporte prioritario</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/casos"
            className="bg-[#D2691E] hover:bg-[#B8621E] text-white font-semibold py-4 px-6 rounded-xl transition-all text-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Comenzar a Practicar
          </Link>
          <Link
            href="/profile"
            className="bg-white hover:bg-gray-50 text-[#8B4513] font-semibold py-4 px-6 rounded-xl transition-all text-center shadow-lg border-2 border-gray-200"
          >
            Ver Mi Suscripción
          </Link>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</p>
              <p className="text-sm text-blue-700">
                Recibirás un correo con los detalles de tu suscripción. Puedes cancelar en cualquier momento desde tu perfil.
                Si tienes dudas, contáctanos en <a href="mailto:soporte@klinikmat.cl" className="underline">soporte@klinikmat.cl</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#D2691E] mx-auto mb-4"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
