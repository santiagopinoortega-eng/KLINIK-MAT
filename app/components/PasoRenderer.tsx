// app/components/PasoRenderer.tsx
"use client";

import { isMcq, isShort, McqOpcion, Paso } from "@/lib/types";
import { useMemo, useState, useEffect } from "react";
import { useCaso } from "./CasoContext";
import cx from "clsx";

interface Props {
  pasoId: string;
  onAnswer: (pasoId: string, opcion: McqOpcion | any, opts?: { skipAdvance?: boolean }) => void;
}

export default function PasoRenderer({ pasoId, onAnswer }: Props) {
  const { caso, respuestas, goToNextStep } = useCaso();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  // Estado para respuesta corta (opcional por ahora, pero preparado)
  const [shortAnswer, setShortAnswer] = useState(""); 

  // Usamos 'Paso | undefined' explícitamente para ayudar a TypeScript
  const stepData: Paso | undefined = useMemo(
    () => caso.pasos.find((p) => p.id === pasoId),
    [caso.pasos, pasoId]
  );

  const respuestaUsuario = useMemo(
    () => respuestas.find((r) => r.pasoId === pasoId),
    [respuestas, pasoId]
  );

  useEffect(() => {
    setSelectedOption(null);
    setShortAnswer("");
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

  // --- CASO 1: Pregunta de Desarrollo (Short) ---
  if (isShort(stepData)) {
    return (
      <div className="mt-4 md:mt-6 animate-fade-in"> 
        <h3 className="text-base md:text-lg font-semibold mb-2 text-neutral-800">Pregunta de Desarrollo</h3>
        <p className="text-sm md:text-base text-neutral-900 mb-4 font-medium">{displayEnunciado}</p>

        {/* Área de texto para la respuesta: la 'guía' y el feedback se muestran AFTER de enviar la respuesta */}
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
              onClick={() => onAnswer(pasoId, { id: 'dev', texto: shortAnswer, esCorrecta: true }, { skipAdvance: true })}
              className="btn btn-primary flex-1 text-sm"
              disabled={!shortAnswer.trim()}
            >
              Enviar respuesta
            </button>
          ) : (
            <button onClick={() => goToNextStep()} className="btn btn-secondary flex-1 text-sm">Continuar</button>
          )}
        </div>

        {/* Después de responder: mostrar sólo la guía de respuesta (si existe).
            El feedback docente y la bibliografía se muestran exclusivamente en la sección final 'Feedback'. */}
        {respuestaUsuario && (
          <div className="mt-4 space-y-4">
            {stepData.guia && (
              <div className="p-3 rounded-lg bg-[var(--km-surface-2)] text-sm text-[var(--km-text-700)] whitespace-pre-wrap">
                <h4 className="font-semibold mb-2">Guía de respuesta</h4>
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
      <div className="mt-4 md:mt-6 animate-fade-in">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-neutral-900 leading-snug">
          {displayEnunciado}
        </h3>
        
        <div className="space-y-2.5">
          {stepData.opciones.map((opcion) => {
            const isSelected = selectedOption === opcion.id;
            const isAnswered = !!respuestaUsuario;
            const isCorrect = opcion.esCorrecta;
            // Si ya respondió, mostramos si su selección fue incorrecta
            const wasSelectedAndWrong = isAnswered && respuestaUsuario.opcionId === opcion.id && !isCorrect;

                return (
              <label key={opcion.id} className={cx(
                  "flex items-start p-3 rounded-xl border transition-all cursor-pointer text-sm md:text-base",
                  {
                    "!cursor-not-allowed opacity-90": isAnswered,
                    "bg-[var(--km-coral)]/8 border-[rgba(183,43,43,0.06)] shadow-sm": isSelected && !isAnswered,
                    "bg-[var(--km-surface-1)] border-[rgba(183,43,43,0.06)] hover:shadow-sm": !isSelected && !isAnswered,
                    "bg-success-50 border-success-300 ring-1 ring-success-200": isCorrect && isAnswered,
                    "bg-danger-50 border-danger-300 ring-1 ring-danger-200": wasSelectedAndWrong,
                    "bg-[var(--km-surface-2)] border-[rgba(0,0,0,0.03)] opacity-80": isAnswered && !isCorrect && !wasSelectedAndWrong,
                  }
                )}>
                <input type="radio" name={stepData.id} value={opcion.id} checked={isSelected} onChange={handleOptionChange} disabled={isAnswered}
                  className="mt-0.5 h-4 w-4 text-[var(--km-primary)] border-neutral-300 focus:ring-[var(--km-primary)] shrink-0" />
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
          {/* Feedback docente general para la pregunta */}
          {respuestaUsuario && stepData.feedbackDocente && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--km-surface-1)] border border-neutral-200 text-sm">
              <h4 className="font-semibold mb-2">Feedback docente</h4>
              <div className="text-[var(--km-text-700)] whitespace-pre-wrap">{stepData.feedbackDocente}</div>
            </div>
          )}
      </div>
    );
  }

  return <div className="text-danger-500">Tipo de paso no soportado.</div>;
}
