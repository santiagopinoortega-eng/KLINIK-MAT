'use client';

import { usePomodoro } from '@/app/context/PomodoroContext';
import { X, Clock, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * FloatingPomodoroWidget - Shows active Pomodoro session on all pages
 * Only visible when there's an active or paused session
 */
export default function FloatingPomodoroWidget() {
  const { sessionId, type, status, timeRemaining, pauseTimer, resumeTimer } = usePomodoro();
  const router = useRouter();

  // Don't show if no active session
  if (!sessionId || status === 'IDLE') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeColor = () => {
    switch (type) {
      case 'WORK':
        return 'bg-blue-600';
      case 'SHORT_BREAK':
        return 'bg-green-600';
      case 'LONG_BREAK':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'WORK':
        return 'Trabajo';
      case 'SHORT_BREAK':
        return 'Descanso';
      case 'LONG_BREAK':
        return 'Descanso Largo';
      default:
        return '';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`${getTypeColor()} text-white rounded-2xl shadow-2xl p-4 min-w-[280px] animate-slide-up`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold text-sm">{getTypeLabel()}</span>
          </div>
          <button
            onClick={() => router.push('/pomodoro')}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            title="Abrir Pomodoro"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Time Display */}
        <div className="text-center mb-3">
          <span className="text-4xl font-bold">{formatTime(timeRemaining)}</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2">
          {status === 'ACTIVE' && (
            <>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm opacity-90">En progreso</span>
            </>
          )}
          {status === 'PAUSED' && (
            <>
              <div className="w-2 h-2 bg-yellow-300 rounded-full" />
              <span className="text-sm opacity-90">Pausado</span>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex gap-2">
          {status === 'ACTIVE' ? (
            <button
              onClick={pauseTimer}
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-medium transition-colors"
            >
              Pausar
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-medium transition-colors"
            >
              Reanudar
            </button>
          )}
          <button
            onClick={() => router.push('/pomodoro')}
            className="flex-1 bg-white text-blue-600 hover:bg-gray-100 rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
