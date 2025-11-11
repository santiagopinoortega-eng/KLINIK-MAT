// app/components/CasoDetalleClient.tsx
"use client";

import CaseProgress from "./CaseProgress";
import PasoRenderer from "./PasoRenderer";
import { useCaso } from "./CasoContext";
import { useEffect, useState } from "react";

export default function CasoDetalleClient() {
  // Traemos 'goToNextStep' del contexto para el botón "Comenzar Caso"
  const { caso, currentStep, handleSelect, goToNextStep } = useCaso();
  const [showContent, setShowContent] = useState(false);

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
          {caso.debrief && ( <> <h3>Feedback Docente</h3> <p>{caso.debrief}</p> </> )}
          {caso.referencias && (
            <> <h3>Bibliografía</h3> <ul>{caso.referencias.map((r, i) => <li key={i}>{r}</li>)}</ul> </>
          )}
        </div>
      </div>
    );
  }

  // --- 2. PANTALLA INICIAL (VIÑETA) - Paso 0 ---
  // Si estamos en el paso 0, mostramos SOLO la viñeta y un botón para empezar.
  if (currentStep === 0) {
    return (
      <div className="card p-6 md:p-8 animate-fade-in">
        <h1 className="text-xl md:text-3xl font-extrabold mb-6 
                     bg-gradient-to-r from-brand-700 to-brand-900 bg-clip-text text-transparent">
          {caso.titulo}
        </h1>
        
        {/* Viñeta destacada */}
        <div className="mb-8 p-4 md:p-6 bg-brand-50/50 border-l-4 border-brand-300 rounded-r-xl">
          <h2 className="text-lg font-bold text-brand-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="text-2xl">📋</span> Historia Clínica
          </h2>
          <div className="text-base md:text-lg text-neutral-800 whitespace-pre-wrap leading-relaxed">
            {caso.pasos[0].enunciado} {/* Usamos el enunciado del paso 0 como viñeta */}
          </div>
        </div>

        {/* Botón para comenzar las preguntas */}
        <button 
          onClick={goToNextStep} 
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
  const preguntasTotales = totalPasos - 1;
  const preguntaActual = currentStep;

  return (
    <div className="card p-6 md:p-8 animate-fade-in">
      {/* Título más compacto durante las preguntas */}
      <h1 className="text-lg md:text-xl font-bold mb-4 text-neutral-500">
        {caso.titulo}
      </h1>

      {/* Barra de Progreso (Ajustada para mostrar progreso de preguntas) */}
      <CaseProgress current={preguntaActual} total={preguntasTotales} />

      {/* Renderizador de Pregunta */}
      <PasoRenderer pasoId={currentStepData.id} onAnswer={handleSelect} />
    </div>
  );
}
