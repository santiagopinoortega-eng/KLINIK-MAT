// hooks/useAITutor.ts
// Hook para gestionar estado del tutor IA

import { useState, useEffect } from 'react';

interface UseAITutorProps {
  caseId: string;
}

export function useAITutor({ caseId }: UseAITutorProps) {
  const [puede, setPuede] = useState(true);
  const [loading, setLoading] = useState(true);
  const [razon, setRazon] = useState<string | undefined>();

  useEffect(() => {
    const verificarDisponibilidad = async () => {
      try {
        const res = await fetch(`/api/ai/tutor?caseId=${caseId}`);
        const data = await res.json();

        setPuede(data.puede);
        setRazon(data.razon);
      } catch (error) {
        console.error('Error verificando disponibilidad tutor:', error);
        setPuede(false);
      } finally {
        setLoading(false);
      }
    };

    verificarDisponibilidad();
  }, [caseId]);

  return { puede, loading, razon };
}
