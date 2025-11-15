// app/components/CaseNavigator.tsx
'use client';

import cx from 'clsx';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useCaso } from '@/app/components/CasoContext';

export default function CaseNavigator() {
  const { caso, currentStep, respuestas, handleNavigate } = useCaso();

  // Construimos una lista con pasos + paso final (feedback)
  const totalSteps = caso.pasos.length + 1; // ultima entrada = feedback final

  return (
    <aside className="sticky top-24">
      <div className="card p-5">
        <h3 className="text-sm font-semibold tracking-wide mb-4 px-2" style={{ color: 'var(--km-deep)' }}>
          Pasos del caso
        </h3>
        <ol className="space-y-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isFeedbackStep = index === caso.pasos.length;
            const isActive = index === currentStep;

            // Determine label and done state
            const label = isFeedbackStep ? 'Feedback' : `Paso ${index + 1}`;

            let isDone = false;
            let isCorrect = false;
            if (!isFeedbackStep) {
              const p = caso.pasos[index];
              const respuesta = respuestas.find(r => r.pasoId === p.id);
              isDone = !!respuesta;
              isCorrect = isDone && (respuesta!.esCorrecta === true || !!respuesta!.revelado);
            } else {
              // feedback step done only if all questions answered
              isDone = respuestas.length >= caso.pasos.length;
            }

            // Disable navigation to steps ahead of progress; allow final only when all answered
            const disabled = !isFeedbackStep ? (index > respuestas.length) : (respuestas.length < caso.pasos.length);

            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleNavigate(index)}
                  disabled={disabled}
                  className={cx(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left text-sm',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                    isActive ? 'bg-primary-500 text-white font-semibold shadow-md' : 'text-ink-700 hover:bg-primary-100/70',
                  )}
                >
                  <span className="text-sm font-medium">{label}</span>
                  {isDone && !isFeedbackStep && (
                    isCorrect
                      ? <CheckCircleIcon className="ml-auto h-5 w-5 text-success-500" />
                      : <XCircleIcon className="ml-auto h-5 w-5 text-danger-400" />
                  )}
                  {isFeedbackStep && isDone && (
                    <CheckCircleIcon className="ml-auto h-5 w-5 text-success-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
