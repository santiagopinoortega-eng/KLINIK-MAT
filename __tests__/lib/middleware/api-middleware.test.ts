// __tests__/lib/middleware/api-middleware.test.ts
import {
  withAuth,
  withRateLimit,
  withValidation,
  withQueryValidation,
  withLogging,
  withCORS,
  compose,
} from '@/lib/middleware/api-middleware';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { UnauthorizedError, RateLimitError, ValidationError } from '@/lib/errors/app-errors';

// Mock dependencies
jest.mock('@/lib/ratelimit');
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

describe('API Middleware', () => {
  let mockHandler: jest.Mock;
  let mockRequest: any;
  let mockContext: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    mockContext = {};
    mockRequest = {
      url: 'http://localhost:3000/api/test',
      method: 'GET',
      headers: new Map(),
      json: jest.fn().mockResolvedValue({ data: 'test' }),
    };
  });

  describe('withAuth', () => {
    it('should pass userId to handler when authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user-123' });

      const wrapped = withAuth(mockHandler);
      await wrapped(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        userId: 'user-123',
      }, undefined);
    });

    it('should return 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const wrapped = withAuth(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.code).toBe('UNAUTHORIZED');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle auth errors gracefully', async () => {
      (auth as jest.Mock).mockRejectedValue(new Error('Auth service down'));

      const wrapped = withAuth(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);
      
      expect(response.status).toBe(500);
    });
  });

  describe('withRateLimit', () => {
    const mockRateLimitConfig = {
      max: 10,
      window: '1m',
    };

    it('should allow request when under rate limit', async () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        ok: true,
        remaining: 5,
        resetAt: Date.now() + 60000,
      });

      const wrapped = withRateLimit(mockRateLimitConfig)(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('5');
    });

    it('should return 429 when limit exceeded', async () => {
      const resetAt = Date.now() + 60000;
      (checkRateLimit as jest.Mock).mockReturnValue({
        ok: false,
        remaining: 0,
        resetAt,
      });

      const wrapped = withRateLimit(mockRateLimitConfig)(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.headers.get('Retry-After')).toBeTruthy();
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should set rate limit headers', async () => {
      const resetAt = Date.now() + 30000;
      (checkRateLimit as jest.Mock).mockReturnValue({
        ok: true,
        remaining: 3,
        resetAt,
      });

      const wrapped = withRateLimit(mockRateLimitConfig)(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);

      expect(response.headers.get('X-RateLimit-Remaining')).toBe('3');
      expect(response.headers.get('X-RateLimit-Reset')).toBe(String(resetAt));
    });

    it('should calculate seconds until reset for error', async () => {
      const resetAt = Date.now() + 45000; // 45 seconds
      (checkRateLimit as jest.Mock).mockReturnValue({
        ok: false,
        remaining: 0,
        resetAt,
      });

      const wrapped = withRateLimit(mockRateLimitConfig)(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);
      const retryAfter = response.headers.get('Retry-After');

      expect(response.status).toBe(429);
      expect(retryAfter).toBeTruthy();
      const seconds = parseInt(retryAfter!, 10);
      expect(seconds).toBeGreaterThan(40);
      expect(seconds).toBeLessThanOrEqual(46);
    });
  });

  describe('withValidation', () => {
    const TestSchema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    });

    it('should validate and pass body to handler', async () => {
      const validData = { name: 'John', age: 30 };
      mockRequest.json.mockResolvedValue(validData);

      const wrapped = withValidation(TestSchema)(mockHandler);
      await wrapped(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        body: validData,
      }, undefined);
    });

    it('should return 400 for invalid data', async () => {
      mockRequest.json.mockResolvedValue({ name: '', age: -5 });

      const wrapped = withValidation(TestSchema)(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should transform data during validation', async () => {
      const TransformSchema = z.object({
        value: z.string().transform(val => val.toUpperCase()),
      });

      mockRequest.json.mockResolvedValue({ value: 'hello' });

      const wrapped = withValidation(TransformSchema)(mockHandler);
      await wrapped(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        body: { value: 'HELLO' },
      }, undefined);
    });

    it('should handle JSON parse errors', async () => {
      mockRequest.json.mockRejectedValue(new Error('Invalid JSON'));

      const wrapped = withValidation(TestSchema)(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);

      expect(response.status).toBe(500);
    });
  });

  describe('withQueryValidation', () => {
    const QuerySchema = z.object({
      page: z.number().positive(),
      limit: z.number().max(100),
      search: z.string().optional(),
    });

    it('should validate query parameters', async () => {
      mockRequest.url = 'http://localhost:3000/api/test?page=1&limit=20&search=test';

      const wrapped = withQueryValidation(QuerySchema)(mockHandler);
      await wrapped(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        query: { page: 1, limit: 20, search: 'test' },
        searchParams: expect.any(URLSearchParams),
      }, undefined);
    });

    it('should convert string numbers to numbers', async () => {
      mockRequest.url = 'http://localhost:3000/api/test?page=5&limit=50';

      const wrapped = withQueryValidation(QuerySchema)(mockHandler);
      await wrapped(mockRequest, mockContext);

      const callArgs = mockHandler.mock.calls[0][1];
      expect(typeof callArgs.query.page).toBe('number');
      expect(typeof callArgs.query.limit).toBe('number');
    });

    it('should handle missing optional parameters', async () => {
      mockRequest.url = 'http://localhost:3000/api/test?page=1&limit=10';

      const wrapped = withQueryValidation(QuerySchema)(mockHandler);
      await wrapped(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        query: { page: 1, limit: 10 },
        searchParams: expect.any(URLSearchParams),
      }, undefined);
    });

    it('should return 400 for invalid query params', async () => {
      mockRequest.url = 'http://localhost:3000/api/test?page=-1&limit=200';

      const wrapped = withQueryValidation(QuerySchema)(mockHandler);
      const response = await wrapped(mockRequest, mockContext, undefined);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should not convert non-numeric strings', async () => {
      const MixedSchema = z.object({
        id: z.string(),
        count: z.number(),
      });

      mockRequest.url = 'http://localhost:3000/api/test?id=abc123&count=5';

      const wrapped = withQueryValidation(MixedSchema)(mockHandler);
      await wrapped(mockRequest, mockContext);

      const callArgs = mockHandler.mock.calls[0][1];
      expect(callArgs.query.id).toBe('abc123');
      expect(callArgs.query.count).toBe(5);
    });
  });

  describe('withLogging', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should log request and response', async () => {
      mockContext.userId = 'user-123';

      const wrapped = withLogging(mockHandler);
      await wrapped(mockRequest, mockContext);

      expect(logger.info).toHaveBeenCalledWith('API Request', {
        method: 'GET',
        path: '/api/test',
        userId: 'user-123',
      });

      expect(logger.info).toHaveBeenCalledWith('API Response', {
        method: 'GET',
        path: '/api/test',
        status: 200,
        duration: expect.stringMatching(/\d+ms/),
        userId: 'user-123',
      });
    });

    it('should add response time header', async () => {
      const wrapped = withLogging(mockHandler);
      const response = await wrapped(mockRequest, mockContext);

      expect(response.headers.get('X-Response-Time')).toMatch(/\d+ms/);
    });

    it('should log errors', async () => {
      const error = new Error('Handler error');
      mockHandler.mockRejectedValue(error);

      const wrapped = withLogging(mockHandler);

      await expect(wrapped(mockRequest, mockContext)).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith('API Error', {
        method: 'GET',
        path: '/api/test',
        duration: expect.stringMatching(/\d+ms/),
        error: 'Handler error',
        userId: undefined,
      });
    });

    it('should log without userId when not authenticated', async () => {
      const wrapped = withLogging(mockHandler);
      await wrapped(mockRequest, mockContext);

      expect(logger.info).toHaveBeenCalledWith('API Request', {
        method: 'GET',
        path: '/api/test',
        userId: undefined,
      });
    });
  });

  describe('withCORS', () => {
    it('should set default CORS headers', async () => {
      const wrapped = withCORS()(mockHandler);
      const response = await wrapped(mockRequest, mockContext);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    });

    it('should set custom origin', async () => {
      const wrapped = withCORS({ origin: 'https://example.com' })(mockHandler);
      const response = await wrapped(mockRequest, mockContext);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
    });

    it('should set multiple origins', async () => {
      const wrapped = withCORS({
        origin: ['https://example.com', 'https://another.com'],
      })(mockHandler);
      const response = await wrapped(mockRequest, mockContext);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://example.com, https://another.com'
      );
    });

    it('should set custom methods', async () => {
      const wrapped = withCORS({ methods: ['GET', 'POST'] })(mockHandler);
      const response = await wrapped(mockRequest, mockContext);

      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST');
    });

    it('should set credentials when enabled', async () => {
      const wrapped = withCORS({ credentials: true })(mockHandler);
      const response = await wrapped(mockRequest, mockContext);

      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('should not set credentials when disabled', async () => {
      const wrapped = withCORS({ credentials: false })(mockHandler);
      const response = await wrapped(mockRequest, mockContext);

      expect(response.headers.has('Access-Control-Allow-Credentials')).toBe(false);
    });
  });

  describe('compose', () => {
    it('should compose multiple middlewares in order', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user-123' });
      (checkRateLimit as jest.Mock).mockReturnValue({
        ok: true,
        remaining: 5,
        resetAt: Date.now(),
      });

      const TestSchema = z.object({ name: z.string() });
      mockRequest.json.mockResolvedValue({ name: 'Test' });

      const composed = compose(
        withAuth,
        withRateLimit({ max: 10, window: '1m' }),
        withValidation(TestSchema),
        withLogging
      )(mockHandler);

      await composed(mockRequest, mockContext, undefined);

      // Verify handler received all context
      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        userId: 'user-123',
        body: { name: 'Test' },
      }, undefined);
    });

    it('should stop execution when middleware returns error response', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const composed = compose(
        withAuth,
        withLogging
      )(mockHandler);

      const response = await composed(mockRequest, mockContext, undefined);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.code).toBe('UNAUTHORIZED');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should work with empty compose', async () => {
      const composed = compose()(mockHandler);
      await composed(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should handle single middleware', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user-123' });

      const composed = compose(withAuth)(mockHandler);
      await composed(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, { userId: 'user-123' }, undefined);
    });

    it('should preserve context through composition', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user-123' });
      mockRequest.json.mockResolvedValue({ data: 'test' });

      const Schema = z.object({ data: z.string() });
      mockContext.customField = 'preserved';

      const composed = compose(
        withAuth,
        withValidation(Schema)
      )(mockHandler);

      await composed(mockRequest, mockContext, undefined);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        userId: 'user-123',
        body: { data: 'test' },
        customField: 'preserved',
      }, undefined);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full middleware stack', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: 'user-123' });
      (checkRateLimit as jest.Mock).mockReturnValue({
        ok: true,
        remaining: 8,
        resetAt: Date.now() + 60000,
      });

      const Schema = z.object({
        title: z.string().min(1),
        content: z.string(),
      });

      mockRequest.json.mockResolvedValue({
        title: 'Test Post',
        content: 'Content here',
      });

      const fullStack = compose(
        withAuth,
        withRateLimit({ max: 10, window: '1m' }),
        withValidation(Schema),
        withCORS({ origin: 'https://example.com' }),
        withLogging
      )(mockHandler);

      const response = await fullStack(mockRequest, mockContext);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('8');
      expect(response.headers.get('X-Response-Time')).toMatch(/\d+ms/);
    });
  });
});
