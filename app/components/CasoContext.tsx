// app/components/CasoContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { CasoClient, McqOpcion as Opcion, Respuesta } from '@/lib/types';

interface CasoContextType {
  caso: CasoClient; currentStep: number; respuestas: Respuesta[];
  handleSelect: (pasoId: string, opcion: Opcion, opts?: { skipAdvance?: boolean }) => void;
  handleNavigate: (stepIndex: number) => void;
  goToNextStep: () => void; // <-- LO VOLVEMOS A EXPONER
}

const CasoContext = createContext<CasoContextType | undefined>(undefined);

export function CasoProvider({ caso, children }: { caso: CasoClient; children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);

  const handleNavigate = useCallback((stepIndex: number) => {
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
  }, [respuestas.length, caso.pasos.length]);

  // --- RE-EXPUESTO PARA EL BOTÓN "COMENZAR" ---
  const goToNextStep = useCallback(() => handleNavigate(currentStep + 1), [currentStep, handleNavigate]);

  const handleSelect = useCallback((pasoId: string, opcion: Opcion, opts?: { skipAdvance?: boolean }) => {
    // Si la respuesta ya existe y solo queremos actualizar puntos
    const existingRespuestaIndex = respuestas.findIndex(r => r.pasoId === pasoId);
    
    if (existingRespuestaIndex !== -1 && 'puntos' in opcion) {
      // Actualizar puntos de una respuesta existente
      setRespuestas(prev => prev.map((r, idx) => 
        idx === existingRespuestaIndex ? { ...r, puntos: opcion.puntos } : r
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
      ...(typeof opcion.puntos === 'number' && { puntos: opcion.puntos })
    };
    
    setRespuestas(prev => [...prev, nuevaRespuesta]);
    
    // Si no se indica skipAdvance, avanzamos automáticamente (útil para MCQ)
    if (!opts?.skipAdvance) {
      setTimeout(() => {
        setCurrentStep(curr => (curr < caso.pasos.length ? curr + 1 : curr));
      }, 700);
    }
  }, [caso.pasos.length, respuestas]);

  const value = useMemo(() => ({ 
    caso, currentStep, respuestas, handleSelect, handleNavigate, goToNextStep 
  }), [caso, currentStep, respuestas, handleSelect, handleNavigate, goToNextStep]);

  return <CasoContext.Provider value={value}>{children}</CasoContext.Provider>;
}

export function useCaso() {
  const context = useContext(CasoContext);
  if (!context) throw new Error('useCaso must be used within a CasoProvider');
  return context;
}
