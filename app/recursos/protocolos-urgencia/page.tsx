import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { URGENCY_PROTOCOLS } from './data';

export default function ProtocolosUrgenciaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header con botón de retorno */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link 
            href="/areas"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Volver a Áreas</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Protocolos de Urgencia Obstétrica
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Guías clínicas de acción rápida basadas en evidencia MINSAL, ACOG, RCOG
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Protocolos - Solo títulos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {URGENCY_PROTOCOLS.map((protocol) => (
            <Link 
              key={protocol.id} 
              href={`/recursos/protocolos-urgencia/${protocol.id}`}
              className="group"
            >
              <div className="
                relative h-full bg-gradient-to-br from-red-600 to-red-700
                rounded-xl p-6 
                transition-all duration-300 
                hover:scale-105 hover:shadow-2xl hover:shadow-red-200/50
                border border-red-500
              ">
                {/* Badge de prioridad */}
                {protocol.priority === 'critica' && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                )}

                {/* Título */}
                <h3 className="text-lg font-bold text-white leading-tight mb-2">
                  {protocol.title}
                </h3>

                {/* Ventana terapéutica */}
                <div className="text-xs text-white/80 font-medium">
                  ⏱️ {protocol.timeWindow}
                </div>

                {/* Arrow en hover */}
                <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg 
                    className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Decoración */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-tl-full" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer informativo */}
        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-center text-sm text-gray-600">
            🚨 <strong>Uso en Emergencias:</strong> Estos protocolos son guías de referencia rápida. 
            Siempre adaptar al contexto clínico individual y recursos disponibles. 
            En caso de duda, consultar con especialista.
          </p>
        </div>
      </div>
    </div>
  );
}
