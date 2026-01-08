// __tests__/lib/errors/app-errors.test.ts
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  InternalServerError,
  ServiceUnavailableError,
  PaymentRequiredError,
  DatabaseError,
  ExternalServiceError,
} from '@/lib/errors/app-errors';

describe('App Errors', () => {
  describe('AppError', () => {
    it('debería crear error base correctamente', () => {
      const error = new AppError('Test error', 500, 'TEST_ERROR', { detail: 'test' });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('AppError');
    });

    it('debería serializar a JSON correctamente', () => {
      const error = new AppError('Test error', 400, 'TEST');

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'AppError',
        message: 'Test error',
        code: 'TEST',
        statusCode: 400,
        details: undefined,
      });
    });
  });

  describe('NotFoundError', () => {
    it('debería crear error 404', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('debería incluir detalles opcionales', () => {
      const error = new NotFoundError('Case', { id: 'case-123' });

      expect(error.details).toEqual({ id: 'case-123' });
    });
  });

  describe('ValidationError', () => {
    it('debería crear error de validación', () => {
      const error = new ValidationError('Invalid email format');

      expect(error.message).toBe('Invalid email format');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('debería incluir detalles de validación', () => {
      const details = [
        { field: 'email', message: 'Invalid format' },
        { field: 'name', message: 'Too short' },
      ];

      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('UnauthorizedError', () => {
    it('debería crear error 401 con mensaje por defecto', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('debería aceptar mensaje personalizado', () => {
      const error = new UnauthorizedError('Token expired');

      expect(error.message).toBe('Token expired');
    });
  });

  describe('ForbiddenError', () => {
    it('debería crear error 403', () => {
      const error = new ForbiddenError();

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toContain('Insufficient permissions');
    });

    it('debería aceptar mensaje personalizado', () => {
      const error = new ForbiddenError('Admin access required');

      expect(error.message).toBe('Admin access required');
    });
  });

  describe('ConflictError', () => {
    it('debería crear error 409', () => {
      const error = new ConflictError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('RateLimitError', () => {
    it('debería crear error 429 con mensaje por defecto', () => {
      const error = new RateLimitError();

      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('debería incluir retryAfter', () => {
      const error = new RateLimitError('Rate limit exceeded', 60);

      expect(error.retryAfter).toBe(60);
    });
  });

  describe('BadRequestError', () => {
    it('debería crear error 400', () => {
      const error = new BadRequestError('Invalid request format');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });
  });

  describe('InternalServerError', () => {
    it('debería crear error 500 con mensaje por defecto', () => {
      const error = new InternalServerError();

      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('debería aceptar mensaje y detalles personalizados', () => {
      const error = new InternalServerError('Database connection failed', {
        host: 'localhost',
      });

      expect(error.message).toBe('Database connection failed');
      expect(error.details).toEqual({ host: 'localhost' });
    });
  });

  describe('ServiceUnavailableError', () => {
    it('debería crear error 503', () => {
      const error = new ServiceUnavailableError();

      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('PaymentRequiredError', () => {
    it('debería crear error 402', () => {
      const error = new PaymentRequiredError();

      expect(error.message).toBe('Payment required');
      expect(error.statusCode).toBe(402);
      expect(error.code).toBe('PAYMENT_REQUIRED');
    });

    it('debería incluir detalles de límite', () => {
      const error = new PaymentRequiredError('Plan limit reached', {
        limit: 100,
        current: 100,
      });

      expect(error.details).toEqual({ limit: 100, current: 100 });
    });
  });

  describe('DatabaseError', () => {
    it('debería crear error de base de datos', () => {
      const error = new DatabaseError('Connection timeout');

      expect(error.message).toBe('Connection timeout');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('ExternalServiceError', () => {
    it('debería crear error de servicio externo', () => {
      const error = new ExternalServiceError(
        'Mercado Pago',
        'Payment gateway timeout'
      );

      expect(error.message).toContain('Mercado Pago');
      expect(error.message).toContain('Payment gateway timeout');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });

    it('debería incluir detalles del servicio', () => {
      const error = new ExternalServiceError(
        'Clerk',
        'Auth service down',
        { endpoint: '/api/users' }
      );

      expect(error.details).toEqual({ endpoint: '/api/users' });
    });
  });
});
