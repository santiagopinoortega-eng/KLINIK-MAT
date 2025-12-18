'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

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

export default function PricingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

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

  const handleSubscribe = async (planId: string) => {
    if (!isLoaded || !userId) {
      router.push('/login');
      return;
    }

    setProcessingPlan(planId);

    try {
      const response = await fetch('/api/subscription/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo crear el pago'}`);
        setProcessingPlan(null);
        return;
      }

      const { initPoint } = await response.json();
      
      // Redirigir a Mercado Pago
      window.location.href = initPoint;
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al crear el pago. Intenta nuevamente.');
      setProcessingPlan(null);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#8B4513] mb-4">
            Planes de Suscripción
          </h1>
          <p className="text-xl text-[#A0522D]">
            Elige el plan perfecto para tu preparación médica
          </p>
        </div>

        {/* Plans mensual */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[#8B4513] mb-6 text-center">
            Planes Mensuales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {monthlyPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-xl p-8 relative ${
                  plan.name === 'PREMIUM'
                    ? 'ring-4 ring-[#D2691E] transform scale-105'
                    : ''
                }`}
              >
                {plan.name === 'PREMIUM' && (
                  <div className="absolute top-0 right-0 bg-[#D2691E] text-white px-4 py-1 rounded-bl-lg rounded-tr-lg font-semibold">
                    Recomendado
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#8B4513] mb-2">
                    {plan.displayName}
                  </h3>
                  <div className="text-4xl font-bold text-[#D2691E] mb-2">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-gray-600">por mes</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {getFeatureList(plan).map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processingPlan === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                    plan.name === 'FREE'
                      ? 'bg-gray-500 hover:bg-gray-600'
                      : plan.name === 'PREMIUM'
                      ? 'bg-[#D2691E] hover:bg-[#B8621E]'
                      : 'bg-[#A0522D] hover:bg-[#8B4513]'
                  } ${
                    processingPlan === plan.id
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {processingPlan === plan.id
                    ? 'Procesando...'
                    : plan.name === 'FREE'
                    ? 'Plan Actual'
                    : 'Suscribirse'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Plans anuales */}
        {yearlyPlans.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-[#8B4513] mb-6 text-center">
              Planes Anuales
              <span className="ml-3 text-lg text-green-600 font-bold">
                ¡Ahorra 15%!
              </span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {yearlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow-xl p-8 border-2 border-green-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-[#8B4513]">
                      {plan.displayName}
                    </h3>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {getSavings(plan)}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-[#D2691E] mb-2">
                      {formatPrice(plan.price)}
                    </div>
                    <div className="text-gray-600">por año</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatPrice(String(parseFloat(plan.price) / 12))} /mes
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {getFeatureList(plan).map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processingPlan === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all bg-green-600 hover:bg-green-700 ${
                      processingPlan === plan.id
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {processingPlan === plan.id
                      ? 'Procesando...'
                      : 'Suscribirse Anual'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-[#8B4513] mb-6">
            Preguntas Frecuentes
          </h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold mb-2">¿Cómo funciona el período de prueba?</p>
              <p className="text-sm">
                Los planes Básico y Premium incluyen 14 días gratis. Puedes
                cancelar en cualquier momento durante el trial sin cargos.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">¿Puedo cambiar de plan?</p>
              <p className="text-sm">
                Sí, puedes cambiar de plan en cualquier momento desde tu panel
                de usuario.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">¿Qué métodos de pago aceptan?</p>
              <p className="text-sm">
                Aceptamos todas las tarjetas de crédito y débito a través de
                Mercado Pago (Visa, Mastercard, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
