/**
 * PricingCard Component - Diseño minimalista profesional
 * Inspirado en Stripe, Linear y productos modernos
 */

'use client';

import { Check, X, Sparkles } from 'lucide-react';
import type { PricingCardProps } from '@/lib/types/pricing';
import { getBillingPeriodLabel, calculateMonthlyEquivalent } from '@/lib/data/pricing-plans';

export default function PricingCard({ 
  plan, 
  onSelect, 
  discount,
  isProcessing = false,
  className = '' 
}: PricingCardProps) {
  const monthlyEquiv = calculateMonthlyEquivalent(plan);
  const isBestValue = plan.isBestValue || false;
  const isFree = plan.isFree || false;

  return (
    <div
      className={`
        relative rounded-2xl transition-all duration-300 flex flex-col h-full
        ${isBestValue
          ? 'bg-gradient-to-br from-red-600 via-red-700 to-rose-800 shadow-2xl shadow-red-500/30 scale-[1.05] border-2 border-red-400'
          : 'bg-white border border-gray-200 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10'
        }
        ${className}
      `}
    >
      {/* Badge Superior - Solo mejor valor */}
      {isBestValue && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-gray-900 text-xs font-bold rounded-full shadow-lg shadow-yellow-500/50 animate-pulse">
            ⭐ MEJOR OFERTA
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        {/* Badge descuento */}
        {discount?.hasDiscount && !isFree && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold rounded-full shadow-md shadow-green-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Ahorra {discount.percentage}%
            </span>
          </div>
        )}
        
        <h3 className={`text-xl font-semibold mb-2 ${isBestValue ? 'text-white' : 'text-gray-900'}`}>
          {plan.displayName}
        </h3>
        
        <p className={`text-sm mb-4 font-medium ${
          isBestValue ? 'text-red-100' : 'text-gray-600'
        }`}>
          {isFree ? 'Explora la plataforma • 10 casos gratis' : 
           plan.billingPeriod === 'SEMIANNUAL' ? (
             <span className="flex items-center gap-1.5">
               <span className="text-lg">🎯</span>
               <span className="font-bold">Asegura tu práctica semestral</span>
             </span>
           ) : 
           plan.billingPeriod === 'ANNUAL' ? (
             <span className="flex items-center gap-1.5">
               <span className="text-lg">🏥</span>
               <span className="font-bold">Asegura tu internado completo</span>
             </span>
           ) : 
           'Flexibilidad mensual'}
        </p>
        
        {/* Precio en CLP */}
        <div className="mb-6">
          {isFree ? (
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${isBestValue ? 'text-white' : 'text-gray-900'}`}>$0</span>
              <span className={isBestValue ? 'text-red-200' : 'text-gray-500'}>CLP</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-4xl font-bold ${isBestValue ? 'text-white' : 'text-gray-900'}`}>
                  ${plan.price.toLocaleString('es-CL')}
                </span>
                <span className={`text-sm ${isBestValue ? 'text-red-100' : 'text-gray-500'}`}>CLP</span>
              </div>
              <div className={`text-sm ${isBestValue ? 'text-red-100' : 'text-gray-600'}`}>
                {getBillingPeriodLabel(plan.billingPeriod)}
              </div>
              {monthlyEquiv.totalMonths > 1 && (
                <div className={`text-xs mt-1 ${isBestValue ? 'text-red-200' : 'text-gray-500'}`}>
                  ${Math.round(monthlyEquiv.pricePerMonth).toLocaleString('es-CL')} CLP/mes
                </div>
              )}
            </>
          )}
        </div>

        {/* Trial */}
        {plan.trialDays > 0 && !isFree && (
          <div className="flex items-center gap-1.5 text-sm text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Prueba {plan.trialDays} días gratis</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="px-6">
        <div className={`border-t ${isBestValue ? 'border-red-500/30' : 'border-gray-100'}`}></div>
      </div>

      {/* Features */}
      <div className="px-6 py-6 flex-1">
        <ul className="space-y-3">
          {plan.features.slice(0, 8).map((feature) => (
            <li key={feature.id} className="flex items-start gap-2.5">
              {feature.included ? (
                <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isBestValue ? 'text-green-300' : 'text-green-600'
                }`} />
              ) : (
                <X className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isBestValue ? 'text-red-400' : 'text-gray-300'
                }`} />
              )}
              <span className={`text-sm ${
                feature.included 
                  ? (isBestValue ? 'text-white font-medium' : 'text-gray-700')
                  : (isBestValue ? 'text-red-300' : 'text-gray-400')
              }`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 mt-auto">
        <button
          onClick={() => !isFree && onSelect(plan.id)}
          disabled={isFree || isProcessing}
          className={`
            w-full py-3 px-6 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
            ${isFree
              ? 'bg-gray-100 text-gray-400 cursor-default'
              : isBestValue
              ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600 shadow-lg shadow-yellow-500/50'
              : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/50'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </span>
          ) : isFree ? (
            'Plan actual'
          ) : (
            '🚀 Comenzar ahora'
          )}
        </button>
      </div>
    </div>
  );
}
