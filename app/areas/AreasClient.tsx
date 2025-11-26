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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header */}
      <div className="bg-gradient-km-primary text-white shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Elige el Área que Quieres Practicar
            </h1>
            <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto">
              Selecciona el área clínica y accede a casos reales de matronería
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Stats Bar */}
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-md border-2 border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-km-cardinal mb-1">54</div>
                <div className="text-sm text-km-text-700 font-semibold">Casos Totales</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">4</div>
                <div className="text-sm text-km-text-700 font-semibold">Áreas Clínicas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">2</div>
                <div className="text-sm text-km-text-700 font-semibold">Áreas Disponibles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">2</div>
                <div className="text-sm text-km-text-700 font-semibold">Modos de Estudio</div>
              </div>
            </div>
          </div>

          {/* Areas Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = selectedArea === area.id;
              const isDisabled = !area.available;

              return (
                <button
                  key={area.id}
                  onClick={() => handleSelectArea(area.id, area.available)}
                  disabled={isDisabled}
                  className={`
                    relative p-8 rounded-2xl border-3 transition-all duration-300 text-left
                    ${isSelected ? 'scale-105 shadow-2xl ring-4 ring-km-crimson/30' : 'hover:scale-102 shadow-lg'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${area.borderColor}
                    bg-gradient-to-br ${area.gradient}
                  `}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 bg-km-crimson text-white rounded-full p-3 shadow-xl animate-bounce-small">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Disabled badge */}
                  {isDisabled && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-neutral-500 text-white text-xs font-bold rounded-full">
                      PRÓXIMAMENTE
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`
                    mb-4 p-4 rounded-xl inline-flex
                    ${isSelected ? 'bg-white shadow-lg scale-110' : 'bg-white/70'}
                    transition-all duration-300
                  `}>
                    <Icon className={`h-10 w-10 ${area.color}`} />
                  </div>

                  {/* Case count badge */}
                  {area.available && area.caseCount && area.caseCount > 0 && (
                    <div className={`
                      inline-block mb-3 px-4 py-1.5 rounded-full text-sm font-bold
                      ${isSelected ? 'bg-white/90 shadow-md' : 'bg-white/70'}
                      ${area.color}
                    `}>
                      {area.caseCount} casos disponibles
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`text-xl md:text-2xl font-extrabold mb-3 leading-tight ${
                    isSelected ? 'text-km-crimson' : 'text-km-navy'
                  } transition-colors`} style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                    {area.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm md:text-base text-km-text-700 leading-relaxed">
                    {area.subtitle}
                  </p>

                  {/* Arrow indicator */}
                  {area.available && (
                    <div className={`
                      mt-4 flex items-center gap-2 text-sm font-semibold
                      ${isSelected ? area.color : 'text-km-text-500'}
                      transition-colors
                    `}>
                      Ver casos
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedArea}
              className={`
                px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300
                ${selectedArea 
                  ? 'bg-gradient-km-primary text-white hover:scale-105 shadow-2xl hover:shadow-km-crimson/50' 
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }
              `}
            >
              {selectedArea ? '🚀 Acceder a los Casos' : '👆 Selecciona un área primero'}
            </button>

            {selectedArea && (
              <p className="mt-4 text-sm text-km-text-700 animate-fade-in">
                💡 Consejo: Comienza con casos de dificultad baja para familiarizarte con el sistema
              </p>
            )}
          </div>

          {/* Info Card */}
          <div className="mt-12 p-6 bg-blue-50 border-2 border-blue-300 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-3 text-lg">� ¿Cómo están organizadas las áreas?</h4>
                <div className="text-sm text-blue-800 space-y-3">
                  <p>
                    <strong>Área 1 - Ginecología y Salud de la Mujer:</strong> Patología ginecológica, endocrinología e infectología. Incluye ITS e Infectología, Climaterio y Menopausia.
                  </p>
                  <p>
                    <strong>Área 2 - Salud Sexual y Reproductiva:</strong> Atención Primaria, regulación de fertilidad y consejería. Incluye Anticoncepción y Consejería en Salud Integral.
                  </p>
                  <p>
                    <strong>Área 3 - Obstetricia y Puerperio:</strong> Control prenatal, parto, puerperio y urgencias obstétricas. Incluye casos de Embarazo, Parto y Puerperio.
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
    </div>
  );
}
