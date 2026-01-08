// lib/payment-helpers.ts
/**
 * Helper functions for payment processing
 * Extracted from route handlers for better testability and reusability
 */

import { prisma } from './prisma';

/**
 * Validates and applies a coupon to a payment
 * Returns discount information or validation error
 */
export async function validateAndApplyCoupon(
  code: string,
  planId: string,
  userId: string,
  price: number
): Promise<{
  valid: boolean;
  coupon?: any;
  discount?: number;
  reason?: string;
}> {
  try {
    const now = new Date();
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
    });

    if (!coupon) {
      return { valid: false, reason: 'Cupón no encontrado o expirado' };
    }

    // Check global usage limit
    if (coupon.maxRedemptions !== null && coupon.redemptionsCount >= coupon.maxRedemptions) {
      return { valid: false, reason: 'Cupón agotado' };
    }

    // Check first purchase only restriction
    if (coupon.firstPurchaseOnly) {
      const hasSubscription = await prisma.subscription.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'PAST_DUE', 'CANCELED'] } },
      });
      if (hasSubscription) {
        return { valid: false, reason: 'Cupón solo válido para primera compra' };
      }
    }

    // Check applicable plans
    const applicablePlans = coupon.applicablePlans as string[] | null;
    if (applicablePlans && applicablePlans.length > 0 && !applicablePlans.includes(planId)) {
      return { valid: false, reason: 'Cupón no válido para este plan' };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (price * Number(coupon.discountValue)) / 100;
    } else {
      // FIXED_AMOUNT
      discount = Math.min(Number(coupon.discountValue), price);
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount),
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, reason: 'Error al validar cupón' };
  }
}

/**
 * Generate unique external reference for payment tracking
 */
export function generatePaymentReference(userId: string, planId: string): string {
  const timestamp = Date.now();
  return `KMAT_${userId.slice(0, 8)}_${planId.slice(0, 8)}_${timestamp}`;
}

/**
 * Prepare payer information for Mercado Pago
 * Handles test mode email generation
 */
export function preparePayer(user: { email: string; name: string | null }, isTestMode: boolean | undefined) {
  const payerEmail = isTestMode 
    ? `test_${Math.floor(Math.random() * 100000)}@klinikmat.com`
    : user.email;
  
  const payerName = user.name || 'Usuario KlinikMat';
  const [firstName, ...lastNames] = payerName.split(' ');

  return {
    email: payerEmail,
    firstName: firstName || 'Usuario',
    lastName: lastNames.join(' ') || 'KlinikMat',
  };
}
