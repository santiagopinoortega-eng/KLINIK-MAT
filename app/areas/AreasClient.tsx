// app/areas/AreasClient.tsx
"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  BeakerIcon,
  UserGroupIcon,
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface ClinicalArea {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  borderColor: string;
  available: boolean;
  caseCount?: number;
}

const AREAS: ClinicalArea[] = [
  {
    id: 'embarazo',
    title: 'EMBARAZO Y CONTROL PRENATAL',
    subtitle: 'Control prenatal, ecografía, patología del embarazo',
    icon: UserGroupIcon,
    color: 'text-blue-600',
    gradient: 'from-blue-50 via-sky-50 to-cyan-50',
    borderColor: 'border-blue-300 hover:border-blue-500',
    available: false,
    caseCount: 0
  },
  {
    id: 'parto',
    title: 'PARTO Y ATENCIÓN INTRAPARTO',
    subtitle: 'Trabajo de parto, monitoreo fetal, atención del parto',
    icon: BeakerIcon,
    color: 'text-indigo-600',
    gradient: 'from-indigo-50 via-purple-50 to-violet-50',
    borderColor: 'border-indigo-300 hover:border-indigo-500',
    available: false,
    caseCount: 0
  },
  {
    id: 'puerperio',
    title: 'PUERPERIO Y LACTANCIA',
    subtitle: 'Puerperio normal y patológico, lactancia materna',
    icon: HeartIcon,
    color: 'text-pink-600',
    gradient: 'from-pink-50 via-rose-50 to-red-50',
    borderColor: 'border-pink-300 hover:border-pink-500',
    available: false,
    caseCount: 0
  },
  {
    id: 'urgencias-obstetricas',
    title: 'URGENCIAS OBSTÉTRICAS',
    subtitle: 'Hemorragias, preeclampsia, emergencias maternas',
    icon: SparklesIcon,
    color: 'text-red-600',
    gradient: 'from-red-50 via-orange-50 to-amber-50',
    borderColor: 'border-red-300 hover:border-red-500',
    available: true,
    caseCount: 1
  },
  {
    id: 'ginecologia',
    title: 'GINECOLOGÍA',
    subtitle: 'Patología ginecológica, climaterio, endocrinología',
    icon: HeartIcon,
    color: 'text-rose-600',
    gradient: 'from-rose-50 via-pink-50 to-fuchsia-50',
    borderColor: 'border-rose-300 hover:border-rose-500',
    available: false,
    caseCount: 0
  },
  {
    id: 'salud-sexual',
    title: 'SALUD SEXUAL Y ANTICONCEPCIÓN',
    subtitle: 'Regulación de fertilidad, métodos anticonceptivos',
    icon: SparklesIcon,
    color: 'text-purple-600',
    gradient: 'from-purple-50 via-violet-50 to-indigo-50',
    borderColor: 'border-purple-300 hover:border-purple-500',
    available: false,
    caseCount: 0
  },
  {
    id: 'its',
    title: 'ITS (INFECCIONES DE TRANSMISIÓN SEXUAL)',
    subtitle: 'Diagnóstico y manejo de infecciones de transmisión sexual',
    icon: BeakerIcon,
    color: 'text-orange-600',
    gradient: 'from-orange-50 via-amber-50 to-yellow-50',
    borderColor: 'border-orange-300 hover:border-orange-500',
    available: false,
    caseCount: 0
  },
  {
    id: 'neonatologia',
    title: 'NEONATOLOGÍA / RECIÉN NACIDO',
    subtitle: 'Atención inmediata, patología neonatal, reanimación',
    icon: UserGroupIcon,
    color: 'text-teal-600',
    gradient: 'from-teal-50 via-emerald-50 to-green-50',
    borderColor: 'border-teal-300 hover:border-teal-500',
    available: false,
    caseCount: 0
  }
];

