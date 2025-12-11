// lib/recommendations.ts
/**
 * Sistema de recomendaciones personalizadas basado en especialidad
 * Genera sugerencias inteligentes para aumentar engagement y retención
 */

import type { CasoClient } from './types';

// --- Tipos para el sistema de recomendaciones ---

export type CaseStatus = 'not-attempted' | 'failed' | 'passed' | 'mastered';

export type StudentProgress = {
  caseId: string;
  bestScore: number;
  attempts: number;
  lastAttempt: Date;
  status: CaseStatus;
};

export type RecommendationGroup = {
  title: string;
  description: string;
  icon: string;
  cases: CasoClient[];
  priority: number; // 1 = highest priority
  category: 'specialty' | 'review' | 'challenge' | 'trending';
};

export type PersonalizedRecommendations = {
  hasSpecialty: boolean;
  specialty?: string;
  groups: RecommendationGroup[];
  totalRecommendations: number;
};

// --- Mapeo de áreas (debe coincidir con schema) ---

export const SPECIALTY_AREAS: Record<string, string> = {
  'Ginecología': 'ginecologia',
  'Obstetricia': 'obstetricia', 
  'Neonatología': 'neonatologia',
  'SSR (Salud Sexual y Reproductiva)': 'ssr',
  'Todas las áreas': 'all',
};

export const AREA_TO_SPECIALTY: Record<string, string> = {
  'ginecologia': 'Ginecología',
  'obstetricia': 'Obstetricia',
  'neonatologia': 'Neonatología',
  'ssr': 'SSR (Salud Sexual y Reproductiva)',
};

// --- Funciones auxiliares ---

/**
 * Determina el estado de un caso basado en el mejor puntaje
 */
export function getCaseStatusFromScore(bestScore: number | null): CaseStatus {
  if (bestScore === null) return 'not-attempted';
  if (bestScore < 60) return 'failed';
  if (bestScore < 90) return 'passed';
  return 'mastered';
}

/**
 * Filtra casos por área/especialidad
 */
export function filterCasesBySpecialty(
  cases: CasoClient[],
  specialty: string
): CasoClient[] {
  if (specialty === 'all' || specialty === 'Todas las áreas') {
    return cases;
  }
  
  const targetArea = SPECIALTY_AREAS[specialty] || specialty.toLowerCase();
  return cases.filter(c => c.area?.toLowerCase() === targetArea);
}

/**
 * Obtiene casos no intentados en la especialidad del usuario
 */
export function getNotAttemptedCases(
  cases: CasoClient[],
  progress: StudentProgress[],
  specialty: string,
  limit: number = 6
): CasoClient[] {
  const specialtyCases = filterCasesBySpecialty(cases, specialty);
  const attemptedIds = new Set(progress.map(p => p.caseId));
  
  return specialtyCases
    .filter(c => !attemptedIds.has(c.id))
    .slice(0, limit);
}

/**
 * Obtiene casos fallados que necesitan repaso
 */
export function getFailedCases(
  cases: CasoClient[],
  progress: StudentProgress[],
  specialty: string,
  limit: number = 6
): CasoClient[] {
  const specialtyCases = filterCasesBySpecialty(cases, specialty);
  const failedIds = new Set(
    progress
      .filter(p => p.status === 'failed')
      .map(p => p.caseId)
  );
  
  return specialtyCases
    .filter(c => failedIds.has(c.id))
    .slice(0, limit);
}

/**
 * Obtiene casos de desafío (dificultad alta)
 */
export function getChallengeCases(
  cases: CasoClient[],
  progress: StudentProgress[],
  specialty: string,
  limit: number = 4
): CasoClient[] {
  const specialtyCases = filterCasesBySpecialty(cases, specialty);
  const masteredIds = new Set(
    progress
      .filter(p => p.status === 'mastered')
      .map(p => p.caseId)
  );
  
  // Casos difíciles que no han sido dominados
  return specialtyCases
    .filter(c => {
      const difficulty = typeof c.dificultad === 'string' 
        ? c.dificultad.toLowerCase() 
        : c.dificultad;
      const isHard = difficulty === 'alta' || difficulty === 3;
      return isHard && !masteredIds.has(c.id);
    })
    .slice(0, limit);
}

/**
 * Obtiene casos "trending" (más intentados recientemente)
 * Simula popularidad basándose en progreso general
 */
