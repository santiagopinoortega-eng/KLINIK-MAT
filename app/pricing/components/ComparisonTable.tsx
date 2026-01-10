/**
 * ComparisonTable Component - Tabla comparativa de planes
 * Diseño profesional para comparar características
 */

'use client';

import type { ComparisonTableProps } from '@/lib/types/pricing';
import { formatPrice, getBillingPeriodLabel, calculateDiscount } from '@/lib/data/pricing-plans';
import { Calculator } from 'lucide-react';

export default function ComparisonTable({ plans, onSelectPlan, className = '' }: ComparisonTableProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 border-2 border-red-100 ${className}`}>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
        <Calculator className="w-6 h-6 text-red-600" />
        Comparación de Planes
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-gray-700 min-w-[120px]">Plan</th>
              <th className="text-center py-3 px-4 font-bold text-gray-700 whitespace-nowrap">Duración</th>
              <th className="text-center py-3 px-4 font-bold text-gray-700 whitespace-nowrap">Precio Total</th>
              <th className="text-center py-3 px-4 font-bold text-red-700 whitespace-nowrap">Descuento</th>
              <th className="text-center py-3 px-4 font-bold text-green-700 whitespace-nowrap">Valor/Mes</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const discount = calculateDiscount(plan);
              const isBest = plan.isBestValue || false;
              const isFree = plan.isFree || false;
              
              return (
                <tr 
                  key={plan.id} 
                  className={`
                    border-b border-gray-100 hover:bg-red-50/30 transition-colors cursor-pointer
                    ${isBest ? 'bg-red-50/50' : ''}
                  `}
                  onClick={() => !isFree && onSelectPlan(plan.id)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{plan.displayName}</span>
                      {isBest && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-bold whitespace-nowrap">
                          MEJOR VALOR
                        </span>
                      )}
                      {isFree && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold whitespace-nowrap">
                          GRATIS
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 text-gray-700 whitespace-nowrap">
                    {isFree ? 'Ilimitado' : getBillingPeriodLabel(plan.billingPeriod)}
                  </td>
                  <td className="text-center py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {isFree ? 'Gratis' : formatPrice(plan.price)}
                  </td>
                  <td className="text-center py-4 px-4">
                    {discount.hasDiscount ? (
                      <span className="font-bold text-red-600">{discount.percentage}%</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {isFree ? (
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {plan.maxCasesPerMonth} casos/mes
                      </span>
                    ) : (
                      <span className="font-bold text-green-700 whitespace-nowrap">
                        ${Math.round(plan.price / (plan.billingPeriod === 'QUARTERLY' ? 3 : plan.billingPeriod === 'BIANNUAL' ? 6 : 1)).toLocaleString('es-CL')}
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
  );
}
