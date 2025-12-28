// app/components/TutorButton.tsx
'use client';

import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface TutorButtonProps {
  caseId: string;
  preguntaId: string;
  opcionElegida: string;
  opcionCorrecta: string;
  disabled?: boolean;
  yaUsado?: boolean;
}

export default function TutorButton({
  caseId,
  preguntaId,
  opcionElegida,
  opcionCorrecta,
  disabled = false,
  yaUsado = false,
}: TutorButtonProps) {
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const solicitarAyuda = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          preguntaId,
          opcionElegida,
          opcionCorrecta,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al solicitar ayuda');
      }

      setRespuesta(data.respuesta);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el tutor IA');
    } finally {
      setLoading(false);
    }
  };

  // Si ya fue usado, mostrar mensaje
  if (yaUsado) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
        <AlertCircle className="inline-block w-4 h-4 mr-2 text-gray-400" />
        Ya usaste el tutor en este caso
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Botón de ayuda */}
      {!respuesta && (
        <button
          onClick={solicitarAyuda}
          disabled={disabled || loading}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-3
            rounded-lg font-medium transition-all
            ${
              disabled || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
            }
          `}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Consultando tutor...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Solicitar ayuda del tutor IA (1 uso)
            </>
          )}
        </button>
      )}

      {/* Respuesta del tutor */}
      {respuesta && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-2">
                Tu tutor te pregunta:
              </h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {respuesta}
              </p>
              <p className="text-xs text-gray-500 mt-3 italic">
                💡 Reflexiona sobre estas preguntas antes de revisar las explicaciones
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertCircle className="inline-block w-4 h-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
}
