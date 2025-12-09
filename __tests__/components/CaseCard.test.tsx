// __tests__/components/CaseCard.test.tsx
/**
 * Tests para CaseCard - Tarjeta de caso clínico
 */

import { render, screen } from '@testing-library/react';
import CaseCard from '@/app/components/CaseCard';

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CaseCard', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Renderizado básico', () => {
    test('muestra título y área correctamente', () => {
      render(
        <CaseCard
          id="test-1"
          title="Caso de Gonorrea"
          area="GINECOLOGIA"
          difficulty={2}
        />
      );

      expect(screen.getByText('Caso de Gonorrea')).toBeInTheDocument();
      expect(screen.getByText('GINECOLOGIA')).toBeInTheDocument();
    });

    test('muestra summary cuando está disponible', () => {
      render(
        <CaseCard
          id="test-1"
          title="Caso Test"
          area="OBSTETRICIA"
          difficulty={1}
          summary="Paciente con dolor abdominal"
        />
      );

      expect(screen.getByText('Paciente con dolor abdominal')).toBeInTheDocument();
    });

    test('muestra fecha cuando está disponible', () => {
      render(
        <CaseCard
          id="test-1"
          title="Caso Test"
          area="SSR"
          difficulty={3}
          createdAt="2024-01-15T10:00:00Z"
        />
      );

      // La fecha se formatea según locale
      expect(screen.getByText(/1\/15\/2024|15\/1\/2024/)).toBeInTheDocument();
    });
  });

  describe('Etiquetas de dificultad', () => {
    test('muestra BAJA para difficulty 1', () => {
      render(
        <CaseCard
          id="test-1"
          title="Caso Fácil"
          area="GINECOLOGIA"
          difficulty={1}
        />
      );

      expect(screen.getByText('BAJA')).toBeInTheDocument();
    });

    test('muestra MEDIA para difficulty 2', () => {
      render(
        <CaseCard
          id="test-2"
          title="Caso Intermedio"
          area="OBSTETRICIA"
          difficulty={2}
        />
      );

      expect(screen.getByText('MEDIA')).toBeInTheDocument();
    });

    test('muestra ALTA para difficulty 3', () => {
      render(
        <CaseCard
          id="test-3"
          title="Caso Difícil"
          area="NEONATOLOGIA"
          difficulty={3}
        />
      );

      expect(screen.getByText('ALTA')).toBeInTheDocument();
    });

    test('muestra BAJA cuando difficulty es null', () => {
      render(
        <CaseCard
          id="test-4"
          title="Caso Sin Dificultad"
          area="SSR"
          difficulty={null}
        />
      );

      expect(screen.getByText('BAJA')).toBeInTheDocument();
    });
  });

  describe('Progreso del usuario (localStorage)', () => {
    test('carga progreso desde localStorage sin romper (formato objeto)', () => {
      localStorageMock.setItem('km-progress', JSON.stringify({
        'test-1': { aciertos: 7, total: 10 }
      }));

      // Debe renderizar sin errores
      expect(() => {
        render(
          <CaseCard
            id="test-1"
            title="Caso con Progreso"
            area="GINECOLOGIA"
            difficulty={2}
          />
        );
      }).not.toThrow();
    });

    test('carga progreso desde localStorage sin romper (formato array)', () => {
      localStorageMock.setItem('km-progress', JSON.stringify({
        'test-2': [
          { ok: true },
          { ok: false },
          { ok: true },
          { ok: true },
        ]
      }));

      // Debe renderizar sin errores
      expect(() => {
        render(
          <CaseCard
            id="test-2"
            title="Caso con Array"
            area="OBSTETRICIA"
            difficulty={1}
          />
        );
      }).not.toThrow();
    });

    test('renderiza correctamente si no existe progreso en localStorage', () => {
      expect(() => {
        render(
          <CaseCard
            id="test-3"
            title="Caso Sin Progreso"
            area="SSR"
            difficulty={2}
          />
        );
      }).not.toThrow();
    });

    test('maneja localStorage corrupto sin romper', () => {
      localStorageMock.setItem('km-progress', 'invalid json{');

      // No debe lanzar error
      expect(() => {
        render(
          <CaseCard
            id="test-4"
            title="Caso con JSON Inválido"
            area="GINECOLOGIA"
            difficulty={1}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Link de navegación', () => {
    test('incluye link a la página del caso', () => {
      render(
        <CaseCard
          id="caso-123"
          title="Caso Test"
          area="GINECOLOGIA"
          difficulty={2}
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/casos/caso-123');
    });
  });

  describe('Casos edge', () => {
    test('maneja área null sin romper', () => {
      expect(() => {
        render(
          <CaseCard
            id="test-1"
            title="Sin Área"
            area={null}
            difficulty={1}
          />
        );
      }).not.toThrow();
    });

    test('maneja createdAt inválido sin romper', () => {
      expect(() => {
        render(
          <CaseCard
            id="test-1"
            title="Fecha Inválida"
            area="GINECOLOGIA"
            difficulty={1}
            createdAt="invalid-date"
          />
        );
      }).not.toThrow();
    });
  });
});
