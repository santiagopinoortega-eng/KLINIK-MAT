// __tests__/lib/sanitize.test.ts
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizePercentage,
  sanitizeCaseId,
  sanitizeEnum,
  sanitizeObject,
  sanitizeStringArray,
  sanitizeCaseStepAnswer,
} from '@/lib/sanitize';

describe('sanitizeString', () => {
  it('remueve tags HTML', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('alert(1)');
    expect(sanitizeString('<b>Bold</b>')).toBe('Bold');
    expect(sanitizeString('Normal text')).toBe('Normal text');
    expect(sanitizeString('a < b')).toBe('a  b');
  });

  it('trunca a maxLength', () => {
    const long = 'a'.repeat(2000);
    expect(sanitizeString(long, 100).length).toBe(100);
  });

  it('trimea espacios', () => {
    expect(sanitizeString('  text  ')).toBe('text');
  });
});

describe('sanitizeEmail', () => {
  it('acepta emails válidos', () => {
    expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
    expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
  });

  it('rechaza emails inválidos', () => {
    expect(() => sanitizeEmail('notanemail')).toThrow('Email inválido');
    expect(() => sanitizeEmail('no@domain')).toThrow('Email inválido');
    expect(() => sanitizeEmail('@example.com')).toThrow('Email inválido');
  });

  it('convierte a lowercase', () => {
    expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com');
  });
});

describe('sanitizeNumber', () => {
  it('acepta números válidos', () => {
    expect(sanitizeNumber(42)).toBe(42);
    expect(sanitizeNumber('42')).toBe(42);
    expect(sanitizeNumber(0)).toBe(0);
  });

  it('rechaza números inválidos', () => {
    expect(() => sanitizeNumber('not a number')).toThrow('Número inválido');
    expect(() => sanitizeNumber(NaN)).toThrow('Número inválido');
    expect(() => sanitizeNumber(Infinity)).toThrow('Número inválido');
  });

  it('valida rango min/max', () => {
    expect(sanitizeNumber(5, 0, 10)).toBe(5);
    expect(() => sanitizeNumber(-1, 0, 10)).toThrow('Número debe ser al menos 0');
    expect(() => sanitizeNumber(11, 0, 10)).toThrow('Número debe ser máximo 10');
  });
});

describe('sanitizePercentage', () => {
  it('acepta porcentajes válidos', () => {
    expect(sanitizePercentage(0)).toBe(0);
    expect(sanitizePercentage(50)).toBe(50);
    expect(sanitizePercentage(100)).toBe(100);
  });

  it('rechaza valores fuera de rango', () => {
    expect(() => sanitizePercentage(-1)).toThrow();
    expect(() => sanitizePercentage(101)).toThrow();
  });
});

describe('sanitizeCaseId', () => {
  it('acepta UUID v4 válidos', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(sanitizeCaseId(validUuid)).toBe(validUuid);
  });

  it('rechaza IDs inválidos', () => {
    expect(() => sanitizeCaseId('not-a-uuid')).toThrow('ID de caso inválido');
    expect(() => sanitizeCaseId('550e8400-e29b-31d4-a716-446655440000')).toThrow(); // v3 UUID
  });
});

describe('sanitizeEnum', () => {
  const modes = ['study', 'timed', 'exam'] as const;

  it('acepta valores permitidos', () => {
    expect(sanitizeEnum('study', modes)).toBe('study');
    expect(sanitizeEnum('timed', modes)).toBe('timed');
  });

  it('rechaza valores no permitidos', () => {
    expect(() => sanitizeEnum('invalid', modes)).toThrow('Valores permitidos');
  });
});

describe('sanitizeObject', () => {
  it('sanitiza objeto válido', () => {
    const input = {
      title: '  Test Case  ',
      score: '85',
      mode: 'study',
    };

    const result = sanitizeObject<{
      title: string;
      score: number;
      mode: 'study' | 'timed';
    }>(input, {
      title: { type: 'string', required: true },
      score: { type: 'number', required: true },
      mode: { type: 'enum', allowedValues: ['study', 'timed'] },
    });

    expect(result.title).toBe('Test Case');
    expect(result.score).toBe(85);
    expect(result.mode).toBe('study');
  });

  it('rechaza campos requeridos faltantes', () => {
    const input = { title: 'Test' };

    expect(() =>
      sanitizeObject(input, {
        title: { type: 'string', required: true },
        score: { type: 'number', required: true },
      })
    ).toThrow('Campo requerido faltante: score');
  });

  it('permite campos opcionales', () => {
    const input = { title: 'Test' };

    const result = sanitizeObject<{ title: string; score?: number }>(input, {
      title: { type: 'string', required: true },
      score: { type: 'number', required: false },
    });

    expect(result.title).toBe('Test');
    expect(result.score).toBeUndefined();
  });
});

describe('sanitizeStringArray', () => {
  it('sanitiza array de strings', () => {
    const input = ['  a  ', '<b>b</b>', 'c'];
    const result = sanitizeStringArray(input);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('rechaza si no es array', () => {
    expect(() => sanitizeStringArray('not an array' as any)).toThrow('Debe ser un array');
  });

  it('limita cantidad de items', () => {
    const input = Array(100).fill('item');
    expect(() => sanitizeStringArray(input, 50, 50)).toThrow('Máximo 50 items');
  });
});

describe('sanitizeCaseStepAnswer', () => {
  it('sanitiza respuesta de opción múltiple', () => {
    const input = {
      stepIndex: 0,
      type: 'multiple-choice',
      answer: 'A',
    };

    const result = sanitizeCaseStepAnswer(input);
    expect(result.stepIndex).toBe(0);
    expect(result.type).toBe('multiple-choice');
    expect(result.answer).toBe('A');
  });

  it('sanitiza respuesta de texto corto', () => {
    const input = {
      stepIndex: 1,
      type: 'short-answer',
      answer: '  Gonorrea  ',
    };

    const result = sanitizeCaseStepAnswer(input);
    expect(result.answer).toBe('Gonorrea');
  });

  it('sanitiza respuesta de selección múltiple', () => {
    const input = {
      stepIndex: 0,
      type: 'multiple-select',
      answer: ['A', 'B', 'C'],
    };

    const result = sanitizeCaseStepAnswer(input);
    expect(result.answer).toEqual(['A', 'B', 'C']);
  });

  it('rechaza tipos de respuesta inválidos', () => {
    const input = {
      stepIndex: 0,
      type: 'invalid-type',
      answer: 'A',
    };

    expect(() => sanitizeCaseStepAnswer(input)).toThrow('Tipo de respuesta desconocido');
  });
});
