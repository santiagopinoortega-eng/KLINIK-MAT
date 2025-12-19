'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import MercadoPagoCheckout from '../components/MercadoPagoCheckout';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: string;
  billingPeriod: string;
  description: string;
  features: Record<string, boolean>;
  maxCasesPerMonth: number | null;
  hasAI: boolean;
  hasAdvancedStats: boolean;
  hasPrioritySupport: boolean;
  trialDays: number;
  isActive: boolean;
}

type CheckoutStep = 'plans' | 'confirm' | 'payment';

export default function PricingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('plans');

  useEffect(() => {
    fetch('/api/subscription/plans')
      .then((res) => res.json())
      .then((data) => {
        console.log('📦 Plans data received:', data);
        // El endpoint devuelve { success: true, plans: [...] }
        const plansList = data.plans || [];
        console.log('📋 Plans array:', plansList, 'Length:', plansList.length);
        setPlans(plansList);
        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ Error loading plans:', error);
        setLoading(false);
      });
  }, []);

  const handleSelectPlan = (planId: string) => {
    if (!isLoaded || !userId) {
      router.push('/login');
      return;
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    setSelectedPlan(plan);
    setCheckoutStep('confirm');
  };

  const handleConfirmPlan = () => {
    setCheckoutStep('payment');
  };

  const handleBackToPlans = () => {
    setCheckoutStep('plans');
    setSelectedPlan(null);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('✅ Payment successful:', paymentId);
    setSelectedPlan(null);
    setCheckoutStep('plans');
    router.push(`/subscription/success?payment_id=${paymentId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment error:', error);
    alert(`Error: ${error}`);
    setCheckoutStep('confirm');
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getFeatureList = (plan: Plan) => {
    const features = [];
    
    if (plan.maxCasesPerMonth === null || plan.maxCasesPerMonth < 0) {
      features.push('Casos clínicos ilimitados');
    } else {
      features.push(`${plan.maxCasesPerMonth} casos clínicos por mes`);
    }

    if (plan.hasAI) {
      features.push('Asistente IA incluido');
    } else {
      features.push('Sin acceso a IA');
    }

    if (plan.hasAdvancedStats) {
      features.push('Estadísticas avanzadas');
    }
    if (plan.hasPrioritySupport) {
      features.push('Soporte prioritario');
    }

    if (plan.trialDays > 0) {
      features.push(`🎁 ${plan.trialDays} días de prueba gratis`);
    }

    return features;
  };

  const getSavings = (plan: Plan) => {
    if (plan.billingPeriod === 'YEARLY') {
      return '15% de descuento';
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] flex items-center justify-center">
        <div className="text-2xl text-[#8B4513]">Cargando planes...</div>
      </div>
    );
  }

  const monthlyPlans = plans.filter((p) => p.billingPeriod === 'MONTHLY');
  const yearlyPlans = plans.filter((p) => p.billingPeriod === 'YEARLY');

  // Renderizado del paso de confirmación
  const renderConfirmStep = () => {
    if (!selectedPlan) return null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header con botón de volver */}
          <button
            onClick={handleBackToPlans}
            className="mb-6 flex items-center text-[#8B4513] hover:text-[#A0522D] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a planes
          </button>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header del plan */}
            <div className="bg-gradient-to-r from-[#D2691E] to-[#B8621E] text-white p-8">
              <h2 className="text-3xl font-bold mb-2">{selectedPlan.displayName}</h2>
              <p className="text-white/90">Confirma tu suscripción</p>
            </div>

            {/* Detalles del plan */}
            <div className="p-8">
              <div className="mb-8">
                <div className="flex justify-between items-baseline mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <span className="text-gray-600">Total a pagar</span>
                    <div className="text-4xl font-bold text-[#8B4513] mt-1">
                      {formatPrice(selectedPlan.price)}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {selectedPlan.billingPeriod === 'YEARLY' ? 'por año' : 'por mes'}
                    </span>
                  </div>
                  {selectedPlan.billingPeriod === 'YEARLY' && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                      Ahorras 15%
                    </div>
                  )}
                </div>

                {selectedPlan.trialDays > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-blue-900">Prueba gratis por {selectedPlan.trialDays} días</p>
                        <p className="text-sm text-blue-700 mt-1">
                          No se te cobrará hasta {new Date(Date.now() + selectedPlan.trialDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL')}. Cancela cuando quieras.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4">Incluye:</h3>
                  {getFeatureList(selectedPlan).map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de continuar */}
              <button
                onClick={handleConfirmPlan}
                className="w-full bg-[#D2691E] hover:bg-[#B8621E] text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Continuar al pago
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al continuar, aceptas nuestros términos y condiciones de servicio
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {checkoutStep === 'confirm' && renderConfirmStep()}
      {checkoutStep === 'payment' && selectedPlan && (
        <MercadoPagoCheckout
          planId={selectedPlan.id}
          planName={selectedPlan.displayName}
          amount={parseFloat(selectedPlan.price)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => setCheckoutStep('confirm')}
        />
      )}
      {checkoutStep === 'plans' && (
        <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-[#8B4513] mb-4 tracking-tight">
                Elige tu plan
              </h1>
              <p className="text-xl text-[#A0522D] max-w-2xl mx-auto">
                Accede a casos clínicos ilimitados y mejora tu preparación médica
              </p>
            </div>

        {/* Plans mensual */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-[#8B4513] mb-8 text-center">
            Planes Mensuales
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {monthlyPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] ${
                  plan.name === 'PREMIUM'
                    ? 'ring-2 ring-[#D2691E] transform scale-[1.03]'
                    : ''
                }`}
              >
                {plan.name === 'PREMIUM' && (
                  <div className="bg-gradient-to-r from-[#D2691E] to-[#B8621E] text-white px-4 py-2 text-center font-semibold text-sm">
                    ⭐ Más Popular
                  </div>
                )}

                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#8B4513] mb-4">
                      {plan.displayName}
                    </h3>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-[#8B4513]">
                        {formatPrice(plan.price).split(',')[0]}
                      </span>
                      <span className="text-gray-600 ml-2">/mes</span>
                    </div>
                  </div>

                  {plan.trialDays > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                      <p className="text-sm text-green-800 font-semibold">
                        🎁 {plan.trialDays} días gratis
                      </p>
                    </div>
                  )}

                  <ul className="space-y-3 mb-8 min-h-[180px]">
                    {getFeatureList(plan).map((feature, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={plan.name === 'FREE'}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] ${
                      plan.name === 'FREE'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : plan.name === 'PREMIUM'
                        ? 'bg-[#D2691E] hover:bg-[#B8621E] shadow-lg shadow-[#D2691E]/30'
                        : 'bg-[#A0522D] hover:bg-[#8B4513] shadow-lg'
                    }`}
                  >
                    {plan.name === 'FREE' ? 'Plan Gratuito' : 'Elegir Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans anuales */}
        {yearlyPlans.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-2">
                Planes Anuales
              </h2>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Ahorra hasta 15% con pago anual
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {yearlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-green-500 transition-all hover:shadow-2xl hover:scale-[1.02]"
                >
                  <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 text-center font-semibold">
                    💰 Mejor Valor - Ahorra {getSavings(plan)}
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#8B4513] mb-6">
                      {plan.displayName}
                    </h3>

                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-[#8B4513]">
                          {formatPrice(plan.price).split(',')[0]}
                        </span>
                        <span className="text-gray-600 ml-2">/año</span>
                      </div>
                      <p className="text-center text-gray-500 mt-2">
                        Equivale a {formatPrice(String(parseFloat(plan.price) / 12))}/mes
                      </p>
                    </div>

                    {plan.trialDays > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-green-800 font-semibold text-center">
                          🎁 {plan.trialDays} días gratis para probar
                        </p>
                      </div>
                    )}

                    <ul className="space-y-3 mb-8">
                      {getFeatureList(plan).map((feature, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 transform hover:scale-[1.02]"
                    >
                      Elegir Plan Anual
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección de confianza */}
        <div className="mt-16 mb-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-[#D2691E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-[#8B4513] mb-2">Pago Seguro</h4>
              <p className="text-sm text-gray-600">Protección con Mercado Pago</p>
            </div>
            <div>
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-[#D2691E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-[#8B4513] mb-2">Cancela Cuando Quieras</h4>
              <p className="text-sm text-gray-600">Sin compromisos ni penalizaciones</p>
            </div>
            <div>
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-[#D2691E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-[#8B4513] mb-2">Acceso Inmediato</h4>
              <p className="text-sm text-gray-600">Comienza a practicar al instante</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-[#8B4513] mb-6 text-center">
            Preguntas Frecuentes
          </h3>
          <div className="space-y-6 text-gray-700">
            <div className="pb-6 border-b border-gray-200">
              <p className="font-semibold text-lg text-[#8B4513] mb-2">
                ¿Cómo funciona el período de prueba?
              </p>
              <p className="text-sm">
                Los planes Básico y Premium incluyen 14 días gratis. No se te cobrará
                nada durante el trial y puedes cancelar en cualquier momento sin cargos.
              </p>
            </div>
            <div className="pb-6 border-b border-gray-200">
              <p className="font-semibold text-lg text-[#8B4513] mb-2">
                ¿Puedo cambiar de plan después?
              </p>
              <p className="text-sm">
                Sí, puedes actualizar o cambiar de plan en cualquier momento desde tu
                panel de usuario. Los cambios se aplican inmediatamente.
              </p>
            </div>
            <div className="pb-6 border-b border-gray-200">
              <p className="font-semibold text-lg text-[#8B4513] mb-2">
                ¿Qué métodos de pago aceptan?
              </p>
              <p className="text-sm">
                Aceptamos todas las tarjetas de crédito y débito a través de Mercado Pago
                (Visa, Mastercard, American Express, etc.). Pagos 100% seguros.
              </p>
            </div>
            <div>
              <p className="font-semibold text-lg text-[#8B4513] mb-2">
                ¿Cómo cancelo mi suscripción?
              </p>
              <p className="text-sm">
                Puedes cancelar desde tu perfil en cualquier momento. Tu acceso continuará
                hasta el final del período que ya pagaste. Sin preguntas, sin complicaciones.
              </p>
            </div>
          </div>
        </div>
          </div>
        </div>
      )}
    </>
  );
}
