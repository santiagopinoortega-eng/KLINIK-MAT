'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MonthlyUsageCard from '../components/MonthlyUsageCard';

interface SubscriptionData {
  id: string;
  planName: string;
  planType: string;
  price: string;
  billingPeriod: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  daysRemaining: number;
  features: {
    hasAI: boolean;
    hasAdvancedStats: boolean;
    hasPrioritySupport: boolean;
    maxCasesPerMonth: number | null;
  };
}

interface PaymentHistory {
  id: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  paidAt: string;
  planName: string;
}

export default function ProfilePage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push('/login');
      return;
    }

    fetchSubscriptionData();
  }, [isLoaded, userId, router]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/current');
      const data = await response.json();

      if (data.success) {
        setSubscription(data.subscription);
        setPaymentHistory(data.paymentHistory || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setCancelling(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          reason: cancelReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Tu suscripción será cancelada al final del período actual');
        setShowCancelModal(false);
        fetchSubscriptionData();
      } else {
        alert('Error al cancelar: ' + data.error);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error al cancelar la suscripción');
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    try {
      const response = await fetch(
        `/api/subscription/cancel?subscription_id=${subscription.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        alert('¡Suscripción reactivada con éxito!');
        fetchSubscriptionData();
      } else {
        alert('Error al reactivar: ' + data.error);
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Error al reactivar la suscripción');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#D2691E] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#8B4513] mb-2">Mi Perfil</h1>
          <p className="text-[#A0522D]">Gestiona tu cuenta y suscripción</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Info del usuario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#D2691E] to-[#B8621E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600 text-sm">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>

              {subscription && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Plan actual</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      subscription.planType === 'FREE'
                        ? 'bg-gray-100 text-gray-800'
                        : subscription.planType === 'PREMIUM'
                        ? 'bg-gradient-to-r from-[#D2691E] to-[#B8621E] text-white'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {subscription.planName}
                    </span>
                  </div>
                  {subscription.planType !== 'FREE' && (
                    <p className="text-sm text-gray-500">
                      {subscription.daysRemaining} días restantes
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Suscripción y pagos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Suscripción activa */}
            {subscription && subscription.planType !== 'FREE' ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#D2691E] to-[#B8621E] text-white px-6 py-4">
                  <h3 className="text-xl font-bold">Suscripción Activa</h3>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Plan</p>
                      <p className="font-semibold text-gray-900">{subscription.planName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Precio</p>
                      <p className="font-semibold text-gray-900">
                        ${parseInt(subscription.price).toLocaleString('es-CL')} CLP / {subscription.billingPeriod === 'YEARLY' ? 'año' : 'mes'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Inicio del período</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Próximo cobro</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Características incluidas:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">
                          {subscription.features.maxCasesPerMonth === null ? 'Casos ilimitados' : `${subscription.features.maxCasesPerMonth} casos/mes`}
                        </span>
                      </div>
                      {subscription.features.hasAI && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">Asistente IA</span>
                        </div>
                      )}
                      {subscription.features.hasAdvancedStats && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">Estadísticas avanzadas</span>
                        </div>
                      )}
                      {subscription.features.hasPrioritySupport && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">Soporte prioritario</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alerta de cancelación */}
                  {subscription.cancelAtPeriodEnd && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-orange-900">Suscripción programada para cancelarse</p>
                          <p className="text-sm text-orange-700 mt-1">
                            Tu acceso continuará hasta el {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    {!subscription.cancelAtPeriodEnd ? (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Cancelar Suscripción
                      </button>
                    ) : (
                      <button
                        onClick={handleReactivateSubscription}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Reactivar Suscripción
                      </button>
                    )}
                    <Link
                      href="/pricing"
                      className="flex-1 bg-white hover:bg-gray-50 text-[#8B4513] font-semibold py-3 px-6 rounded-lg transition-colors border-2 border-gray-200 text-center"
                    >
                      Cambiar Plan
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sin suscripción activa</h3>
                <p className="text-gray-600 mb-6">Actualmente estás en el plan gratuito</p>
                <Link
                  href="/pricing"
                  className="inline-block bg-[#D2691E] hover:bg-[#B8621E] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Ver Planes Premium
                </Link>
              </div>
            )}

            {/* Uso Mensual Card */}
            <MonthlyUsageCard />

            {/* Historial de pagos */}
            {paymentHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Historial de Pagos</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.paidAt).toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.description || payment.planName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${parseInt(payment.amount).toLocaleString('es-CL')} {payment.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status === 'APPROVED' ? 'Aprobado' : payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de cancelación */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Cancelar suscripción?</h3>
              <p className="text-gray-600 mb-6">
                Tu acceso continuará hasta el final del período actual. Podrás reactivarla cuando quieras.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Por qué cancelas? (opcional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2691E] focus:border-transparent"
                  rows={3}
                  placeholder="Cuéntanos para mejorar..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                  disabled={cancelling}
                >
                  Volver
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
