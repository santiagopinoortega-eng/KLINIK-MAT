'use client';

import { useEffect, useState } from 'react';
import { usePomodoro } from '@/app/context/PomodoroContext';
import { Play, Pause, Square, Clock, TrendingUp, Calendar, Award, Target } from 'lucide-react';

interface PomodoroStats {
  totalSessions: number;
  completedSessions: number;
  totalTimeSpent: number;
  avgSessionTime: number;
  focusScore: number;
  weeklyAverage: number;
  dailyStreak: number;
  workSessions: number;
  breakSessions: number;
}

interface WeeklyData {
  week: string;
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
  avgDailyMinutes: number;
}

export default function PomodoroPage() {
  const {
    sessionId,
    type,
    status,
    duration,
    timeRemaining,
    timeSpent,
    caseTitle,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
  } = usePomodoro();

  const [selectedType, setSelectedType] = useState<'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'>('WORK');
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const [statsRes, weeklyRes] = await Promise.all([
        fetch('/api/pomodoro/stats'),
        fetch('/api/pomodoro/stats/weekly'),
      ]);

      if (statsRes.ok) {
        const { stats } = await statsRes.json();
        setStats(stats);
      }

      if (weeklyRes.ok) {
        const { stats: weekly } = await weeklyRes.json();
        setWeeklyStats(weekly);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = duration * 60 > 0 ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100 : 0;

  // Handle start timer
  const handleStart = async () => {
    setLoading(true);
    try {
      await startTimer(selectedType, selectedDuration);
    } catch (error) {
      console.error('Failed to start timer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pause/resume
  const handlePauseResume = async () => {
    if (status === 'ACTIVE') {
      await pauseTimer();
    } else if (status === 'PAUSED') {
      await resumeTimer();
    }
  };

  // Handle stop
  const handleStop = async () => {
    const notes = prompt('Add notes about this session (optional):');
    await stopTimer(true, notes || undefined);
    fetchStats(); // Refresh stats after completion
  };

  const isIdle = status === 'IDLE';
  const isActive = status === 'ACTIVE';
  const isPaused = status === 'PAUSED';
  const hasActiveSession = sessionId !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Timer Pomodoro 🍅
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Mejora tu concentración y productividad con la técnica Pomodoro
          </p>
        </div>

        {/* Main Timer Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          {/* Timer Display */}
          <div className="text-center mb-8">
            {/* Circular Progress */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <svg className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700 sm:hidden"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 sm:hidden ${
                    type === 'WORK'
                      ? 'text-blue-500'
                      : type === 'SHORT_BREAK'
                      ? 'text-green-500'
                      : 'text-purple-500'
                  }`}
                  strokeLinecap="round"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="104"
                  stroke="currentColor"
                  strokeWidth="7"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700 hidden sm:block md:hidden"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="104"
                  stroke="currentColor"
                  strokeWidth="7"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 104}`}
                  strokeDashoffset={`${2 * Math.PI * 104 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 hidden sm:block md:hidden ${
                    type === 'WORK'
                      ? 'text-blue-500'
                      : type === 'SHORT_BREAK'
                      ? 'text-green-500'
                      : 'text-purple-500'
                  }`}
                  strokeLinecap="round"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700 hidden md:block"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 hidden md:block ${
                    type === 'WORK'
                      ? 'text-blue-500'
                      : type === 'SHORT_BREAK'
                      ? 'text-green-500'
                      : 'text-purple-500'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                  {hasActiveSession ? formatTime(timeRemaining) : formatTime(selectedDuration * 60)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {hasActiveSession
                    ? type === 'WORK'
                      ? 'Trabajo'
                      : type === 'SHORT_BREAK'
                      ? 'Descanso Corto'
                      : 'Descanso Largo'
                    : 'Listo para comenzar'}
                </span>
              </div>
            </div>

            {/* Case Info */}
            {caseTitle && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Estudiando: <span className="font-semibold">{caseTitle}</span>
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {isIdle ? (
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="flex items-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  Iniciar
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseResume}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                        Reanudar
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                    Detener
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Session Configuration (only when idle) */}
          {isIdle && (
            <div className="border-t dark:border-gray-700 pt-6 sm:pt-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Configurar sesión
              </h3>

              {/* Type Selection */}
              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de sesión
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setSelectedType('WORK');
                      setSelectedDuration(25);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedType === 'WORK'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-sm sm:text-base font-medium">Trabajo</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedType('SHORT_BREAK');
                      setSelectedDuration(5);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedType === 'SHORT_BREAK'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <span className="text-sm sm:text-base font-medium">Descanso Corto</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedType('LONG_BREAK');
                      setSelectedDuration(15);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedType === 'LONG_BREAK'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-sm sm:text-base font-medium">Descanso Largo</span>
                  </button>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duración (minutos)
                </label>
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                  {[5, 15, 25, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setSelectedDuration(mins)}
                      className={`px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm sm:text-base ${
                        selectedDuration === mins
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {mins}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {/* Total Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.completedSessions}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sesiones completadas</p>
            </div>

            {/* Focus Score */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.focusScore}%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Índice de enfoque</p>
            </div>

            {/* Weekly Average */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.weeklyAverage}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Min/día (promedio)</p>
            </div>

            {/* Daily Streak */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.dailyStreak}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Días consecutivos</p>
            </div>
          </div>
        )}

        {/* Weekly Progress Chart */}
        {weeklyStats.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Progreso Semanal
              </h2>
            </div>

            <div className="space-y-4">
              {weeklyStats.map((week, index) => {
                const maxMinutes = Math.max(...weeklyStats.map((w) => w.totalMinutes));
                const percentage = maxMinutes > 0 ? (week.totalMinutes / maxMinutes) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {week.week}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {week.totalMinutes} min ({week.completedSessions} sesiones)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
