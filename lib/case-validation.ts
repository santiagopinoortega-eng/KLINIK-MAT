// lib/case-validation.ts

/**
 * Reglas de estructura de casos clínicos por dificultad
 */

export const CASE_STRUCTURE_RULES = {
  BAJA: {
    difficulty: 1,
    totalQuestions: 6,
    mcqQuestions: 6,
    shortQuestions: 0,
    optionsPerMcq: 4, // A-D
    label: 'Baja'
  },
  MEDIA: {
    difficulty: 2,
    totalQuestions: 7,
    mcqQuestions: 6,
    shortQuestions: 1,
    optionsPerMcq: 4, // A-D
    label: 'Media'
  },
  ALTA: {
    difficulty: 3,
    totalQuestions: 8,
    mcqQuestions: 7,
    shortQuestions: 1,
    optionsPerMcq: 4, // A-D
    label: 'Alta'
  }
} as const;

export type DifficultyLevel = keyof typeof CASE_STRUCTURE_RULES;

/**
 * Valida si un caso cumple con la estructura requerida según su dificultad
 */
export function validateCaseStructure(
  difficulty: number | string,
  mcqCount: number,
  shortCount: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Mapear dificultad
  let difficultyKey: DifficultyLevel;
  if (difficulty === 1 || difficulty === 'Baja') difficultyKey = 'BAJA';
  else if (difficulty === 2 || difficulty === 'Media') difficultyKey = 'MEDIA';
  else if (difficulty === 3 || difficulty === 'Alta') difficultyKey = 'ALTA';
  else {
    errors.push(`Dificultad inválida: ${difficulty}. Debe ser 1-3 o "Baja", "Media", "Alta"`);
    return { valid: false, errors };
  }

  const rules = CASE_STRUCTURE_RULES[difficultyKey];
  const totalCount = mcqCount + shortCount;

  // Validar total de preguntas
  if (totalCount !== rules.totalQuestions) {
    errors.push(
      `Dificultad ${rules.label}: Esperadas ${rules.totalQuestions} preguntas, encontradas ${totalCount}`
    );
  }

  // Validar MCQ
  if (mcqCount !== rules.mcqQuestions) {
    errors.push(
      `Dificultad ${rules.label}: Esperadas ${rules.mcqQuestions} preguntas MCQ, encontradas ${mcqCount}`
    );
  }

  // Validar SHORT
  if (shortCount !== rules.shortQuestions) {
    errors.push(
      `Dificultad ${rules.label}: Esperadas ${rules.shortQuestions} preguntas de desarrollo, encontradas ${shortCount}`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Obtiene las reglas para una dificultad específica
 */
export function getRulesForDifficulty(difficulty: number | string) {
  if (difficulty === 1 || difficulty === 'Baja') return CASE_STRUCTURE_RULES.BAJA;
  if (difficulty === 2 || difficulty === 'Media') return CASE_STRUCTURE_RULES.MEDIA;
  if (difficulty === 3 || difficulty === 'Alta') return CASE_STRUCTURE_RULES.ALTA;
  return null;
}

/**
 * Valida que una pregunta MCQ tenga exactamente 4 opciones (A-D)
 */
export function validateMcqOptions(optionsCount: number): { valid: boolean; error?: string } {
  const expectedOptions = 4;
  if (optionsCount !== expectedOptions) {
    return {
      valid: false,
      error: `Pregunta MCQ debe tener ${expectedOptions} opciones (A-D), encontradas ${optionsCount}`
    };
  }
  return { valid: true };
}
