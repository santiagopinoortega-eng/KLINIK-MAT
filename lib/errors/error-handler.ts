// lib/errors/error-handler.ts
/**
 * Manejador global de errores para APIs
 * Convierte errores en respuestas HTTP apropiadas
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from './app-errors';
import { logger } from '../logger';

/**
 * Maneja errores de Zod (validación)
 */
function handleZodError(error: ZodError) {
  const errors = error.issues.map((err: any) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    },
    { status: 400 }
  );
}

/**
 * Maneja errores de Prisma
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  // P2002: Unique constraint violation
  if (error.code === 'P2002') {
    const field = (error.meta?.target as string[])?.join(', ') || 'field';
    return NextResponse.json(
      {
        error: `Duplicate value for ${field}`,
        code: 'DUPLICATE_ENTRY',
        details: error.meta,
      },
      { status: 409 }
    );
  }

  // P2025: Record not found
  if (error.code === 'P2025') {
    return NextResponse.json(
      {
        error: 'Record not found',
        code: 'NOT_FOUND',
      },
      { status: 404 }
    );
  }

  // P2003: Foreign key constraint failed
  if (error.code === 'P2003') {
    return NextResponse.json(
      {
        error: 'Related record not found',
        code: 'FOREIGN_KEY_CONSTRAINT',
        details: error.meta,
      },
      { status: 400 }
    );
  }

  // Error genérico de Prisma
  logger.error('Prisma error', { code: error.code, meta: error.meta });
  return NextResponse.json(
    {
      error: 'Database operation failed',
      code: 'DATABASE_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Manejador principal de errores
 */
export function handleApiError(error: unknown): NextResponse {
  // Log del error
  logger.error('API Error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    type: error?.constructor?.name,
  });

  // AppError (errores personalizados)
  if (error instanceof AppError) {
    const response = NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );

    // Agregar header Retry-After para rate limit
    if (error.statusCode === 429 && 'retryAfter' in error && error.retryAfter) {
      response.headers.set('Retry-After', String(error.retryAfter));
    }

    return response;
  }

  // ZodError (validación)
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  // Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'Invalid database query',
        code: 'INVALID_QUERY',
      },
      { status: 400 }
    );
  }

  // Error genérico de JavaScript
  if (error instanceof Error) {
    // No exponer detalles internos en producción
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      {
        error: isDev ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(isDev && { stack: error.stack }),
      },
      { status: 500 }
    );
  }

  // Error desconocido
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Wrapper para manejar errores en route handlers
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Crea un error de validación desde múltiples errores
 */
export function createValidationError(errors: Record<string, string>) {
  const details = Object.entries(errors).map(([field, message]) => ({
    field,
    message,
  }));

  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details,
    },
    { status: 400 }
  );
}
