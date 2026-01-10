// lib/idempotency.ts
/**
 * Idempotency Protection for Payment Operations
 * 
 * Previene pagos duplicados causados por:
 * - Doble-click del usuario
 * - Network retries
 * - Race conditions
 * 
 * Implementación:
 * 1. Cliente genera/envía idempotency key
 * 2. Server verifica si ya procesó ese key
 * 3. Si existe, retorna respuesta guardada (sin re-procesar)
 * 4. Si no existe, procesa y guarda respuesta
 */

import { prisma } from './prisma';
import { logger } from './logger';

/**
 * Genera un idempotency key único basado en contexto
 */
export function generateIdempotencyKey(
  userId: string,
  operation: string,
  planId?: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  const parts = [operation, userId, planId, timestamp, random]
    .filter(Boolean)
    .join('_');
  
  return `IDEM_${parts}`;
}

/**
 * Verifica si una operación ya fue procesada
 * Retorna la respuesta guardada si existe
 */
export async function checkIdempotency(
  key: string,
  ttlSeconds = 86400 // 24 horas por defecto
): Promise<{
  exists: boolean;
  response?: any;
  createdAt?: Date;
}> {
  try {
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (!existing) {
      return { exists: false };
    }

    // Verificar si expiró
    if (existing.expiresAt && existing.expiresAt < new Date()) {
      logger.info('[IDEMPOTENCY] Key expired, will reprocess', { key });
      // Limpiar key expirado
      await prisma.idempotencyKey.delete({ where: { key } });
      return { exists: false };
    }

    logger.info('[IDEMPOTENCY] Key found, returning cached response', {
      key,
      createdAt: existing.createdAt,
    });

    return {
      exists: true,
      response: existing.response,
      createdAt: existing.createdAt,
    };
  } catch (error) {
    logger.error('[IDEMPOTENCY] Error checking key', { error, key });
    // En caso de error, permitir que proceda (mejor procesar que fallar)
    return { exists: false };
  }
}

/**
 * Guarda el resultado de una operación idempotente
 */
export async function saveIdempotencyResponse(
  key: string,
  response: any,
  ttlSeconds = 86400
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await prisma.idempotencyKey.create({
      data: {
        key,
        response: response as any, // Prisma Json type
        expiresAt,
      },
    });

    logger.info('[IDEMPOTENCY] Response saved', {
      key,
      expiresAt,
    });
  } catch (error) {
    // Si ya existe (race condition), no es problema
    if ((error as any).code === 'P2002') {
      logger.warn('[IDEMPOTENCY] Key already exists (race condition)', { key });
      return;
    }

    logger.error('[IDEMPOTENCY] Error saving response', { error, key });
    // No lanzar error, el pago ya se procesó exitosamente
  }
}

/**
 * Limpia idempotency keys expirados (ejecutar como cron job)
 */
export async function cleanExpiredIdempotencyKeys(): Promise<number> {
  try {
    const result = await prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info('[IDEMPOTENCY] Cleaned expired keys', {
      count: result.count,
    });

    return result.count;
  } catch (error) {
    logger.error('[IDEMPOTENCY] Error cleaning expired keys', { error });
    return 0;
  }
}

/**
 * Middleware para proteger endpoints con idempotency
 * 
 * @example
 * ```typescript
 * export const POST = compose(
 *   withAuth,
 *   withIdempotency, // ✅ Protege contra duplicados
 *   withValidation(CreatePaymentDto)
 * )(async (req, context) => {
 *   // ... lógica de pago
 * });
 * ```
 */
export function withIdempotency(
  ttlSeconds = 86400
): (handler: any) => any {
  return (handler: any) => async (req: Request, context: any, params?: any) => {
    // Obtener idempotency key del header
    const idempotencyKey = req.headers.get('idempotency-key');

    if (!idempotencyKey) {
      logger.warn('[IDEMPOTENCY] No key provided, processing without protection', {
        userId: context.userId,
        path: new URL(req.url).pathname,
      });
      // Continuar sin protección (opcional: podrías requerir el key)
      return handler(req, context, params);
    }

    // Verificar si ya fue procesado
    const { exists, response, createdAt } = await checkIdempotency(
      idempotencyKey,
      ttlSeconds
    );

    if (exists) {
      logger.info('[IDEMPOTENCY] Returning cached response', {
        userId: context.userId,
        key: idempotencyKey,
        ageSeconds: createdAt ? Math.floor((Date.now() - createdAt.getTime()) / 1000) : 'unknown',
      });

      // Retornar respuesta guardada
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotent-Replay': 'true',
          'X-Original-Request-Time': createdAt?.toISOString() || '',
        },
      });
    }

    // Procesar request normalmente
    const result = await handler(req, context, params);

    // Guardar respuesta para futuros requests
    const responseData = await result.clone().json();
    await saveIdempotencyResponse(idempotencyKey, responseData, ttlSeconds);

    return result;
  };
}
