// app/components/PasoRenderer.tsx
"use client";

import { isMcq, isShort, McqOpcion, Paso } from "@/lib/types";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useCaso } from "./CasoContext";
import { ImageViewer } from "./ImageViewer";
import { evaluateShortAnswer } from "@/lib/scoring";
import cx from "clsx";

interface Props {
  pasoId: string;
  onAnswer: (pasoId: string, opcion: McqOpcion | any, opts?: { skipAdvance?: boolean }) => void;
}

export default function PasoRenderer({ pasoId, onAnswer }: Props) {
  const { caso, respuestas, goToNextStep } = useCaso();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState(""); 
  const [shortScore, setShortScore] = useState<number | null>(null); // 0, 1 o 2 puntos

  // Usamos 'Paso | undefined' explícitamente para ayudar a TypeScript
  const stepData: Paso | undefined = useMemo(
    () => caso.pasos.find((p) => p.id === pasoId),
    [caso.pasos, pasoId]
  );

  const respuestaUsuario = useMemo(
    () => respuestas.find((r) => r.pasoId === pasoId),
    [respuestas, pasoId]
  );

  // Handler para guardar puntos de autoevaluación
  const handleScoreSelection = useCallback((puntos: number) => {
    setShortScore(puntos);
    // Actualizar la respuesta con los puntos
    if (respuestaUsuario) {
      onAnswer(pasoId, { 
        ...respuestaUsuario, 
        puntos 
      }, { skipAdvance: true });
    }
  }, [pasoId, respuestaUsuario, onAnswer]);

  // Handler para enviar respuesta Short - DEBE estar en nivel superior
  const handleSubmitShort = useCallback(() => {
    if (!stepData || !isShort(stepData)) return;
    
    const puntosMaximos = stepData.puntosMaximos || 2;
    const criterios = stepData.criteriosEvaluacion || [];
    const puntosObtenidos = evaluateShortAnswer(shortAnswer, criterios, puntosMaximos);
    
    setShortScore(puntosObtenidos);
    onAnswer(pasoId, { 
      id: 'dev', 
      texto: shortAnswer, 
      esCorrecta: true,
      puntos: puntosObtenidos 
    }, { skipAdvance: true });
  }, [shortAnswer, stepData, pasoId, onAnswer, evaluateShortAnswer]);

  useEffect(() => {
    setSelectedOption(null);
    setShortAnswer("");
    setShortScore(null);
  }, [pasoId]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newlySelectedOptionId = event.target.value;
    setSelectedOption(newlySelectedOptionId);

    if (!!respuestaUsuario) return;

    if (stepData && isMcq(stepData)) {
      const opcionSeleccionada = stepData.opciones.find(o => o.id === newlySelectedOptionId);
      if (opcionSeleccionada) {
        onAnswer(pasoId, opcionSeleccionada);
      }
    }
  };

  if (!stepData) {
    return <div className="text-danger-500">Error: Cargando datos...</div>;
  }

  // Fallback robusto para obtener el texto de la pregunta (algunos orígenes usan 'text' o 'texto')
  const rawEnunciado = (stepData as any).enunciado || (stepData as any).text || (stepData as any).texto || (stepData as any).prompt || (stepData as any).pregunta || '';

  // Si el enunciado es un título genérico como "Puntos Clave del Caso",
  // mostramos un prompt más explícito para guiar la respuesta del estudiante.
  const isGenericPointsTitle = /puntos\s*(clave|clave del caso|clave del caso)/i.test(rawEnunciado.trim());
  const displayEnunciado = isGenericPointsTitle
    ? 'Redacta en 3–5 líneas los puntos clave de este caso clínico (foco en diagnóstico, conducta y seguimiento).' 
    : rawEnunciado;

  // --- CASO 1: Pregunta de Desarrollo (Short) con Evaluación Automática ---
  if (isShort(stepData)) {
    const puntosMaximos = stepData.puntosMaximos || 2;
    const criterios = stepData.criteriosEvaluacion || [];
    
    return (
      <div className="mt-4 md:mt-6 animate-fade-in bg-white border-2 border-blue-200 rounded-xl p-5 shadow-md"> 
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base md:text-lg font-semibold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Pregunta de Desarrollo</h3>
          <span className="text-xs font-semibold text-white bg-gradient-to-r from-[#DC2626] to-[#F87171] px-3 py-1.5 rounded-full shadow-sm">
            {puntosMaximos} {puntosMaximos === 1 ? 'punto' : 'puntos'}
          </span>
        </div>
        <p className="text-sm md:text-base text-gray-700 mb-4 font-medium">{displayEnunciado}</p>

        {/* Imágenes de la pregunta */}
        {stepData.imagenes && stepData.imagenes.length > 0 && (
          <div className="mb-4">
            <ImageViewer images={stepData.imagenes} />
          </div>
        )}

        <textarea 
            className="w-full p-3 border border-neutral-300 rounded-lg mb-4 text-sm focus:ring-[var(--km-blue)] focus:border-[var(--km-blue)]"
            rows={6}
            placeholder="Escribe tu análisis aquí..."
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            disabled={!!respuestaUsuario}
        />

        <div className="flex items-center gap-3">
          {!respuestaUsuario ? (
            <button
              onClick={handleSubmitShort}
              className="btn btn-primary flex-1 text-sm"
              disabled={!shortAnswer.trim()}
            >
              Enviar respuesta
            </button>
          ) : (
            <button onClick={() => goToNextStep()} className="btn btn-secondary flex-1 text-sm">Continuar</button>
          )}
        </div>

        {/* Resultado automático */}
        {respuestaUsuario && shortScore !== null && (
          <div className="mt-4 space-y-3">
            <div className={`p-4 rounded-lg border ${
              shortScore === puntosMaximos 
                ? 'bg-success-50 border-success-300' 
                : shortScore > 0 
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-orange-50 border-orange-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-neutral-900">
                  {shortScore === puntosMaximos && '✅ ¡Excelente respuesta!'}
                  {shortScore > 0 && shortScore < puntosMaximos && '⚠️ Respuesta parcial'}
                  {shortScore === 0 && '📝 Respuesta incompleta'}
                </span>
                <span className="text-lg font-bold text-[var(--km-primary)]">
                  {shortScore}/{puntosMaximos} puntos
                </span>
              </div>
              
              {criterios.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-700 mb-2">Criterios evaluados:</p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    {criterios.map((criterio, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[var(--km-coral)] mt-0.5">•</span>
                        <span>{criterio}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {stepData.guia && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 text-sm text-gray-700 whitespace-pre-wrap shadow-sm">
                <h4 className="font-semibold mb-2 text-[#BC4639]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Guía de respuesta esperada</h4>
                <div>{stepData.guia}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- CASO 2: Selección Múltiple (MCQ) ---
  if (isMcq(stepData)) {
     return (
      <div className="mt-4 md:mt-6 animate-fade-in bg-white border-2 border-blue-200 rounded-xl p-5 shadow-md">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-[#1E3A5F] leading-snug" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          {displayEnunciado}
        </h3>

        {/* Imágenes de la pregunta MCQ */}
        {stepData.imagenes && stepData.imagenes.length > 0 && (
          <div className="mb-4">
            <ImageViewer images={stepData.imagenes} />
          </div>
        )}
        
        <div className="space-y-2.5">
          {stepData.opciones.map((opcion) => {
            const isSelected = selectedOption === opcion.id;
            const isAnswered = !!respuestaUsuario;
            const isCorrect = opcion.esCorrecta;
            // Si ya respondió, mostramos si su selección fue incorrecta
            const wasSelectedAndWrong = isAnswered && respuestaUsuario.opcionId === opcion.id && !isCorrect;

                return (
              <label key={opcion.id} className={cx(
                  "flex items-start p-3 rounded-xl border-2 transition-all cursor-pointer text-sm md:text-base",
                  {
                    "!cursor-not-allowed opacity-90": isAnswered,
                    "bg-gradient-to-r from-red-50 to-orange-50 border-[#DC2626] shadow-md ring-2 ring-red-200/50": isSelected && !isAnswered,
                    "bg-white border-blue-200 hover:border-[#3B82F6] hover:shadow-sm hover:bg-blue-50/30": !isSelected && !isAnswered,
                    "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400 ring-2 ring-emerald-300/50 shadow-md": isCorrect && isAnswered,
                    "bg-gradient-to-r from-red-100 to-orange-100 border-red-400 ring-2 ring-red-300/50 shadow-md": wasSelectedAndWrong,
                    "bg-neutral-50 border-neutral-200 opacity-70": isAnswered && !isCorrect && !wasSelectedAndWrong,
                  }
                )}>
                <input type="radio" name={stepData.id} value={opcion.id} checked={isSelected} onChange={handleOptionChange} disabled={isAnswered}
                  className="mt-0.5 h-5 w-5 text-[#DC2626] border-gray-300 focus:ring-[#DC2626] shrink-0" />
                <span className="ml-3 flex-1">
                  <span className={isAnswered ? "text-[var(--km-text-700)]" : "text-[var(--km-text-900)]"}>{opcion.texto}</span>
                  {isAnswered && (isCorrect || wasSelectedAndWrong) && (
                      <div className={cx("mt-2 text-xs p-2 rounded-lg animate-fade-in", isCorrect ? "bg-success-100/50 text-success-800" : "bg-danger-100/50 text-danger-800")}>
                        <strong>{isCorrect ? "¡Correcto!" : "Incorrecto."}</strong> {opcion.explicacion}
                      </div>
                    )}
                </span>
              </label>
            );
          })}
        </div>
          
          {/* Botón de navegación para MCQ */}
          {respuestaUsuario && (
            <div className="mt-4">
              <button 
                onClick={() => goToNextStep()} 
                className="btn btn-primary w-full md:w-auto"
              >
                Siguiente pregunta →
              </button>
            </div>
          )}

          {/* Feedback docente se muestra solo al FINAL del caso, no aquí */}
      </div>
    );
  }

  return <div className="text-danger-500">Tipo de paso no soportado.</div>;
}
