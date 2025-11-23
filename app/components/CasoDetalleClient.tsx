// app/components/CasoDetalleClient.tsx
"use client";

import CaseProgress from "./CaseProgress";
import PasoRenderer from "./PasoRenderer";
import { useCaso } from "./CasoContext";
import { useEffect, useState } from "react";
import { ImageViewer } from "./ImageViewer";

export default function CasoDetalleClient() {
  // Traemos 'goToNextStep' del contexto para el botón "Comenzar Caso"
  const { caso, currentStep, respuestas, handleSelect, handleNavigate, goToNextStep } = useCaso();
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

    // Determinar nivel de desempeño y obtener feedback dinámico
    let nivel = '';
    let emoji = '';
    let badgeColor = '';
    let feedbackMessage = '';

    // Usar feedbackDinamico del caso si existe
    const feedbackDinamico = caso.feedback_dinamico;
    
    if (porcentaje >= 61) {
      nivel = 'Excelente';
      emoji = '🏆';
      badgeColor = 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 border-green-400';
      feedbackMessage = feedbackDinamico?.alto || 'Dominas los conceptos clave del caso. ¡Felicitaciones!';
    } else if (porcentaje >= 31) {
      nivel = 'Bien';
      emoji = '✓';
      badgeColor = 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border-yellow-400';
      feedbackMessage = feedbackDinamico?.medio || 'Buen desempeño. Refuerza algunos detalles para alcanzar la excelencia.';
    } else {
      nivel = 'Necesitas Revisar';
      emoji = '📝';
      badgeColor = 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 border-red-400';
      feedbackMessage = feedbackDinamico?.bajo || 'Repasa los conceptos fundamentales y vuelve a intentarlo.';
    }

    return (
      <div className="card p-6 md:p-8 animate-fade-in">
        <h1 className="text-xl md:text-3xl font-extrabold mb-4 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          {caso.titulo}
        </h1>

        {/* Resumen de Puntuación */}
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-red-50/50 via-rose-50/30 to-pink-50/40 border-2 border-red-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-800" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Resultado del Caso</h2>
            <div className={`px-4 py-2 rounded-full border-2 font-semibold ${badgeColor}`}>
              {emoji} {nivel}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-300 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <div className="text-4xl font-bold text-emerald-600 mb-1" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{puntosObtenidos}</div>
              <div className="text-sm font-semibold text-emerald-700">Puntos Obtenidos</div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-300 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <div className="text-4xl font-bold text-rose-600 mb-1" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{puntosMaximos}</div>
              <div className="text-sm font-semibold text-rose-700">Puntos Totales</div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-300 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-1" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{porcentaje}%</div>
              <div className="text-sm font-semibold text-red-700">Porcentaje</div>
            </div>
          </div>

          {/* Barra de progreso mejorada */}
          <div className="w-full bg-gradient-to-r from-neutral-100 to-neutral-200 rounded-full h-4 mb-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
              style={{ width: `${porcentaje}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
            </div>
          </div>

          {/* Feedback dinámico adaptativo */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 mt-4 shadow-sm">
            <p className="text-sm md:text-base text-rose-900 leading-relaxed font-medium">{feedbackMessage}</p>
          </div>
        </div>

        {/* Botones de acción finales */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            🔄 Reintentar caso
          </button>
          <a 
            href="/casos" 
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            ← Volver a casos
          </a>
        </div>

        <div className="prose prose-sm md:prose-base prose-neutral max-w-none">
            { (caso.debrief || caso.pasos.some(p => p.feedbackDocente)) && (
              <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 shadow-sm">
                <h3 className="text-lg font-semibold text-rose-800 mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Feedback Docente</h3>
                {caso.debrief ? (
                  <p className="text-rose-900 mt-2 leading-relaxed">{caso.debrief}</p>
                ) : (
                  <div className="space-y-3 mt-2 text-rose-900">
                    {caso.pasos.map((p, idx) => (
                      p.feedbackDocente ? (
                        <div key={p.id} className="bg-white/50 p-3 rounded-lg">
                          <strong className="block text-rose-800 mb-1">Paso {idx + 1}:</strong>
                          <div className="whitespace-pre-wrap">{p.feedbackDocente}</div>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            )}
            {caso.referencias && caso.referencias.length > 0 && (
              <section className="mt-6 p-5 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 shadow-sm">
                <h3 className="text-lg font-semibold text-red-800 mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Bibliografía</h3>
                <ul className="list-disc pl-5 mt-3 text-sm text-red-900 space-y-1">
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
        {/* Instrucciones claras sin repetir el título */}
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            <span className="text-2xl">📋</span>
            Instrucciones del Caso Clínico
          </h2>
          <ul className="space-y-2 text-sm text-red-800">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 font-semibold">1.</span>
              <span>Lee atentamente la <strong>viñeta clínica</strong> que aparece en el panel izquierdo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 font-semibold">2.</span>
              <span>Analiza los <strong>datos relevantes</strong> del paciente y el contexto clínico</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 font-semibold">3.</span>
              <span>Responde las preguntas a tu <strong>propio ritmo</strong> usando los botones de navegación</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 font-semibold">4.</span>
              <span>Revisa el <strong>feedback dinámico</strong> al finalizar para reforzar tu aprendizaje</span>
            </li>
          </ul>
        </div>

        {/* Información del caso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 text-center border-2 border-red-200 shadow-sm">
            <div className="text-xl font-bold text-red-600 break-words" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{caso.pasos.length}</div>
            <div className="text-xs text-red-700 font-medium mt-1">Preguntas</div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4 text-center border-2 border-rose-200 shadow-sm">
            <div className="text-sm font-bold text-rose-700 break-words leading-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{caso.modulo || 'General'}</div>
            <div className="text-xs text-rose-700 font-medium mt-1">Módulo</div>
          </div>
          <div className={`rounded-lg p-4 text-center border-2 sm:col-span-2 md:col-span-1 shadow-sm ${
            caso.dificultad === 'BAJA' ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300' :
            caso.dificultad === 'MEDIA' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300' :
            caso.dificultad === 'ALTA' ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300' :
            'bg-neutral-50 border-neutral-200'
          }`}>
            <div className={`text-sm font-bold break-words leading-tight ${
              caso.dificultad === 'BAJA' ? 'text-emerald-700' :
              caso.dificultad === 'MEDIA' ? 'text-amber-700' :
              caso.dificultad === 'ALTA' ? 'text-red-700' :
              'text-neutral-700'
            }`} style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              {caso.dificultad || 'MEDIA'}
            </div>
            <div className="text-xs text-neutral-600 mt-1">Dificultad</div>
          </div>
        </div>

        {/* Botón para comenzar las preguntas */}
        <button 
          onClick={() => { setStarted(true); handleNavigate(0); }} 
          className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <span className="text-xl">🚀</span>
          Comenzar Caso Clínico
          <span className="text-xl">→</span>
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
        <div className="mb-4 block md:hidden p-3 bg-brand-50/30 rounded-md text-sm text-neutral-700">
          <div className="whitespace-pre-wrap">{caso.vigneta}</div>
          {caso.imagenes && caso.imagenes.length > 0 && (
            <div className="mt-3">
              <ImageViewer images={caso.imagenes} />
            </div>
          )}
        </div>
      )}

      {/* Barra de Progreso: mostramos índice 1-based */}
      <CaseProgress current={Math.min(preguntaActual + 1, preguntasTotales)} total={preguntasTotales} />

      {/* Renderizador de Pregunta */}
      <PasoRenderer pasoId={currentStepData.id} onAnswer={handleSelect} />
    </div>
  );
}
