/**
 * TrustBadges Component - Badges de confianza y seguridad
 * Diseño clínico profesional
 */

'use client';

import { Shield, Clock, Zap } from 'lucide-react';
import type { TrustBadgesProps } from '@/lib/types/pricing';

const TRUST_ITEMS = [
  {
    id: 'secure',
    icon: Shield,
    title: 'Pago 100% Seguro',
    description: 'Transacciones protegidas con cifrado bancario mediante Mercado Pago'
  },
  {
    id: 'flexible',
    icon: Clock,
    title: 'Cancela Sin Compromiso',
    description: 'Gestiona tu suscripción cuando lo necesites. Sin permanencia ni penalizaciones'
  },
  {
    id: 'instant',
    icon: Zap,
    title: 'Acceso Instantáneo',
    description: 'Comienza tu formación inmediatamente después de completar el pago'
  }
];

export default function TrustBadges({ className = '' }: TrustBadgesProps) {
  return (
    <div className={`bg-white rounded-3xl shadow-xl p-12 border border-gray-100 ${className}`}>
      <div className="grid md:grid-cols-3 gap-10">
        {TRUST_ITEMS.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <div key={item.id} className="text-center">
              <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-lg ring-4 ring-red-100/50">
                <IconComponent className="w-10 h-10 text-red-600" strokeWidth={2} />
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {item.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
