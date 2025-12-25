'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

interface TapRecord {
  timestamp: number;
}

export default function LcfSimulator() {
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetBPM, setTargetBPM] = useState(140);
  const [volume, setVolume] = useState(0.5);
  const [beatIndicator, setBeatIndicator] = useState(false);
  
  // Timer State
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerDuration = 15; // 15 segundos exactos
  
  // Tap State
  const [taps, setTaps] = useState<TapRecord[]>([]);
  const [userBPM, setUserBPM] = useState<number | null>(null);
  
  // Result State
  const [showResult, setShowResult] = useState(false);
  const [errorPercentage, setErrorPercentage] = useState<number | null>(null);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const schedulerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);

  // Initialize Web Audio Context (lazy initialization on user click)
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext created on user interaction');
    }
  }, []);

  // Generate "Lub-Dub" heartbeat sound
  const playHeartbeat = useCallback((time: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    
    // Indicador visual de beat
    setBeatIndicator(true);
    lastBeatTimeRef.current = ctx.currentTime;
    setTimeout(() => setBeatIndicator(false), 100);
    
    // Crear nodos de audio
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Filtro lowpass para emular sonido de estetoscopio
    filter.type = 'lowpass';
    filter.frequency.value = 200; // Corta sonidos agudos molestos
    
    // Gain Envelope correcto (según ejemplo)
    // El volumen empieza en 0, sube rápido y baja rápido
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.8 * volume, time + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.3); // Release

    // "Lub" - Low frequency (65Hz para sonido grave de estetoscopio)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65, time);
    osc1.connect(gainNode);
    osc1.start(time);
    osc1.stop(time + 0.1);

    // "Dub" - Slightly higher frequency, delayed (75Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(75, time + 0.15);
    osc2.connect(gainNode);
    osc2.start(time + 0.15);
    osc2.stop(time + 0.25);
    
    // Conexiones: osc -> gain -> filter -> destination
    gainNode.connect(filter);
    filter.connect(ctx.destination);
  }, [volume]);

  // Schedule beats ahead of time for precise timing
  const scheduleBeat = useCallback(() => {
    if (!audioContextRef.current || !isPlaying) return;

    const ctx = audioContextRef.current;
    const currentTime = ctx.currentTime;
    const scheduleAheadTime = 0.1; // Schedule 100ms ahead

    while (nextBeatTimeRef.current < currentTime + scheduleAheadTime) {
      playHeartbeat(nextBeatTimeRef.current);
      const secondsPerBeat = 60.0 / targetBPM;
      nextBeatTimeRef.current += secondsPerBeat;
    }
  }, [isPlaying, targetBPM, playHeartbeat]);

  // Start Audio (inicializa AudioContext solo con interacción del usuario)
  const startAudio = useCallback(async () => {
    // Crear AudioContext SOLO cuando el usuario hace click
    initAudio();
    
    if (!audioContextRef.current) {
      console.error('Failed to initialize audio context');
      return;
    }

    // Resume audio context if suspended (autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      console.log('AudioContext suspendido, resumiendo...');
      await audioContextRef.current.resume();
    }
    
    console.log('AudioContext state:', audioContextRef.current.state);
    console.log('Volume:', volume, 'BPM:', targetBPM);

    nextBeatTimeRef.current = audioContextRef.current.currentTime;
    setIsPlaying(true);

    if (schedulerIntervalRef.current) {
      clearInterval(schedulerIntervalRef.current);
    }
    schedulerIntervalRef.current = setInterval(scheduleBeat, 25);
  }, [initAudio, scheduleBeat, volume, targetBPM]);

  // Stop Audio
  const stopAudio = useCallback(() => {
    setIsPlaying(false);
    if (schedulerIntervalRef.current) {
      clearInterval(schedulerIntervalRef.current);
    }
  }, []);

  // Timer Management
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= timerDuration) {
            stopTimer();
            return timerDuration;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const startTimer = () => {
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
    setTaps([]);
    setTimeElapsed(0);
    setShowResult(false);
    setUserBPM(null);
    setErrorPercentage(null);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    calculateUserBPM();
  };

  // Handle Tap
  const handleTap = () => {
    if (!isTimerRunning) return;
    
    const now = Date.now();
    setTaps(prev => [...prev, { timestamp: now }]);
  };

  // Calculate User BPM from taps
  const calculateUserBPM = () => {
    if (taps.length < 2) {
      setUserBPM(0);
      setShowResult(true);
      return;
    }

    // Calculate intervals between taps
    const intervals: number[] = [];
    for (let i = 1; i < taps.length; i++) {
      intervals.push(taps[i].timestamp - taps[i - 1].timestamp);
    }

    // Average interval in milliseconds
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // Convert to BPM: (60000 ms / avg interval)
    const calculatedBPM = Math.round(60000 / avgInterval);
    
    setUserBPM(calculatedBPM);
    
    // Calculate error percentage
    const error = Math.abs(calculatedBPM - targetBPM);
    const errorPct = ((error / targetBPM) * 100).toFixed(1);
    setErrorPercentage(parseFloat(errorPct));
    
    setShowResult(true);
  };

  // Canvas Waveform Visualization
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = '#f0fdfa'; // teal-50
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        const time = Date.now() / 1000;
        const bps = targetBPM / 60; // beats per second
        const phase = (time * bps) % 1; // 0 to 1 for each beat

        // Draw heartbeat waveform
        ctx.strokeStyle = '#008080';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const normalizedX = x / width;
          let y = height / 2;

          // Create lub-dub pattern
          if (normalizedX < phase) {
            const beatPhase = normalizedX / phase;
            
            // Lub (0-0.3)
            if (beatPhase < 0.3) {
              const lubPhase = beatPhase / 0.3;
              y = height / 2 - Math.sin(lubPhase * Math.PI) * 40;
            }
            // Dub (0.4-0.6)
            else if (beatPhase > 0.4 && beatPhase < 0.6) {
              const dubPhase = (beatPhase - 0.4) / 0.2;
              y = height / 2 - Math.sin(dubPhase * Math.PI) * 30;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Draw beat indicator
        const indicatorX = phase * width;
        ctx.fillStyle = '#008080';
        ctx.beginPath();
        ctx.arc(indicatorX, height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Static line when not playing
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, targetBPM]);

  // Reset everything
  const reset = () => {
    stopAudio();
    setIsTimerRunning(false);
    setTimeElapsed(0);
    setTaps([]);
    setShowResult(false);
    setUserBPM(null);
    setErrorPercentage(null);
  };

  // Get clinical interpretation
  const getInterpretation = (bpm: number) => {
    if (bpm < 110) {
      return {
        classification: 'Bradicardia Fetal',
        alert: true,
        color: 'red',
        message: '¡ALERTA! Bradicardia fetal detectada según Normas MINSAL.',
        recommendation: 'FCF <110 lpm requiere evaluación inmediata. Descartar hipoxia fetal, bloqueo cardíaco congénito, medicación materna (betabloqueadores). Considerar cambio de posición, oxígeno materno, cesárea urgente si persiste.'
      };
    } else if (bpm >= 110 && bpm <= 160) {
      return {
        classification: 'Rango Normal',
        alert: false,
        color: 'green',
        message: 'FCF dentro del rango fisiológico normal.',
        recommendation: 'Continuar vigilancia de rutina. Evaluar variabilidad y patrón de FCF con monitoreo continuo.'
      };
    } else {
      return {
        classification: 'Taquicardia Fetal',
        alert: true,
        color: 'orange',
        message: '¡ALERTA! Taquicardia fetal detectada según Normas MINSAL.',
        recommendation: 'FCF >160 lpm requiere investigación. Descartar fiebre materna, corioamnionitis, medicación (betamiméticos), hipertiroidismo, arritmia fetal. Evaluar necesidad de antibióticos si sospecha infección.'
      };
    }
  };

  const userInterpretation = userBPM ? getInterpretation(userBPM) : null;

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl shadow-lg p-8 border-2" style={{ borderColor: '#008080' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl shadow-lg" style={{ background: '#008080' }}>
          <SpeakerWaveIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Simulador de Auscultación LCF
          </h3>
          <p className="text-sm text-gray-600">
            Practica tu oído clínico con sonidos cardiofetales reales
          </p>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border-2 border-teal-200 relative">
        {/* Beat Indicator */}
        {beatIndicator && (
          <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500 text-white text-sm font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Lub-Dub
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={800}
          height={150}
          className="w-full h-auto"
        />
      </div>

      {/* BPM Control */}
      <div className="mb-6 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Frecuencia Cardíaca Fetal Real
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold" style={{ color: '#008080' }}>
                {targetBPM}
              </span>
              <span className="text-lg text-gray-600">lpm</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Taps registrados</div>
            <div className="text-3xl font-bold text-gray-900">{taps.length}</div>
          </div>
        </div>

        <input
          type="range"
          min="110"
          max="180"
          step="5"
          value={targetBPM}
          onChange={(e) => setTargetBPM(parseInt(e.target.value))}
          disabled={isPlaying || isTimerRunning}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #008080 0%, #008080 ${((targetBPM - 110) / 70) * 100}%, #e2e8f0 ${((targetBPM - 110) / 70) * 100}%, #e2e8f0 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>110 lpm</span>
          <span className="font-semibold">Rango: 110-160 lpm (Normal)</span>
          <span>180 lpm</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Volumen
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Timer Display */}
      <div className="mb-6 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-gray-700">Tiempo de Práctica</div>
          <div className="text-4xl font-bold" style={{ color: '#008080' }}>
            {timeElapsed.toFixed(1)}s / {timerDuration}s
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full transition-all duration-100 rounded-full"
            style={{ 
              width: `${Math.min((timeElapsed / timerDuration) * 100, 100)}%`,
              background: '#008080'
            }}
          />
        </div>
      </div>

      {/* Tap Button */}
      <div className="mb-6">
        <button
          onClick={handleTap}
          disabled={!isTimerRunning}
          className={`w-full py-12 rounded-2xl font-bold text-2xl transition-all transform active:scale-95 shadow-lg ${
            !isTimerRunning
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'text-white hover:shadow-2xl'
          }`}
          style={{
            background: isTimerRunning ? '#008080' : undefined,
            boxShadow: isTimerRunning ? '0 10px 40px rgba(0, 128, 128, 0.3)' : undefined
          }}
        >
          {isTimerRunning ? (
            <span className="flex items-center justify-center gap-4">
              <span className="text-5xl animate-pulse">💓</span>
              TAP al escuchar cada latido
            </span>
          ) : (
            'Inicia el temporizador para comenzar'
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        {!isPlaying && !isTimerRunning && (
          <button
            onClick={() => {
              startAudio();
              startTimer();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            style={{ background: '#008080' }}
          >
            <PlayIcon className="w-6 h-6" />
            Iniciar Simulación
          </button>
        )}

        {isPlaying && (
          <button
            onClick={stopAudio}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <PauseIcon className="w-6 h-6" />
            Detener Audio
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

      {/* Results */}
      {showResult && userBPM !== null && (
        <div className="bg-white rounded-xl p-6 border-2 shadow-lg animate-fade-in" style={{ borderColor: '#008080' }}>
          <h4 className="text-xl font-bold text-gray-900 mb-4">Resultado de tu Auscultación</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-teal-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Tu Detección</div>
              <div className="text-3xl font-bold" style={{ color: '#008080' }}>
                {userBPM} lpm
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">FCF Real</div>
              <div className="text-3xl font-bold text-gray-900">
                {targetBPM} lpm
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-4 text-white mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Margen de Error</div>
                <div className="text-3xl font-bold">{errorPercentage}%</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Diferencia</div>
                <div className="text-2xl font-bold">
                  {Math.abs(userBPM - targetBPM)} lpm
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Interpretation */}
          {userInterpretation && (
            <div className={`rounded-xl p-6 border-2 ${
              userInterpretation.alert ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                {userInterpretation.alert ? (
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600 flex-shrink-0" />
                ) : (
                  <CheckCircleIcon className="w-8 h-8 text-green-600 flex-shrink-0" />
                )}
                <div>
                  <h5 className={`text-lg font-bold mb-2 ${
                    userInterpretation.alert ? 'text-red-900' : 'text-green-900'
                  }`}>
                    {userInterpretation.classification}
                  </h5>
                  <p className={`text-sm mb-3 ${
                    userInterpretation.alert ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {userInterpretation.message}
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-l-4" style={{ 
                borderColor: userInterpretation.alert ? '#dc2626' : '#10b981' 
              }}>
                <div className="text-xs font-semibold text-gray-600 mb-1 uppercase">
                  Recomendación Clínica (MINSAL)
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {userInterpretation.recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Performance Feedback */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              {errorPercentage !== null && errorPercentage < 5 ? (
                <span className="text-green-600 font-semibold">✓ Excelente precisión! Tu oído clínico está bien entrenado.</span>
              ) : errorPercentage !== null && errorPercentage < 10 ? (
                <span className="text-blue-600 font-semibold">→ Buena aproximación. Continúa practicando para mejorar precisión.</span>
              ) : (
                <span className="text-orange-600 font-semibold">! Practica más para mejorar tu sincronización con el ritmo cardíaco.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" style={{ color: '#008080' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Instrucciones de Uso
        </h4>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>1</span>
            <span>Ajusta la FCF real con el slider (110-180 lpm)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>2</span>
            <span>Presiona <strong>&quot;Iniciar Simulación&quot;</strong> para comenzar el audio y el temporizador</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>3</span>
            <span>Escucha atentamente el patrón <strong>&quot;lub-dub&quot;</strong> del latido cardíaco</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>4</span>
            <span>Presiona <strong>TAP</strong> cada vez que escuches un latido completo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>5</span>
            <span>Al terminar los 15 segundos, revisa tu precisión y el feedback clínico</span>
          </li>
        </ol>
      </div>

      {/* Clinical Pearls */}
      <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-6 border-2 border-amber-200">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          💡 Perlas Clínicas - Auscultación LCF
        </h4>
        <ul className="space-y-2 text-sm text-gray-800">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Patrón normal:</strong> &quot;Lub-dub&quot; rítmico, 110-160 lpm en reposo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Mejor técnica:</strong> Cuenta durante 15 segundos y multiplica x4</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Ubicación:</strong> En presentación cefálica, auscultar cuadrantes inferiores del abdomen materno</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Diferenciación:</strong> Siempre palpar pulso materno simultáneamente (60-100 lpm)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Instrumentos:</strong> Estetoscopio de Pinard, Doppler fetal, o CTG para variabilidad</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
