// app/components/CasoDetalleClient.tsx
"use client";

import CaseProgress from "./CaseProgress";
import PasoRenderer from "./PasoRenderer";
import { useCaso } from "./CasoContext";
import { useEffect, useState } from "react";

export default function CasoDetalleClient() {
  // Traemos 'goToNextStep' del contexto para el botón "Comenzar Caso"
  const { caso, currentStep, handleSelect, handleNavigate, goToNextStep } = useCaso();
  const [showContent, setShowContent] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!caso || !showContent) {
    return <div className="card animate-pulse h-40 grid place-items-center text-neutral-500">Cargando...</div>;
  }

  const totalPasos = caso.pasos.length;
  const isCompleted = currentStep >= totalPasos;

  // --- 1. PANTALLA DE FINALIZADO ---
  if (isCompleted) {
    return (
      <div className="card p-6 md:p-8 animate-fade-in">
        <h1 className="text-xl md:text-3xl font-extrabold mb-4 
                   bg-gradient-to-r from-brand-700 to-brand-900 bg-clip-text text-transparent">
          {caso.titulo}
        </h1>
        <div className="p-4 bg-success-50 border border-success-200 rounded-lg mb-6">
          <h2 className="text-lg md:text-xl font-bold text-success-800">¡Caso Completado!</h2>
          <p className="text-success-700 text-sm md:text-base mt-1">Has revisado todo el caso.</p>
        </div>
        <div className="prose prose-sm md:prose-base prose-neutral max-w-none">
            { (caso.debrief || caso.pasos.some(p => p.feedbackDocente)) && (
              <div className="mt-4 p-4 rounded-md bg-[var(--km-surface-2)] border border-neutral-100">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--km-deep)' }}>Feedback Docente</h3>
                {caso.debrief ? (
                  <p className="text-[var(--km-text-700)] mt-2">{caso.debrief}</p>
                ) : (
                  <div className="space-y-3 mt-2 text-[var(--km-text-700)]">
                    {caso.pasos.map((p, idx) => (
                      p.feedbackDocente ? (
                        <div key={p.id}>
                          <strong className="block">Paso {idx + 1}:</strong>
                          <div className="whitespace-pre-wrap">{p.feedbackDocente}</div>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            )}
            {caso.referencias && caso.referencias.length > 0 && (
              <section className="mt-6 card">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--km-deep)' }}>Bibliografía</h3>
                <ul className="list-disc pl-5 mt-3 text-sm text-[var(--km-text-700)]">
                  {caso.referencias.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </section>
            )}
        </div>
      </div>
    );
  }

  // --- 2. PANTALLA INICIAL (VIÑETA) - Paso 0 ---
  // Mantener una pantalla inicial con CTA; usamos un estado local `started` para no consumir el índice 0
  if (!started) {
    return (
      <div className="card p-6 md:p-8 animate-fade-in">
        <h1 className="text-xl md:text-3xl font-extrabold mb-6 text-[var(--km-text-900)]">
          {caso.titulo}
        </h1>

        <p className="text-sm text-[var(--km-text-700)] mb-6">Lee atentamente la historia clínica en la columna izquierda y cuando estés listo, comienza con las preguntas.</p>

        {/* Botón para comenzar las preguntas */}
        <button 
          onClick={() => { setStarted(true); handleNavigate(0); }} 
          className="btn btn-primary btn-lg w-full md:w-auto flex items-center justify-center gap-2"
        >
          Comenzar Preguntas →
        </button>
      </div>
    );
  }

  // --- 3. PANTALLA DE PREGUNTAS (Pasos 1 en adelante) ---
  const currentStepData = caso.pasos[currentStep];
  if (!currentStepData) return <div className="card text-danger-500">Error de paso.</div>;

  // Calculamos el progreso excluyendo la viñeta (paso 0)
  const preguntasTotales = totalPasos;
  const preguntaActual = currentStep; // 0-based index for questions

  return (
    <div className="card p-6 md:p-8 animate-fade-in">
      {/* Título más compacto durante las preguntas */}
      <h1 className="text-lg md:text-xl font-bold mb-4 text-neutral-500">
        {caso.titulo}
      </h1>

      {/* Compact vignette for smaller screens: show a short excerpt of vigneta above the question */}
      {caso.vigneta && (
        <div className="mb-4 block md:hidden p-3 bg-brand-50/30 rounded-md text-sm text-neutral-700 whitespace-pre-wrap">{caso.vigneta}</div>
      )}

      {/* Barra de Progreso: mostramos índice 1-based */}
      <CaseProgress current={Math.min(preguntaActual + 1, preguntasTotales)} total={preguntasTotales} />

      {/* Renderizador de Pregunta */}
      <PasoRenderer pasoId={currentStepData.id} onAnswer={handleSelect} />
    </div>
  );
}
