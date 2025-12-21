'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UsageStats {
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

export default function MonthlyUsageCard() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/subscription/check-access');
      const data = await response.json();

      if (data.success) {
        setUsage({
          planName: data.planName,
          planType: data.planType,
          isUnlimited: data.isUnlimited,
          caseLimit: data.caseLimit,
          casesUsed: data.casesUsed,
          remaining: data.remaining,
          percentage: data.percentage,
          isPremium: data.isPremium,
          canAccess: data.canAccess,
        });
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const getColorClasses = () => {
    if (usage.isUnlimited) return 'from-green-50 to-emerald-50 border-green-200';
    if (usage.percentage >= 90) return 'from-red-50 to-rose-50 border-red-200';
    if (usage.percentage >= 70) return 'from-orange-50 to-amber-50 border-orange-200';
    return 'from-blue-50 to-cyan-50 border-blue-200';
  };

  const getProgressColor = () => {
    if (usage.percentage >= 90) return 'bg-red-500';
    if (usage.percentage >= 70) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getTextColor = () => {
    if (usage.isUnlimited) return 'text-green-700';
    if (usage.percentage >= 90) return 'text-red-700';
    if (usage.percentage >= 70) return 'text-orange-700';
    return 'text-blue-700';
  };

  return (
    <div className={`bg-gradient-to-br ${getColorClasses()} border-2 rounded-2xl shadow-lg overflow-hidden`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Uso Mensual</h3>
          <div className="bg-white px-3 py-1 rounded-full">
            <span className={`text-xs font-semibold ${getTextColor()}`}>
              {usage.planName}
            </span>
          </div>
        </div>

        {usage.isUnlimited ? (
          // Vista para planes premium
          <div className="text-center py-8">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-green-700 mb-2">Ilimitado ⭐</p>
            <p className="text-sm text-gray-600">
              Practica con todos los casos clínicos sin restricciones
            </p>
          </div>
        ) : (
          // Vista para plan FREE
          <div>
            {/* Estadísticas principales */}
            <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {usage.casesUsed}
                    <span className="text-2xl text-gray-500"> / {usage.caseLimit}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">casos completados este mes</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-white font-bold text-lg">{usage.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-3">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
                    style={{ width: `${usage.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Casos restantes */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Casos restantes:</span>
                <span className={`font-semibold ${getTextColor()}`}>
                  {usage.remaining} {usage.remaining === 1 ? 'caso' : 'casos'}
                </span>
              </div>
            </div>

            {/* Advertencia si está cerca del límite */}
            {usage.percentage >= 70 && usage.canAccess && (
              <div className={`${usage.percentage >= 90 ? 'bg-red-100 border-red-300' : 'bg-orange-100 border-orange-300'} border-2 rounded-lg p-4 mb-4`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 ${usage.percentage >= 90 ? 'text-red-600' : 'text-orange-600'} mr-2 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className={`font-semibold ${usage.percentage >= 90 ? 'text-red-900' : 'text-orange-900'}`}>
                      {usage.percentage >= 90 ? '¡Casi sin casos!' : 'Acercándote al límite'}
                    </p>
                    <p className={`text-sm ${usage.percentage >= 90 ? 'text-red-700' : 'text-orange-700'} mt-1`}>
                      Solo te quedan {usage.remaining} {usage.remaining === 1 ? 'caso' : 'casos'} este mes. Considera actualizar a Premium.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Límite alcanzado */}
            {!usage.canAccess && (
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-900">Límite mensual alcanzado</p>
                    <p className="text-sm text-red-700 mt-1">
                      Has usado todos tus casos gratuitos de este mes. Actualiza para continuar practicando.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA para upgrade */}
            <div className="flex gap-3">
              <Link
                href="/pricing"
                className="flex-1 bg-gradient-to-r from-[#D2691E] to-[#B8621E] hover:from-[#B8621E] hover:to-[#A0522D] text-white font-semibold py-3 px-6 rounded-lg transition-all text-center shadow-lg"
              >
                🚀 Obtener Ilimitados
              </Link>
            </div>

            {/* Info de reset */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Tu límite se renueva el 1° de cada mes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
