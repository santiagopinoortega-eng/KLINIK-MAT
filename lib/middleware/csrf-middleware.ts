// lib/middleware/csrf-middleware.ts
/**
 * CSRF Protection Middleware for Payment Endpoints
 * 
 * Implements Double Submit Cookie pattern:
 * 1. Cliente obtiene token de /api/csrf
 * 2. Cliente envía token en header x-csrf-token
 * 3. Server valida que cookie y header coincidan
 * 
 * USAR SOLO EN ENDPOINTS QUE MODIFICAN DATOS (POST/PUT/DELETE)
 */

import { validateCsrfToken } from '../csrf';
import { UnauthorizedError } from '../errors/app-errors';
import { logger } from '../logger';
import type { ApiHandler } from './api-middleware';

/**
 * Middleware para validar token CSRF
 * Protege contra ataques Cross-Site Request Forgery
 * 
 * @example
 * ```typescript
 * export const POST = compose(
 *   withAuth,
 *   withCSRF,  // ✅ Agrega protección CSRF
 *   withValidation(CreatePaymentDto)
 * )(async (req, context) => {
 *   // ... lógica protegida
 * });
 * ```
 */
export function withCSRF(handler: ApiHandler): ApiHandler {
  return async (req, context, params) => {
    const method = req.method.toUpperCase();
    
    // Solo validar en métodos mutantes
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return handler(req, context, params);
    }

    try {
      const isValid = await validateCsrfToken(req);

      if (!isValid) {
        logger.warn('[CSRF] Token validation failed', {
          userId: context.userId,
          method,
          path: new URL(req.url).pathname,
        });
        
        throw new UnauthorizedError('Invalid or missing CSRF token');
      }

      logger.debug('[CSRF] Token validated successfully', {
        userId: context.userId,
      });

      return handler(req, context, params);
    } catch (error) {
      // Si es error de validación, propagarlo
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      // Otros errores (ej: problemas leyendo cookies)
      logger.error('[CSRF] Validation error', { error });
      throw new UnauthorizedError('CSRF validation failed');
    }
  };
}

/**
 * Middleware para CSRF en operaciones críticas (pagos, cambios de plan)
 * Similar a withCSRF pero con logging más detallado
 */
export function withStrictCSRF(handler: ApiHandler): ApiHandler {
  return async (req, context, params) => {
    const method = req.method.toUpperCase();
    const url = new URL(req.url);
    
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return handler(req, context, params);
    }

    const startTime = Date.now();
    
    try {
      const isValid = await validateCsrfToken(req);

      if (!isValid) {
        logger.error('[CSRF STRICT] Validation FAILED - Possible attack', {
          userId: context.userId,
          method,
          path: url.pathname,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          userAgent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        });
        
        // En operaciones críticas, registrar en auditoría
        // TODO: Agregar a tabla de security_events
        
        throw new UnauthorizedError('CSRF token validation failed');
      }

      const duration = Date.now() - startTime;
      logger.info('[CSRF STRICT] Validation passed', {
        userId: context.userId,
        duration: `${duration}ms`,
      });

      return handler(req, context, params);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      logger.error('[CSRF STRICT] Unexpected error', { error });
      throw new UnauthorizedError('Security validation failed');
    }
  };
}
