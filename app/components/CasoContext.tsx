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
    if (stepIndex <= respuestas.length + 1 && stepIndex >= 0 && stepIndex <= caso.pasos.length)
      setCurrentStep(stepIndex);
  }, [respuestas.length, caso.pasos.length]);

  // --- RE-EXPUESTO PARA EL BOTÓN "COMENZAR" ---
  const goToNextStep = useCallback(() => handleNavigate(currentStep + 1), [currentStep, handleNavigate]);

  const handleSelect = useCallback((pasoId: string, opcion: Opcion, opts?: { skipAdvance?: boolean }) => {
    if (respuestas.some(r => r.pasoId === pasoId)) return;
    setRespuestas(prev => [...prev, { pasoId, opcionId: opcion.id, esCorrecta: opcion.esCorrecta }]);
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