export default function AreasClient() {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'areas' | 'stats' | 'recursos' | 'progreso'>('areas');

  const handleSelectArea = (areaId: string, available: boolean) => {
    if (!available) return;
    setSelectedArea(areaId);
  };

  const handleContinue = () => {
    if (selectedArea) {
      router.push(`/casos?area=${selectedArea}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-white pb-20 md:pb-8">
      {/* Top Navigation Bar - Desktop (hidden on mobile) */}
      <div className="hidden md:block sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Navegación principal - Distribuida */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('areas')}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'areas'
                    ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-500/30'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <BookOpenIcon className="w-5 h-5" />
                <span>Áreas de Estudio</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'stats'
                    ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-500/30'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Estadísticas</span>
              </button>
              <button
                onClick={() => setActiveTab('recursos')}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'recursos'
                    ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-500/30'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <AcademicCapIcon className="w-5 h-5" />
                <span>Recursos</span>
              </button>
              <button
                onClick={() => setActiveTab('progreso')}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'progreso'
                    ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-500/30'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <StarIcon className="w-5 h-5" />
                <span>Mi Progreso</span>
              </button>
            </nav>
            
            {/* Badge de disponibilidad */}
            <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="font-semibold text-green-700 text-sm">2 áreas disponibles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header - Hero Section */}
      <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Formación Clínica Profesional
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Áreas de Especialización Obstétrica
            </h1>
            <p className="text-lg md:text-xl text-red-50 max-w-3xl mx-auto leading-relaxed">
              Casos clínicos reales basados en guías MINSAL. Aprende practicando en un entorno seguro y profesional.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {/* Tab Content: Areas */}
        {activeTab === 'areas' && (
          <div className="space-y-8">
            {/* Stats Cards - Modernos y Clínicos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">54</div>
                </div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Casos Totales</div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">4</div>
                </div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Áreas Clínicas</div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">2</div>
                </div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Disponibles</div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">2</div>
                </div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Modos de Práctica</div>
              </div>
            </div>

            {/* Areas Grid - Diseño Clínico Profesional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AREAS.map((area) => {
                const Icon = area.icon;
                const isSelected = selectedArea === area.id;
                
                return (
                  <div
                    key={area.id}
                    onClick={() => handleSelectArea(area.id, area.available)}
                    className={`
                      relative overflow-hidden rounded-2xl border-2 transition-all duration-500 cursor-pointer group
                      ${isSelected ? 'ring-4 ring-red-500/30 scale-[1.02] border-red-400 shadow-2xl shadow-red-200/50' : 'border-gray-200 shadow-lg'}
                      ${area.available ? 'hover:shadow-2xl hover:border-red-300 transform hover:scale-[1.02]' : 'opacity-70 cursor-not-allowed'}
                    `}
                  >
                    {/* Badge Superior */}
                    <div className="absolute top-4 right-4 z-10">
                      {area.available ? (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          {area.caseCount} casos activos
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          🔒 Próximamente
                        </div>
                      )}
                    </div>

                    {/* Header con Gradiente */}
                    <div className={`bg-gradient-to-br ${area.gradient} p-8 relative overflow-hidden`}>
                      {/* Patrón de fondo sutil */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                      </div>

                      <div className="relative">
                        <div className={`inline-flex p-4 rounded-2xl bg-white shadow-lg mb-6 ${area.color}`}>
                          <Icon className="h-10 w-10" strokeWidth={2} />
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-3 ${area.color} leading-tight`}>
                          {area.title}
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          {area.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 bg-white">
                      {isSelected && area.available && (
                        <div className="mb-4 flex items-center gap-3 text-red-600 font-semibold animate-fade-in">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>Área seleccionada - Lista para practicar</span>
                        </div>
                      )}

                      {area.available && (
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <div className="text-lg font-bold text-gray-900">{area.caseCount}</div>
                            <div className="text-xs text-gray-600">Casos</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <div className="text-lg font-bold text-gray-900">3</div>
                            <div className="text-xs text-gray-600">Niveles</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <div className="text-lg font-bold text-gray-900">MINSAL</div>
                            <div className="text-xs text-gray-600">Basado</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Overlay para áreas no disponibles */}
                    {!area.available && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-gray-200">
                          <p className="text-gray-700 font-bold text-center">
                            🚧 En desarrollo
                          </p>
                          <p className="text-xs text-gray-600 text-center mt-1">Disponible pronto</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Continue Button - Mejorado */}
            <div className="text-center">
              <button
                onClick={handleContinue}
                disabled={!selectedArea}
                className={`
                  group relative px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 transform
                  ${selectedArea 
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white hover:from-red-700 hover:via-rose-700 hover:to-red-800 shadow-xl hover:shadow-2xl hover:scale-105 shadow-red-300/50' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  {selectedArea ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Comenzar a Practicar
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      Selecciona un área para continuar
                    </>
                  )}
                </span>
              </button>

              {selectedArea && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 animate-fade-in">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">Consejo: Comienza con casos de dificultad baja</span>
                </div>
              )}
            </div>

            {/* Info Card Profesional */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">📚 Organización de Áreas Clínicas</h4>
                  <div className="space-y-3 text-sm text-blue-900">
                    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl opacity-60">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-700">1</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Embarazo y Control Prenatal</p>
                        <p className="text-xs text-gray-700 mt-1">Control prenatal, ecografía, patología del embarazo • <span className="font-bold">Próximamente</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl opacity-60">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-700">2</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Parto y Atención Intraparto</p>
                        <p className="text-xs text-gray-700 mt-1">Trabajo de parto, monitoreo fetal, atención del parto • <span className="font-bold">Próximamente</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl opacity-60">
                      <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-pink-700">3</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Puerperio y Lactancia</p>
                        <p className="text-xs text-gray-700 mt-1">Puerperio normal y patológico, lactancia materna • <span className="font-bold">Próximamente</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-red-700">4</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Urgencias Obstétricas</p>
                        <p className="text-xs text-gray-700 mt-1">Hemorragias, preeclampsia, emergencias maternas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl opacity-60">
                      <div className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-rose-700">5</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Ginecología</p>
                        <p className="text-xs text-gray-700 mt-1">Patología ginecológica, climaterio, endocrinología • <span className="font-bold">Próximamente</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl opacity-60">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-700">6</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Salud Sexual y Anticoncepción</p>
                        <p className="text-xs text-gray-700 mt-1">Regulación de fertilidad, métodos anticonceptivos • <span className="font-bold">Próximamente</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl opacity-60">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-700">7</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">ITS (Infecciones de Transmisión Sexual)</p>
                        <p className="text-xs text-gray-700 mt-1">Diagnóstico y manejo de infecciones de transmisión sexual • <span className="font-bold">Próximamente</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl opacity-60">
                      <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-teal-700">8</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Neonatología / Recién Nacido</p>
                        <p className="text-xs text-gray-700 mt-1">Atención inmediata, patología neonatal, reanimación • <span className="font-bold">Próximamente</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Stats */}
        {activeTab === 'stats' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Estadísticas Generales</h2>
              <div className="text-center py-12">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-600">Las estadísticas se mostrarán aquí</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Recursos */}
        {activeTab === 'recursos' && (
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Centro de <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Recursos</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Herramientas, guías y recursos de referencia para potenciar tu aprendizaje en obstetricia
              </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Recursos Disponibles</p>
                    <p className="text-2xl font-bold text-gray-900">10</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Guías Oficiales</p>
                    <p className="text-2xl font-bold text-gray-900">15+</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Métodos Anticonceptivos</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recursos Destacados */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Recursos Disponibles
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Simulador FCF - DESTACADO */}
                <Link href="/recursos/simulador-fcf" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-emerald-300 h-full transition-all duration-300 group-hover:shadow-2xl group-hover:border-emerald-400 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse">
                        ⭐ Destacado
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      Simulador de Latidos Cardiofetales
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Simulador interactivo de frecuencia cardiaca fetal con patrones normales y patológicos. Practica la interpretación de FCF con audio realista y casos clínicos.
                    </p>
                    
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Iniciar simulador</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Calculadoras Obstétricas */}
                <Link href="/recursos/calculadoras" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-purple-300 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-purple-100 text-purple-800 border-purple-200">
                        Interactivo
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      Calculadoras Obstétricas
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Calcula edad gestacional, fecha probable de parto, IMC pregestacional, percentiles de peso fetal y más herramientas clínicas esenciales.
                    </p>
                    
                    <div className="flex items-center gap-2 text-purple-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Usar calculadoras</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* PubMed Search - Mejorado */}
                <Link href="/recursos/pubmed" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-indigo-300 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-indigo-100 text-indigo-800 border-indigo-200">
                        API Integrada
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      Buscador PubMed Especializado
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      API oficial de PubMed integrada. Búsqueda especializada en +35 millones de artículos con filtros obstétricos predefinidos y acceso directo.
                    </p>
                    
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Buscar artículos</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Bases de Datos Científicas */}
                <Link href="/recursos/bases-datos" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-teal-300 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-teal-100 text-teal-800 border-teal-200">
                        Colección
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      Bases de Datos Científicas
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Acceso directo a 16+ bases de datos médicas, revistas internacionales y sociedades científicas. Cochrane, UpToDate, ACOG, RCOG y más.
                    </p>
                    
                    <div className="flex items-center gap-2 text-teal-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Ver bases de datos</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Timer Pomodoro */}
                <Link href="/recursos/pomodoro" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-orange-300 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-orange-100 text-orange-800 border-orange-200">
                        Productividad
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      Timer Pomodoro
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Técnica de estudio con intervalos de 25 minutos y descansos programados. Maximiza tu concentración y rendimiento académico.
                    </p>
                    
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Iniciar timer</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Protocolos de Urgencia */}
                <Link href="/recursos/protocolos-urgencia" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-red-300 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-red-100 text-red-800 border-red-200">
                        Urgencias
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      Protocolos de Urgencia Obstétrica
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Guías clínicas de emergencias obstétricas basadas en MINSAL, ACOG, RCOG y evidencia gold standard. Acceso rápido en situaciones críticas.
                    </p>
                    
                    <div className="flex items-center gap-2 text-red-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Ver protocolos</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Escalas y Scores */}
                <Link href="/recursos/escalas-scores" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-indigo-300 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-indigo-100 text-indigo-800 border-indigo-200">
                        Valoración
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      Escalas y Scores Clínicos
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Acceso rápido a escalas de valoración: Bishop, Apgar, Ballard, Silverman-Andersen, Perfil Biofísico y más. Con referencias MINSAL y gold standard.
                    </p>
                    
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Ver escalas</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Anticonceptivos */}
                <Link href="/recursos/anticonceptivos" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-rose-300 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-rose-100 text-rose-800 border-rose-200">
                        Interactivo
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                      Guía Rápida de Anticonceptivos
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Guía interactiva completa con criterios de elegibilidad OMS, efectividad, contraindicaciones y recomendaciones para cada método anticonceptivo.
                    </p>
                    
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Explorar recurso</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* MINSAL */}
                <Link href="/recursos/minsal" className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-blue-300 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 bg-blue-100 text-blue-800 border-blue-200">
                        Oficial
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      Normativas MINSAL
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Acceso directo a guías clínicas, protocolos oficiales y normativas del Ministerio de Salud de Chile sobre salud sexual y reproductiva.
                    </p>
                    
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Explorar recurso</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Juegos Educativos */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                Juegos Educativos
              </h3>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sopa de Letras */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">🔤 Sopa de Letras</h4>
                      <p className="text-sm text-gray-600">
                        Encuentra términos médicos ocultos en el tablero
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-lg">
                      NUEVO
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Temas</p>
                      <p className="font-bold text-purple-600">4 áreas</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Palabras</p>
                      <p className="font-bold text-purple-600">10 por juego</p>
                    </div>
                  </div>

                  <Link 
                    href="/recursos/juegos/sopa-de-letras"
                    className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-center hover:shadow-lg transition-all hover:scale-105"
                  >
                    Jugar Ahora →
                  </Link>
                </div>

                {/* Ahorcado */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">🎮 Ahorcado Matronil</h4>
                      <p className="text-sm text-gray-600">
                        Adivina términos obstétricos con pistas clínicas
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg">
                      NUEVO
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Categorías</p>
                      <p className="font-bold text-blue-600">4 áreas</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Términos</p>
                      <p className="font-bold text-blue-600">25+ palabras</p>
                    </div>
                  </div>

                  <Link 
                    href="/recursos/juegos/ahorcado"
                    className="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl text-center hover:shadow-lg transition-all hover:scale-105"
                  >
                    Jugar Ahora →
                  </Link>
                </div>
              </div>

              {/* Banner de beneficios */}
              <div className="mt-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-5 border-2 border-indigo-200">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🧠</div>
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2">Aprende jugando</h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Mejora tu retención de terminología medica con juegos diseñados específicamente para obstetricia, ginecología, lactancia y neonatología. Perfectos para estudiar entre casos clínicos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximos Recursos */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Próximos Recursos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Atlas Anatomía */}
                <Link href="/recursos/atlas" className="group block">
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200 h-full transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-bold border-2 bg-purple-100 text-purple-800 border-purple-200">
                        Disponible
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">Atlas de Anatomía Obstétrica</h4>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      10+ imágenes anatómicas con descripciones y relevancia clínica detallada.
                    </p>
                    <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs group-hover:gap-3 transition-all">
                      <span>Explorar atlas</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Atlas Ecografía */}
                <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200 opacity-75 cursor-not-allowed">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-bold border-2 bg-gray-100 text-gray-800 border-gray-200">
                      Próximamente
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Atlas de Ecografía</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Imágenes de referencia ecográfica obstétrica con descripciones detalladas.
                  </p>
                </div>

                {/* Videos Educativos */}
                <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200 opacity-75 cursor-not-allowed">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-bold border-2 bg-gray-100 text-gray-800 border-gray-200">
                      Próximamente
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Videos Educativos</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Biblioteca de videos sobre técnicas de exploración física y procedimientos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Progreso */}
        {activeTab === 'progreso' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Progreso</h2>
              <div className="text-center py-12">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p className="text-gray-600">Tu progreso se mostrará aquí</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar - Mobile (visible solo en móvil) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl">
        <div className="grid grid-cols-4 h-20">
          <button
            onClick={() => setActiveTab('areas')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'areas'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600'
            }`}
          >
            <BookOpenIcon className="w-6 h-6" strokeWidth={activeTab === 'areas' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Áreas</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'stats'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600'
            }`}
          >
            <ChartBarIcon className="w-6 h-6" strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('recursos')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'recursos'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600'
            }`}
          >
            <AcademicCapIcon className="w-6 h-6" strokeWidth={activeTab === 'recursos' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Recursos</span>
          </button>
          <button
            onClick={() => setActiveTab('progreso')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'progreso'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600'
            }`}
          >
            <StarIcon className="w-6 h-6" strokeWidth={activeTab === 'progreso' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Progreso</span>
          </button>
        </div>
      </div>
    </div>
  );
}
