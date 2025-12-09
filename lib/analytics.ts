// lib/analytics.ts
import { track } from '@vercel/analytics';

/**
 * Analytics wrapper para trackear eventos importantes de la plataforma
 * Usa Vercel Analytics para capturar métricas de uso
 */
export const analytics = {
  /**
   * Usuario inició un caso clínico
   */
  caseStarted: (data: {
    caseId: string;
    caseTitle: string;
    area: string;
    difficulty: string;
    mode: 'study' | 'osce';
  }) => {
    track('case_started', {
      case_id: data.caseId,
      case_title: data.caseTitle,
      area: data.area,
      difficulty: data.difficulty,
      mode: data.mode,
    });
  },

  /**
   * Usuario completó un caso clínico
   */
  caseCompleted: (data: {
    caseId: string;
    caseTitle: string;
    area: string;
    score: number;
    totalPoints: number;
    percentage: number;
    timeSpent: number; // segundos
    mode: 'study' | 'osce';
  }) => {
    track('case_completed', {
      case_id: data.caseId,
      case_title: data.caseTitle,
      area: data.area,
      score: data.score,
      total_points: data.totalPoints,
      percentage: data.percentage,
      time_spent_seconds: data.timeSpent,
      time_spent_minutes: Math.round(data.timeSpent / 60),
      mode: data.mode,
      passed: data.percentage >= 70,
    });
  },

  /**
   * Usuario respondió una pregunta
   */
  questionAnswered: (data: {
    caseId: string;
    questionType: 'mcq' | 'short';
    isCorrect: boolean;
    stepNumber: number;
  }) => {
    track('question_answered', {
      case_id: data.caseId,
      question_type: data.questionType,
      is_correct: data.isCorrect,
      step_number: data.stepNumber,
    });
  },

  /**
   * Usuario navegó entre pasos
   */
  stepNavigated: (data: {
    caseId: string;
    fromStep: number;
    toStep: number;
    direction: 'next' | 'previous' | 'jump';
  }) => {
    track('step_navigated', {
      case_id: data.caseId,
      from_step: data.fromStep,
      to_step: data.toStep,
      direction: data.direction,
    });
  },

  /**
   * Usuario cambió de modo (study/osce)
   */
  modeSelected: (data: {
    caseId: string;
    mode: 'study' | 'osce';
  }) => {
    track('mode_selected', {
      case_id: data.caseId,
      mode: data.mode,
    });
  },

  /**
   * Tiempo agotado en modo OSCE
   */
  timeExpired: (data: {
    caseId: string;
    timeLimit: number;
    stepsCompleted: number;
    totalSteps: number;
  }) => {
    track('time_expired', {
      case_id: data.caseId,
      time_limit_seconds: data.timeLimit,
      steps_completed: data.stepsCompleted,
      total_steps: data.totalSteps,
      completion_rate: (data.stepsCompleted / data.totalSteps) * 100,
    });
  },

  /**
   * Usuario accedió a recursos educativos
   */
  resourceAccessed: (data: {
    resourceType: 'anticonceptivos' | 'minsal';
    resourceId?: string;
    resourceTitle?: string;
  }) => {
    track('resource_accessed', {
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      resource_title: data.resourceTitle,
    });
  },

  /**
   * Usuario vio su progreso
   */
  progressViewed: () => {
    track('progress_viewed');
  },

  /**
   * Error crítico ocurrido
   */
  errorOccurred: (data: {
    errorMessage: string;
    errorLocation: string;
    errorType: string;
  }) => {
    track('error_occurred', {
      error_message: data.errorMessage,
      error_location: data.errorLocation,
      error_type: data.errorType,
    });
  },

  /**
   * Usuario actualizó su perfil
   */
  profileUpdated: (data: {
    fieldsUpdated: string[];
  }) => {
    track('profile_updated', {
      fields_updated: data.fieldsUpdated.join(','),
      fields_count: data.fieldsUpdated.length,
    });
  },
};
