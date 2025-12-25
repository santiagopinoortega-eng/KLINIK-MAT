'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

type CountMode = '6' | '10' | '15' | '30' | '60';

export default function FCFCounter() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [countMode, setCountMode] = useState<CountMode>('15');
  const [showResult, setShowResult] = useState(false);
  const [finalFCF, setFinalFCF] = useState<number | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Duración en segundos según modo
  const modeDurations: Record<CountMode, number> = {
    '6': 6,
    '10': 10,
    '15': 15,
    '30': 30,
    '60': 60
  };

  const duration = modeDurations[countMode];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= duration) {
            stopCounting();
            return duration;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, duration]);

  const startCounting = () => {
    setIsRunning(true);
    setShowResult(false);
    setFinalFCF(null);
  };

  const stopCounting = () => {
    setIsRunning(false);
    if (timeElapsed >= duration) {
      calculateFCF();
    }
  };

  const calculateFCF = () => {
    // FCF = (latidos contados / tiempo) * 60
    const fcf = Math.round((count / duration) * 60);
    setFinalFCF(fcf);
    setShowResult(true);
  };

  const reset = () => {
    setIsRunning(false);
    setCount(0);
    setTimeElapsed(0);
    setShowResult(false);
    setFinalFCF(null);
  };

  const incrementCount = () => {
    if (isRunning || timeElapsed === 0) {
      setCount(prev => prev + 1);
    }
  };

  const getInterpretation = (fcf: number) => {
    if (fcf < 110) {
      return {
        classification: 'Bradicardia',
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-red-700',
        icon: ExclamationTriangleIcon,
        description: 'Frecuencia cardíaca fetal por debajo del rango normal. Requiere evaluación inmediata.',
        recommendation: 'Evaluar causas: hipoxia fetal, bloqueo cardíaco, medicación materna (betabloqueadores). Considerar cambio de posición materna, oxígeno, suspender oxitocina. Evaluar urgencia de parto.'
      };
    } else if (fcf >= 110 && fcf <= 160) {
      return {
        classification: 'Normal',
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        textColor: 'text-green-700',
        icon: CheckCircleIcon,
        description: 'Frecuencia cardíaca fetal dentro del rango normal.',
        recommendation: 'Continuar monitoreo de rutina. Rango normal entre 110-160 lpm. Evaluar variabilidad y presencia de aceleraciones/desaceleraciones.'
      };
    } else {
      return {
        classification: 'Taquicardia',
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-700',
        icon: ExclamationTriangleIcon,
        description: 'Frecuencia cardíaca fetal elevada.',
        recommendation: 'Evaluar causas: fiebre materna, corioamnionitis, medicación (betamiméticos), hipertiroidismo materno, arritmia fetal. Si persistente >160 lpm, descartar infección y considerar tratamiento según causa.'
      };
    }
  };

  const interpretation = finalFCF ? getInterpretation(finalFCF) : null;

  return (
    <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl shadow-lg p-8 border-2 border-red-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
          <HeartIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Contador de Frecuencia Cardíaca Fetal
          </h3>
          <p className="text-sm text-gray-600">
            Herramienta para practicar auscultación y cálculo de FCF
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Tiempo de Conteo
        </label>
        <div className="grid grid-cols-5 gap-2">
          {(['6', '10', '15', '30', '60'] as CountMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                if (!isRunning) {
                  setCountMode(mode);
                  reset();
                }
              }}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                countMode === mode
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {mode}s
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          <strong>Recomendado:</strong> 15 segundos (x4 = 60 seg) o 6 segundos (x10 = 60 seg)
        </p>
      </div>

      {/* Timer Display */}
      <div className="mb-6 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Tiempo</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {timeElapsed.toFixed(1)}s / {duration}s
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-500 to-rose-600 h-full transition-all duration-100 rounded-full"
            style={{ width: `${Math.min((timeElapsed / duration) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Counter Display */}
      <div className="mb-6 bg-white rounded-xl p-8 shadow-sm">
        <div className="text-center mb-4">
          <div className="text-6xl font-bold text-red-600 mb-2">
            {count}
          </div>
          <div className="text-sm font-medium text-gray-600">
            latidos contados
          </div>
        </div>

        {/* Big Click Button */}
        <button
          onClick={incrementCount}
          disabled={!isRunning && timeElapsed >= duration}
          className={`w-full py-8 rounded-2xl font-bold text-xl transition-all transform active:scale-95 ${
            !isRunning && timeElapsed >= duration
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-rose-700'
          }`}
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-3">
              <HeartIcon className="w-8 h-8 animate-pulse" />
              Tocar para contar cada latido
            </span>
          ) : timeElapsed >= duration ? (
            'Tiempo completado - Ver resultado abajo'
          ) : (
            'Iniciar contador para comenzar'
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        {!isRunning && timeElapsed === 0 && (
          <button
            onClick={startCounting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:from-green-600 hover:to-emerald-700"
          >
            <PlayIcon className="w-6 h-6" />
            Iniciar
          </button>
        )}
        
        {isRunning && (
          <button
            onClick={stopCounting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:from-yellow-600 hover:to-amber-700"
          >
            <PauseIcon className="w-6 h-6" />
            Pausar
          </button>
        )}

        {timeElapsed >= duration && !showResult && (
          <button
            onClick={calculateFCF}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:from-blue-600 hover:to-indigo-700"
          >
            <CheckCircleIcon className="w-6 h-6" />
            Calcular FCF
          </button>
        )}

        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-300 transition-all"
        >
          <ArrowPathIcon className="w-6 h-6" />
          Reiniciar
        </button>
      </div>

      {/* Result Display */}
      {showResult && finalFCF && interpretation && (
        <div className={`${interpretation.bgColor} rounded-xl p-6 border-2 ${interpretation.borderColor} animate-fade-in`}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 bg-white rounded-lg shadow-sm`}>
              <interpretation.icon className={`w-8 h-8 ${interpretation.textColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">{finalFCF}</span>
                <span className="text-lg font-medium text-gray-600">lpm</span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${interpretation.textColor} bg-white shadow-sm mb-3`}>
                {interpretation.classification}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {interpretation.description}
              </p>
              <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: `var(--${interpretation.color}-500)` }}>
                <div className="text-xs font-semibold text-gray-600 mb-1 uppercase">Recomendación Clínica</div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {interpretation.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Calculation Details */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <strong>Cálculo:</strong> ({count} latidos / {duration} segundos) × 60 = {finalFCF} lpm
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Instrucciones de Uso
        </h4>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">1</span>
            <span>Selecciona el tiempo de conteo (recomendado: 15 segundos)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">2</span>
            <span>Presiona <strong>&quot;Iniciar&quot;</strong> para comenzar el cronómetro</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">3</span>
            <span>Toca el botón grande <strong>cada vez que escuches un latido</strong> (o simula con metrónomo)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">4</span>
            <span>Al completarse el tiempo, presiona <strong>&quot;Calcular FCF&quot;</strong> para obtener el resultado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">5</span>
            <span>Revisa la interpretación clínica y recomendaciones</span>
          </li>
        </ol>
      </div>

      {/* Clinical Pearls */}
      <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-6 border-2 border-amber-200">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          💡 Perlas Clínicas - Auscultación FCF
        </h4>
        <ul className="space-y-2 text-sm text-gray-800">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Rango normal:</strong> 110-160 lpm en reposo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Técnica recomendada:</strong> Contar 15 segundos y multiplicar x4, o 6 segundos x10</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Pitfall común:</strong> Confundir FCF con latido materno (60-100 lpm). Siempre palpar pulso materno simultáneamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Ubicación óptima:</strong> Depende de presentación y posición fetal. En cefálica: habitualmente en cuadrantes inferiores</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Monitoreo intermitente:</strong> Bajo riesgo: cada 30 min en fase activa. Alto riesgo: cada 15 min o continuo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Variabilidad:</strong> La FCF normal tiene variabilidad latido a latido (6-25 lpm). Estetoscopio Pinard/Doppler no detectan variabilidad (requiere CTG)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
