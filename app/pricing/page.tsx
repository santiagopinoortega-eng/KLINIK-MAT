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
    
    // Casos clínicos ilimitados
    features.push('✅ Casos clínicos ilimitados (6 áreas)');
    
    // Áreas incluidas
    features.push('📚 Embarazo y Control Prenatal');
    features.push('📚 Parto y Atención Intraparto');
    features.push('📚 Puerperio y Lactancia');
    features.push('📚 Ginecología');
    features.push('📚 Salud Sexual y Anticoncepción');
    features.push('📚 Neonatología / Recién Nacido');
    
    // Recursos incluidos
    features.push('💊 Guía interactiva de anticonceptivos');
    features.push('📋 Normativas MINSAL actualizadas');
    features.push('🔬 Búsqueda PubMed integrada');
    
    // Características del plan
    features.push('📊 Estadísticas avanzadas de progreso');
    features.push('📄 Exportar reportes a PDF');
    features.push('💾 Modo offline disponible');
    
    // Soporte prioritario para planes trimestrales y anuales
    if (plan.billingPeriod === 'QUARTERLY' || plan.billingPeriod === 'BIANNUAL') {
      features.push('⭐ Soporte prioritario');
    }
    
    // Acceso anticipado para plan anual
    if (plan.billingPeriod === 'BIANNUAL') {
      features.push('🎯 Acceso anticipado a nuevas funcionalidades');
      features.push('🎓 Certificado de estudios descargable');
    }

    // Período de prueba
    if (plan.trialDays > 0) {
      features.push(`🎁 ${plan.trialDays} días de prueba gratis`);
    }

    return features;
  };

  const getPlanDuration = (billingPeriod: string) => {
    switch (billingPeriod) {
      case 'MONTHLY':
        return '1 mes';
      case 'QUARTERLY':
        return '3 meses';
      case 'BIANNUAL':
        return '6 meses';
      case 'YEARLY':
        return '12 meses';
      default:
        return '1 mes';
    }
  };

  const getDiscountInfo = (plan: Plan) => {
    const monthlyPrice = 4990;
    if (plan.billingPeriod === 'QUARTERLY') {
      const normalPrice = monthlyPrice * 3; // $14,970
      const savings = normalPrice - parseFloat(plan.price); // $3,740
      const discount = 25; // 25%
      return { savings, discount, show: true };
    }
    if (plan.billingPeriod === 'BIANNUAL') {
      const normalPrice = monthlyPrice * 6; // $29,940
      const savings = normalPrice - parseFloat(plan.price); // $5,240
      const discount = 17; // 17%
      return { savings, discount, show: true };
    }
    return { savings: 0, discount: 0, show: false };
  };

  // Filtrar todos los planes activos (sin separar por período)
  const activePlans = plans.filter((p) => p.isActive);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] flex items-center justify-center">
        <div className="text-2xl text-[#8B4513]">Cargando planes...</div>
      </div>
    );
  }

  if (checkoutStep === 'confirm') {
    return renderConfirmStep();
  }

  if (checkoutStep === 'payment' && selectedPlan) {
    return (
      <MercadoPagoCheckout
        planId={selectedPlan.id}
        planName={selectedPlan.displayName}
        amount={parseFloat(selectedPlan.price)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onClose={() => setCheckoutStep('confirm')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Clínico Profesional */}
            <div className="text-center mb-16">
              {/* Badge de oferta con animación */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 text-white px-6 py-2.5 rounded-full text-sm font-bold mb-6 shadow-lg animate-pulse">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                🔥 Oferta Especial • Ahorra hasta 25% • Cupos Limitados
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                Invierte en tu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
                  Formación Profesional
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Casos clínicos especializados, recursos actualizados y herramientas diseñadas para matronas/es en formación
              </p>
              
              {/* Indicador de ahorro máximo */}
              <div className="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-xl border-2 border-green-200 shadow-md">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <div className="text-sm text-gray-600 font-medium">Ahorra hasta</div>
                  <div className="text-lg font-bold text-green-700">$5.240 CLP en plan semestral</div>
                </div>
              </div>
            </div>

        {/* Grid de Planes - Diseño Clínico Moderno con mejor espaciado */}
        <div className="mb-20">
          {/* Tabla comparativa de precios destacada */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 max-w-5xl mx-auto border-2 border-red-100">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Comparación de Planes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Plan</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Duración</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Precio Total</th>
                    <th className="text-center py-3 px-4 font-bold text-red-700">Descuento</th>
                    <th className="text-center py-3 px-4 font-bold text-green-700">Valor/Mes</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlans.map((plan) => {
                    const discountInfo = getDiscountInfo(plan);
                    const monthlyEquivalent = plan.billingPeriod === 'MONTHLY' ? parseFloat(plan.price) :
                                             plan.billingPeriod === 'QUARTERLY' ? parseFloat(plan.price) / 3 :
                                             parseFloat(plan.price) / 6; // 6 meses, no 9
                    const isBest = plan.billingPeriod === 'BIANNUAL';
                    const isFree = plan.name === 'FREE';
                    
                    return (
                      <tr key={plan.id} className={`border-b border-gray-100 hover:bg-red-50/30 transition-colors ${isBest ? 'bg-red-50/50' : ''}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{plan.displayName}</span>
                            {isBest && (
                              <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-bold">MEJOR VALOR</span>
                            )}
                            {isFree && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">GRATIS</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-4 px-4 text-gray-700">{isFree ? 'Ilimitado' : getPlanDuration(plan.billingPeriod)}</td>
                        <td className="text-center py-4 px-4 font-bold text-gray-900">{isFree ? 'Gratis' : formatPrice(plan.price)}</td>
                        <td className="text-center py-4 px-4">
                          {discountInfo.show ? (
                            <span className="font-bold text-red-600">{discountInfo.discount}%</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-center py-4 px-4">
                          {isFree ? (
                            <span className="text-sm text-gray-500">10 casos/mes</span>
                          ) : (
                            <span className="font-bold text-green-700">
                              ${Math.round(monthlyEquivalent).toLocaleString('es-CL')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjetas de planes con mejor diseño */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {activePlans.map((plan) => {
              const discountInfo = getDiscountInfo(plan);
              const isBestValue = plan.billingPeriod === 'BIANNUAL'; // 6 meses - DESTACAR
              const isPopular = plan.billingPeriod === 'QUARTERLY';
              const isFree = plan.name === 'FREE';
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-3xl overflow-visible transition-all duration-500 flex flex-col transform hover:-translate-y-3 hover:shadow-2xl ${
                    isFree
                      ? 'border-2 border-blue-300 shadow-lg hover:shadow-xl'
                      : isBestValue
                      ? 'ring-4 ring-red-600 shadow-2xl shadow-red-300/50 scale-105 z-20'
                      : isPopular
                      ? 'ring-2 ring-red-400/50 shadow-xl shadow-red-100/50'
                      : 'shadow-xl hover:shadow-2xl border-2 border-gray-200'
                  }`}
                >
                {/* Badge Superior - Destacar mejor plan o marcar FREE */}
                {isFree && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 border-2 border-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm uppercase tracking-wide">100% Gratis</span>
                    </div>
                  </div>
                )}
                {isBestValue && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-8 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 border-2 border-white">
                        <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm uppercase tracking-wide">Mejor Oferta</span>
                      </div>
                      {/* Efecto de pulso para llamar más la atención */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-full animate-ping opacity-20"></div>
                    </div>
                  </div>
                )}
                
                {/* Header del plan con gradiente rojo mejorado */}
                <div className={`px-8 pt-12 pb-8 ${
                  isFree
                    ? 'bg-gradient-to-br from-blue-100 via-blue-50 to-white'
                    : isBestValue 
                    ? 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white' 
                    : isPopular
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100'
                }`}>
                  {/* Badge de descuento prominente mejorado */}
                  {discountInfo.show && !isFree && (
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
                        isBestValue 
                          ? 'bg-white/20 text-white backdrop-blur-sm ring-2 ring-white/40 animate-pulse' 
                          : 'bg-white/95 text-red-700 ring-2 ring-red-200'
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        <span>AHORRA {discountInfo.discount}%</span>
                      </div>
                    </div>
                  )}
                  
                  <h3 className={`text-2xl font-bold mb-3 ${
                    isFree ? 'text-blue-800' : (isBestValue || isPopular ? 'text-white' : 'text-gray-800')
                  }`}>
                    {plan.displayName}
                  </h3>
                  
                  {/* Precio destacado con mejor tipografía */}
                  <div className="flex items-baseline justify-center gap-2 mb-3">
                    {isFree ? (
                      <span className="text-5xl font-black tracking-tight text-blue-800">Gratis</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold">$</span>
                        <span className={`text-5xl font-black tracking-tight ${
                          isBestValue || isPopular ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatPrice(plan.price).split(',')[0]}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className={`text-sm font-medium mb-2 ${
                    isFree ? 'text-blue-700' : (isBestValue || isPopular ? 'text-white/90' : 'text-gray-600')
                  }`}>
                    {isFree ? 'Para siempre' : `por ${getPlanDuration(plan.billingPeriod)}`}
                  </div>
                  
                  {/* Precio mensual equivalente destacado */}
                  {plan.billingPeriod !== 'MONTHLY' && !isFree && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                      isBestValue || isPopular 
                        ? 'bg-white/20 text-white' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      ${Math.round(parseFloat(plan.price) / (plan.billingPeriod === 'QUARTERLY' ? 3 : plan.billingPeriod === 'BIANNUAL' ? 6 : 12)).toLocaleString('es-CL')}/mes
                    </div>
                  )}
                  {isFree && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-100 text-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      10 casos/mes límite
                    </div>
                  )}
                </div>

                {/* Contenido del plan con mejor espaciado */}
                <div className="px-8 py-8 flex flex-col flex-grow">
                  {/* Descripción breve */}
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {plan.description}
                  </p>
                  
                  {/* Lista de características con iconos médicos mejorados */}
                  <ul className="space-y-3.5 mb-8 flex-grow">
                    {getFeatureList(plan).slice(0, 6).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          isBestValue ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          <svg className={`w-3 h-3 ${
                            isBestValue ? 'text-red-600' : 'text-green-600'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón de acción profesional mejorado */}
                  <button
                    onClick={() => isFree ? null : handleSelectPlan(plan.id)}
                    disabled={isFree}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                      isFree
                        ? 'bg-blue-100 text-blue-800 cursor-default border-2 border-blue-300'
                        : isBestValue
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:via-rose-700 hover:to-red-800 text-white shadow-xl shadow-red-300/50 focus:ring-red-300 animate-pulse hover:animate-none'
                        : isPopular
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-200/50 focus:ring-red-200'
                        : 'bg-white text-red-700 border-2 border-red-600 hover:bg-red-50 shadow-md hover:shadow-lg focus:ring-red-200'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isFree ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Ya tienes acceso
                        </>
                      ) : (
                        <>
                          {isBestValue && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                          Comenzar Ahora
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Información adicional mejorada */}
                  <div className="mt-4 space-y-2">
                    {plan.trialDays > 0 && (
                      <p className="text-xs text-center text-green-600 font-bold flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {plan.trialDays} días de prueba gratis
                      </p>
                    )}
                    {isBestValue && (
                      <p className="text-xs text-center text-gray-500 font-medium flex items-center justify-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pago seguro con Mercado Pago
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Sección de confianza - Diseño Clínico */}
        <div className="mt-20 mb-16 max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-lg ring-4 ring-red-100/50">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Pago 100% Seguro</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Transacciones protegidas con cifrado bancario mediante Mercado Pago</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-lg ring-4 ring-red-100/50">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Cancela Sin Compromiso</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Gestiona tu suscripción cuando lo necesites. Sin permanencia ni penalizaciones</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-lg ring-4 ring-red-100/50">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Acceso Instantáneo</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Comienza tu formación inmediatamente después de completar el pago</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Profesional */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              Preguntas Frecuentes
            </h3>
            <p className="text-gray-600 mt-2">Resuelve tus dudas sobre nuestros planes</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50/50 to-rose-50/50 rounded-2xl p-6 border border-red-100/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    ¿Cómo funciona el período de prueba gratuito?
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Los planes Básico y Premium incluyen 14 días de prueba completamente gratis. No realizamos ningún cargo durante este período y puedes cancelar cuando desees sin costo alguno.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50/50 to-rose-50/50 rounded-2xl p-6 border border-red-100/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    ¿Puedo cambiar de plan después de suscribirme?
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Sí, tienes total flexibilidad para actualizar o cambiar tu plan en cualquier momento desde tu panel de usuario. Los cambios se aplican de manera inmediata.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50/50 to-rose-50/50 rounded-2xl p-6 border border-red-100/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  3
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    ¿Qué métodos de pago están disponibles?
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) a través de Mercado Pago. Todas las transacciones son 100% seguras y encriptadas.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50/50 to-rose-50/50 rounded-2xl p-6 border border-red-100/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  4
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    ¿Cómo puedo cancelar mi suscripción?
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Puedes cancelar tu suscripción desde tu perfil de usuario en cualquier momento. Tu acceso permanecerá activo hasta el final del período que ya has pagado. Sin complicaciones ni preguntas.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA final */}
          <div className="mt-10 text-center p-6 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl">
            <p className="text-white font-semibold mb-2">¿Tienes más preguntas?</p>
            <p className="text-white/90 text-sm">Contáctanos y te ayudaremos encantados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
