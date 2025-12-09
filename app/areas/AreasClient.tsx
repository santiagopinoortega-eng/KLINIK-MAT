// app/areas/AreasClient.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  HeartIcon, 
  BeakerIcon,
  UserGroupIcon,
  SparklesIcon
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
    id: 'ginecologia',
    title: 'ÁREA 1: GINECOLOGÍA Y SALUD DE LA MUJER',
    subtitle: 'Patología, disfunciones y endocrinología ginecológica',
    icon: HeartIcon,
    color: 'text-rose-700',
    gradient: 'from-rose-50 via-pink-50 to-red-50',
    borderColor: 'border-rose-300 hover:border-rose-500',
    available: true,
    caseCount: 25
  },
  {
    id: 'ssr',
    title: 'ÁREA 2: SALUD SEXUAL Y REPRODUCTIVA',
    subtitle: 'APS, regulación de fertilidad y promoción de la salud',
    icon: SparklesIcon,
    color: 'text-purple-700',
    gradient: 'from-purple-50 via-violet-50 to-indigo-50',
    borderColor: 'border-purple-300 hover:border-purple-500',
    available: true,
    caseCount: 29
  },
  {
    id: 'obstetricia',
    title: 'ÁREA 3: OBSTETRICIA Y PUERPERIO',
    subtitle: 'Control prenatal, parto, puerperio y urgencias obstétricas',
    icon: UserGroupIcon,
    color: 'text-blue-700',
    gradient: 'from-blue-50 via-cyan-50 to-teal-50',
    borderColor: 'border-blue-300 hover:border-blue-500',
    available: false,
    caseCount: 0
  },
  {
    id: 'neonatologia',
    title: 'ÁREA 4: NEONATOLOGÍA',
    subtitle: 'Recién nacido sano, patológico y lactancia materna',
    icon: BeakerIcon,
    color: 'text-amber-700',
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    borderColor: 'border-amber-300 hover:border-amber-500',
    available: false,
    caseCount: 0
  }
];

export default function AreasClient() {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

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
    <div className="min-h-screen bg-neutral-50/50">
      {/* Header - Responsive */}
      <div className="bg-gradient-km-primary text-white shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-6 md:py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Elige el Área que Quieres Practicar
            </h1>
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-xl mx-auto">
              Selecciona el área clínica y accede a casos reales
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 max-w-5xl">
        {/* Stats Bar - Responsive */}
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-km-red-700 mb-0.5">54</div>
              <div className="text-xs text-km-navy-600 font-medium">Casos Totales</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-0.5">4</div>
              <div className="text-xs text-km-navy-600 font-medium">Áreas Clínicas</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-0.5">2</div>
              <div className="text-xs text-km-navy-600 font-medium">Disponibles</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-0.5">2</div>
              <div className="text-xs text-km-navy-600 font-medium">Modos</div>
            </div>
          </div>
        </div>

        {/* Areas Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {AREAS.map((area) => {
            const Icon = area.icon;
            const isSelected = selectedArea === area.id;
            
            return (
              <div
                key={area.id}
                onClick={() => handleSelectArea(area.id, area.available)}
                className={`
                  relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer min-h-touch md:min-h-0
                  ${isSelected ? 'ring-4 ring-km-red-500/50 scale-[1.02]' : ''}
                  ${area.borderColor}
                  ${area.available ? 'hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]' : 'opacity-60 cursor-not-allowed'}
                `}
              >
                <div className={`bg-gradient-to-br ${area.gradient} p-4 sm:p-6`}>
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-xl bg-white/80 ${area.color}`}>
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    {area.available && (
                      <div className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                        {area.caseCount} casos
                      </div>
                    )}
                    {!area.available && (
                      <div className="bg-neutral-200 text-neutral-600 px-3 py-1 rounded-full text-xs font-bold">
                        Próximamente
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-2 ${area.color}`}>
                    {area.title}
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {area.subtitle}
                  </p>

                  {isSelected && (
                    <div className="mt-4 flex items-center gap-2 text-km-red-600 font-semibold text-sm animate-fade-in">
                      <span>✓</span>
                      <span>Área seleccionada</span>
                    </div>
                  )}
                </div>

                {!area.available && (
                  <div className="absolute inset-0 bg-neutral-900/10 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/90 px-6 py-3 rounded-lg shadow-lg">
                      <p className="text-neutral-700 font-bold">🔒 En desarrollo</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleContinue}
            disabled={!selectedArea}
            className={`
              px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
              ${selectedArea 
                ? 'bg-gradient-km-primary text-white hover:scale-105 shadow-md hover:shadow-lg' 
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }
            `}
          >
            {selectedArea ? '🚀 Acceder a los Casos' : '👆 Selecciona un área primero'}
          </button>

          {selectedArea && (
            <p className="mt-3 text-xs text-km-navy-600 animate-fade-in">
              💡 Consejo: Comienza con casos de dificultad baja
            </p>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50/80 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">📋 ¿Cómo están organizadas las áreas?</h4>
              <div className="text-xs text-blue-800 space-y-2">
                <p>
                  <strong>Área 1 - Ginecología y Salud de la Mujer:</strong> Patología ginecológica, endocrinología e infectología.
                </p>
                <p>
                  <strong>Área 2 - Salud Sexual y Reproductiva:</strong> Atención Primaria, regulación de fertilidad y consejería.
                </p>
                <p>
                  <strong>Área 3 - Obstetricia y Puerperio:</strong> Control prenatal, parto, puerperio y urgencias obstétricas.
                </p>
                <p>
                  <strong>Área 4 - Neonatología:</strong> Recién nacido sano, patológico y lactancia materna. <span className="font-semibold">Próximamente.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
