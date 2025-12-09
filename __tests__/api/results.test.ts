// __tests__/api/results.test.ts
/**
 * Tests para validación de datos de resultados
 */

import { calculatePercentage, validateScore } from '@/lib/scoring';

describe('Validación de resultados', () => {
  describe('Validación de datos de entrada', () => {
    test('validateScore rechaza scores negativos', () => {
      expect(validateScore(-1, 10)).toBe(false);
    });

    test('validateScore rechaza scores mayores al total', () => {
      expect(validateScore(11, 10)).toBe(false);
    });

    test('validateScore acepta scores válidos', () => {
      expect(validateScore(0, 10)).toBe(true);
      expect(validateScore(5, 10)).toBe(true);
      expect(validateScore(10, 10)).toBe(true);
    });

    test('validateScore acepta decimales válidos', () => {
      expect(validateScore(7.5, 10)).toBe(true);
      expect(validateScore(0.5, 1)).toBe(true);
    });
  });

  describe('Cálculo de resultados', () => {
    test('calcula porcentaje correctamente', () => {
      expect(calculatePercentage(8, 10)).toBe(80);
      expect(calculatePercentage(0, 10)).toBe(0);
      expect(calculatePercentage(10, 10)).toBe(100);
    });

    test('redondea porcentajes decimales', () => {
      expect(calculatePercentage(7, 9)).toBe(78);
      expect(calculatePercentage(1, 3)).toBe(33);
    });

    test('maneja scores con decimales', () => {
      expect(calculatePercentage(7.5, 10)).toBe(75);
      expect(calculatePercentage(2.5, 5)).toBe(50);
    });
  });

  describe('Casos edge', () => {
    test('maneja score cero correctamente', () => {
      expect(validateScore(0, 10)).toBe(true);
      expect(calculatePercentage(0, 10)).toBe(0);
    });

    test('maneja score perfecto correctamente', () => {
      expect(validateScore(10, 10)).toBe(true);
      expect(calculatePercentage(10, 10)).toBe(100);
    });

    test('validateScore rechaza totalPoints cero o negativo', () => {
      expect(validateScore(5, 0)).toBe(false);
      expect(validateScore(5, -1)).toBe(false);
    });
  });
});
