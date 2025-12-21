'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UsageData {
  planName: string;
  planType: string;
  isUnlimited: boolean;
  caseLimit: number | null;
  casesUsed: number;
  remaining: number | null;
  percentage: number;
  isPremium: boolean;
  canAccess: boolean;
}

export default function UsageLimitBadge() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/subscription/check-access');
      const data = await response.json();
      if (data.success) {
        setUsage(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching usage:', error);
      setLoading(false);
    }
  };

  if (loading || !usage) return null;

  // Si es ilimitado, mostrar badge premium simple
  if (usage.isUnlimited) {
    return (
      <div className="bg-gradient-to-r from-[#D2691E] to-[#B8621E] text-white px-4 py-2 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-semibold text-sm">{usage.planName} • Ilimitado</span>
        </div>
      </div>
    );
  }

  // Calcular color según porcentaje de uso
  const getColorClasses = () => {
    if (usage.percentage >= 90) return 'bg-red-50 border-red-300 text-red-800';
    if (usage.percentage >= 70) return 'bg-orange-50 border-orange-300 text-orange-800';
    return 'bg-blue-50 border-blue-300 text-blue-800';
  };

  const getProgressColor = () => {
    if (usage.percentage >= 90) return 'bg-red-500';
    if (usage.percentage >= 70) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className={`border-2 rounded-lg p-3 ${getColorClasses()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-semibold">
            {usage.casesUsed} / {usage.caseLimit} casos este mes
          </span>
        </div>
        {!usage.canAccess && (
          <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded">
            LÍMITE ALCANZADO
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${getProgressColor()}`}
          style={{ width: `${Math.min(usage.percentage, 100)}%` }}
        />
      </div>

      {/* Mensaje según estado */}
      {usage.canAccess ? (
        <p className="text-xs">
          {usage.remaining === 1 ? '¡Último caso disponible!' : `${usage.remaining} casos restantes`}
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium">
            Has alcanzado tu límite mensual
          </p>
          <Link
            href="/pricing"
            className="block text-center bg-gradient-to-r from-[#D2691E] to-[#B8621E] hover:from-[#B8621E] hover:to-[#A0522D] text-white text-xs font-semibold py-2 px-3 rounded transition-all"
          >
            🚀 Actualizar a Premium
          </Link>
        </div>
      )}
    </div>
  );
}
