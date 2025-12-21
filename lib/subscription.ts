import { prisma } from './prisma';

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    displayName: string;
    price: string;
    billingPeriod: string;
    hasAI: boolean;
    hasAdvancedStats: boolean;
    hasPrioritySupport: boolean;
    maxCasesPerMonth: number | null;
  };
}

/**
 * Obtiene la suscripción activa del usuario desde la base de datos
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscription as UserSubscription | null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Verifica si el usuario tiene acceso premium (plan BASIC o superior)
 */
export async function hasActivePremiumSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) return false;
  
  // Verificar que no sea el plan FREE
  return subscription.plan.name !== 'FREE';
}

/**
 * Verifica si el usuario puede acceder a features de IA
 */
export async function canAccessAI(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription?.plan.hasAI ?? false;
}

/**
 * Verifica si el usuario puede acceder a estadísticas avanzadas
 */
export async function canAccessAdvancedStats(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription?.plan.hasAdvancedStats ?? false;
}

/**
 * Obtiene el historial de pagos del usuario
 */
export async function getUserPaymentHistory(userId: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    return payments;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
}

/**
 * Verifica si la suscripción del usuario está por vencer (menos de 7 días)
 */
export async function isSubscriptionExpiringSoon(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) return false;
  
  const daysUntilExpiry = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

/**
 * Obtiene el límite de casos mensuales según el plan del usuario
 */
export async function getUserCaseLimit(userId: string): Promise<number | null> {
  const subscription = await getUserSubscription(userId);
  
  // Si no tiene suscripción o es FREE, límite de 15 casos
  if (!subscription || subscription.plan.name === 'FREE') {
    return 15;
  }
  
  // Los planes premium tienen el límite definido en maxCasesPerMonth (null = ilimitado)
  return subscription.plan.maxCasesPerMonth;
}

/**
 * Cuenta cuántos casos ha completado el usuario en el mes actual
 */
export async function getCasesCompletedThisMonth(userId: string): Promise<number> {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const count = await prisma.studentResult.count({
      where: {
        userId,
        completedAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    return count;
  } catch (error) {
    console.error('Error counting cases completed this month:', error);
    return 0;
  }
}

/**
 * Verifica si el usuario puede acceder a un nuevo caso
 * Retorna { canAccess: boolean, casesUsed: number, caseLimit: number | null, remaining: number | null }
 */
export async function canAccessNewCase(userId: string): Promise<{
  canAccess: boolean;
  casesUsed: number;
  caseLimit: number | null;
  remaining: number | null;
}> {
  const caseLimit = await getUserCaseLimit(userId);
  const casesUsed = await getCasesCompletedThisMonth(userId);

  // Si es ilimitado (null), siempre puede acceder
  if (caseLimit === null) {
    return {
      canAccess: true,
      casesUsed,
      caseLimit: null,
      remaining: null,
    };
  }

  // Verificar si ha superado el límite
  const canAccess = casesUsed < caseLimit;
  const remaining = Math.max(0, caseLimit - casesUsed);

  return {
    canAccess,
    casesUsed,
    caseLimit,
    remaining,
  };
}

/**
 * Obtiene estadísticas de uso del usuario para el mes actual
 */
export async function getUserUsageStats(userId: string) {
  const subscription = await getUserSubscription(userId);
  const caseLimit = await getUserCaseLimit(userId);
  const casesUsed = await getCasesCompletedThisMonth(userId);
  
  const remaining = caseLimit === null ? null : Math.max(0, caseLimit - casesUsed);
  const percentage = caseLimit === null ? 0 : Math.round((casesUsed / caseLimit) * 100);

  return {
    planName: subscription?.plan.displayName || 'Gratuito',
    planType: subscription?.plan.name || 'FREE',
    isUnlimited: caseLimit === null,
    caseLimit,
    casesUsed,
    remaining,
    percentage,
    isPremium: subscription?.plan.name !== 'FREE',
  };
}
