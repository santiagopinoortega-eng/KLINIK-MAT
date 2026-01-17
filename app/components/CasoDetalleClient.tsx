// app/components/CasoDetalleClient.tsx
"use client";

import CaseProgress from "./CaseProgress";
import PasoRenderer from "./PasoRenderer";
import { useCaso } from "./CasoContext";
import { useEffect, useState } from "react";
import { ImageViewer } from "./ImageViewer";
import { analytics } from "@/lib/analytics";
import { postJSON } from "@/lib/fetch-with-csrf";

// Función auxiliar para mapear módulo a área
function mapModuloToArea(modulo?: string): string {
  if (!modulo) return 'General';
  const normalized = modulo.toLowerCase();
  if (normalized.includes('gineco')) return 'ginecologia';
  if (normalized.includes('obste')) return 'obstetricia';
  if (normalized.includes('neo')) return 'neonatologia';
  if (normalized.includes('ssr') || normalized.includes('salud sexual')) return 'ssr';
  return modulo;
}

export default function CasoDetalleClient() {
  // Traemos 'goToNextStep' del contexto para el botón "Comenzar Caso"
  const { caso, currentStep, respuestas, handleSelect, handleNavigate, goToNextStep, mode, timeLimit, timeSpent, isTimeExpired, isCaseCompleted } = useCaso();
  const [showContent, setShowContent] = useState(false);
  const [started, setStarted] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false); // Track si ya guardamos en DB

  // Calcular si está completado (necesario para el useEffect)
  const totalPasos = caso?.pasos.length || 0;
  const isCompleted = currentStep >= totalPasos;

  // Hook para mostrar contenido con delay
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Hook para guardar resultado automáticamente cuando se completa el caso
  useEffect(() => {
    if (!caso || !isCompleted || savedToDb) return;

    // Calcular puntos para guardar
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
        const respuesta = respuestas[idx];
        if (respuesta && 'puntos' in respuesta) {
          puntosObtenidos += respuesta.puntos || 0;
        }
      }
    });

    // Guardar en base de datos con CSRF protection
    const payload = {
      caseId: caso.id,
      caseTitle: caso.titulo,
      caseArea: mapModuloToArea(caso.modulo || caso.area),
      score: puntosObtenidos,
      totalPoints: puntosMaximos,
      mode: mode || 'study',
      timeLimit: timeLimit || null,
      timeSpent: timeSpent || null,
      answers: respuestas,
    };
    
    console.log('🔄 Intentando guardar resultado...', {
      caseId: caso.id,
      caseTitle: caso.titulo,
      score: puntosObtenidos,
      totalPoints: puntosMaximos,
    });
    console.log('📦 Payload completo:', JSON.stringify(payload, null, 2));
    
    postJSON('/api/results', payload)
      .then(async ({ ok, data, error }) => {
        console.log('📡 Respuesta del servidor:', { ok, data, error });
        
        // Si falla por CSRF (403), reintentar una vez después de refrescar token
        if (!ok && (error?.includes('403') || error?.includes('Forbidden') || error?.includes('CSRF'))) {
          console.log('⚠️ CSRF token expired, refreshing and retrying...');
          
          // Refrescar CSRF token
          await fetch('/api/csrf', { credentials: 'include' });
          console.log('🔑 CSRF token refrescado, reintentando...');
          
          // Reintentar
          const retry = await postJSON('/api/results', {
            caseId: caso.id,
            caseTitle: caso.titulo,
            caseArea: mapModuloToArea(caso.modulo || caso.area),
            score: puntosObtenidos,
            totalPoints: puntosMaximos,
            mode: mode || 'study',
            timeLimit: timeLimit || null,
            timeSpent: timeSpent || null,
            answers: respuestas,
          });
          
          console.log('📡 Respuesta del retry:', retry);
          
          if (retry.ok && retry.data?.success) {
            console.log('✅ Resultado guardado (retry):', retry.data.result);
            setSavedToDb(true);
            
            analytics.caseCompleted({
              caseId: caso.id,
              caseTitle: caso.titulo,
              area: mapModuloToArea(caso.modulo || caso.area),
              score: puntosObtenidos,
              totalPoints: puntosMaximos,
              percentage: Math.round((puntosObtenidos / puntosMaximos) * 100),
              timeSpent: timeSpent || 0,
              mode: mode || 'study',
            });
          } else {
            console.error('❌ Error al guardar resultado (retry):', retry.error);
            alert(`Error al guardar resultado: ${retry.error || 'Desconocido'}. Por favor, recarga la página y vuelve a intentar.`);
          }
          return;
        }
        
        if (ok && data?.success) {
          console.log('✅ Resultado guardado:', data.result);
          setSavedToDb(true);

          // Track case completion
          analytics.caseCompleted({
            caseId: caso.id,
            caseTitle: caso.titulo,
            area: mapModuloToArea(caso.modulo || caso.area),
            score: puntosObtenidos,
            totalPoints: puntosMaximos,
            percentage: Math.round((puntosObtenidos / puntosMaximos) * 100),
            timeSpent: timeSpent || 0,
            mode: mode || 'study',
          });
        } else {
          console.error('❌ Error al guardar resultado:', error);
          alert(`Error al guardar resultado: ${error || 'Desconocido'}. Por favor, recarga la página y vuelve a intentar.`);
        }
      })
      .catch((err) => {
        console.error('❌ Error crítico al guardar resultado:', err);
        alert(`Error crítico: ${err.message}. Por favor, recarga la página.`);
      });
  }, [isCompleted, savedToDb, caso, respuestas, mode, timeLimit, timeSpent]);

  // Early return DESPUÉS de todos los hooks
  if (!caso || !showContent) {
    return <div className="card animate-pulse h-40 grid place-items-center text-neutral-500">Cargando...</div>;
  }

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
    
    // Sistema de puntuación actualizado: 0-25 / 25-50 / 50-75 / 75-100
    if (porcentaje >= 75) {
      nivel = 'Excelente';
      emoji = '🏆';
      badgeColor = 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 border-green-400';
      feedbackMessage = feedbackDinamico?.alto || '¡Excelente! Dominas los conceptos clave del caso. ¡Felicitaciones!';
    } else if (porcentaje >= 50) {
      nivel = 'Bien';
      emoji = '✓';
      badgeColor = 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border-blue-400';
      feedbackMessage = feedbackDinamico?.medio || 'Buen trabajo. Refuerza algunos detalles para alcanzar la excelencia.';
    } else if (porcentaje >= 25) {
      nivel = 'Mejorable';
      emoji = '⚠️';
      badgeColor = 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border-yellow-400';
      feedbackMessage = feedbackDinamico?.bajo || 'Vas por buen camino. Repasa los conceptos y vuelve a intentarlo.';
    } else {
      nivel = 'Necesitas Revisar';
      emoji = '📝';
      badgeColor = 'bg-gradient-to-r from-red-100 to-orange-100 text-red-900 border-red-400';
      feedbackMessage = 'Repasa los conceptos fundamentales antes de continuar. ¡No te desanimes, sigue estudiando!';
    }

    return (
      <div className="card p-6 md:p-8 animate-fade-in">
        <h1 className="text-xl md:text-3xl font-extrabold mb-4 bg-gradient-to-r from-[#1E3A5F] via-[#DC2626] to-[#BC4639] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          {caso.titulo}
        </h1>

        {/* Indicador de guardado exitoso */}
        {savedToDb && (
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 flex items-center gap-3 animate-fade-in">
            <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-900">
              ✅ Resultado guardado en tu historial
            </span>
          </div>
        )}

        {/* Resumen de Puntuación */}
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-blue-50/50 via-white/70 to-red-50/30 border-2 border-blue-200/40 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Resultado del Caso</h2>
            <div className={`px-4 py-2 rounded-full border-2 font-semibold ${badgeColor}`}>
              {emoji} {nivel}
            </div>
          </div>

          {/* Estadísticas de Tiempo (si aplica) */}
          {mode && mode !== 'study' && timeLimit && (
            <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-purple-900">
                  Gestión del Tiempo - Modo OSCE
                </h3>
              </div>
              
              {(() => {
                const minutesUsed = Math.floor(timeSpent / 60);
                const secondsUsed = timeSpent % 60;
                const minutesLimit = Math.floor(timeLimit / 60);
                const secondsLimit = timeLimit % 60;
                const timeRemaining = Math.max(0, timeLimit - timeSpent);
                const minutesRemaining = Math.floor(timeRemaining / 60);
                const secondsRemaining = timeRemaining % 60;
                
                // Determinar mensaje y estilo según rendimiento - SIMPLIFICADO
                let performanceMessage = '';
                let performanceColor = '';
                let performanceIcon = '';
                
                if (isTimeExpired) {
                  // Tiempo agotado - Debe mejorar
                  performanceMessage = `⚠️ Debes mejorar la distribución del tiempo`;
                  performanceColor = 'text-red-800 bg-red-50 border-red-400';
                  performanceIcon = '⚠️';
                } else {
                  // Terminó a tiempo - Excelente
                  performanceMessage = `🎯 ¡EXCELENTE! Completaste el caso a tiempo`;
                  performanceColor = 'text-green-800 bg-green-50 border-green-400';
                  performanceIcon = '✅';
                }

                return (
                  <>
                    {/* Mensaje Principal de Rendimiento - GRANDE Y CLARO */}
                    <div className={`mb-4 p-5 rounded-lg border-2 ${performanceColor} font-bold text-center`}>
                      <div className="text-2xl mb-2">{performanceIcon}</div>
                      <div className="text-xl">{performanceMessage}</div>
                      {!isTimeExpired && (
                        <div className="text-base font-normal mt-2 opacity-90">
                          Te sobraron {minutesRemaining}:{secondsRemaining.toString().padStart(2, '0')} minutos
                        </div>
                      )}
                    </div>

                    {/* Estadísticas simples */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-purple-200">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {minutesUsed}:{secondsUsed.toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm font-semibold text-purple-700">Tiempo Usado</div>
                      </div>
                      
                      <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-indigo-200">
                        <div className="text-3xl font-bold text-indigo-600 mb-1">
                          {minutesLimit}:00
                        </div>
                        <div className="text-sm font-semibold text-indigo-700">Tiempo Límite OSCE</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-300 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <div className="text-4xl font-bold text-emerald-600 mb-1" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{puntosObtenidos}</div>
              <div className="text-sm font-semibold text-emerald-700">Puntos Obtenidos</div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <div className="text-4xl font-bold text-blue-700 mb-1" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{puntosMaximos}</div>
              <div className="text-sm font-semibold text-blue-800">Puntos Totales</div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-300 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-1" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{porcentaje}%</div>
              <div className="text-sm font-semibold text-red-700">Porcentaje</div>
            </div>
          </div>

          {/* Barra de progreso mejorada */}
          <div className="w-full bg-gradient-to-r from-neutral-100 to-neutral-200 rounded-full h-4 mb-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#DC2626] via-[#F87171] to-[#FCA5A5] h-4 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
              style={{ width: `${porcentaje}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
            </div>
          </div>

          {/* Feedback dinámico adaptativo */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 mt-4 shadow-sm">
            <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">{feedbackMessage}</p>
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
              <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1E3A5F] mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Feedback Docente</h3>
                {caso.debrief ? (
                  <p className="text-gray-700 mt-2 leading-relaxed">{caso.debrief}</p>
                ) : (
                  <div className="space-y-3 mt-2 text-gray-700">
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
              <section className="mt-6 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 shadow-sm">
                <h3 className="text-lg font-semibold text-[#BC4639] mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Bibliografía</h3>
                <ul className="list-disc pl-5 mt-3 text-sm text-gray-700 space-y-1">
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
        {/* Objetivos de Aprendizaje */}
        {caso.objetivosAprendizaje && caso.objetivosAprendizaje.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-5 mb-6 shadow-md">
            <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              <span className="text-2xl">🎯</span>
              Objetivos de Aprendizaje
            </h2>
            <ul className="space-y-2.5">
              {caso.objetivosAprendizaje.map((objetivo, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-blue-900">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{objetivo}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instrucciones claras sin repetir el título */}
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-l-4 border-[#1E3A5F] rounded-lg p-5 mb-6 shadow-md">
          <h2 className="text-lg font-bold text-[#1E3A5F] mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            <span className="text-2xl">📋</span>
            Instrucciones del Caso Clínico
          </h2>
          <ul className="space-y-2.5 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-xs font-bold">1</span>
              <span className="leading-relaxed">Lee atentamente la <strong>viñeta clínica</strong> que aparece en el panel superior</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-xs font-bold">2</span>
              <span className="leading-relaxed">Analiza los <strong>datos relevantes</strong> del paciente y el contexto clínico</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-xs font-bold">3</span>
              <span className="leading-relaxed">Responde las preguntas a tu <strong>propio ritmo</strong> usando los botones de navegación</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626] text-white flex items-center justify-center text-xs font-bold">4</span>
              <span className="leading-relaxed">Revisa el <strong>feedback dinámico</strong> al finalizar para reforzar tu aprendizaje</span>
            </li>
          </ul>
        </div>

        {/* Información del caso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 text-center border-2 border-red-200 shadow-sm">
            <div className="text-xl font-bold text-[#DC2626] break-words" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{caso.pasos.length}</div>
            <div className="text-xs text-red-700 font-medium mt-1">Preguntas</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border-2 border-blue-200 shadow-sm">
            <div className="text-sm font-bold text-[#1E3A5F] break-words leading-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{caso.modulo || 'General'}</div>
            <div className="text-xs text-blue-700 font-medium mt-1">Módulo</div>
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
