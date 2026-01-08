// app/context/PomodoroContext.tsx
'use client';

/**
 * Pomodoro Context - Global State Management
 * 
 * Mantiene el timer activo incluso al navegar entre páginas
 * Sincroniza con localStorage y base de datos
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { postJSON, patchJSON } from '@/lib/fetch-with-csrf';
import type { PomodoroSession } from '@prisma/client';

export interface PomodoroState {
  sessionId: string | null;
  type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
  status: 'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  duration: number; // minutos configurados
  timeRemaining: number; // segundos restantes
  timeSpent: number; // segundos transcurridos
  caseId?: string;
  caseTitle?: string;
}

interface PomodoroContextValue extends PomodoroState {
  startTimer: (type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK', duration: number, caseId?: string, caseTitle?: string) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: (complete: boolean, notes?: string) => Promise<void>;
  resetTimer: () => void;
  isRunning: boolean;
}

const PomodoroContext = createContext<PomodoroContextValue | undefined>(undefined);

const STORAGE_KEY = 'klinikmat_pomodoro';
const SYNC_INTERVAL = 10000; // Sincronizar cada 10 segundos

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PomodoroState>({
    sessionId: null,
    type: 'WORK',
    status: 'IDLE',
    duration: 25,
    timeRemaining: 25 * 60,
    timeSpent: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Cargar estado desde localStorage al montar
  useEffect(() => {
    let hasActiveSession = false;
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Si hay sesión activa o pausada, restaurar
        if (parsed.sessionId && (parsed.status === 'ACTIVE' || parsed.status === 'PAUSED')) {
          setState(parsed);
          startTimeRef.current = Date.now() - (parsed.timeSpent * 1000);
          hasActiveSession = true;
        }
      } catch (error) {
        console.error('Error loading Pomodoro state:', error);
      }
    }

    // Solo recuperar del servidor si hay indicios de sesión activa
    // Esto evita llamadas innecesarias en cada página
    if (hasActiveSession) {
      loadActiveSession();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Guardar estado en localStorage cuando cambia
  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Timer logic
  useEffect(() => {
    if (state.status === 'ACTIVE') {
      // Iniciar timer
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newTimeSpent = prev.timeSpent + 1;
          const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);

          // Auto-completar cuando llega a 0
          if (newTimeRemaining === 0) {
            stopTimerInternal(true);
            return prev;
          }

          return {
            ...prev,
            timeSpent: newTimeSpent,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 1000);

      // Sincronizar con servidor periódicamente
      syncIntervalRef.current = setInterval(() => {
        syncWithServer();
      }, SYNC_INTERVAL);
    } else {
      // Limpiar timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [state.status]);

  /**
   * Cargar sesión activa desde el servidor
   */
  const loadActiveSession = async () => {
    try {
      const response = await fetch('/api/pomodoro/active');
      const data = await response.json();

      if (data.success && data.session) {
        const session: PomodoroSession = data.session;
        setState({
          sessionId: session.id,
          type: session.type as 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK',
          status: session.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
          duration: session.duration,
          timeRemaining: session.timeRemaining,
          timeSpent: session.timeSpent,
          caseId: session.caseId || undefined,
          caseTitle: session.caseTitle || undefined,
        });

        if (session.status === 'ACTIVE') {
          startTimeRef.current = Date.now() - (session.timeSpent * 1000);
        }
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  /**
   * Sincronizar con servidor
   */
  const syncWithServer = async () => {
    if (!state.sessionId) return;

    try {
      await patchJSON(`/api/pomodoro/${state.sessionId}`, {
        timeRemaining: state.timeRemaining,
        timeSpent: state.timeSpent,
      });
    } catch (error) {
      console.error('Error syncing with server:', error);
    }
  };

  /**
   * Iniciar timer
   */
  const startTimer = useCallback(
    async (
      type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK',
      duration: number,
      caseId?: string,
      caseTitle?: string
    ) => {
      try {
        const response = await postJSON('/api/pomodoro', {
          type,
          duration,
          caseId,
          caseTitle,
        });

        if (response.ok && response.data?.success) {
          const session: PomodoroSession = response.data.session;
          
          setState({
            sessionId: session.id,
            type: session.type as 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK',
            status: 'ACTIVE',
            duration: session.duration,
            timeRemaining: session.timeRemaining,
            timeSpent: 0,
            caseId: session.caseId || undefined,
            caseTitle: session.caseTitle || undefined,
          });

          startTimeRef.current = Date.now();
        }
      } catch (error: any) {
        console.error('Error starting timer:', error);
        throw new Error(error.message || 'Error al iniciar el timer');
      }
    },
    []
  );

  /**
   * Pausar timer
   */
  const pauseTimer = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      await patchJSON(`/api/pomodoro/${state.sessionId}/pause`, {});
      setState((prev) => ({ ...prev, status: 'PAUSED' }));
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  }, [state.sessionId]);

  /**
   * Reanudar timer
   */
  const resumeTimer = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      await patchJSON(`/api/pomodoro/${state.sessionId}/resume`, {});
      setState((prev) => ({ ...prev, status: 'ACTIVE' }));
      startTimeRef.current = Date.now() - (state.timeSpent * 1000);
    } catch (error) {
      console.error('Error resuming timer:', error);
    }
  }, [state.sessionId, state.timeSpent]);

  /**
   * Detener timer (interno)
   */
  const stopTimerInternal = async (complete: boolean, notes?: string) => {
    if (!state.sessionId) return;

    try {
      const endpoint = complete ? 'complete' : 'cancel';
      await patchJSON(`/api/pomodoro/${state.sessionId}/${endpoint}`, {
        timeSpent: state.timeSpent,
        ...(notes && { notes }),
      });

      setState({
        sessionId: null,
        type: 'WORK',
        status: 'IDLE',
        duration: 25,
        timeRemaining: 25 * 60,
        timeSpent: 0,
      });

      localStorage.removeItem(STORAGE_KEY);

      // Reproducir notificación
      if (complete && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Pomodoro completado!', {
          body: `Has completado ${state.duration} minutos de ${state.type === 'WORK' ? 'estudio' : 'descanso'}.`,
          icon: '/favicon.ico',
        });
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  /**
   * Detener timer (público)
   */
  const stopTimer = useCallback(
    async (complete: boolean, notes?: string) => {
      await stopTimerInternal(complete, notes);
    },
    [state.sessionId, state.timeSpent, state.duration, state.type]
  );

  /**
   * Resetear timer (sin guardar)
   */
  const resetTimer = useCallback(() => {
    setState({
      sessionId: null,
      type: 'WORK',
      status: 'IDLE',
      duration: 25,
      timeRemaining: 25 * 60,
      timeSpent: 0,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isRunning = state.status === 'ACTIVE';

  return (
    <PomodoroContext.Provider
      value={{
        ...state,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
        isRunning,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
