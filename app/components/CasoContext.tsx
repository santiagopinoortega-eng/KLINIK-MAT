// app/components/CasoContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { CasoClient, McqOpcion, Respuesta } from '@/lib/types';

export type CaseMode = 'study' | 'osce';

interface CasoContextType {
  caso: CasoClient; 
  currentStep: number; 
  respuestas: Respuesta[];
  mode: CaseMode | null;
  timeLimit: number | null; // segundos
  timeSpent: number; // segundos transcurridos
  isTimeExpired: boolean;
  isCaseCompleted: boolean;
  handleSelect: (pasoId: string, opcion: McqOpcion | any, opts?: { skipAdvance?: boolean }) => void;
  handleNavigate: (stepIndex: number) => void;
  goToNextStep: () => void;
  setMode: (mode: CaseMode) => void;
  autoSubmitCase: () => void;
}

const CasoContext = createContext<CasoContextType | undefined>(undefined);

export function CasoProvider({ caso, children }: { caso: CasoClient; children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [mode, setModeState] = useState<CaseMode | null>(null);
  const [timeSpent, setTimeSpent] = useState(0); // segundos transcurridos
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [isCaseCompleted, setIsCaseCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Determinar tiempo límite según modo
  const timeLimit = useMemo(() => {
    if (!mode) return null;
    switch (mode) {
      case 'osce': return 720; // 12 minutos
      case 'study': return null; // sin límite
      default: return null;
    }
  }, [mode]);

  // Iniciar contador cuando se selecciona modo
  const setMode = useCallback((newMode: CaseMode) => {
    setModeState(newMode);
    setStartTime(Date.now());
  }, []);

  // Contador de tiempo
  useEffect(() => {
    if (!startTime || isTimeExpired || isCaseCompleted) return; // PAUSAR si completó

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isTimeExpired, isCaseCompleted]); // Agregar isCaseCompleted

  // Detectar cuando el caso está completo
  useEffect(() => {
    if (currentStep >= caso.pasos.length && respuestas.length === caso.pasos.length) {
      setIsCaseCompleted(true);
    }
  }, [currentStep, respuestas.length, caso.pasos.length]);

  // Auto-submit cuando expira el tiempo
  const autoSubmitCase = useCallback(() => {
    setIsTimeExpired(true);
    setCurrentStep(caso.pasos.length); // Ir a resultados
  }, [caso.pasos.length]);

  const handleNavigate = useCallback((stepIndex: number) => {
    if (isTimeExpired) return; // No permitir navegación si tiempo expiró
    
    // bounds
    if (stepIndex < 0 || stepIndex > caso.pasos.length) return;

    const answered = respuestas.length;
    const isFeedback = stepIndex === caso.pasos.length;

    // cannot jump ahead beyond the next unanswered question
    if (isFeedback) {
      if (answered < caso.pasos.length) return; // final feedback only after all answered
    } else {
      if (stepIndex > answered) return; // cannot navigate to a future unanswered step
    }

    setCurrentStep(stepIndex);
  }, [respuestas.length, caso.pasos.length, isTimeExpired]);

  // --- RE-EXPUESTO PARA EL BOTÓN "COMENZAR" ---
  const goToNextStep = useCallback(() => handleNavigate(currentStep + 1), [currentStep, handleNavigate]);

  const handleSelect = useCallback((pasoId: string, opcion: McqOpcion | any, opts?: { skipAdvance?: boolean }) => {
    if (isTimeExpired) return; // No permitir respuestas si tiempo expiró
    
    // Si la respuesta ya existe y solo queremos actualizar puntos
    const existingRespuestaIndex = respuestas.findIndex(r => r.pasoId === pasoId);
    
    if (existingRespuestaIndex !== -1 && 'puntos' in opcion && typeof opcion.puntos === 'number') {
      // Actualizar puntos de una respuesta existente
      setRespuestas(prev => prev.map((r, idx) => 
        idx === existingRespuestaIndex ? { ...r, puntos: opcion.puntos as number } : r
      ));
      return;
    }
    
    // Si ya respondió (nueva respuesta), no permitir duplicados
    if (existingRespuestaIndex !== -1) return;
    
    // Nueva respuesta
    const nuevaRespuesta: Respuesta = {
      pasoId,
      opcionId: opcion.id,
      esCorrecta: opcion.esCorrecta,
      ...(opcion.texto && { respuestaTexto: opcion.texto }),
      ...('puntos' in opcion && typeof opcion.puntos === 'number' && { puntos: opcion.puntos })
    };
    
    setRespuestas(prev => [...prev, nuevaRespuesta]);
  }, [respuestas, isTimeExpired]);

  const value = useMemo(() => ({ 
    caso, 
    currentStep, 
    respuestas, 
    mode,
    timeLimit,
    timeSpent,
    isTimeExpired,
    isCaseCompleted, // NEW: exponer estado de completitud
    handleSelect, 
    handleNavigate, 
    goToNextStep,
    setMode,
    autoSubmitCase
  }), [caso, currentStep, respuestas, mode, timeLimit, timeSpent, isTimeExpired, isCaseCompleted, handleSelect, handleNavigate, goToNextStep, setMode, autoSubmitCase]);

  return <CasoContext.Provider value={value}>{children}</CasoContext.Provider>;
}

export function useCaso() {
  const context = useContext(CasoContext);
  if (!context) throw new Error('useCaso must be used within a CasoProvider');
  return context;
}
