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
    // Calcular puntos totales del caso
    let puntosObtenidos = 0;
    let puntosMaximos = 0;

    caso.pasos.forEach((paso, idx) => {
      if (paso.tipo === 'mcq') {
        puntosMaximos += 1;
        const respuesta = respuestas[idx];
        if (respuesta?.esCorrecta) {
          puntosObtenidos += 1;
        }
      } else if (paso.tipo === 'short') {
        const puntosPaso = paso.puntosMaximos || 2;
        puntosMaximos += puntosPaso;
        // Aquí necesitamos obtener la autoevaluación del estudiante
        // Por ahora asumimos que está en el objeto respuesta
        const respuesta = respuestas[idx];
        if (respuesta && 'puntos' in respuesta) {
          puntosObtenidos += respuesta.puntos || 0;
        }
      }
    });

    const porcentaje = puntosMaximos > 0 ? Math.round((puntosObtenidos / puntosMaximos) * 100) : 0;

    // Determinar nivel de desempeño
    let nivel = '';
    let emoji = '';
    let badgeColor = '';
    let mensaje = '';

    if (porcentaje >= 90) {
      nivel = 'Excelente';
      emoji = '🏆';
      badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      mensaje = 'Dominas los conceptos clave del caso. ¡Felicitaciones!';
    } else if (porcentaje >= 70) {
      nivel = 'Muy Bien';
      emoji = '⭐';
      badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
      mensaje = 'Buen desempeño. Refuerza algunos detalles para alcanzar la excelencia.';
    } else if (porcentaje >= 50) {
      nivel = 'Bien';
      emoji = '✓';
      badgeColor = 'bg-green-100 text-green-800 border-green-300';
      mensaje = 'Comprensión aceptable. Revisa los puntos con dificultad.';
    } else {
      nivel = 'Necesitas Revisar';
      emoji = '📝';
      badgeColor = 'bg-orange-100 text-orange-800 border-orange-300';
      mensaje = 'Repasa los conceptos fundamentales y vuelve a intentarlo.';
    }

    return (
      <div className="card p-6 md:p-8 animate-fade-in">
        <h1 className="text-xl md:text-3xl font-extrabold mb-4 
                   bg-gradient-to-r from-brand-700 to-brand-900 bg-clip-text text-transparent">
          {caso.titulo}
        </h1>

        {/* Resumen de Puntuación */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-br from-[var(--km-surface-1)] to-[var(--km-surface-2)] border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900">Resultado del Caso</h2>
            <div className={`px-4 py-2 rounded-full border font-semibold ${badgeColor}`}>
              {emoji} {nivel}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg border border-neutral-200">
              <div className="text-3xl font-bold text-[var(--km-primary)]">{puntosObtenidos}</div>
              <div className="text-sm text-neutral-600">Puntos Obtenidos</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-neutral-200">
              <div className="text-3xl font-bold text-neutral-700">{puntosMaximos}</div>
              <div className="text-sm text-neutral-600">Puntos Totales</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-neutral-200">
              <div className="text-3xl font-bold text-[var(--km-coral)]">{porcentaje}%</div>
              <div className="text-sm text-neutral-600">Porcentaje</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-neutral-200 rounded-full h-3 mb-3">
            <div 
              className="bg-[var(--km-primary)] h-3 rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <p className="text-sm text-neutral-700 text-center">{mensaje}</p>
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
