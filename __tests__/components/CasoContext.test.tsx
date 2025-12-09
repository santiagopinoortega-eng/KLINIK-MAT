// __tests__/components/CasoContext.test.tsx
/**
 * Tests para CasoContext - State management del caso clínico
 */

import { renderHook, act } from '@testing-library/react';
import { CasoProvider, useCaso, CaseMode } from '@/app/components/CasoContext';
import type { CasoClient } from '@/lib/types';

// Mock de caso de prueba
const mockCaso: CasoClient = {
  id: 'test-caso',
  title: 'Caso de Prueba',
  slug: 'caso-prueba',
  difficulty: 'Intermedio',
  area: 'GINECOLOGIA',
  group: 'Test',
  timeLimit: null,
  pasos: [
    {
      id: 'paso1',
      type: 'mcq',
      pregunta: '¿Pregunta 1?',
      opciones: [
        { id: 'a', texto: 'Opción A', esCorrecta: true, feedback: 'Correcto' },
        { id: 'b', texto: 'Opción B', esCorrecta: false, feedback: 'Incorrecto' },
      ],
    },
    {
      id: 'paso2',
      type: 'mcq',
      pregunta: '¿Pregunta 2?',
      opciones: [
        { id: 'c', texto: 'Opción C', esCorrecta: false, feedback: 'Incorrecto' },
        { id: 'd', texto: 'Opción D', esCorrecta: true, feedback: 'Correcto' },
      ],
    },
    {
      id: 'paso3',
      type: 'short',
      pregunta: '¿Pregunta abierta?',
      puntosMaximos: 2,
      criteriosEvaluacion: ['criterio1', 'criterio2'],
    },
  ],
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CasoProvider caso={mockCaso}>{children}</CasoProvider>
);

