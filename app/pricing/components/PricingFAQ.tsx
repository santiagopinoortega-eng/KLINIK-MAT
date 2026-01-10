/**
 * PricingFAQ Component - Preguntas frecuentes
 * Diseño profesional y accesible
 */

'use client';

import { HelpCircle } from 'lucide-react';
import type { FAQProps } from '@/lib/types/pricing';
import { PRICING_FAQS } from '@/lib/data/pricing-plans';

export default function PricingFAQ({ items = PRICING_FAQS, className = '' }: FAQProps) {
  return (
    <div className={`bg-white rounded-3xl shadow-xl p-10 border border-gray-100 ${className}`}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl mb-4">
          <HelpCircle className="w-8 h-8 text-red-600" strokeWidth={2} />
        </div>
        <h3 className="text-3xl font-bold text-gray-900">
          Preguntas Frecuentes
        </h3>
        <p className="text-gray-600 mt-2">Resuelve tus dudas sobre nuestros planes</p>
      </div>
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="bg-gradient-to-r from-red-50/50 to-rose-50/50 rounded-2xl p-6 border border-red-100/50 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900 mb-2">
                  {item.question}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* CTA final */}
      <div className="mt-10 text-center p-6 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl">
        <p className="text-white font-semibold mb-2">¿Tienes más preguntas?</p>
        <p className="text-white/90 text-sm">
          Contáctanos a{' '}
          <a 
            href="mailto:klinik.mat2025@gmail.com" 
            className="underline hover:text-white font-medium"
          >
            klinik.mat2025@gmail.com
          </a>
          {' '}y te ayudaremos encantados
        </p>
      </div>
    </div>
  );
}
