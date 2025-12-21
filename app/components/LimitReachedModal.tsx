'use client';

import Link from 'next/link';

interface LimitReachedModalProps {
  casesUsed: number;
  caseLimit: number;
  onClose: () => void;
}

export default function LimitReachedModal({ casesUsed, caseLimit, onClose }: LimitReachedModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center">Límite Mensual Alcanzado</h2>
        </div>

        <div className="p-8">
          {/* Estadísticas */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Has completado</p>
              <p className="text-4xl font-bold text-[#8B4513]">
                {casesUsed} / {caseLimit}
              </p>
              <p className="text-gray-600 text-sm mt-2">casos este mes</p>
            </div>
          </div>

          {/* Mensaje */}
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-3">
              ¡Felicitaciones por tu dedicación! 🎉
            </p>
            <p className="text-gray-600 text-sm">
              Has utilizado todos los casos gratuitos de este mes. Actualiza a Premium para continuar practicando sin límites.
            </p>
          </div>

          {/* Beneficios Premium */}
          <div className="bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] rounded-xl p-4 mb-6">
            <p className="font-semibold text-[#8B4513] mb-3 text-center">Con Premium obtienes:</p>
            <div className="space-y-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Casos clínicos ilimitados</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Asistente IA para resolver dudas</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Estadísticas avanzadas</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Soporte prioritario</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full bg-gradient-to-r from-[#D2691E] to-[#B8621E] hover:from-[#B8621E] hover:to-[#A0522D] text-white font-semibold py-4 px-6 rounded-xl transition-all text-center shadow-lg transform hover:scale-[1.02]"
            >
              Ver Planes Premium
            </Link>
            <button
              onClick={onClose}
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors text-center"
            >
              Volver
            </button>
          </div>

          {/* Nota */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Tu límite se renueva el 1° de cada mes
          </p>
        </div>
      </div>
    </div>
  );
}
