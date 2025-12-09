// app/hooks/useUserProgress.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export interface CaseProgress {
  caseId: string;
  attempts: number;
  bestScore: number;
  lastAttemptDate: string;
  averageScore: number;
  status: 'not-attempted' | 'failed' | 'passed' | 'mastered';
}

export function useUserProgress() {
  const { isSignedIn } = useUser();
  const [progress, setProgress] = useState<Map<string, CaseProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!isSignedIn) {
      setProgress(new Map());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/results');
      
      if (!response.ok) {
        throw new Error('Error al cargar progreso');
      }

      const data = await response.json();
      
      // Procesar resultados para crear un mapa de progreso por caso
      const progressMap = new Map<string, CaseProgress>();
      
      if (data.results && Array.isArray(data.results)) {
        // Agrupar por caseId
        const groupedByCase: Record<string, any[]> = {};
        
        data.results.forEach((result: any) => {
          if (!groupedByCase[result.caseId]) {
            groupedByCase[result.caseId] = [];
          }
          groupedByCase[result.caseId].push(result);
        });

        // Calcular estadísticas por caso
        Object.entries(groupedByCase).forEach(([caseId, results]) => {
          const scores = results.map(r => (r.score / r.totalPoints) * 100);
          const bestScore = Math.max(...scores);
          const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          const lastAttempt = results.sort((a, b) => 
            new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          )[0];

          let status: CaseProgress['status'] = 'not-attempted';
          if (bestScore >= 90) status = 'mastered';
          else if (bestScore >= 70) status = 'passed';
          else if (results.length > 0) status = 'failed';

          progressMap.set(caseId, {
            caseId,
            attempts: results.length,
            bestScore: Math.round(bestScore),
            lastAttemptDate: lastAttempt.completedAt,
            averageScore: Math.round(averageScore),
            status
          });
        });
      }

      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getCaseProgress = useCallback((caseId: string): CaseProgress | null => {
    return progress.get(caseId) || null;
  }, [progress]);

  const getCaseStatus = useCallback((caseId: string): CaseProgress['status'] => {
    return progress.get(caseId)?.status || 'not-attempted';
  }, [progress]);

  return {
    progress,
    loading,
    getCaseProgress,
    getCaseStatus,
    refetch: fetchProgress,
  };
}
