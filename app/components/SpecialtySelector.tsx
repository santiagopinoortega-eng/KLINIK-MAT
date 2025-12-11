// app/components/SpecialtySelector.tsx
'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import { getCsrfTokenFromCookie } from '@/lib/csrf-client';

type SpecialtySelectorProps = {
  onComplete?: (specialty: string) => void;
  onSkip?: () => void;
  showSkip?: boolean;
  isModal?: boolean;
};

const SPECIALTIES = [
  {
    value: 'Ginecología',
    label: 'Ginecología',
    icon: '🩺',
    description: 'ITS, Climaterio y Menopausia',
  },
  {
    value: 'Obstetricia',
    label: 'Obstetricia',
    icon: '🤰',
    description: 'Embarazo, Parto, Puerperio',
  },
  {
    value: 'Neonatología',
    label: 'Neonatología',
    icon: '👶',
    description: 'Atención del Recién Nacido',
  },
  {
    value: 'SSR (Salud Sexual y Reproductiva)',
    label: 'SSR',
    icon: '💬',
    description: 'Anticoncepción y Consejería',
  },
  {
    value: 'Todas las áreas',
    label: 'Todas las áreas',
    icon: '🎯',
    description: 'Explorar todo el contenido',
  },
];

export default function SpecialtySelector({
  onComplete,
  onSkip,
  showSkip = false,
  isModal = true,
}: SpecialtySelectorProps) {
  const { user } = useUser();
  const [selected, setSelected] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSave = async () => {
    if (!selected) {
      setError('Por favor selecciona un área de interés');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Obtener token CSRF desde memoria
      const csrfToken = getCsrfTokenFromCookie();

      if (!csrfToken) {
        setError('Error de seguridad. Por favor recarga la página.');
        setSaving(false);
        return;
      }

      // Actualizar perfil del usuario
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ specialty: selected }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar tu especialidad');
      }

      // Recargar datos de Clerk
      await user?.reload();

      // Llamar callback si existe
      if (onComplete) {
        onComplete(selected);
      }
    } catch (err) {
      console.error('Error saving specialty:', err);
      setError('No pudimos guardar tu preferencia. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const content = (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="text-3xl sm:text-4xl mb-2">🎓</div>
        <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-1.5 sm:mb-2">
          ¡Bienvenido/a a KLINIK-MAT!
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 max-w-lg mx-auto">
          Cuéntanos qué área te interesa más para personalizar tu experiencia
          y recomendarte los mejores casos clínicos.
        </p>
      </div>

      {/* Specialty Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-2xl mx-auto">
        {SPECIALTIES.map((specialty) => (
          <button
            key={specialty.value}
            onClick={() => setSelected(specialty.value)}
            className={`
              group relative p-3 sm:p-4 rounded-lg border-2 text-left
              transition-all duration-200 min-h-touch md:min-h-0
              ${
                selected === specialty.value
                  ? 'border-red-600 bg-red-50 shadow-lg scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-md'
              }
            `}
            aria-pressed={selected === specialty.value}
          >
            {/* Icon */}
            <div
              className={`
                text-2xl sm:text-3xl mb-1.5 transition-transform
                ${selected === specialty.value ? 'scale-110' : 'group-hover:scale-110'}
              `}
            >
              {specialty.icon}
            </div>

            {/* Label */}
            <div className="font-bold text-sm sm:text-base text-gray-900 mb-0.5">
              {specialty.label}
            </div>

            {/* Description */}
            <div className="text-xs text-gray-600">
              {specialty.description}
            </div>

            {/* Selected Indicator */}
            {selected === specialty.value && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-center max-w-2xl mx-auto">
        <button
          onClick={handleSave}
          disabled={saving || !selected}
          className={`
            btn w-full sm:w-auto min-h-touch md:min-h-0 text-sm sm:text-base py-2.5 sm:py-3
            ${
              selected && !saving
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </span>
          ) : (
            'Continuar →'
          )}
        </button>

        {showSkip && (
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-xs sm:text-sm text-gray-600 hover:text-red-600 transition-colors underline"
          >
            Omitir por ahora
          </button>
        )}
      </div>

      {/* Benefit Note */}
      <div className="text-center max-w-xl mx-auto">
        <p className="text-[10px] sm:text-xs text-gray-600 leading-snug">
          💡 <strong>¿Por qué es importante?</strong> Te recomendaremos casos específicos
          de tu área, identificaremos tus puntos débiles y te sugeriremos desafíos personalizados.
        </p>
      </div>
    </div>
  );

  // Modal wrapper
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-3 sm:p-4 overflow-y-auto pt-20 md:pt-24">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl my-4 sm:my-8 p-4 sm:p-5 md:p-6 relative max-h-[calc(100vh-8rem)] overflow-y-auto">
          {showSkip && (
            <button
              onClick={handleSkip}
              disabled={saving}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  // Non-modal (inline) version
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
      {content}
    </div>
  );
}