describe('CasoContext', () => {
  describe('Estado inicial', () => {
    test('inicia con valores por defecto', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      expect(result.current.currentStep).toBe(0);
      expect(result.current.respuestas).toEqual([]);
      expect(result.current.mode).toBeNull();
      expect(result.current.timeLimit).toBeNull();
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isTimeExpired).toBe(false);
      expect(result.current.isCaseCompleted).toBe(false);
    });

    test('proporciona el caso correctamente', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      expect(result.current.caso).toBe(mockCaso);
      expect(result.current.caso.pasos).toHaveLength(3);
    });
  });

  describe('Selección de modo', () => {
    test('setMode cambia el modo a study', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      act(() => {
        result.current.setMode('study');
      });

      expect(result.current.mode).toBe('study');
      expect(result.current.timeLimit).toBeNull(); // study sin límite
    });

    test('setMode cambia el modo a osce con límite de tiempo', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      act(() => {
        result.current.setMode('osce');
      });

      expect(result.current.mode).toBe('osce');
      expect(result.current.timeLimit).toBe(720); // 12 minutos
    });
  });

  describe('Navegación entre pasos', () => {
    test('goToNextStep avanza al siguiente paso', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      // Responder primer paso
      act(() => {
        result.current.handleSelect('paso1', mockCaso.pasos[0].opciones![0]);
      });

      act(() => {
        result.current.goToNextStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    test('handleNavigate permite navegar a pasos respondidos', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      // Responder primeros dos pasos
      act(() => {
        result.current.handleSelect('paso1', mockCaso.pasos[0].opciones![0]);
      });
      act(() => {
        result.current.handleSelect('paso2', mockCaso.pasos[1].opciones![1]);
      });

      // Navegar al paso 0
      act(() => {
        result.current.handleNavigate(0);
      });

      expect(result.current.currentStep).toBe(0);

      // Navegar al paso 1
      act(() => {
        result.current.handleNavigate(1);
      });

      expect(result.current.currentStep).toBe(1);
    });

    test('handleNavigate NO permite saltar a pasos no respondidos', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      // Intentar navegar al paso 2 sin responder nada
      act(() => {
        result.current.handleNavigate(2);
      });

      expect(result.current.currentStep).toBe(0); // Se queda en el inicial
    });

    test('handleNavigate permite ir a feedback solo si todos respondidos', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      // Intentar ir a feedback sin responder
      act(() => {
        result.current.handleNavigate(3); // feedback step
      });

      expect(result.current.currentStep).toBe(0); // No permite

      // Responder todos
      act(() => {
        result.current.handleSelect('paso1', mockCaso.pasos[0].opciones![0]);
        result.current.handleSelect('paso2', mockCaso.pasos[1].opciones![1]);
        result.current.handleSelect('paso3', { id: 'short1', texto: 'Respuesta abierta', puntos: 2 });
      });

      // Ahora sí permite ir a feedback
      act(() => {
        result.current.handleNavigate(3);
      });

      expect(result.current.currentStep).toBe(3);
    });
  });

  describe('Manejo de respuestas', () => {
    test('handleSelect agrega respuesta correcta', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      act(() => {
        result.current.handleSelect('paso1', mockCaso.pasos[0].opciones![0]);
      });

      expect(result.current.respuestas).toHaveLength(1);
      expect(result.current.respuestas[0]).toMatchObject({
        pasoId: 'paso1',
        opcionId: 'a',
        esCorrecta: true,
      });
    });

    test('handleSelect NO permite responder dos veces el mismo paso', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      act(() => {
        result.current.handleSelect('paso1', mockCaso.pasos[0].opciones![0]);
      });

      // Intentar responder de nuevo
      act(() => {
        result.current.handleSelect('paso1', mockCaso.pasos[0].opciones![1]);
      });

      expect(result.current.respuestas).toHaveLength(1); // Solo 1 respuesta
      expect(result.current.respuestas[0].opcionId).toBe('a'); // Primera opción
    });

    test('handleSelect con skipAdvance actualiza puntos sin duplicar', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      // Responder pregunta short
      act(() => {
        result.current.handleSelect('paso3', { 
          id: 'short1', 
          texto: 'Mi respuesta', 
          puntos: 1 
        });
      });

      expect(result.current.respuestas).toHaveLength(1);
      expect(result.current.respuestas[0].puntos).toBe(1);

      // Actualizar puntos (autoevaluación)
      act(() => {
        result.current.handleSelect('paso3', { puntos: 2 }, { skipAdvance: true });
      });

      expect(result.current.respuestas).toHaveLength(1); // No duplica
      expect(result.current.respuestas[0].puntos).toBe(2); // Actualiza puntos
    });

    test('handleSelect guarda respuesta de texto para Short', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      act(() => {
        result.current.handleSelect('paso3', { 
          id: 'short1', 
          texto: 'Esta es mi respuesta detallada',
          puntos: 2 
        });
      });

      expect(result.current.respuestas[0]).toMatchObject({
        pasoId: 'paso3',
        respuestaTexto: 'Esta es mi respuesta detallada',
        puntos: 2,
      });
    });
  });

  describe('Estado de completitud', () => {
    test('isCaseCompleted es false al inicio', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      expect(result.current.isCaseCompleted).toBe(false);
    });

    test('isCaseCompleted es true cuando se responden todos y se llega al final', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      // Responder todos los pasos
      act(() => {
        result.current.handleSelect('paso1', mockCaso.pasos[0].opciones![0]);
        result.current.handleSelect('paso2', mockCaso.pasos[1].opciones![1]);
        result.current.handleSelect('paso3', { id: 'short1', texto: 'Respuesta', puntos: 2 });
      });

      // Avanzar a feedback
      act(() => {
        result.current.handleNavigate(3);
      });

      expect(result.current.isCaseCompleted).toBe(true);
    });
  });

  describe('Manejo de tiempo', () => {
    test('autoSubmitCase marca tiempo expirado y va a resultados', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      act(() => {
        result.current.setMode('osce');
      });

      act(() => {
        result.current.autoSubmitCase();
      });

      expect(result.current.isTimeExpired).toBe(true);
      expect(result.current.currentStep).toBe(mockCaso.pasos.length); // Va a feedback
    });

    test('NO permite responder si el tiempo expiró', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      act(() => {
        result.current.setMode('osce');
        result.current.autoSubmitCase();
      });

      // Intentar responder
      act(() => {
        result.current.handleSelect('paso1', mockCaso.pasos[0].opciones![0]);
      });

      expect(result.current.respuestas).toHaveLength(0); // No permite
    });

    test('NO permite navegar si el tiempo expiró', () => {
      const { result } = renderHook(() => useCaso(), { wrapper });

      act(() => {
        result.current.setMode('osce');
        result.current.autoSubmitCase();
      });

      // Intentar navegar
      act(() => {
        result.current.handleNavigate(1);
      });

      expect(result.current.currentStep).toBe(mockCaso.pasos.length); // Se queda en feedback
    });
  });

  describe('Error handling', () => {
    test('useCaso lanza error si se usa fuera del provider', () => {
      // Suprimir console.error para este test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useCaso());
      }).toThrow('useCaso must be used within a CasoProvider');

      consoleSpy.mockRestore();
    });
  });
});
