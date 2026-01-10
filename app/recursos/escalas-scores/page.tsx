import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CLINICAL_SCALES } from './data';

export default function EscalasScoresPage() {
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
              Escalas y Scores Clínicos
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Herramientas de evaluación estandarizadas en obstetricia
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Escalas - Solo títulos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {CLINICAL_SCALES.map((escala) => (
            <Link 
              key={escala.id} 
              href={`/recursos/escalas-scores/${escala.id}`}
              className="group"
            >
              <div className="
                relative h-full bg-gradient-to-br from-red-600 to-red-700
                rounded-xl p-6 
                transition-all duration-300 
                hover:scale-105 hover:shadow-2xl hover:shadow-red-200/50
                border border-red-500
              ">
                {/* Solo el título */}
                <h3 className="text-lg font-bold text-white leading-tight">
                  {escala.name}
                </h3>

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
            📋 Información basada en protocolos del <strong>Ministerio de Salud de Chile (MINSAL)</strong>, guías ACOG, RCOG y Williams Obstetrics
          </p>
        </div>
      </div>
    </div>
  );
}
