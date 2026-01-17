// lib/middleware/api-middleware.ts
/**
 * Middleware composable para route handlers
 * Proporciona autenticación, validación, rate limiting, y error handling
 */

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ZodSchema } from 'zod';
import { checkRateLimit, type RateLimitConfig } from '../ratelimit';
import { handleApiError } from '../errors/error-handler';
import { UnauthorizedError, RateLimitError, ValidationError } from '../errors/app-errors';
import { logger } from '../logger';

/**
 * Context compartido entre middlewares
 */
export type ApiContext = {
  userId?: string;
  body?: any;
  params?: any;
  searchParams?: URLSearchParams;
  [key: string]: any;
};

/**
 * Handler type para route handlers
 * Soporta params opcionales para rutas dinámicas (ej: /api/cases/[id])
 */
export type ApiHandler = (
  req: NextRequest,
  context: ApiContext,
  params?: any
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware: Autenticación requerida
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req, context, params) => {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        throw new UnauthorizedError('Authentication required');
      }

      // Agregar userId al contexto
      context.userId = userId;
      
      return await handler(req, context, params);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Middleware: Rate limiting
 */
export function withRateLimit(
  config: RateLimitConfig
): (handler: ApiHandler) => ApiHandler {
  return (handler) => async (req, context, params) => {
    try {
      const result = checkRateLimit(req, config);
      
      if (!result.ok) {
        const resetDate = new Date(result.resetAt);
        const secondsUntilReset = Math.ceil((result.resetAt - Date.now()) / 1000);
        
        throw new RateLimitError(
          'Too many requests. Please try again later.',
          secondsUntilReset
        );
      }

      // Agregar info de rate limit a headers de respuesta
      const response = await handler(req, context, params);
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(result.resetAt));
      
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Middleware: Validación de body con Zod
 */
export function withValidation<T extends ZodSchema>(
  schema: T
): (handler: ApiHandler) => ApiHandler {
  return (handler) => async (req, context, params) => {
    try {
      const body = await req.json();
      
      // Log detallado del body recibido
      console.log('🔍 [Validation] Body received:', JSON.stringify(body, null, 2));
      
      // Validar con Zod
      const validated = schema.parse(body);
      
      console.log('✅ [Validation] Body validated successfully');
      
      // Agregar datos validados al contexto
      context.body = validated;
      
      return await handler(req, context, params);
    } catch (error) {
      console.error('❌ [Validation] Error:', error);
      return handleApiError(error);
    }
  };
}

/**
 * Middleware: Validación de query params con Zod
 */
export function withQueryValidation<T extends ZodSchema>(
  schema: T
): (handler: ApiHandler) => ApiHandler {
  return (handler) => async (req, context, params) => {
    try {
      const searchParams = new URL(req.url).searchParams;
      const queryObj: any = Object.fromEntries(searchParams.entries());
      
      // Convertir strings numéricos a números
      Object.keys(queryObj).forEach(key => {
        const value = queryObj[key];
        if (!isNaN(Number(value)) && value !== '') {
          queryObj[key] = Number(value);
        }
      });
      
      // Validar con Zod
      const validated = schema.parse(queryObj);
      
      // Agregar datos validados al contexto
      context.query = validated;
      context.searchParams = searchParams;
      
      return await handler(req, context, params);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Middleware: Logging de requests
 */
export function withLogging(handler: ApiHandler): ApiHandler {
  return async (req, context, params) => {
    const startTime = Date.now();
    const method = req.method;
    const url = new URL(req.url);
    
    logger.info('API Request', {
      method,
      path: url.pathname,
      userId: context.userId,
    });

    try {
      const response = await handler(req, context, params);
      const duration = Date.now() - startTime;
      
      logger.info('API Response', {
        method,
        path: url.pathname,
        status: response.status,
        duration: `${duration}ms`,
        userId: context.userId,
      });

      // Agregar header de timing
      response.headers.set('X-Response-Time', `${duration}ms`);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('API Error', {
        method,
        path: url.pathname,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: context.userId,
      });

      throw error;
    }
  };
}

/**
 * Middleware: CORS headers
 */
export function withCORS(
  options: {
    origin?: string | string[];
    methods?: string[];
    credentials?: boolean;
  } = {}
): (handler: ApiHandler) => ApiHandler {
  return (handler) => async (req, context, params) => {
    const response = await handler(req, context, params);
    
    // Configurar CORS headers
    const origin = Array.isArray(options.origin)
      ? options.origin.join(', ')
      : options.origin || '*';
    
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set(
      'Access-Control-Allow-Methods',
      (options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']).join(', ')
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    
    if (options.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  };
}

/**
 * Middleware: Verificar permisos de rol
 */
export function withRole(
  allowedRoles: string[]
): (handler: ApiHandler) => ApiHandler {
  return (handler) => async (req, context, params) => {
    if (!context.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Obtener rol del usuario (requiere UserService)
    const { UserService } = await import('@/services/user.service');
    const user = await UserService.getUserProfile(context.userId);
    
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ValidationError('Insufficient permissions');
    }

    context.userRole = user.role;
    
    return await handler(req, context, params);
  };
}

/**
 * Composer de middlewares
 * Permite encadenar múltiples middlewares fácilmente
 */
export function compose(...middlewares: ((handler: ApiHandler) => ApiHandler)[]) {
  return (handler: ApiHandler): ApiHandler => {
    return middlewares.reduceRight(
      (wrappedHandler, middleware) => middleware(wrappedHandler),
      handler
    );
  };
}
