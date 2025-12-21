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
