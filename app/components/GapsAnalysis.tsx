// app/components/GapsAnalysis.tsx
'use client';

import { useState, useEffect } from 'react';
import { Brain, Loader2, TrendingUp, BookOpen } from 'lucide-react';

interface Error {
  preguntaId: string;
  opcionElegida: string;
}

interface GapsAnalysisProps {
  caseId: string;
  errores: Error[];
  area: string;
  modulo: string;
}

interface Analisis {
  concepto_debil: string;
  pregunta_reflexion: string;
  recomendacion: string;
}

export default function GapsAnalysis({
  caseId,
  errores,
  area,
  modulo,
}: GapsAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo analizar si hay al menos 2 errores
    if (errores.length >= 2) {
      analizarGaps();
    }
  }, [errores, caseId]);

  const analizarGaps = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          errores: errores.map(e => ({
            preguntaId: e.preguntaId,
            opcionElegida: e.opcionElegida,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al analizar');
      }

      if (data.sinAnalisis) {
        return; // No hay suficientes errores
      }

      setAnalisis(data.analisis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // No mostrar nada si no hay suficientes errores
  if (errores.length < 2) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-blue-700">Analizando tu patrón de errores...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return null; // Fallar silenciosamente
  }

  // Análisis completado
  if (analisis) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Análisis de aprendizaje
              </h3>
              <p className="text-sm text-blue-700">
                Detectamos un patrón en tus respuestas
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                  Concepto a reforzar
                </p>
                <p className="font-medium text-gray-900">
                  {analisis.concepto_debil}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                  Pregunta de reflexión
                </p>
                <p className="text-gray-700 italic">
                  {analisis.pregunta_reflexion}
                </p>
              </div>

              <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
                <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                    Recomendación
                  </p>
                  <p className="text-sm text-gray-700">
                    {analisis.recomendacion}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 italic">
              💡 Este análisis te ayuda a identificar oportunidades de mejora específicas
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
