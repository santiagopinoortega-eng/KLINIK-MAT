/**
 * PricingHeader Component - Header minimalista
 */

'use client';

import type { PricingHeaderProps } from '@/lib/types/pricing';

export default function PricingHeader({ 
  maxSavings = 5240,
  className = '' 
}: PricingHeaderProps) {
  return (
    <div className={`text-center max-w-3xl mx-auto ${className}`}>
      {/* Badge simple */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg shadow-green-500/30 animate-pulse">
        <span>💰</span>
        <span>Ahorra hasta 40% con el plan anual</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-orange-600 bg-clip-text text-transparent mb-4 tracking-tight">
        Elige el plan perfecto para tu formación
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-600 leading-relaxed">
        Accede a casos clínicos reales y prepara tu carrera médica. 
        Cancela cuando quieras.
      </p>
    </div>
  );
}
