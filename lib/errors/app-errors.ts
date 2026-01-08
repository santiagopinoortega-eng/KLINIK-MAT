// lib/errors/app-errors.ts
/**
 * Custom Error Classes para manejo unificado de errores
 * Proporciona tipos de errores específicos con códigos HTTP apropiados
 */

/**
 * Base Error Class para errores de aplicación
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Error 404: Recurso no encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string, details?: any) {
    super(
      `${resource} not found`,
      404,
      'NOT_FOUND',
      details
    );
  }
}

/**
 * Error 400: Validación fallida
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      400,
      'VALIDATION_ERROR',
      details
    );
  }
}

/**
 * Error 401: No autenticado
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Error 403: No autorizado (falta permisos)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden - Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Error 409: Conflicto (recurso ya existe)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * Error 429: Demasiadas peticiones
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Error 400: Bad Request genérico
 */
export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/**
 * Error 500: Error interno del servidor
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}

/**
 * Error 503: Servicio no disponible
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Error 402: Pago requerido (límite de plan alcanzado)
 */
export class PaymentRequiredError extends AppError {
  constructor(message: string = 'Payment required', details?: any) {
    super(message, 402, 'PAYMENT_REQUIRED', details);
  }
}

/**
 * Error de base de datos
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

/**
 * Error de servicio externo (Mercado Pago, Clerk, etc)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(
      `External service error: ${service} - ${message}`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      details
    );
  }
}
