// lib/ensure-user.ts
/**
 * Servicio centralizado para asegurar que usuarios autenticados existan en BD
 * CRÍTICO: Garantiza que TODOS los usuarios autenticados tengan registro en PostgreSQL
 * 
 * Casos de uso:
 * - Usuario nuevo que no ha sido sincronizado por webhook
 * - Webhook falló o tiene delay
 * - Usuario migrado de otro sistema
 * - Race conditions durante registro
 * 
 * Flujo:
 * 1. Usuario se autentica con Clerk
 * 2. Este servicio verifica si existe en BD
 * 3. Si NO existe, lo crea automáticamente con datos de Clerk
 * 4. El webhook eventualmente actualizará los datos completos
 */

import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

/**
 * Cache en memoria para reducir queries redundantes
 * Key: userId, Value: timestamp última verificación
 */
const userExistenceCache = new Map<string, number>();
const CACHE_TTL = 60000; // 1 minuto

/**
 * Asegura que el usuario existe en la base de datos
 * Si no existe, lo crea automáticamente con datos de Clerk
 * 
 * @param userId - ID del usuario de Clerk
 * @returns Usuario creado o existente
 * @throws Error si no se puede crear el usuario
 */
export async function ensureUserExists(userId: string) {
  // Cache check: evitar queries repetitivas en la misma sesión
  const cachedTime = userExistenceCache.get(userId);
  if (cachedTime && Date.now() - cachedTime < CACHE_TTL) {
    return; // Usuario verificado recientemente
  }

  try {
    // Verificar si usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (existingUser) {
      // Usuario existe, actualizar cache y retornar
      userExistenceCache.set(userId, Date.now());
      return existingUser;
    }

    // Usuario NO existe: crearlo automáticamente
    logger.warn('⚠️ Usuario autenticado no existe en BD, creándolo automáticamente', { userId });

    // Obtener datos del usuario desde Clerk
    let clerkUserData;
    try {
      const clerk = await clerkClient();
      clerkUserData = await clerk.users.getUser(userId);
    } catch (clerkError) {
      logger.error('❌ Error obteniendo datos de Clerk', { userId, error: clerkError });
      // Si Clerk falla, crear usuario con datos mínimos
      clerkUserData = null;
    }

    // Extraer email y nombre
    const email = clerkUserData?.emailAddresses?.[0]?.emailAddress || `temp_${userId}@klinikmat.cl`;
    const firstName = clerkUserData?.firstName || '';
    const lastName = clerkUserData?.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || null;

    // Crear usuario en BD
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        role: 'STUDENT', // Por defecto todos son estudiantes
        emailVerified: new Date(), // Clerk ya verificó el email
      },
    });

    logger.info('✅ Usuario creado automáticamente en BD', {
      userId,
      email,
      name,
      source: clerkUserData ? 'clerk_api' : 'fallback',
    });

    // Actualizar cache
    userExistenceCache.set(userId, Date.now());

    return newUser;
  } catch (error: any) {
    // Si es error de duplicado (P2002), es porque otro proceso ya lo creó
    // Esto puede pasar en race conditions
    if (error?.code === 'P2002') {
      logger.info('ℹ️ Usuario ya creado por otro proceso (race condition)', { userId });
      userExistenceCache.set(userId, Date.now());
      return;
    }

    // Error real: log y throw
    logger.error('❌ Error crítico creando usuario en BD', {
      userId,
      error: error?.message,
      code: error?.code,
      stack: error?.stack,
    });

    throw error;
  }
}

/**
 * Limpia el cache de existencia de usuarios
 * Útil para testing o cuando se necesita forzar revalidación
 */
export function clearUserExistenceCache() {
  userExistenceCache.clear();
  logger.info('🧹 Cache de existencia de usuarios limpiado');
}

/**
 * Obtiene stats del cache para monitoring
 */
export function getUserCacheStats() {
  return {
    size: userExistenceCache.size,
    entries: Array.from(userExistenceCache.entries()).map(([userId, timestamp]) => ({
      userId,
      lastChecked: new Date(timestamp).toISOString(),
      age: Date.now() - timestamp,
    })),
  };
}
