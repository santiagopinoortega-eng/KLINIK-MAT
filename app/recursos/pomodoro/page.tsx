'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { usePomodoro } from '@/app/context/PomodoroContext';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
};

const SETTINGS_KEY = 'pomodoroSettings';
const STATS_KEY = 'pomodoroStats';

export default function PomodoroTimer() {
  // Usar el contexto global para que el timer persista al navegar
  const {
    sessionId,
    type,
    status,
    timeRemaining,
    timeSpent,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    isRunning,
  } = usePomodoro();

  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [localStats, setLocalStats] = useState({ completedPomodoros: 0, totalStudyTime: 0 });
  const [isStarting, setIsStarting] = useState(false);

  // Cargar configuración y estadísticas
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }

    // Estadísticas locales (diarias)
    const savedStats = localStorage.getItem(STATS_KEY);
    const today = new Date().toDateString();
    
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        if (parsed.date === today) {
          setLocalStats(parsed);
        } else {
          // Nuevo día, reset stats
          const newStats = { date: today, completedPomodoros: 0, totalStudyTime: 0 };
          localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
          setLocalStats(newStats);
        }
      } catch (e) {
        console.error('Error parsing stats:', e);
      }
    }

    // Pedir permiso de notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Actualizar tiempo de estudio cuando el timer está corriendo
  useEffect(() => {
    if (status === 'ACTIVE' && type === 'WORK') {
      const interval = setInterval(() => {
        setLocalStats(prev => {
          const updated = { ...prev, totalStudyTime: prev.totalStudyTime + 1 };
          localStorage.setItem(STATS_KEY, JSON.stringify({ ...updated, date: new Date().toDateString() }));
          return updated;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, type]);

  const handleStart = async (selectedType: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    setIsStarting(true);
    try {
      const duration = selectedType === 'WORK' 
        ? settings.workDuration 
        : selectedType === 'SHORT_BREAK' 
          ? settings.shortBreakDuration 
          : settings.longBreakDuration;
      
      await startTimer(selectedType, duration);
    } catch (error) {
      console.error('Error starting timer:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async (complete: boolean) => {
    try {
      await stopTimer(complete);
      
      if (complete && type === 'WORK') {
        // Incrementar pomodoros completados
        setLocalStats(prev => {
          const updated = { ...prev, completedPomodoros: prev.completedPomodoros + 1 };
          localStorage.setItem(STATS_KEY, JSON.stringify({ ...updated, date: new Date().toDateString() }));
          return updated;
        });

        // Notificación
        if (settings.soundEnabled) {
          playNotificationSound();
        }
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('¡Pomodoro Completado! 🎉', {
            body: 'Es hora de tomar un descanso',
            icon: '/icon-192x192.png',
          });
        }
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxXIpBSl+zPLaizsIGGS56+mgUBELTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElqy5O6nVhQLQ5zd8sFuJAUuhM/z1YU4BxVrvO7mnEoODlWs5/CvYBgIP5fY88p1LAUme8ry3Ik6CBdlu+3nolETDEuk4fG4aR0FNo7V88+AMgUhdsXv4JVDCxJasuTup1cVCz+c3fK/cCQFLoTP89WGOQcUa7zu5p1KDg5Urufwrx8YCD+X2PPKdSwFJnvK8tyJOggXZbvt56JRE==');
    audio.play().catch(() => {});
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Calcular progreso
  const totalSeconds = type === 'WORK' 
    ? settings.workDuration * 60 
    : type === 'SHORT_BREAK' 
      ? settings.shortBreakDuration * 60 
      : settings.longBreakDuration * 60;
  
  const progress = status !== 'IDLE' && sessionId
    ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 
    : 0;

  // Mapear tipo a modo visual
  const currentMode = status === 'IDLE' ? 'idle' : type === 'WORK' ? 'work' : type === 'SHORT_BREAK' ? 'shortBreak' : 'longBreak';

  const modeConfig = {
    idle: {
      title: 'Listo para Empezar',
      icon: <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
      textColor: 'text-gray-600',
      buttonColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    },
    work: {
      title: 'Tiempo de Estudio',
      icon: <BookOpenIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      textColor: 'text-purple-600',
      buttonColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    },
    shortBreak: {
      title: 'Descanso Corto',
      icon: <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-teal-50',
      textColor: 'text-green-600',
      buttonColor: 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700',
    },
    longBreak: {
      title: 'Descanso Largo',
      icon: <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      textColor: 'text-blue-600',
      buttonColor: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
    },
  };

  const config = modeConfig[currentMode];

  // Tiempo a mostrar
  const displayTime = status !== 'IDLE' && sessionId 
    ? timeRemaining 
    : settings.workDuration * 60;

  return (
    <div className={`min-h-screen ${config.bgColor} transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link 
            href="/areas" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium text-sm sm:text-base">Volver a Áreas</span>
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2 rounded-lg ${config.textColor} hover:bg-white/50 transition-all`}
              title="Ver estadísticas"
            >
              <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${config.textColor} hover:bg-white/50 transition-all`}
              title="Configuración"
            >
              <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Banner: Timer persiste al navegar */}
        {status !== 'IDLE' && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <p className="text-sm sm:text-base font-medium">
                ✨ El timer sigue funcionando aunque navegues a otras páginas. ¡Ve a estudiar casos clínicos!
              </p>
            </div>
          </div>
        )}

        {/* Stats Panel */}
        {showStats && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              Estadísticas de Hoy
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{localStats.completedPomodoros}</p>
                <p className="text-xs sm:text-sm text-gray-600">Pomodoros Completados</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{formatStudyTime(localStats.totalStudyTime)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Tiempo de Estudio</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Configuración</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Estudio (min)
                  </label>
                  <input
                    type="number"
                    value={settings.workDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, workDuration: parseInt(e.target.value) || 25 };
                      setSettings(newSettings);
                      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
                    }}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    min="1"
                    max="60"
                    disabled={status !== 'IDLE'}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Descanso (min)
                  </label>
                  <input
                    type="number"
                    value={settings.shortBreakDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, shortBreakDuration: parseInt(e.target.value) || 5 };
                      setSettings(newSettings);
                      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
                    }}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    min="1"
                    max="30"
                    disabled={status !== 'IDLE'}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Largo (min)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, longBreakDuration: parseInt(e.target.value) || 15 };
                      setSettings(newSettings);
                      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
                    }}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    min="1"
                    max="60"
                    disabled={status !== 'IDLE'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => {
                      const newSettings = { ...settings, soundEnabled: e.target.checked };
                      setSettings(newSettings);
                      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Reproducir sonido al terminar</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Timer Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-100">
          {/* Mode Title */}
          <div className={`flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 ${config.textColor}`}>
            {config.icon}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{config.title}</h1>
          </div>

          {/* Timer Display */}
          <div className="relative mb-6 sm:mb-8">
            <svg className="transform -rotate-90 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 108}`}
                strokeDashoffset={`${2 * Math.PI * 108 * (1 - progress / 100)}`}
                className={config.textColor}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold ${config.textColor}`}>
                {formatTime(displayTime)}
              </span>
              {status === 'PAUSED' && (
                <span className="text-sm text-yellow-600 font-medium mt-2">Pausado</span>
              )}
            </div>
          </div>

          {/* Controls */}
          {status === 'IDLE' ? (
            // Botones para iniciar
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">Selecciona un modo para comenzar:</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => handleStart('WORK')}
                  disabled={isStarting}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <BookOpenIcon className="w-5 h-5" />
                  Trabajo ({settings.workDuration}m)
                </button>
                <button
                  onClick={() => handleStart('SHORT_BREAK')}
                  disabled={isStarting}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Descanso ({settings.shortBreakDuration}m)
                </button>
              </div>
            </div>
          ) : (
            // Controles del timer activo
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {status === 'ACTIVE' ? (
                  <button
                    onClick={pauseTimer}
                    className={`${config.buttonColor} text-white p-4 sm:p-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                    title="Pausar"
                  >
                    <PauseIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                ) : (
                  <button
                    onClick={resumeTimer}
                    className={`${config.buttonColor} text-white p-4 sm:p-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                    title="Reanudar"
                  >
                    <PlayIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                )}
                <button
                  onClick={() => handleStop(false)}
                  className="bg-red-500 hover:bg-red-600 text-white p-4 sm:p-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                  title="Detener"
                >
                  <StopIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-4 sm:p-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                  title="Reiniciar"
                >
                  <ArrowPathIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </div>

              {/* Completar manualmente */}
              <button
                onClick={() => handleStop(true)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Marcar como completado
              </button>
            </div>
          )}

          {/* Progress Info */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Pomodoros completados hoy: <span className="font-bold text-purple-600">{localStats.completedPomodoros}</span>
            </p>
            {sessionId && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Tiempo enfocado: {formatStudyTime(timeSpent)}
              </p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/casos"
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all group"
          >
            <BookOpenIcon className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Casos Clínicos</span>
          </Link>
          <Link
            href="/areas"
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all group"
          >
            <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Áreas</span>
          </Link>
          <Link
            href="/estadisticas"
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all col-span-2 sm:col-span-1"
          >
            <ChartBarIcon className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Estadísticas</span>
          </Link>
        </div>

        {/* Info Footer */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">📚 Técnica Pomodoro</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            Divide tu estudio en intervalos enfocados con descansos regulares para maximizar la productividad.
          </p>
          <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
            <li>✓ 25 minutos de estudio concentrado</li>
            <li>✓ 5 minutos de descanso corto</li>
            <li>✓ El timer sigue funcionando al navegar</li>
            <li>✓ Widget flotante en todas las páginas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
