// app/components/CaseNavigator.tsx
'use client';

import cx from 'clsx';
import { CheckCircleIcon, XCircleIcon, ClipboardDocumentListIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import { ClockIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useCaso } from '@/app/components/CasoContext';

export default function CaseNavigator() {
  const { caso, currentStep, respuestas, handleNavigate } = useCaso();

  // Construimos una lista con pasos + paso final (feedback)
  const totalSteps = caso.pasos.length + 1; // ultima entrada = feedback final

  // Calcular progreso
  const answeredCount = respuestas.length;
  const progressPercentage = Math.round((answeredCount / caso.pasos.length) * 100);

  return (
    <aside className="sticky top-24">
      <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 overflow-hidden">
        {/* Header con progreso */}
        <div className="bg-gradient-to-br from-[#1E3A5F] via-[#DC2626] to-[#BC4639] p-5 text-white relative overflow-hidden">
          {/* Efecto de brillo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold tracking-wide flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                <span className="text-2xl">📊</span>
                Progreso del Caso
              </h3>
              <div className="bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 shadow-lg">
                <span className="text-sm font-bold">{answeredCount}</span>
                <span className="text-xs opacity-75 mx-1">/</span>
                <span className="text-sm font-bold">{caso.pasos.length}</span>
              </div>
            </div>
            
            {/* Barra de progreso mejorada */}
            <div className="space-y-2">
              <div className="w-full bg-white/15 backdrop-blur-sm rounded-full h-4 shadow-inner border border-white/20 overflow-hidden">
                <div 
                  className="h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ 
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, #DC2626 0%, #F87171 50%, #FCA5A5 100%)',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.6)'
                  }}
                >
                  {/* Brillo animado dentro de la barra */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-slide" />
                </div>
              </div>
              
              {/* Porcentaje y texto descriptivo */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold opacity-90">
                  {progressPercentage === 0 && '¡Comienza ahora!'}
                  {progressPercentage > 0 && progressPercentage < 100 && '¡Sigue así!'}
                  {progressPercentage === 100 && '¡Completado!'}
                </span>
                <span className="font-bold text-sm bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                  {progressPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de pasos */}
        <div className="p-4">
          <ol className="space-y-1.5">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const isFeedbackStep = index === caso.pasos.length;
              const isActive = index === currentStep;
              const paso = !isFeedbackStep ? caso.pasos[index] : null;

              // Determine label and done state
              const label = isFeedbackStep ? 'Ver Resultados' : `Pregunta ${index + 1}`;
              const tipoIcon = paso?.tipo === 'mcq' ? ClipboardDocumentListIcon : ChatBubbleBottomCenterTextIcon;

              let isDone = false;
              let isCorrect = false;
              let puntos = 0;
              
              if (!isFeedbackStep) {
                const respuesta = respuestas.find(r => r.pasoId === paso!.id);
                isDone = !!respuesta;
                
                if (paso?.tipo === 'mcq') {
                  isCorrect = isDone && respuesta!.esCorrecta === true;
                } else if (paso?.tipo === 'short') {
                  isCorrect = isDone; // Short siempre se considera "correcto" si fue respondido
                  puntos = respuesta?.puntos || 0;
                }
              } else {
                // feedback step done only if all questions answered
                isDone = respuestas.length >= caso.pasos.length;
              }

              // Disable navigation to steps ahead of progress; allow final only when all answered
              const disabled = !isFeedbackStep ? (index > respuestas.length) : (respuestas.length < caso.pasos.length);

              const TipoIcon = tipoIcon;

              return (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(index)}
                    disabled={disabled}
                    className={cx(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left group relative border-2',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                      {
                        'bg-gradient-to-r from-[#DC2626] to-[#F87171] text-white shadow-md scale-105 border-transparent': isActive,
                        'hover:bg-blue-50/50 text-neutral-700 hover:border-[#3B82F6] border-transparent': !isActive && !disabled,
                        'bg-neutral-50 border-neutral-200': !isActive && disabled,
                      }
                    )}
                  >
                    {/* Icono de tipo de pregunta o estado */}
                    <div className={cx(
                      'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-all',
                      {
                        'bg-white/30': isActive,
                        'bg-neutral-100': !isActive && !isDone,
                        'bg-success-100': isDone && isCorrect && !isActive,
                        'bg-orange-100': isDone && !isCorrect && paso?.tipo === 'mcq' && !isActive,
                      }
                    )}>
                      {disabled && !isDone ? (
                        <LockClosedIcon className={cx('h-4 w-4', isActive ? 'text-white/90' : 'text-neutral-400')} />
                      ) : isDone && !isFeedbackStep ? (
                        paso?.tipo === 'mcq' ? (
                          isCorrect ? (
                            <CheckCircleIcon className={cx('h-5 w-5', isActive ? 'text-white/90' : 'text-success-600')} />
                          ) : (
                            <XCircleIcon className={cx('h-5 w-5', isActive ? 'text-white/90' : 'text-orange-500')} />
                          )
                        ) : (
                          <div className={cx('text-xs font-bold', isActive ? 'text-white' : 'text-[#DC2626]')}>
                            {puntos}pt
                          </div>
                        )
                      ) : isFeedbackStep && isDone ? (
                        <CheckCircleIcon className={cx('h-5 w-5', isActive ? 'text-white/90' : 'text-success-600')} />
                      ) : (
                        <TipoIcon className={cx('h-4 w-4', isActive ? 'text-white/90' : 'text-neutral-400')} />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <span className={cx(
                        'text-sm font-semibold block truncate',
                        isActive ? 'text-white drop-shadow-sm' : isDone ? 'text-neutral-900' : 'text-neutral-600'
                      )}>
                        {label}
                      </span>
                      {!isFeedbackStep && paso && (
                        <span className={cx(
                          'text-xs block truncate font-medium',
                          isActive ? 'text-white/90' : 'text-neutral-500'
                        )}>
                          {paso.tipo === 'mcq' ? 'Alternativas' : 'Desarrollo'}
                        </span>
                      )}
                    </div>

                    {/* Indicador de activo */}
                    {isActive && (
                      <ClockIcon className="h-4 w-4 text-white drop-shadow-sm animate-pulse" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Footer con leyenda */}
        <div className="px-4 pb-4">
          <div className="bg-neutral-50 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-600">
              <ClipboardDocumentListIcon className="h-4 w-4 text-neutral-400" />
              <span>Pregunta de alternativas</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <ChatBubbleBottomCenterTextIcon className="h-4 w-4 text-neutral-400" />
              <span>Pregunta de desarrollo</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
