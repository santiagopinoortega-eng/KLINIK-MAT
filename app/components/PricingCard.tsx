// app/components/PricingCard.tsx
'use client';

import { useState } from 'react';
import { CheckIcon, SparklesIcon, Zap } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  displayName: string;
  price: string;
  currency: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  description: string;
  features: Record<string, boolean>;
  maxCasesPerMonth: number | null;
  hasAI: boolean;
  hasAdvancedStats: boolean;
  hasPrioritySupport: boolean;
  trialDays: number;
  isPopular?: boolean;
  discount?: number;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planId: string) => void;
  isLoading: boolean;
  currentPlan?: string;
}

export default function PricingCard({ plan, onSelect, isLoading, currentPlan }: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isCurrentPlan = currentPlan === plan.id;
  const isFreePlan = plan.name === 'FREE';
  
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (plan.currency === 'CLP') {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(num);
    }
    return `$${num}`;
  };

  const getFeatures = () => {
    const features = [];
    
    if (plan.maxCasesPerMonth === null || plan.maxCasesPerMonth < 0) {
      features.push('Casos clínicos ilimitados');
    } else {
      features.push(`${plan.maxCasesPerMonth} casos por mes`);
    }
    
    if (plan.hasAI) {
      features.push('Retroalimentación con IA');
    }
    
    if (plan.hasAdvancedStats) {
      features.push('Estadísticas avanzadas');
    } else {
      features.push('Estadísticas básicas');
    }
    
    if (plan.hasPrioritySupport) {
      features.push('Soporte prioritario');
    }
    
    features.push('Acceso desde cualquier dispositivo');
    features.push('Actualizaciones automáticas');
    
    if (plan.trialDays > 0) {
      features.push(`${plan.trialDays} días de prueba gratis`);
    }
    
    return features;
  };

  const buttonText = isCurrentPlan 
    ? 'Plan Actual'
    : isFreePlan 
    ? 'Comenzar Gratis'
    : 'Actualizar Plan';

  return (
    <div
      className={`
        relative flex flex-col h-full rounded-3xl transition-all duration-300
        ${plan.isPopular 
          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-2xl scale-105' 
          : 'bg-white border-2 border-gray-200 hover:border-emerald-500 hover:shadow-xl'
        }
        ${isHovered && !plan.isPopular ? 'transform scale-105' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            MÁS POPULAR
          </div>
        </div>
      )}

      {/* Discount Badge */}
      {plan.discount && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold shadow-lg">
          <div className="text-center">
            <div className="text-xl">-{plan.discount}%</div>
          </div>
        </div>
      )}

      <div className="p-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className={`text-2xl font-bold mb-2 ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
            {plan.displayName}
          </h3>
          <p className={`text-sm ${plan.isPopular ? 'text-emerald-100' : 'text-gray-600'}`}>
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center gap-2">
            <span className={`text-5xl font-extrabold ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
              {isFreePlan ? 'Gratis' : formatPrice(plan.price)}
            </span>
            {!isFreePlan && (
              <span className={`text-lg ${plan.isPopular ? 'text-emerald-100' : 'text-gray-600'}`}>
                /{plan.billingPeriod === 'MONTHLY' ? 'mes' : 'año'}
              </span>
            )}
          </div>
          {plan.discount && (
            <div className={`mt-2 text-sm ${plan.isPopular ? 'text-emerald-100' : 'text-gray-500'}`}>
              <span className="line-through">
                {formatPrice((parseFloat(plan.price) / (1 - plan.discount / 100)).toFixed(0))}
              </span>
              <span className="ml-2 font-semibold text-red-500">¡Ahorra {plan.discount}%!</span>
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-4 mb-8 flex-1">
          {getFeatures().map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckIcon 
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  plan.isPopular ? 'text-white' : 'text-emerald-600'
                }`} 
              />
              <span className={plan.isPopular ? 'text-emerald-50' : 'text-gray-700'}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={() => !isCurrentPlan && !isLoading && onSelect(plan.id)}
          disabled={isCurrentPlan || isLoading}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300
            ${plan.isPopular
              ? 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl'
              : isCurrentPlan
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl'
            }
            ${isLoading ? 'opacity-50 cursor-wait' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              Procesando...
            </div>
          ) : (
            buttonText
          )}
        </button>

        {/* Trial Notice */}
        {plan.trialDays > 0 && !isFreePlan && (
          <p className={`text-xs text-center mt-4 ${plan.isPopular ? 'text-emerald-100' : 'text-gray-500'}`}>
            Cancela cuando quieras durante el período de prueba
          </p>
        )}
      </div>
    </div>
  );
}
