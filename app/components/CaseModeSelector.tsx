// app/components/CaseModeSelector.tsx
"use client";

import { useState } from 'react';
import { 
  BookOpenIcon, 
  ClockIcon, 
  BoltIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

export type CaseMode = 'study' | 'osce';

interface ModeSelectorProps {
  onModeSelected: (mode: CaseMode) => void;
  caseTitle: string;
}

interface ModeOption {
  id: CaseMode;
  icon: React.ElementType;
  title: string;
  description: string;
  timeLimit: number | null; // segundos (null = sin límite)
  badge?: string;
  color: string;
  gradient: string;
}

const MODES: ModeOption[] = [
  {
    id: 'study',
    icon: BookOpenIcon,
    title: 'Modo Estudio',
    description: 'Sin límite de tiempo. Revisa cada detalle con calma y consulta referencias cuando lo necesites.',
    timeLimit: null,
    badge: 'Recomendado para aprender',
    color: 'border-blue-300 hover:border-blue-500',
    gradient: 'from-blue-50 to-indigo-50'
  },
  {
    id: 'osce',
    icon: AcademicCapIcon,
    title: 'Modo OSCE',
    description: 'Simula una estación de examen OSCE real con 12 minutos para completar el caso clínico.',
    timeLimit: 720, // 12 minutos
    badge: '⏱️ 12 minutos',
    color: 'border-orange-300 hover:border-orange-500',
    gradient: 'from-orange-50 to-amber-50'
  }
];

export default function CaseModeSelector({ onModeSelected, caseTitle }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<CaseMode | null>(null);

  const handleSelectMode = (mode: CaseMode) => {
    setSelectedMode(mode);
  };

  const handleStart = () => {
    if (selectedMode) {
      onModeSelected(selectedMode);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-km-cardinal mb-3">
            {caseTitle}
          </h1>
          <p className="text-lg text-km-text-700 max-w-2xl mx-auto">
            Elige cómo quieres resolver este caso clínico
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                className={`
                  relative p-6 rounded-2xl border-3 transition-all duration-300
                  ${isSelected ? 'scale-105 shadow-xl' : 'hover:scale-102 shadow-md'}
                  ${mode.color}
                  bg-gradient-to-br ${mode.gradient}
                  text-left group
                `}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-km-crimson text-white rounded-full p-2 shadow-lg animate-bounce-small">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  mb-4 p-3 rounded-xl inline-flex
                  ${isSelected ? 'bg-white/80 shadow-md' : 'bg-white/60'}
                  transition-all duration-300
                `}>
                  <Icon className={`h-8 w-8 ${
                    mode.id === 'study' ? 'text-blue-600' :
                    mode.id === 'osce' ? 'text-orange-600' :
                    'text-red-600'
                  }`} />
                </div>

                {/* Badge */}
                {mode.badge && (
                  <div className={`
                    inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3
                    ${isSelected ? 'bg-white/90' : 'bg-white/70'}
                    ${mode.id === 'study' ? 'text-blue-800' : 'text-orange-800'}
                  `}>
                    {mode.badge}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-km-navy mb-2 group-hover:text-km-crimson transition-colors">
                  {mode.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-km-text-700 leading-relaxed">
                  {mode.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Start Button */}
        <div className="text-center animate-fade-in">
          <button
            onClick={handleStart}
            disabled={!selectedMode}
            className={`
              btn btn-lg px-12 py-4 text-lg font-bold
              ${selectedMode 
                ? 'bg-gradient-km-primary text-white hover:scale-105 shadow-xl' 
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }
              transition-all duration-300
            `}
          >
            {selectedMode ? '🚀 Comenzar Caso' : '👆 Selecciona un modo'}
          </button>

          {/* Modo info */}
          {selectedMode && (
            <div className="mt-4 text-sm text-km-text-700 animate-fade-in">
              {selectedMode === 'study' && '💡 Tómate tu tiempo para aprender'}
              {selectedMode === 'osce' && '⏱️ El cronómetro iniciará al comenzar'}
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">💡 Consejo profesional:</p>
              <p>Comienza en <strong>Modo Estudio</strong> para familiarizarte con el caso. Luego desafíate en <strong>Modo OSCE</strong> para simular el examen real.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