export function getTrendingCases(
  cases: CasoClient[],
  progress: StudentProgress[],
  specialty: string,
  limit: number = 4
): CasoClient[] {
  const specialtyCases = filterCasesBySpecialty(cases, specialty);
  
  // Contar intentos por caso
  const attemptCounts = new Map<string, number>();
  progress.forEach(p => {
    attemptCounts.set(p.caseId, (attemptCounts.get(p.caseId) || 0) + p.attempts);
  });
  
  // Ordenar por número de intentos (más popular primero)
  return specialtyCases
    .sort((a, b) => {
      const countA = attemptCounts.get(a.id) || 0;
      const countB = attemptCounts.get(b.id) || 0;
      return countB - countA;
    })
    .slice(0, limit);
}

/**
 * Función principal: genera recomendaciones personalizadas
 */
export function generatePersonalizedRecommendations(
  userSpecialty: string | null | undefined,
  allCases: CasoClient[],
  userProgress: StudentProgress[]
): PersonalizedRecommendations {
  // Si el usuario no tiene especialidad definida, retornar vacío
  if (!userSpecialty) {
    return {
      hasSpecialty: false,
      groups: [],
      totalRecommendations: 0,
    };
  }

  const groups: RecommendationGroup[] = [];
  
  // 1. Casos nuevos en tu especialidad (PRIORIDAD ALTA)
  const notAttempted = getNotAttemptedCases(allCases, userProgress, userSpecialty, 6);
  if (notAttempted.length > 0) {
    groups.push({
      title: `Para ti: ${AREA_TO_SPECIALTY[SPECIALTY_AREAS[userSpecialty]] || userSpecialty}`,
      description: 'Casos nuevos en tu área de interés',
      icon: '🎯',
      cases: notAttempted,
      priority: 1,
      category: 'specialty',
    });
  }

  // 2. Casos para repasar (fallados)
  const failed = getFailedCases(allCases, userProgress, userSpecialty, 6);
  if (failed.length > 0) {
    groups.push({
      title: 'Repasar y mejorar',
      description: 'Casos que necesitan tu atención',
      icon: '🔄',
      cases: failed,
      priority: 2,
      category: 'review',
    });
  }

  // 3. Desafíos recomendados (alta dificultad)
  const challenges = getChallengeCases(allCases, userProgress, userSpecialty, 4);
  if (challenges.length > 0) {
    groups.push({
      title: 'Desafíos avanzados',
      description: 'Pon a prueba tu conocimiento',
      icon: '💪',
      cases: challenges,
      priority: 3,
      category: 'challenge',
    });
  }

  // 4. Trending en tu especialidad
  const trending = getTrendingCases(allCases, userProgress, userSpecialty, 4);
  if (trending.length > 0) {
    groups.push({
      title: 'Populares en tu área',
      description: 'Casos que otros estudiantes están practicando',
      icon: '🔥',
      cases: trending,
      priority: 4,
      category: 'trending',
    });
  }

  const totalRecommendations = groups.reduce((sum, g) => sum + g.cases.length, 0);

  return {
    hasSpecialty: true,
    specialty: userSpecialty,
    groups: groups.sort((a, b) => a.priority - b.priority),
    totalRecommendations,
  };
}

/**
 * Calcula porcentaje de completitud en una especialidad
 */
export function getSpecialtyCompletionPercentage(
  specialty: string,
  allCases: CasoClient[],
  userProgress: StudentProgress[]
): number {
  const specialtyCases = filterCasesBySpecialty(allCases, specialty);
  if (specialtyCases.length === 0) return 0;
  
  const completedIds = new Set(
    userProgress
      .filter(p => p.status === 'passed' || p.status === 'mastered')
      .map(p => p.caseId)
  );
  
  const completed = specialtyCases.filter(c => completedIds.has(c.id)).length;
  return Math.round((completed / specialtyCases.length) * 100);
}

/**
 * Obtiene estadísticas por especialidad
 */
export function getSpecialtyStats(
  specialty: string,
  allCases: CasoClient[],
  userProgress: StudentProgress[]
) {
  const specialtyCases = filterCasesBySpecialty(allCases, specialty);
  const total = specialtyCases.length;
  
  const notAttempted = getNotAttemptedCases(allCases, userProgress, specialty, 999).length;
  const failed = getFailedCases(allCases, userProgress, specialty, 999).length;
  
  const progressIds = new Set(userProgress.map(p => p.caseId));
  const passed = specialtyCases.filter(c => {
    const p = userProgress.find(pr => pr.caseId === c.id);
    return p && p.status === 'passed';
  }).length;
  
  const mastered = specialtyCases.filter(c => {
    const p = userProgress.find(pr => pr.caseId === c.id);
    return p && p.status === 'mastered';
  }).length;

  return {
    total,
    notAttempted,
    failed,
    passed,
    mastered,
    completionPercentage: getSpecialtyCompletionPercentage(specialty, allCases, userProgress),
  };
}
