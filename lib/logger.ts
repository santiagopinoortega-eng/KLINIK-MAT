// lib/logger.ts
/**
 * Sistema de logging estructurado para KLINIK-MAT
 * 
 * FILOSOFÍA: Proyecto de fundador solo = logging eficiente
 * - Desarrollo: console colorizado
 * - Producción: Sentry automático (ya instalado)
 * - $0 de costo extra
 */
import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Logger estructurado que envía eventos a Sentry y console
 */
export const logger = {
  /**
   * 🔵 DEBUG: Solo en desarrollo
   */
  debug: (message: string, context?: LogContext) => {
    if (isDev && !isTest) {
      console.log(`🔵 [DEBUG] ${message}`, context || '');
    }
  },

  /**
   * ✅ INFO: Eventos normales (breadcrumb en prod)
   */
  info: (message: string, context?: LogContext) => {
    if (isTest) return;
    
    if (isDev) {
      console.log(`✅ [INFO] ${message}`, context || '');
    } else if (isProd) {
      // Solo breadcrumb, no envía evento a Sentry
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: context,
      });
    }
  },

  /**
   * ⚠️ WARN: Situaciones inusuales (envía a Sentry)
   */
  warn: (message: string, context?: LogContext) => {
    if (isTest) return;
    
    if (isDev) {
      console.warn(`⚠️ [WARN] ${message}`, context || '');
    } else if (isProd) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  },

  /**
   * 🔴 ERROR: Siempre envía a Sentry en producción
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    if (isTest) return;
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    if (isDev) {
      console.error(`🔴 [ERROR] ${message}`, errorObj, context || '');
    } else if (isProd) {
      Sentry.captureException(errorObj, {
        extra: {
          message,
          ...context,
        },
      });
    }
  },

  /**
   * 💰 PAYMENT: Eventos de pagos (siempre logguear)
   */
  payment: (
    event: 'created' | 'approved' | 'rejected' | 'refunded',
    data: {
      userId: string;
      planId?: string;
      amount?: number;
      paymentId?: string;
      reason?: string;
    }
  ) => {
    if (isTest) return;
    
    const message = `Payment ${event}: User ${data.userId}`;
    
    if (isDev) {
      console.log(`💰 [PAYMENT] ${message}`, data);
    } else if (isProd) {
      Sentry.captureMessage(message, {
        level: 'info',
        tags: { event_type: 'payment', payment_event: event },
        extra: data,
      });
    }
  },

  /**
   * 🔐 AUTH: Eventos de autenticación
   */
  auth: (
    event: 'login' | 'logout' | 'signup' | 'failed',
    data: {
      userId?: string;
      email?: string;
      reason?: string;
    }
  ) => {
    if (isTest) return;
    
    const message = `Auth ${event}${data.email ? `: ${data.email}` : ''}`;
    
    if (isDev) {
      console.log(`🔐 [AUTH] ${message}`, data);
    } else if (isProd) {
      Sentry.addBreadcrumb({
        category: 'auth',
        message,
        level: event === 'failed' ? 'warning' : 'info',
        data,
      });
    }
  },

  /**
   * Setear contexto de usuario para tracking
   */
  setUser: (userId: string | null, email?: string, name?: string) => {
    if (isProd) {
      Sentry.setUser(userId ? { id: userId, email, username: name } : null);
    }
  },

  /**
   * Agregar contexto global (breadcrumb)
   */
  addBreadcrumb: (message: string, category: string, data?: LogContext) => {
    if (isProd) {
      Sentry.addBreadcrumb({ message, category, data, level: 'info' });
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
