/**
 * Tests de Componentes - UsageLimitBadge
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import UsageLimitBadge from '@/app/components/UsageLimitBadge';

// Mock fetch global
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('UsageLimitBadge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe mostrar loading state inicialmente', () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
      () => new Promise(() => {}) as Promise<Response> // Never resolves
    );

    render(<UsageLimitBadge />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('debe mostrar badge FREE con conteo correcto (12/15)', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        canAccess: true,
        planName: 'Gratuito',
        planType: 'FREE',
        isUnlimited: false,
        caseLimit: 15,
        casesUsed: 12,
        remaining: 3,
        percentage: 80,
        isPremium: false,
      }),
    } as Response);

    render(<UsageLimitBadge />);

    await waitFor(() => {
      expect(screen.getByText(/12/)).toBeInTheDocument();
      expect(screen.getByText(/15/)).toBeInTheDocument();
      expect(screen.getByText(/casos este mes/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar badge PREMIUM ilimitado', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        canAccess: true,
        planName: 'Premium',
        planType: 'PREMIUM',
        isUnlimited: true,
        caseLimit: null,
        casesUsed: 50,
        remaining: null,
        percentage: 0,
        isPremium: true,
      }),
    } as Response);

    render(<UsageLimitBadge />);

    await waitFor(() => {
      expect(screen.getByText(/ilimitado/i)).toBeInTheDocument();
      expect(screen.getByText(/premium/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar advertencia cuando límite alcanzado', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        canAccess: false,
        planName: 'Gratuito',
        planType: 'FREE',
        isUnlimited: false,
        caseLimit: 15,
        casesUsed: 15,
        remaining: 0,
        percentage: 100,
        isPremium: false,
      }),
    } as Response);

    render(<UsageLimitBadge />);

    await waitFor(() => {
      expect(screen.getByText(/límite alcanzado/i)).toBeInTheDocument();
      expect(screen.getByText(/actualizar a premium/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar barra de progreso con color correcto (azul <70%)', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        canAccess: true,
        caseLimit: 15,
        casesUsed: 5,
        percentage: 33,
        isPremium: false,
      }),
    } as Response);

    const { container } = render(<UsageLimitBadge />);

    await waitFor(() => {
      const progressBar = container.querySelector('[style*="width: 33%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  it('debe mostrar barra naranja cuando uso >70%', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        canAccess: true,
        caseLimit: 15,
        casesUsed: 12,
        percentage: 80,
        isPremium: false,
      }),
    } as Response);

    const { container } = render(<UsageLimitBadge />);

    await waitFor(() => {
      const badge = container.querySelector('.border-orange-300');
      expect(badge).toBeInTheDocument();
    });
  });

  it('debe mostrar barra roja cuando uso >90%', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        canAccess: true,
        caseLimit: 15,
        casesUsed: 14,
        percentage: 93,
        isPremium: false,
      }),
    } as Response);

    const { container } = render(<UsageLimitBadge />);

    await waitFor(() => {
      const badge = container.querySelector('.border-red-300');
      expect(badge).toBeInTheDocument();
    });
  });

  it('debe manejar errores de fetch correctamente', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

    render(<UsageLimitBadge />);

    await waitFor(() => {
      // Componente no debe crashear, debe mostrar estado por defecto o error
      expect(screen.queryByText(/error/i)).toBeInTheDocument();
    });
  });

  it('debe llamar al endpoint correcto', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, isPremium: false }),
    } as Response);

    render(<UsageLimitBadge />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/subscription/check-access');
    });
  });
});
