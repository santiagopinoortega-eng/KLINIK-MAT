'use client';

import { useState, useEffect, useRef } from 'react';
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
} from '@heroicons/react/24/outline';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number; // minutos
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // cada cuántos pomodoros
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

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0); // en segundos
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Cargar datos guardados
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    const savedPomodoros = localStorage.getItem('completedPomodoros');
    const savedStudyTime = localStorage.getItem('totalStudyTime');
    const savedDate = localStorage.getItem('pomodoroDate');
    const today = new Date().toDateString();

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setTimeLeft(parsed.workDuration * 60);
    }

    // Reset diario de estadísticas
    if (savedDate !== today) {
      localStorage.setItem('pomodoroDate', today);
      localStorage.setItem('completedPomodoros', '0');
      localStorage.setItem('totalStudyTime', '0');
    } else {
      if (savedPomodoros) setCompletedPomodoros(parseInt(savedPomodoros));
      if (savedStudyTime) setTotalStudyTime(parseInt(savedStudyTime));
    }
  }, []);

  // Timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });

        // Actualizar tiempo total de estudio
        if (mode === 'work') {
          setTotalStudyTime(prev => {
            const newTotal = prev + 1;
            localStorage.setItem('totalStudyTime', newTotal.toString());
            return newTotal;
          });
        }
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      startTimeRef.current = null;
    }
  }, [isRunning, timeLeft, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      localStorage.setItem('completedPomodoros', newCount.toString());

      // Determinar siguiente modo
      const nextMode = newCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(nextMode === 'longBreak' ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60);

      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }

      // Notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Pomodoro Completado! 🎉', {
          body: `Tiempo de descanso: ${nextMode === 'longBreak' ? settings.longBreakDuration : settings.shortBreakDuration} minutos`,
          icon: '/icon-192x192.png',
        });
      }
    } else {
      setMode('work');
      setTimeLeft(settings.workDuration * 60);

      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 1000);
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Descanso Terminado! 💪', {
          body: 'Es hora de volver a estudiar',
          icon: '/icon-192x192.png',
        });
      }
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxXIpBSl+zPLaizsIGGS56+mgUBELTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElqy5O6nVhQLQ5zd8sFuJAUuhM/z1YU4BxVrvO7mnEoODlWs5/CvYBgIP5fY88p1LAUme8ry3Ik6CBdlu+3nolETDEuk4fG4aR0FNo7V88+AMgUhdsXv4JVDCxJasuTup1cVCz+c3fK/cCQFLoTP89WGOQcUa7zu5p1KDg5Urufwrx8YCD+X2PPKdSwFJnvK8tyJOggXZbvt56JRE==');
    audio.play().catch(() => {});
  };

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(settings.workDuration * 60);
  };

  const skipTimer = () => {
    setIsRunning(false);
    handleTimerComplete();
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

  const progress = mode === 'work'
    ? ((settings.workDuration * 60 - timeLeft) / (settings.workDuration * 60)) * 100
    : mode === 'shortBreak'
    ? ((settings.shortBreakDuration * 60 - timeLeft) / (settings.shortBreakDuration * 60)) * 100
    : ((settings.longBreakDuration * 60 - timeLeft) / (settings.longBreakDuration * 60)) * 100;

  const modeConfig = {
    work: {
      title: 'Tiempo de Estudio',
      icon: <BookOpenIcon className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      textColor: 'text-purple-600',
      buttonColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    },
    shortBreak: {
      title: 'Descanso Corto',
      icon: <SparklesIcon className="w-8 h-8" />,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-teal-50',
      textColor: 'text-green-600',
      buttonColor: 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700',
    },
    longBreak: {
      title: 'Descanso Largo',
      icon: <SparklesIcon className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      textColor: 'text-blue-600',
      buttonColor: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
    },
  };

  const config = modeConfig[mode];

  return (
    <div className={`min-h-screen ${config.bgColor} transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/recursos" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Volver a Recursos</span>
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2 rounded-lg ${config.textColor} hover:bg-white/50 transition-all`}
            >
              <ChartBarIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${config.textColor} hover:bg-white/50 transition-all`}
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
              Estadísticas de Hoy
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <CheckCircleIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-600">{completedPomodoros}</p>
                <p className="text-sm text-gray-600">Pomodoros Completados</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-600">{formatStudyTime(totalStudyTime)}</p>
                <p className="text-sm text-gray-600">Tiempo Total de Estudio</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Configuración</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estudio (min)
                  </label>
                  <input
                    type="number"
                    value={settings.workDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, workDuration: parseInt(e.target.value) };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
                      if (mode === 'work' && !isRunning) setTimeLeft(parseInt(e.target.value) * 60);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descanso (min)
                  </label>
                  <input
                    type="number"
                    value={settings.shortBreakDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, shortBreakDuration: parseInt(e.target.value) };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descanso Largo (min)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, longBreakDuration: parseInt(e.target.value) };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => {
                      const newSettings = { ...settings, autoStartBreaks: e.target.checked };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Iniciar descansos automáticamente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => {
                      const newSettings = { ...settings, autoStartPomodoros: e.target.checked };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Iniciar pomodoros automáticamente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => {
                      const newSettings = { ...settings, soundEnabled: e.target.checked };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
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
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Mode Title */}
          <div className={`flex items-center justify-center gap-3 mb-8 ${config.textColor}`}>
            {config.icon}
            <h1 className="text-2xl md:text-3xl font-bold">{config.title}</h1>
          </div>

          {/* Timer Display */}
          <div className="relative mb-8">
            <svg className="transform -rotate-90 w-64 h-64 mx-auto">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className={config.textColor}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-6xl md:text-7xl font-bold ${config.textColor}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={toggleTimer}
              className={`${config.buttonColor} text-white p-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
            >
              {isRunning ? (
                <PauseIcon className="w-8 h-8" />
              ) : (
                <PlayIcon className="w-8 h-8" />
              )}
            </button>
            <button
              onClick={resetTimer}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowPathIcon className="w-8 h-8" />
            </button>
          </div>

          {/* Skip Button */}
          {isRunning && (
            <div className="text-center">
              <button
                onClick={skipTimer}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Saltar {mode === 'work' ? 'pomodoro' : 'descanso'}
              </button>
            </div>
          )}

          {/* Progress Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Pomodoros completados hoy: <span className="font-bold text-purple-600">{completedPomodoros}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Siguiente descanso largo en {settings.longBreakInterval - (completedPomodoros % settings.longBreakInterval)} pomodoros
            </p>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">📚 Técnica Pomodoro</h3>
          <p className="text-sm text-gray-600 mb-3">
            Divide tu estudio en intervalos de tiempo enfocados con descansos regulares para maximizar la productividad y retención.
          </p>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>✓ 25 minutos de estudio concentrado</li>
            <li>✓ 5 minutos de descanso corto</li>
            <li>✓ 15 minutos de descanso largo cada 4 pomodoros</li>
            <li>✓ Notificaciones del navegador al terminar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
