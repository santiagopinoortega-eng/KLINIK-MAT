// __tests__/lib/progress.test.ts
/**
 * Tests para lib/progress.ts
 * Valida el almacenamiento y recuperación de progreso en localStorage
 */

import { readProgress, clearProgress, SavedProgress } from '@/lib/progress';

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Reemplazar localStorage global con nuestro mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('lib/progress.ts', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  describe('readProgress', () => {
    test('retorna null si no hay progreso guardado', () => {
      const progress = readProgress('caso-test-1');
      expect(progress).toBeNull();
    });

    test('retorna el progreso guardado si existe', () => {
      const mockProgress: SavedProgress = {
        indice: 2,
        score: 5,
        mcqAnswers: { 'q1': 'option-a', 'q2': 'option-b' },
        shortAnswers: { 'q3': 'Respuesta de ejemplo' },
        startedAt: Date.now(),
      };

      localStorage.setItem(
        'klinikmat:case:caso-test-1',
        JSON.stringify(mockProgress)
      );

      const progress = readProgress('caso-test-1');
      expect(progress).toEqual(mockProgress);
    });

    test('retorna null si el JSON está corrupto', () => {
      localStorage.setItem('klinikmat:case:caso-test-1', 'invalid-json{');
      
      const progress = readProgress('caso-test-1');
      expect(progress).toBeNull();
    });

    test('usa el formato de key correcto', () => {
      const caseId = 'caso-its-vph-1';
      const mockProgress: SavedProgress = {
        indice: 0,
        score: 0,
        mcqAnswers: {},
        shortAnswers: {},
      };

      localStorage.setItem(
        `klinikmat:case:${caseId}`,
        JSON.stringify(mockProgress)
      );

      const progress = readProgress(caseId);
      expect(progress).not.toBeNull();
      expect(progress?.indice).toBe(0);
    });

    test('diferencia entre casos distintos', () => {
      const progress1: SavedProgress = {
        indice: 1,
        score: 3,
        mcqAnswers: {},
        shortAnswers: {},
      };

      const progress2: SavedProgress = {
        indice: 5,
        score: 8,
        mcqAnswers: {},
        shortAnswers: {},
      };

      localStorage.setItem('klinikmat:case:caso-1', JSON.stringify(progress1));
      localStorage.setItem('klinikmat:case:caso-2', JSON.stringify(progress2));

      expect(readProgress('caso-1')?.indice).toBe(1);
      expect(readProgress('caso-2')?.indice).toBe(5);
    });
  });

  describe('clearProgress', () => {
    test('elimina el progreso guardado', () => {
      const mockProgress: SavedProgress = {
        indice: 3,
        score: 7,
        mcqAnswers: {},
        shortAnswers: {},
      };

      localStorage.setItem(
        'klinikmat:case:caso-test-1',
        JSON.stringify(mockProgress)
      );

      // Verificar que existe
      expect(readProgress('caso-test-1')).not.toBeNull();

      // Limpiar
      clearProgress('caso-test-1');

      // Verificar que fue eliminado
      expect(readProgress('caso-test-1')).toBeNull();
    });

    test('no afecta a otros casos', () => {
      const progress1: SavedProgress = { indice: 1, score: 1, mcqAnswers: {}, shortAnswers: {} };
      const progress2: SavedProgress = { indice: 2, score: 2, mcqAnswers: {}, shortAnswers: {} };

      localStorage.setItem('klinikmat:case:caso-1', JSON.stringify(progress1));
      localStorage.setItem('klinikmat:case:caso-2', JSON.stringify(progress2));

      clearProgress('caso-1');

      expect(readProgress('caso-1')).toBeNull();
      expect(readProgress('caso-2')).not.toBeNull();
      expect(readProgress('caso-2')?.indice).toBe(2);
    });

    test('no falla si el caso no existe', () => {
      // Esto no debería lanzar error
      expect(() => {
        clearProgress('caso-inexistente');
      }).not.toThrow();
    });
  });

  describe('SavedProgress type', () => {
    test('estructura completa del progreso guardado', () => {
      const completeProgress: SavedProgress = {
        indice: 4,
        score: 9,
        mcqAnswers: {
          'paso-1-mcq': 'option-correct',
          'paso-2-mcq': 'option-b',
        },
        shortAnswers: {
          'paso-3-short': 'Anticonceptivo de emergencia',
        },
        startedAt: 1699900000000,
        finishedAt: 1699900600000,
        durationSec: 600,
      };

      localStorage.setItem(
        'klinikmat:case:test',
        JSON.stringify(completeProgress)
      );

      const retrieved = readProgress('test');
      
      expect(retrieved).toEqual(completeProgress);
      expect(retrieved?.indice).toBe(4);
      expect(retrieved?.score).toBe(9);
      expect(retrieved?.mcqAnswers).toHaveProperty('paso-1-mcq');
      expect(retrieved?.shortAnswers).toHaveProperty('paso-3-short');
      expect(retrieved?.durationSec).toBe(600);
    });

    test('progreso parcial sin timestamps', () => {
      const partialProgress: SavedProgress = {
        indice: 1,
        score: 2,
        mcqAnswers: { 'q1': 'a' },
        shortAnswers: {},
      };

      localStorage.setItem(
        'klinikmat:case:test',
        JSON.stringify(partialProgress)
      );

      const retrieved = readProgress('test');
      
      expect(retrieved?.startedAt).toBeUndefined();
      expect(retrieved?.finishedAt).toBeUndefined();
      expect(retrieved?.durationSec).toBeUndefined();
    });
  });
});
