// app/components/PasoRenderer.tsx
"use client";

import { isMcq, isShort, McqOpcion, Paso } from "@/lib/types";
import { useMemo, useState, useEffect } from "react";
import { useCaso } from "./CasoContext";
import cx from "clsx";

interface Props {
  pasoId: string;
  onAnswer: (pasoId: string, opcion: McqOpcion | any) => void;
}

export default function PasoRenderer({ pasoId, onAnswer }: Props) {
  const { caso, respuestas } = useCaso();
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

  // --- CASO 1: Pregunta de Desarrollo (Short) ---
  if (isShort(stepData)) {
    return (
      <div className="mt-4 md:mt-6 animate-fade-in"> 
        <h3 className="text-base md:text-lg font-semibold mb-2 text-neutral-800">Pregunta de Desarrollo</h3>
        <p className="text-sm md:text-base text-neutral-900 mb-4 font-medium">{stepData.enunciado}</p>
        
        {/* Área de texto simple para simular la interacción */}
        <textarea 
            className="w-full p-3 border border-neutral-300 rounded-lg mb-4 text-sm focus:ring-brand-500 focus:border-brand-500"
            rows={3}
            placeholder="Escribe tu análisis aquí..."
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            disabled={!!respuestaUsuario}
        />

        <button
          onClick={() => onAnswer(pasoId, { id: 'next', texto: 'Respuesta enviada', esCorrecta: true })}
          className="btn btn-primary w-full md:w-auto text-sm"
          disabled={!shortAnswer.trim() && !respuestaUsuario}
        >
          {respuestaUsuario ? "Continuar" : "Enviar Respuesta"}
        </button>
      </div>
    );
  }

  // --- CASO 2: Selección Múltiple (MCQ) ---
  if (isMcq(stepData)) {
     return (
      <div className="mt-4 md:mt-6 animate-fade-in">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-neutral-900 leading-snug">
          {stepData.enunciado}
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
                    "bg-brand-50 border-brand-300 ring-1 ring-brand-200": isSelected && !isAnswered,
                    "bg-white border-neutral-200 hover:bg-neutral-50": !isSelected && !isAnswered,
                    "bg-success-50 border-success-300 ring-1 ring-success-200": isCorrect && isAnswered,
                    "bg-danger-50 border-danger-300 ring-1 ring-danger-200": wasSelectedAndWrong,
                    "bg-neutral-50 border-neutral-200 opacity-60": isAnswered && !isCorrect && !wasSelectedAndWrong,
                  }
                )}>
                <input type="radio" name={stepData.id} value={opcion.id} checked={isSelected} onChange={handleOptionChange} disabled={isAnswered}
                  className="mt-0.5 h-4 w-4 text-brand-600 border-neutral-300 focus:ring-brand-500 shrink-0" />
                <span className="ml-3 flex-1">
                  <span className={isAnswered ? "text-neutral-700" : "text-neutral-900"}>{opcion.texto}</span>
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
      </div>
    );
  }

  return <div className="text-danger-500">Tipo de paso no soportado.</div>;
}
