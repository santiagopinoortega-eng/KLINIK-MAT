/**
 * Tests de Integración - API Endpoint check-access
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock auth de Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock funciones de subscription
jest.mock('@/lib/subscription', () => ({
  canAccessNewCase: jest.fn(),
  getUserUsageStats: jest.fn(),
}));

const mockAuth = require('@clerk/nextjs/server').auth;
const mockCanAccessNewCase = require('@/lib/subscription').canAccessNewCase;
const mockGetUserUsageStats = require('@/lib/subscription').getUserUsageStats;

describe('API /api/subscription/check-access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar 401 si usuario no autenticado', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const { GET } = await import('@/app/api/subscription/check-access/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('debe retornar datos correctos para usuario FREE con acceso', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' });
    mockCanAccessNewCase.mockResolvedValue({
      canAccess: true,
      casesUsed: 8,
      caseLimit: 15,
      remaining: 7,
    });
    mockGetUserUsageStats.mockResolvedValue({
      planName: 'Gratuito',
      planType: 'FREE',
      isUnlimited: false,
      caseLimit: 15,
      casesUsed: 8,
      remaining: 7,
      percentage: 53,
      isPremium: false,
    });

    const { GET } = await import('@/app/api/subscription/check-access/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.canAccess).toBe(true);
    expect(data.casesUsed).toBe(8);
    expect(data.caseLimit).toBe(15);
    expect(data.remaining).toBe(7);
    expect(data.percentage).toBe(53);
    expect(data.planType).toBe('FREE');
  });

  it('debe retornar canAccess: false cuando límite alcanzado', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' });
    mockCanAccessNewCase.mockResolvedValue({
      canAccess: false,
      casesUsed: 15,
      caseLimit: 15,
      remaining: 0,
    });
    mockGetUserUsageStats.mockResolvedValue({
      planName: 'Gratuito',
      planType: 'FREE',
      isUnlimited: false,
      caseLimit: 15,
      casesUsed: 15,
      remaining: 0,
      percentage: 100,
      isPremium: false,
    });

    const { GET } = await import('@/app/api/subscription/check-access/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.canAccess).toBe(false);
    expect(data.percentage).toBe(100);
  });

  it('debe retornar datos correctos para usuario PREMIUM', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_premium_123' });
    mockCanAccessNewCase.mockResolvedValue({
      canAccess: true,
      casesUsed: 50,
      caseLimit: null,
      remaining: null,
    });
    mockGetUserUsageStats.mockResolvedValue({
      planName: 'Premium',
      planType: 'PREMIUM',
      isUnlimited: true,
      caseLimit: null,
      casesUsed: 50,
      remaining: null,
      percentage: 0,
      isPremium: true,
    });

    const { GET } = await import('@/app/api/subscription/check-access/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isUnlimited).toBe(true);
    expect(data.canAccess).toBe(true);
    expect(data.isPremium).toBe(true);
  });

  it('debe manejar errores internos correctamente', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' });
    mockCanAccessNewCase.mockRejectedValue(new Error('Database error'));

    const { GET } = await import('@/app/api/subscription/check-access/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Error checking access');
  });

  it('debe retornar estructura completa de datos', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' });
    mockCanAccessNewCase.mockResolvedValue({
      canAccess: true,
      casesUsed: 5,
      caseLimit: 15,
      remaining: 10,
    });
    mockGetUserUsageStats.mockResolvedValue({
      planName: 'Gratuito',
      planType: 'FREE',
      isUnlimited: false,
      caseLimit: 15,
      casesUsed: 5,
      remaining: 10,
      percentage: 33,
      isPremium: false,
    });

    const { GET } = await import('@/app/api/subscription/check-access/route');
    const response = await GET();
    const data = await response.json();

    // Verificar todas las propiedades esperadas
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('canAccess');
    expect(data).toHaveProperty('planName');
    expect(data).toHaveProperty('planType');
    expect(data).toHaveProperty('isUnlimited');
    expect(data).toHaveProperty('caseLimit');
    expect(data).toHaveProperty('casesUsed');
    expect(data).toHaveProperty('remaining');
    expect(data).toHaveProperty('percentage');
    expect(data).toHaveProperty('isPremium');
  });
});
