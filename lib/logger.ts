// lib/logger.ts
import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

/**
 * Logger estructurado que envía eventos a Sentry y console
 */
export const logger = {
  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  },

  /**
   * Log informativo
   */
  info: (message: string, context?: LogContext) => {
    console.info(`[INFO] ${message}`, context);
    
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureMessage(message, {
        level: 'info',
        extra: context,
      });
    }
  },

  /**
   * Log de advertencia
   */
  warn: (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context);
    
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  },

  /**
   * Log de error - Siempre envía a Sentry
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, error, context);
    
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: {
            message,
            ...context,
          },
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: {
            error,
            ...context,
          },
        });
      }
    }
  },

  /**
   * Setear contexto de usuario para tracking
   */
  setUser: (userId: string | null, email?: string, name?: string) => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      if (userId) {
        Sentry.setUser({
          id: userId,
          email,
          username: name,
        });
      } else {
        Sentry.setUser(null);
      }
    }
  },

  /**
   * Agregar contexto global (breadcrumb)
   */
  addBreadcrumb: (message: string, category: string, data?: LogContext) => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }
  },
};

/**
 * Mensajes de error user-friendly
 */
export const ErrorMessages = {
  // Auth
  UNAUTHORIZED: 'Debes iniciar sesión para continuar.',
  SESSION_EXPIRED: 'Tu sesión expiró. Por favor inicia sesión nuevamente.',
  
  // Casos
  CASE_NOT_FOUND: 'Este caso no existe o fue eliminado.',
  CASE_LOAD_FAILED: 'No pudimos cargar el caso. Por favor recarga la página.',
  
  // Resultados
  SAVE_RESULT_FAILED: 'No pudimos guardar tu resultado. Verifica tu conexión e intenta nuevamente.',
  LOAD_RESULTS_FAILED: 'No pudimos cargar tus resultados. Por favor intenta de nuevo.',
  
  // Perfil
  PROFILE_LOAD_FAILED: 'No pudimos cargar tu perfil. Por favor intenta de nuevo.',
  PROFILE_UPDATE_FAILED: 'No pudimos actualizar tu perfil. Por favor intenta de nuevo.',
  
  // Network
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado. Por favor intenta de nuevo.',
  
  // Rate limiting
  RATE_LIMIT: 'Demasiados intentos. Espera un momento antes de intentar nuevamente.',
  
  // Generic
  GENERIC_ERROR: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
  SERVER_ERROR: 'Error del servidor. Nuestro equipo fue notificado.',
};

/**
 * Helper para logging de API errors
 */
export function logApiError(
  endpoint: string,
  error: unknown,
  context?: LogContext
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(
    `API Error: ${endpoint}`,
    error instanceof Error ? error : undefined,
    {
      endpoint,
      errorMessage,
      errorStack,
      ...context,
    }
  );
}
