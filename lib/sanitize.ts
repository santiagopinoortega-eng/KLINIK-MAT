// lib/sanitize.ts
// Input sanitization y validación para prevenir XSS, SQL injection, etc.

/**
 * Sanitiza string básico - remueve HTML y caracteres peligrosos
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remueve tags HTML
    .replace(/[<>]/g, ''); // Remueve < y > sobrantes
}

/**
 * Sanitiza email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const sanitized = email.trim().toLowerCase();
  
  // Validación básica de formato email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Email inválido');
  }
  
  return sanitized;
}

/**
 * Sanitiza número
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number {
  const num = Number(input);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Número inválido');
  }
  
  if (min !== undefined && num < min) {
    throw new Error(`Número debe ser al menos ${min}`);
  }
  
  if (max !== undefined && num > max) {
    throw new Error(`Número debe ser máximo ${max}`);
  }
  
  return num;
}

/**
 * Sanitiza porcentaje (0-100)
 */
export function sanitizePercentage(input: any): number {
  return sanitizeNumber(input, 0, 100);
}

/**
 * Sanitiza ID de caso (UUID v4)
 */
export function sanitizeCaseId(id: string): string {
  if (typeof id !== 'string') {
    throw new Error('ID inválido');
  }
  
  const sanitized = id.trim();
  
  // UUID v4 format: 8-4-4-4-12 caracteres hexadecimales
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(sanitized)) {
    throw new Error('ID de caso inválido');
  }
  
  return sanitized;
}

/**
 * Sanitiza enum - verifica que el valor esté en la lista permitida
 */
export function sanitizeEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName = 'Valor'
): T {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} debe ser un string`);
  }
  
  const sanitized = value.trim() as T;
  
  if (!allowedValues.includes(sanitized)) {
    throw new Error(
      `${fieldName} inválido. Valores permitidos: ${allowedValues.join(', ')}`
    );
  }
  
  return sanitized;
}

/**
 * Sanitiza objeto con schema definido
 */
export function sanitizeObject<T extends Record<string, any>>(
  input: any,
  schema: {
    [K in keyof T]: {
      type: 'string' | 'number' | 'boolean' | 'enum' | 'email' | 'caseId';
      required?: boolean;
      maxLength?: number;
      min?: number;
      max?: number;
      allowedValues?: readonly any[];
    };
  }
): Partial<T> {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Entrada debe ser un objeto');
  }

  const sanitized: Partial<T> = {};

  for (const [key, config] of Object.entries(schema)) {
    const value = input[key];

    // Campo requerido faltante
    if (config.required && (value === undefined || value === null)) {
      throw new Error(`Campo requerido faltante: ${key}`);
    }

    // Campo opcional faltante - skip
    if (value === undefined || value === null) {
      continue;
    }

    // Sanitizar según tipo
    try {
      switch (config.type) {
        case 'string':
          sanitized[key as keyof T] = sanitizeString(value, config.maxLength) as any;
          break;

        case 'number':
          sanitized[key as keyof T] = sanitizeNumber(value, config.min, config.max) as any;
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            throw new Error(`${key} debe ser booleano`);
          }
          sanitized[key as keyof T] = value as any;
          break;

        case 'enum':
          if (!config.allowedValues) {
            throw new Error(`Schema error: allowedValues required for enum ${key}`);
          }
          sanitized[key as keyof T] = sanitizeEnum(value, config.allowedValues, key) as any;
          break;

        case 'email':
          sanitized[key as keyof T] = sanitizeEmail(value) as any;
          break;

        case 'caseId':
          sanitized[key as keyof T] = sanitizeCaseId(value) as any;
          break;

        default:
          throw new Error(`Schema error: tipo desconocido para ${key}`);
      }
    } catch (error) {
      throw new Error(`Error en campo ${key}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  return sanitized;
}

/**
 * Sanitiza array de strings
 */
export function sanitizeStringArray(
  input: any,
  maxLength = 100,
  maxItems = 50
): string[] {
  if (!Array.isArray(input)) {
    throw new Error('Debe ser un array');
  }

  if (input.length > maxItems) {
    throw new Error(`Máximo ${maxItems} items permitidos`);
  }

  return input.map(item => sanitizeString(item, maxLength));
}

/**
 * Prevenir NoSQL injection en queries
 */
export function sanitizeMongoQuery(query: any): any {
  if (typeof query !== 'object' || query === null) {
    return query;
  }

  // Remueve operadores de query que puedan ser peligrosos
  const dangerousOperators = ['$where', '$regex', '$expr'];
  
  for (const key of Object.keys(query)) {
    if (dangerousOperators.includes(key)) {
      delete query[key];
    } else if (typeof query[key] === 'object') {
      query[key] = sanitizeMongoQuery(query[key]);
    }
  }

  return query;
}

/**
 * Valida y sanitiza respuesta de paso de caso clínico
 */
export function sanitizeCaseStepAnswer(answer: any): {
  stepIndex: number;
  type: string;
  answer: any;
} {
  if (typeof answer !== 'object' || answer === null) {
    throw new Error('Respuesta inválida');
  }

  const stepIndex = sanitizeNumber(answer.stepIndex, 0);
  const type = sanitizeString(answer.type, 50);

  // Sanitizar según tipo de pregunta
  let sanitizedAnswer: any;

  switch (type) {
    case 'multiple-choice':
      if (typeof answer.answer !== 'string') {
        throw new Error('Respuesta de opción múltiple debe ser string');
      }
      sanitizedAnswer = sanitizeString(answer.answer, 5); // A, B, C, D, E
      break;

    case 'multiple-select':
      sanitizedAnswer = sanitizeStringArray(answer.answer, 5, 10);
      break;

    case 'short-answer':
      sanitizedAnswer = sanitizeString(answer.answer, 500);
      break;

    case 'image-select':
      if (typeof answer.answer !== 'string' && typeof answer.answer !== 'number') {
        throw new Error('Respuesta de imagen debe ser string o número');
      }
      sanitizedAnswer = answer.answer;
      break;

    default:
      throw new Error(`Tipo de respuesta desconocido: ${type}`);
  }

  return {
    stepIndex,
    type,
    answer: sanitizedAnswer,
  };
}
