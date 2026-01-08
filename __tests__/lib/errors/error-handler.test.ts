// __tests__/lib/errors/error-handler.test.ts
import { handleApiError } from '@/lib/errors/error-handler';
import { 
  AppError, 
  NotFoundError, 
  ValidationError, 
  UnauthorizedError,
  ForbiddenError,
  RateLimitError 
} from '@/lib/errors/app-errors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AppError handling', () => {
    it('should handle NotFoundError', async () => {
      const error = new NotFoundError('User');
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'User not found',
        code: 'NOT_FOUND',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle ValidationError', async () => {
      const error = new ValidationError('Invalid email format');
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    });

    it('should handle UnauthorizedError', async () => {
      const error = new UnauthorizedError();
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    });

    it('should handle ForbiddenError', async () => {
      const error = new ForbiddenError('Admin access required');
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: 'Admin access required',
        code: 'FORBIDDEN',
      });
    });

    it('should handle RateLimitError', async () => {
      const error = new RateLimitError('Too many requests', 60);
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data).toEqual({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      expect(response.headers.get('Retry-After')).toBe('60');
    });

    it('should include details when provided', async () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_ERROR', {
        field: 'email',
        reason: 'already exists',
      });
      const response = handleApiError(error);
      const data = await response.json();

      expect(data).toEqual({
        error: 'Custom error',
        code: 'CUSTOM_ERROR',
        details: {
          field: 'email',
          reason: 'already exists',
        },
      });
    });
  });

  describe('ZodError handling', () => {
    it('should handle Zod validation errors', async () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
        },
        {
          code: 'too_small',
          minimum: 8,
          type: 'string',
          inclusive: true,
          exact: false,
          path: ['password'],
          message: 'String must contain at least 8 character(s)',
        },
      ]);

      const response = handleApiError(zodError);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: [
          {
            field: 'email',
            message: 'Expected string, received number',
          },
          {
            field: 'password',
            message: 'String must contain at least 8 character(s)',
          },
        ],
      });
    });

    it('should handle nested path validation errors', async () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['user', 'profile', 'name'],
          message: 'Required',
        },
      ]);

      const response = handleApiError(zodError);
      const data = await response.json();

      expect(data.details[0]).toEqual({
        field: 'user.profile.name',
        message: 'Required',
      });
    });
  });

  describe('Prisma error handling', () => {
    it('should handle P2002 - Unique constraint violation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '6.19.0',
          meta: { target: ['email'] },
        }
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({
        error: 'Duplicate value for email',
        code: 'DUPLICATE_ENTRY',
        details: { target: ['email'] },
      });
    });

    it('should handle P2002 with multiple fields', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '6.19.0',
          meta: { target: ['userId', 'caseId'] },
        }
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(data.error).toBe('Duplicate value for userId, caseId');
    });

    it('should handle P2025 - Record not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '6.19.0',
          meta: {},
        }
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'Record not found',
        code: 'NOT_FOUND',
      });
    });

    it('should handle P2003 - Foreign key constraint', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '6.19.0',
          meta: { field_name: 'userId' },
        }
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Related record not found',
        code: 'FOREIGN_KEY_CONSTRAINT',
        details: { field_name: 'userId' },
      });
    });

    it('should handle unknown Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unknown error',
        {
          code: 'P9999',
          clientVersion: '6.19.0',
          meta: {},
        }
      );

      const response = handleApiError(prismaError);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Database operation failed',
        code: 'DATABASE_ERROR',
      });
      expect(logger.error).toHaveBeenCalledWith('Prisma error', {
        code: 'P9999',
        meta: {},
      });
    });
  });

  describe('Generic error handling', () => {
    it('should handle standard Error objects', async () => {
      const error = new Error('Something went wrong');
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle unknown error types', async () => {
      const error = { weird: 'object' };
      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      });
    });

    it('should handle null/undefined errors', async () => {
      const response = handleApiError(null);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      });
    });

    it('should log error stack traces', async () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      handleApiError(error);

      expect(logger.error).toHaveBeenCalledWith('API Error', {
        error: 'Test error',
        stack: expect.stringContaining('Error: Test error'),
        type: 'Error',
      });
    });
  });

  describe('Error metadata logging', () => {
    it('should log error constructor name', async () => {
      const error = new ValidationError('Invalid input');
      handleApiError(error);

      expect(logger.error).toHaveBeenCalledWith('API Error', {
        error: 'Invalid input',
        stack: expect.any(String),
        type: 'ValidationError',
      });
    });

    it('should handle errors without constructor', async () => {
      const error = Object.create(null);
      error.message = 'Weird error';
      
      handleApiError(error);

      expect(logger.error).toHaveBeenCalledWith('API Error', {
        error: 'Unknown error',
        stack: undefined,
        type: undefined,
      });
    });
  });
});
