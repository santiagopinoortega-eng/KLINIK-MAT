// app/components/CaseTimer.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface CaseTimerProps {
  duration: number; // segundos totales
  onExpire: () => void; // callback cuando se acaba el tiempo
  warningAt?: number; // segundos para mostrar alerta (default: 120 = 2 min)
  onTick?: (secondsRemaining: number) => void; // callback cada segundo
  isPaused?: boolean; // pausar el timer (para modos especiales)
  isCaseCompleted?: boolean; // detener cuando el caso esté completo
}

export default function CaseTimer({ 
  duration, 
  onExpire, 
  warningAt = 120,
  onTick,
  isPaused = false,
  isCaseCompleted = false
}: CaseTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    // Detener el timer si está pausado O si el caso está completo
    if (isPaused || isCaseCompleted) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        const newValue = prev - 1;
        
        // Callbacks
        if (onTick) onTick(newValue);
        
        // Estados de alerta
        if (newValue <= 60 && newValue > 0) {
          setIsCritical(true);
        } else if (newValue <= warningAt && newValue > 60) {
          setIsWarning(true);
        }
        
        // Tiempo agotado
        if (newValue <= 0) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onExpire, warningAt, onTick, isPaused, isCaseCompleted]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimerColor = () => {
    if (isCritical) return 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse';
    if (isWarning) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-km-teal to-teal-600';
  };

  const getTimerText = () => {
    if (isCritical) return 'text-red-100';
    if (isWarning) return 'text-orange-100';
    return 'text-white';
  };

  const getProgressPercentage = () => {
    return (secondsRemaining / duration) * 100;
  };

  return (
    <div className="fixed top-20 right-6 z-50 animate-fade-in">
      <div 
        className={`${getTimerColor()} rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm border-2 ${
          isCritical ? 'border-red-400' : isWarning ? 'border-orange-400' : 'border-white/20'
        }`}
      >
        <ClockIcon className={`h-5 w-5 ${getTimerText()} ${isCritical ? 'animate-bounce' : ''}`} />
        
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${getTimerText()} opacity-90`}>
            {isCritical ? '⚠️ Tiempo crítico' : isWarning ? '⏰ Apresúrate' : 'Tiempo restante'}
          </span>
          <span className={`text-2xl font-bold ${getTimerText()} tracking-tight tabular-nums`}>
            {formatTime(secondsRemaining)}
          </span>
        </div>
      </div>
      
      {/* Barra de progreso visual */}
      <div className="mt-2 w-full bg-neutral-200/30 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
        <div 
          className={`h-full transition-all duration-1000 ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-teal-500'
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Texto de alerta */}
      {isCritical && (
        <p className="mt-2 text-xs text-red-700 font-semibold text-center bg-red-50 px-2 py-1 rounded">
          ¡Último minuto!
        </p>
      )}
    </div>
  );
}
