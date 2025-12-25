'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  ArrowLeftIcon,
  ChartBarIcon,
  ScaleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  CLINICAL_SCALES, 
  SCALE_CATEGORIES, 
  searchScales,
  getScalesByCategory 
} from './data';

export default function EscalasScoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrar escalas
  const filteredScales = searchQuery
    ? searchScales(searchQuery)
    : selectedCategory === 'all'
    ? CLINICAL_SCALES
    : getScalesByCategory(selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/areas"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver a Recursos
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <ScaleIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Escalas y Scores Clínicos
              </h1>
              <p className="text-gray-600 mt-1">
                Herramientas de evaluación estandarizadas en obstetricia
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8 text-indigo-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {CLINICAL_SCALES.length}
                  </div>
                  <div className="text-sm text-gray-600">Escalas Disponibles</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
              <div className="flex items-center gap-3">
                <ScaleIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {SCALE_CATEGORIES.length}
                  </div>
                  <div className="text-sm text-gray-600">Categorías</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Referencias Validadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Uso en Práctica Clínica
              </h3>
              <p className="text-sm text-amber-800">
                Estas escalas son herramientas de apoyo diagnóstico. Deben interpretarse 
                en el contexto clínico individual del paciente. No sustituyen el juicio clínico 
                ni la evaluación integral del equipo de salud.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar escalas por nombre, indicación o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todas ({CLINICAL_SCALES.length})
          </button>
          {SCALE_CATEGORIES.map((category) => {
            const count = getScalesByCategory(category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-md`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.icon} {category.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredScales.length === 0 ? (
            'No se encontraron escalas'
          ) : (
            <>
              Mostrando {filteredScales.length}{' '}
              {filteredScales.length === 1 ? 'escala' : 'escalas'}
            </>
          )}
        </div>

        {/* Scales Grid */}
        {filteredScales.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No se encontraron escalas
            </h3>
            <p className="text-gray-500">
              Intenta con otros términos de búsqueda o selecciona una categoría diferente
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredScales.map((scale) => {
              const category = SCALE_CATEGORIES.find(cat => cat.id === scale.category);
              
              return (
                <Link
                  key={scale.id}
                  href={`/recursos/escalas-scores/${scale.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-300 group"
                >
                  {/* Category Badge */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${category?.color} text-white`}
                      >
                        {category?.icon} {category?.name}
                      </span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <ChartBarIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {scale.totalScoreRange.min}-{scale.totalScoreRange.max} puntos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {scale.name}
                    </h3>

                    <p className="text-gray-700 mb-4 leading-relaxed line-clamp-2">
                      {scale.description}
                    </p>

                    {/* Indication */}
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        Indicación
                      </span>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {scale.indication}
                      </p>
                    </div>

                    {/* Timing */}
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                        Aplicación
                      </span>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {scale.timingApplication}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ScaleIcon className="w-4 h-4" />
                          {scale.parameters.length} parámetros
                        </span>
                        <span className="flex items-center gap-1">
                          <ChartBarIcon className="w-4 h-4" />
                          {scale.interpretation.length} niveles
                        </span>
                      </div>
                      <span className="text-indigo-600 font-medium group-hover:gap-3 flex items-center gap-2 transition-all">
                        Ver escala
                        <svg
                          className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600 bg-white rounded-lg p-6 shadow-sm">
          <p className="mb-2">
            <strong>Referencias:</strong> Todas las escalas están basadas en guías MINSAL Chile, 
            ACOG, RCOG, WHO y literatura médica gold standard.
          </p>
          <p>
            Para uso clínico en práctica diaria. Consultar protocolos institucionales locales.
          </p>
        </div>
      </div>
    </div>
  );
}
