'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { URGENCY_PROTOCOLS, PROTOCOL_CATEGORIES, searchProtocols } from './data';

export default function ProtocolosUrgenciaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrar protocolos
  const filteredProtocols = URGENCY_PROTOCOLS.filter(protocol => {
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protocol.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Estadísticas
  const criticalCount = URGENCY_PROTOCOLS.filter(p => p.priority === 'critica').length;
  const categoriesCount = Object.keys(PROTOCOL_CATEGORIES).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/areas"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Volver a Recursos</span>
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Protocolos de <span className="text-red-600">Urgencia Obstétrica</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Guías clínicas basadas en MINSAL, ACOG, RCOG y evidencia gold standard
              </p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg mt-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Uso en Emergencias</p>
                <p className="text-xs text-red-800 mt-1">
                  Estos protocolos son guías de referencia rápida. Siempre adaptar al contexto clínico individual
                  y recursos disponibles. En caso de duda, consultar con especialista.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Protocolos</p>
                <p className="text-2xl font-bold text-gray-900">{URGENCY_PROTOCOLS.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Emergencias Críticas</p>
                <p className="text-2xl font-bold text-gray-900">{criticalCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Categorías</p>
                <p className="text-2xl font-bold text-gray-900">{categoriesCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          {/* Búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar protocolo (ej: hemorragia, eclampsia, distocia...)"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors"
              />
            </div>
          </div>

          {/* Filtros por categoría */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Filtrar por categoría:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({URGENCY_PROTOCOLS.length})
              </button>
              {Object.values(PROTOCOL_CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contador resultados */}
          {searchQuery && (
            <div className="mt-4 text-sm text-gray-600">
              <span className="font-semibold">{filteredProtocols.length}</span> protocolo(s) encontrado(s)
            </div>
          )}
        </div>

        {/* Grid de Protocolos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProtocols.map((protocol) => {
            const category = PROTOCOL_CATEGORIES[protocol.category];
            
            return (
              <Link
                key={protocol.id}
                href={`/recursos/protocolos-urgencia/${protocol.id}`}
                className="group block"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 h-full transition-all duration-300 hover:shadow-2xl hover:border-red-300 hover:-translate-y-1">
                  {/* Header del protocolo */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${category.color} text-white flex items-center gap-1`}>
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    
                    {protocol.priority === 'critica' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-bold">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        CRÍTICA
                      </div>
                    )}
                  </div>

                  {/* Título */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {protocol.title}
                  </h3>

                  {/* Tiempo crítico */}
                  <div className="flex items-center gap-2 mb-3">
                    <ClockIcon className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">
                      Ventana: {protocol.timeWindow}
                    </span>
                  </div>

                  {/* Definición */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {protocol.definition}
                  </p>

                  {/* Presentación clínica preview */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Presentación clínica:</p>
                    <ul className="space-y-1">
                      {protocol.clinicalPresentation.slice(0, 2).map((symptom, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span className="line-clamp-1">{symptom}</span>
                        </li>
                      ))}
                      {protocol.clinicalPresentation.length > 2 && (
                        <li className="text-xs text-gray-500 italic">
                          +{protocol.clinicalPresentation.length - 2} más...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{protocol.initialManagement.length} pasos</span>
                      <span>•</span>
                      <span>{protocol.medications.length} fármacos</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      <span>Ver protocolo</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sin resultados */}
        {filteredProtocols.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No se encontraron protocolos</p>
            <p className="text-sm text-gray-500 mt-1">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
