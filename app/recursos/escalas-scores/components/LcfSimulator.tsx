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
  const [volume, setVolume] = useState(1.0); // Volumen al 100% para que sea audible
  const [beatIndicator, setBeatIndicator] = useState(false);
  
  // Timer State
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(10); // Duración seleccionable: 6 o 10 segundos
  
  // Tap State
  const [taps, setTaps] = useState<TapRecord[]>([]);
  const [userBPM, setUserBPM] = useState<number | null>(null);
  
  // Result State
  const [showResult, setShowResult] = useState(false);
  const [errorPercentage, setErrorPercentage] = useState<number | null>(null);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isPlayingRef = useRef<boolean>(false); // Ref sincrónico para scheduling
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
      
      // Crear AnalyserNode para visualización real de la onda
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096; // Mayor resolución para mejor visualización
      analyserRef.current.smoothingTimeConstant = 0.85; // Suavizado de la onda
      analyserRef.current.connect(audioContextRef.current.destination);
      
      console.log('AudioContext + AnalyserNode created on user interaction');
    }
  }, []);

  // Generate "Lub-Dub" heartbeat sound
  const playHeartbeat = useCallback((time: number) => {
    if (!audioContextRef.current) {
      console.error('❌ playHeartbeat: No audio context');
      return;
    }

    const ctx = audioContextRef.current;
    console.log('🔊 playHeartbeat called at time:', time, 'currentTime:', ctx.currentTime);
    
    // Indicador visual de beat
    setBeatIndicator(true);
    lastBeatTimeRef.current = ctx.currentTime;
    setTimeout(() => setBeatIndicator(false), 100);
    
    // Crear nodos de audio
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Filtro lowpass para emular sonido de estetoscopio
    filter.type = 'lowpass';
    filter.frequency.value = 180; // Corta sonidos agudos molestos
    filter.Q.value = 1.5; // Más selectivo
    
    // Gain Envelope mejorado con mayor claridad
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(4.0 * volume, time + 0.04); // Attack más rápido y fuerte
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.25); // Release más corto

    // "Lub" - Low frequency mejorado (60Hz para sonido grave profundo)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(60, time);
    osc1.frequency.exponentialRampToValueAtTime(55, time + 0.08); // Caída de frecuencia
    osc1.connect(gainNode);
    osc1.start(time);
    osc1.stop(time + 0.08);

    // "Dub" - Slightly higher frequency, delayed (70Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(70, time + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(65, time + 0.18);
    osc2.connect(gainNode);
    osc2.start(time + 0.12);
    osc2.stop(time + 0.18);
    
    // CONEXIÓN AL ANALIZADOR ANTES DE LA SALIDA (arquitectura correcta)
    // Flujo: osc → gain → filter → analyser → destination
    gainNode.connect(filter);
    if (analyserRef.current) {
      filter.connect(analyserRef.current);
    } else {
      filter.connect(ctx.destination);
    }
  }, [volume]);

  // Schedule beats ahead of time for precise timing
  const scheduleBeat = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current) {
      console.log('⏸️ scheduleBeat: Not running', { hasContext: !!audioContextRef.current, isPlaying: isPlayingRef.current });
      return;
    }

    const ctx = audioContextRef.current;
    const currentTime = ctx.currentTime;
    const scheduleAheadTime = 0.1; // Schedule 100ms ahead

    let beatsScheduled = 0;
    while (nextBeatTimeRef.current < currentTime + scheduleAheadTime) {
      console.log('📅 Scheduling beat at:', nextBeatTimeRef.current);
      playHeartbeat(nextBeatTimeRef.current);
      const secondsPerBeat = 60.0 / targetBPM;
      nextBeatTimeRef.current += secondsPerBeat;
      beatsScheduled++;
    }
    if (beatsScheduled > 0) {
      console.log(`✅ Scheduled ${beatsScheduled} beats`);
    }
  }, [targetBPM, playHeartbeat]);

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
    console.log('🎬 Initial nextBeatTime set to:', nextBeatTimeRef.current);
    
    // Actualizar ref PRIMERO (sincrónico), luego estado (asincrónico)
    isPlayingRef.current = true;
    setIsPlaying(true);

    if (schedulerIntervalRef.current) {
      clearInterval(schedulerIntervalRef.current);
    }
    
    // Llamar scheduleBeat inmediatamente una vez
    console.log('🚀 Calling scheduleBeat immediately (isPlayingRef:', isPlayingRef.current, ')');
    scheduleBeat();
    
    // Luego configurar el interval
    schedulerIntervalRef.current = setInterval(() => {
      console.log('⏰ Interval tick - calling scheduleBeat');
      scheduleBeat();
    }, 25);
    console.log('✅ Scheduler interval created');
  }, [initAudio, scheduleBeat, volume, targetBPM]);

  // Stop Audio
  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (schedulerIntervalRef.current) {
      clearInterval(schedulerIntervalRef.current);
    }
  }, []);

  // Calculate User BPM from taps
  const calculateUserBPM = useCallback(() => {
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
  }, [taps, targetBPM]);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
    calculateUserBPM();
  }, [calculateUserBPM]);

  // Timer Management
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 0.1;
          if (newTime >= timerDuration) {
            stopTimer();
            return timerDuration;
          }
          return newTime;
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
  }, [isTimerRunning, stopTimer]);

  const startTimer = () => {
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
    setTaps([]);
    setTimeElapsed(0);
    setShowResult(false);
    setUserBPM(null);
    setErrorPercentage(null);
  };

  // Handle Tap
  const handleTap = () => {
    if (!isTimerRunning) return;
    
    const now = Date.now();
    setTaps(prev => [...prev, { timestamp: now }]);
  };

  // Canvas Waveform Visualization - CONEXIÓN REAL AL ANALYSER NODE
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Fondo estilo monitor médico
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);

      if (isPlayingRef.current && analyserRef.current) {
        // OBTENER DATOS REALES DEL AUDIO (no animación falsa)
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        // Dibujar onda real (Time Domain Data)
        ctx.lineWidth = 2.5;
        
        // Crear gradiente para la línea
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#14b8a6'); // teal-500
        gradient.addColorStop(0.5, '#2dd4bf'); // teal-400
        gradient.addColorStop(1, '#5eead4'); // teal-300
        
        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#2dd4bf';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // Normalizar (0-255 → 0-2)
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // Grid hospitalario mejorado (estilo EKG)
        ctx.strokeStyle = '#1e293b80'; // slate-800 con transparencia
        ctx.lineWidth = 0.5;
        // Líneas horizontales
        for (let i = 0; i < 5; i++) {
          const y = (i * height) / 4;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        // Líneas verticales
        for (let i = 0; i < 10; i++) {
          const x = (i * width) / 9;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
      } else {
        // Línea estática cuando no está reproduciendo
        ctx.strokeStyle = '#475569'; // slate-600
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Texto indicador
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Presiona "Iniciar" para ver la onda real del audio', width / 2, height / 2 - 10);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]); // Solo depende de isPlaying, no de targetBPM

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
    if (bpm < 80) {
      return {
        classification: '⚠️ Bradicardia Fetal Severa',
        alert: true,
        color: 'red',
        message: '¡EMERGENCIA OBSTÉTRICA! Bradicardia fetal severa detectada.',
        recommendation: 'FCF <80 lpm es EMERGENCIA. Requiere evaluación INMEDIATA. Activar código rojo obstétrico: cambio urgente de posición materna, oxígeno al 100%, suspender oxitocina si presente, preparar cesárea de urgencia. Descartar desprendimiento placentario, compresión de cordón, hipoxia severa.'
      };
    } else if (bpm >= 80 && bpm < 110) {
      return {
        classification: 'Bradicardia Fetal',
        alert: true,
        color: 'red',
        message: '¡ALERTA! Bradicardia fetal detectada según Normas MINSAL.',
        recommendation: 'FCF 80-109 lpm requiere evaluación inmediata. Descartar hipoxia fetal, bloqueo cardíaco congénito, medicación materna (betabloqueadores). Considerar cambio de posición, oxígeno materno, suspender oxitocina. Evaluar necesidad de cesárea urgente si persiste o empeora.'
      };
    } else if (bpm >= 110 && bpm <= 160) {
      return {
        classification: 'Rango Normal ✓',
        alert: false,
        color: 'green',
        message: 'FCF dentro del rango fisiológico normal.',
        recommendation: 'Continuar vigilancia de rutina. Evaluar variabilidad y patrón de FCF con monitoreo continuo. En trabajo de parto, verificar presencia de aceleraciones (signo de bienestar fetal).'
      };
    } else if (bpm > 160 && bpm <= 180) {
      return {
        classification: 'Taquicardia Fetal',
        alert: true,
        color: 'orange',
        message: '¡ALERTA! Taquicardia fetal detectada según Normas MINSAL.',
        recommendation: 'FCF 161-180 lpm requiere investigación. Descartar fiebre materna, corioamnionitis, medicación (betamiméticos, atropina), hipertiroidismo materno, deshidratación, arritmia fetal. Evaluar necesidad de antibióticos si sospecha infección. Monitoreo continuo.'
      };
    } else {
      return {
        classification: '⚠️ Taquicardia Fetal Severa',
        alert: true,
        color: 'red',
        message: '¡ALERTA GRAVE! Taquicardia fetal severa detectada.',
        recommendation: 'FCF >180 lpm requiere acción URGENTE. Alta sospecha de compromiso fetal. Descartar corioamnionitis (fiebre materna, leucocitosis), hipoxia fetal, arritmia cardíaca fetal. Iniciar antibióticos empíricos si signos de infección. Considerar finalización del embarazo si no responde a manejo.'
      };
    }
  };

  const userInterpretation = userBPM ? getInterpretation(userBPM) : null;

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl shadow-lg p-4 border-2" style={{ borderColor: '#008080' }}>
      {/* Header Compacto */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg" style={{ background: '#008080' }}>
          <SpeakerWaveIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Simulador LCF</h3>
          <p className="text-xs text-gray-600">Práctica de auscultación cardíaca fetal</p>
        </div>
      </div>

      {/* Grid Compacto: Canvas + Controles */}
      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        {/* Waveform Visualization */}
        <div className="bg-slate-900 rounded-lg p-2 shadow border border-teal-900 relative">
          {beatIndicator && (
            <div className="absolute top-1 right-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Lub-Dub
            </div>
          )}
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="font-mono text-teal-400">📊 Onda Real</span>
            <span className="font-mono text-slate-500">Time Domain</span>
          </div>
          <canvas
            ref={canvasRef}
            width={500}
            height={80}
            className="w-full h-auto rounded border border-teal-900"
          />
        </div>

        {/* Controles BPM y Volumen */}
        <div className="space-y-2">
          {/* BPM Control */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">FCF Real</label>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: '#008080' }}>{targetBPM}</span>
                  <span className="text-xs text-gray-600">lpm</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Taps</div>
                <div className="text-xl font-bold text-gray-900">{taps.length}</div>
              </div>
            </div>
            <input
              type="range"
              min="80"
              max="200"
              step="5"
              value={targetBPM}
              onChange={(e) => setTargetBPM(parseInt(e.target.value))}
              disabled={isPlaying || isTimerRunning}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #008080 0%, #008080 ${((targetBPM - 80) / 120) * 100}%, #e2e8f0 ${((targetBPM - 80) / 120) * 100}%, #e2e8f0 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>80</span>
              <span className="font-semibold">Normal: 110-160</span>
              <span>200</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Volumen</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>



      {/* Timer y Tap Button - Layout Horizontal */}
      <div className="grid lg:grid-cols-3 gap-3 mb-3">
        {/* Timer Display + Duration Selector */}
        <div className="lg:col-span-1 bg-white rounded-lg p-2 shadow-sm">
          <div className="text-xs font-semibold text-gray-700 mb-1">Duración de conteo</div>
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setTimerDuration(6)}
              disabled={isPlaying || isTimerRunning}
              className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                timerDuration === 6
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isPlaying || isTimerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={timerDuration === 6 ? { background: '#008080' } : {}}
            >
              6s
            </button>
            <button
              onClick={() => setTimerDuration(10)}
              disabled={isPlaying || isTimerRunning}
              className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                timerDuration === 10
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isPlaying || isTimerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={timerDuration === 10 ? { background: '#008080' } : {}}
            >
              10s
            </button>
          </div>
          <div className="text-xs font-semibold text-gray-700 mb-0.5">Tiempo</div>
          <div className="text-xl font-bold mb-1" style={{ color: '#008080' }}>
            {timeElapsed.toFixed(1)}s <span className="text-xs text-gray-600">/ {timerDuration}s</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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
        <div className="lg:col-span-2">
          <button
            onClick={handleTap}
            disabled={!isTimerRunning}
            className={`w-full h-full py-4 rounded-lg font-bold text-base transition-all transform active:scale-95 shadow ${
              !isTimerRunning
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'text-white hover:shadow-lg'
            }`}
            style={{
              background: isTimerRunning ? '#008080' : undefined,
              boxShadow: isTimerRunning ? '0 4px 20px rgba(0, 128, 128, 0.3)' : undefined
            }}
          >
            {isTimerRunning ? (
              <span className="flex items-center justify-center gap-2">
                <span className="text-2xl animate-pulse">💓</span>
                <span>TAP al escuchar latido</span>
              </span>
            ) : (
              'Inicia para comenzar a contar'
            )}
          </button>
        </div>
      </div>

      {/* Controls Mejorados */}
      <div className="flex gap-2 mb-3">
        {!isPlaying && !isTimerRunning && (
          <button
            onClick={() => {
              startAudio();
              startTimer();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #008080 0%, #00a896 100%)' }}
          >
            <PlayIcon className="w-5 h-5" />
            <span>Iniciar Simulación</span>
          </button>
        )}

        {isPlaying && isTimerRunning && (
          <>
            <button
              onClick={stopAudio}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <PauseIcon className="w-5 h-5" />
              <span>Pausar Audio</span>
            </button>
            <button
              onClick={stopTimer}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Finalizar y Ver Resultado</span>
            </button>
          </>
        )}

        {(isPlaying || isTimerRunning) && (
          <button
            onClick={reset}
            className="flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Reiniciar</span>
          </button>
        )}

        {!isPlaying && !isTimerRunning && (
          <button
            onClick={reset}
            className="flex items-center justify-center gap-1.5 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Results Compactos */}
      {showResult && userBPM !== null && (
        <div className="bg-white rounded-lg p-3 border-2 shadow animate-fade-in" style={{ borderColor: '#008080' }}>
          <h4 className="text-sm font-bold text-gray-900 mb-2">Resultado de Auscultación</h4>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-teal-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-0.5">Tu Detección</div>
              <div className="text-xl font-bold" style={{ color: '#008080' }}>
                {userBPM} <span className="text-xs">lpm</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-0.5">FCF Real</div>
              <div className="text-xl font-bold text-gray-900">
                {targetBPM} <span className="text-xs">lpm</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-0.5">Error</div>
              <div className="text-xl font-bold text-red-600">
                {errorPercentage}%
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-2 text-white mb-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-90">Margen de Error</div>
                <div className="text-xl font-bold">{errorPercentage}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-90">Diferencia</div>
                <div className="text-lg font-bold">
                  {Math.abs(userBPM - targetBPM)} lpm
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Interpretation */}
          {userInterpretation && (
            <div className={`rounded-lg p-3 border-2 ${
              userInterpretation.alert ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {userInterpretation.alert ? (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                <div>
                  <h5 className={`text-base font-bold mb-1 ${
                    userInterpretation.alert ? 'text-red-900' : 'text-green-900'
                  }`}>
                    {userInterpretation.classification}
                  </h5>
                  <p className={`text-xs mb-2 ${
                    userInterpretation.alert ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {userInterpretation.message}
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-2 border-l-4" style={{ 
                borderColor: userInterpretation.alert ? '#dc2626' : '#10b981' 
              }}>
                <div className="text-xs font-semibold text-gray-600 mb-0.5 uppercase">
                  Recomendación Clínica (MINSAL)
                </div>
                <p className="text-xs text-gray-800 leading-relaxed">
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
      <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
          <svg className="w-5 h-5" style={{ color: '#008080' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Instrucciones de Uso
        </h4>
        <ol className="space-y-1.5 text-xs text-gray-700">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>1</span>
            <span>Selecciona la duración de conteo: <strong>6 segundos</strong> o <strong>10 segundos</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>2</span>
            <span>Ajusta la FCF real con el slider (<strong>80-200 lpm</strong>)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>3</span>
            <span>Presiona <strong>&quot;Iniciar Simulación&quot;</strong> para comenzar el audio y el temporizador</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>4</span>
            <span>Escucha atentamente el patrón <strong>&quot;lub-dub&quot;</strong> del latido cardíaco</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>5</span>
            <span>Presiona <strong>TAP</strong> cada vez que escuches un latido completo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full text-white font-bold text-xs flex items-center justify-center" style={{ background: '#008080' }}>6</span>
            <span>Al terminar el tiempo, presiona <strong>&quot;Finalizar y Ver Resultado&quot;</strong> para revisar tu precisión</span>
          </li>
        </ol>
      </div>

      {/* Clinical Pearls */}
      <div className="mt-4 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg p-4 border-2 border-amber-200">
        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
          💡 Perlas Clínicas - Auscultación LCF
        </h4>
        <ul className="space-y-1.5 text-xs text-gray-800">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Patrón normal:</strong> &quot;Lub-dub&quot; rítmico, 110-160 lpm en reposo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Mejor técnica:</strong> Cuenta durante 6-10 segundos y calcula los lpm</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Bradicardia severa:</strong> {'<'}80 lpm - Emergencia obstétrica, evaluar inmediatamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span><strong>Taquicardia severa:</strong> {'>'}180 lpm - Riesgo de compromiso fetal</span>
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
            <span><strong>Instrumentos:</strong> Estetoscopio de Pinard, Doppler fetal, o CTG para variabilidad continua</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
