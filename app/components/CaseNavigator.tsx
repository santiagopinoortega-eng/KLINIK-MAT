// app/components/CaseNavigator.tsx
'use client';

import cx from 'clsx';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useCaso } from '@/app/components/CasoContext';

export default function CaseNavigator() {
  const { caso, currentStep, respuestas, handleNavigate } = useCaso();

  return (
    <aside className="sticky top-24">
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/80 shadow-soft p-5">
        <h3 className="text-sm font-semibold tracking-wide text-primary-800 mb-4 px-2">
          Pasos del caso
        </h3>
        <ol className="space-y-2">
          {caso.pasos.map((p, index) => {
            const isActive = index === currentStep;
            const respuesta = respuestas.find(r => r.pasoId === p.id);
            const isDone = !!respuesta;
            const isCorrect = isDone && (respuesta.esCorrecta === true || !!respuesta.revelado);

            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handleNavigate(index)}
                  disabled={index > respuestas.length}
                  className={cx(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left text-sm',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                    isActive ? 'bg-primary-500 text-white font-semibold shadow-md' : 'text-ink-700 hover:bg-primary-100/70',
                  )}
                >
                  <span className="text-sm font-medium">Paso {index + 1}</span>
                  {isDone && (
                    isCorrect
                      ? <CheckCircleIcon className="ml-auto h-5 w-5 text-success-500" />
                      : <XCircleIcon className="ml-auto h-5 w-5 text-danger-400" />
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
