/**
 * Pricing Page - KLINIK-MAT
 * Arquitectura de Elite: Componentes modulares, tipos estrictos, código senior
 * 
 * STACK:
 * - TypeScript estricto con tipos profesionales
 * - Componentes reutilizables separados
 * - Data layer independiente de UI
 * - Lucide Icons profesionales
 * - Diseño clínico moderno
 * - MercadoPago integration
 * 
 * @version 2.0.0
 * @author KLINIK-MAT Team
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Components
import PricingHeader from './components/PricingHeader';
import PricingCard from './components/PricingCard';
import ComparisonTable from './components/ComparisonTable';
import TrustBadges from './components/TrustBadges';
import PricingFAQ from './components/PricingFAQ';
import MercadoPagoCheckout from '../components/MercadoPagoCheckout';

// Types & Data
import type { PricingPlan, CheckoutStep } from '@/lib/types/pricing';
import { 
  calculateDiscount, 
  filterActivePlans,
  getPlanFeatures,
  getBestValuePlan
} from '@/lib/data/pricing-plans';

/**
 * Main Pricing Page Component
 */
export default function PricingPage() {
  // ===== Hooks =====
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // ===== State =====
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('plans');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  // ===== Data Fetching =====
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/subscription/plans');
        
        if (!response.ok) {
          throw new Error('Error al cargar planes');
        }

        const data = await response.json();
        
        if (!data.success || !data.plans) {
          throw new Error('Respuesta inválida del servidor');
        }

        // Transformar planes del API al formato interno
        const transformedPlans: PricingPlan[] = data.plans.map((plan: any) => ({
          ...plan,
          price: parseFloat(plan.price),
          // Usar features de la BD si están disponibles, sino generar con getPlanFeatures
          features: Array.isArray(plan.features) && plan.features.length > 0
            ? plan.features.map((text: string, index: number) => ({
                id: `feature-${index}`,
                text,
                included: true,
                icon: 'check'
              }))
            : getPlanFeatures(plan),
          benefits: [],
          isFree: plan.name === 'FREE',
          isBestValue: plan.billingPeriod === 'ANNUAL',      // 40% descuento - Mejor oferta
          isPopular: plan.billingPeriod === 'SEMIANNUAL'     // 25% descuento - Popular
        }));

        setPlans(transformedPlans);
      } catch (err) {
        console.error('❌ Error loading plans:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // ===== Event Handlers =====
  const handleSelectPlan = useCallback((planId: string) => {
    // Verificar autenticación
    if (!isLoaded || !userId) {
      router.push('/login');
      return;
    }

    const plan = plans.find((p) => p.id === planId);
    
    if (!plan || plan.isFree) {
      return;
    }

    setProcessingPlan(planId);
    setSelectedPlan(plan);
    setCheckoutStep('confirm');
    setProcessingPlan(null);
  }, [plans, userId, isLoaded, router]);

  const handleConfirmPlan = useCallback(() => {
    if (!selectedPlan) return;
    setCheckoutStep('payment');
  }, [selectedPlan]);

  const handleBackToPlans = useCallback(() => {
    setCheckoutStep('plans');
    setSelectedPlan(null);
  }, []);

  const handlePaymentSuccess = useCallback((paymentId: string) => {
    console.log('✅ Payment successful:', paymentId);
    setSelectedPlan(null);
    setCheckoutStep('plans');
    router.push(`/subscription/success?payment_id=${paymentId}`);
  }, [router]);

  const handlePaymentError = useCallback((error: string) => {
    console.error('❌ Payment error:', error);
    alert(`Error en el pago: ${error}`);
    setCheckoutStep('confirm');
  }, []);

  // ===== Computed Values =====
  const activePlans = filterActivePlans(plans);
  const bestValuePlan = getBestValuePlan(activePlans);
  const maxSavings = bestValuePlan ? calculateDiscount(bestValuePlan).savings : 5240;

  // ===== Render Functions =====

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl text-gray-700 font-semibold">Cargando planes...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar planes</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  /**
   * Confirmation step
   */
  if (checkoutStep === 'confirm' && selectedPlan) {
    const discount = calculateDiscount(selectedPlan);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-red-50/30 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button
            onClick={handleBackToPlans}
            className="mb-6 flex items-center text-red-600 hover:text-red-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a planes
          </button>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Plan header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-8">
              <h2 className="text-3xl font-bold mb-2">{selectedPlan.displayName}</h2>
              <p className="text-white/90">Confirma tu suscripción</p>
            </div>

            {/* Plan details */}
            <div className="p-8">
              <div className="mb-8">
                <div className="flex justify-between items-baseline mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <span className="text-gray-600">Total a pagar</span>
                    <div className="text-4xl font-bold text-red-600 mt-1">
                      ${selectedPlan.price.toLocaleString('es-CL')} CLP
                    </div>
                    <span className="text-gray-500 text-sm">
                      por {selectedPlan.billingPeriod === 'BIANNUAL' ? '6 meses' : selectedPlan.billingPeriod === 'QUARTERLY' ? '3 meses' : 'mes'}
                    </span>
                  </div>
                  {discount.hasDiscount && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                      Ahorras {discount.percentage}%
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
                  {selectedPlan.features.map((feature) => (
                    <div key={feature.id} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue button */}
              <button
                onClick={handleConfirmPlan}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Continuar al pago
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al continuar, aceptas nuestros{' '}
                <a href="/terminos" className="underline hover:text-gray-700">
                  términos y condiciones
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Payment step
   */
  if (checkoutStep === 'payment' && selectedPlan) {
    return (
      <MercadoPagoCheckout
        planId={selectedPlan.id}
        planName={selectedPlan.displayName}
        amount={selectedPlan.price}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onClose={() => setCheckoutStep('confirm')}
      />
    );
  }

  /**
   * Main plans view
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PricingHeader maxSavings={maxSavings} className="mb-16" />

        {/* Pricing Cards Grid - Lo principal primero */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 max-w-6xl mx-auto">
          {activePlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              discount={calculateDiscount(plan)}
              isProcessing={processingPlan === plan.id}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <TrustBadges className="mb-16 max-w-4xl mx-auto" />

        {/* Comparison Table - Como ayuda abajo */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-8">Compara todos los planes</h2>
          <ComparisonTable 
            plans={activePlans} 
            onSelectPlan={handleSelectPlan}
            className="max-w-5xl mx-auto"
          />
        </div>

        {/* FAQ */}
        <PricingFAQ className="max-w-4xl mx-auto" />
      </div>
    </div>
  );
}
