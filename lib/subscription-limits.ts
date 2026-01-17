/**
 * Sistema de límites de suscripción
 * Verifica límites de uso para planes FREE y pagos
 */

import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  usageCount?: number;
  limit?: number;
  planName?: string;
}

/**
 * Verifica si el usuario puede acceder a un nuevo caso
 * @param userId - ID del usuario
 * @returns Resultado de la verificación con detalles
 */
export async function checkCaseAccessLimit(userId: string): Promise<LimitCheckResult> {
  try {
    // Obtener usuario con su suscripción activa
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            currentPeriodEnd: { gte: new Date() },
          },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      // En desarrollo, permitir acceso si el usuario no está en la BD
      // (Clerk puede autenticar usuarios que aún no se han sincronizado)
      if (process.env.NODE_ENV === 'development') {
        return {
          allowed: true,
          reason: 'Usuario en desarrollo sin registro en BD',
          planName: 'DEV',
        };
      }
      
      return {
        allowed: false,
        reason: 'Usuario no encontrado',
      };
    }

    // Si no tiene suscripción activa, se asume plan FREE
    const subscription = user.subscriptions[0];
    const plan = subscription?.plan;

    // Si no tiene plan, o el plan es FREE, verificar límites
    const isFreeUser = !plan || plan.name === 'FREE';

    if (!isFreeUser) {
      // Usuario con plan pago tiene acceso ilimitado
      return {
        allowed: true,
        planName: plan.displayName,
      };
    }

    // Usuario FREE: verificar límite de 10 casos por mes
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Contar casos completados este mes
    const casesThisMonth = await prisma.usageRecord.count({
      where: {
        userId,
        resourceType: 'CASE_COMPLETION',
        billingPeriodStart: { gte: monthStart },
        billingPeriodEnd: { lte: monthEnd },
      },
    });

    const FREE_LIMIT = 10;

    if (casesThisMonth >= FREE_LIMIT) {
      return {
        allowed: false,
        reason: `Has alcanzado el límite de ${FREE_LIMIT} casos por mes del plan gratuito. Actualiza tu plan para acceso ilimitado.`,
        usageCount: casesThisMonth,
        limit: FREE_LIMIT,
        planName: 'Plan Gratuito',
      };
    }

    return {
      allowed: true,
      usageCount: casesThisMonth,
      limit: FREE_LIMIT,
      planName: 'Plan Gratuito',
    };
  } catch (error) {
    console.error('[checkCaseAccessLimit] Error:', error);
    return {
      allowed: false,
      reason: 'Error al verificar límites',
    };
  }
}

/**
 * Registra el uso de un caso completado
 * @param userId - ID del usuario
 * @param caseId - ID del caso completado
 */
export async function recordCaseCompletion(userId: string, caseId: string): Promise<void> {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Obtener suscripción activa
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Crear registro de uso
    await prisma.usageRecord.create({
      data: {
        userId,
        subscriptionId: subscription?.id,
        resourceType: 'CASE_COMPLETION',
        quantity: 1,
        billingPeriodStart: monthStart,
        billingPeriodEnd: monthEnd,
        metadata: {
          caseId,
          completedAt: now.toISOString(),
        },
      },
    });

    console.log(`✅ [recordCaseCompletion] Caso ${caseId} registrado para usuario ${userId}`);
  } catch (error) {
    console.error('[recordCaseCompletion] Error:', error);
    // No lanzar error para no interrumpir el flujo
  }
}

/**
 * Verifica si el usuario tiene acceso a recursos premium (PubMed, MINSAL, etc.)
 * Plan FREE solo tiene acceso a PubMed
 * @param userId - ID del usuario
 * @param resourceType - Tipo de recurso ('pubmed', 'minsal', 'anticonceptivos')
 */
export async function checkResourceAccess(
  userId: string,
  resourceType: 'pubmed' | 'minsal' | 'anticonceptivos' | 'export'
): Promise<LimitCheckResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            currentPeriodEnd: { gte: new Date() },
          },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return { allowed: false, reason: 'Usuario no encontrado' };
    }

    const subscription = user.subscriptions[0];
    const plan = subscription?.plan;
    const isFreeUser = !plan || plan.name === 'FREE';

    // PubMed está disponible para todos
    if (resourceType === 'pubmed') {
      return { allowed: true, planName: plan?.displayName || 'Plan Gratuito' };
    }

    // Otros recursos solo para usuarios de pago
    if (isFreeUser) {
      return {
        allowed: false,
        reason: `Recurso ${resourceType} disponible solo en planes pagos`,
        planName: 'Plan Gratuito',
      };
    }

    return {
      allowed: true,
      planName: plan.displayName,
    };
  } catch (error) {
    console.error('[checkResourceAccess] Error:', error);
    return { allowed: false, reason: 'Error al verificar acceso' };
  }
}

/**
 * Obtiene el resumen de uso del mes actual para un usuario
 * @param userId - ID del usuario
 */
export async function getMonthlyUsageSummary(userId: string) {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const usage = await prisma.usageRecord.groupBy({
      by: ['resourceType'],
      where: {
        userId,
        billingPeriodStart: { gte: monthStart },
        billingPeriodEnd: { lte: monthEnd },
      },
      _sum: {
        quantity: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            currentPeriodEnd: { gte: now },
          },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const plan = user?.subscriptions[0]?.plan;
    const isFreeUser = !plan || plan.name === 'FREE';

    return {
      plan: plan?.displayName || 'Plan Gratuito',
      isFree: isFreeUser,
      usage: usage.reduce((acc, item) => {
        acc[item.resourceType] = item._sum.quantity || 0;
        return acc;
      }, {} as Record<string, number>),
      limits: isFreeUser ? { CASE_COMPLETION: 10 } : {},
    };
  } catch (error) {
    console.error('[getMonthlyUsageSummary] Error:', error);
    return null;
  }
}
