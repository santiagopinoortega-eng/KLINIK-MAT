// app/api/subscription/create-preference/route.ts
/**
 * API para crear preferencias de pago en Mercado Pago
 * 
 * POST /api/subscription/create-preference
 * Body: { planId: string, couponCode?: string }
 * 
 * Flujo profesional:
 * 1. Validar usuario autenticado
 * 2. Validar plan existe y está activo
 * 3. Aplicar cupón si existe
 * 4. Crear preferencia en MP con metadata completa
 * 5. Registrar intento de pago en DB
 * 6. Retornar init_point para redirección
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { preferenceClient, MERCADOPAGO_URLS } from '@/lib/mercadopago';
import { checkRateLimit, RATE_LIMITS } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreatePreferenceRequest {
  planId: string;
  couponCode?: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // 2. Rate limiting (5 intentos por minuto)
    const rateLimitResult = checkRateLimit(req, { windowMs: 60_000, maxRequests: 5 });
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { 
          error: 'Demasiados intentos. Intenta de nuevo en unos minutos.',
          retryAfter: rateLimitResult.resetAt 
        },
        { status: 429 }
      );
    }

    // 3. Parsear body
    const body = await req.json() as CreatePreferenceRequest;
    const { planId, couponCode } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'planId es requerido' },
        { status: 400 }
      );
    }

    console.log(`💳 [CREATE-PREFERENCE] User ${userId} requesting plan ${planId}`);

    // 4. Obtener usuario y plan
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.subscriptionPlan.findUnique({ 
        where: { id: planId, isActive: true } 
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado o inactivo' },
        { status: 404 }
      );
    }

    // 5. Calcular precio con descuento si aplica
    let finalPrice = Number(plan.price);
    let discountAmount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await validateCoupon(couponCode, planId, userId);
      if (coupon) {
        discountAmount = await calculateDiscount(coupon, finalPrice);
        finalPrice -= discountAmount;
        console.log(`🎫 [CREATE-PREFERENCE] Coupon applied: ${couponCode}, discount: $${discountAmount}`);
      } else {
        console.warn(`⚠️  [CREATE-PREFERENCE] Invalid coupon: ${couponCode}`);
      }
    }

    // 6. Generar referencia única
    const externalReference = `KMAT_${userId.slice(0, 8)}_${planId.slice(0, 8)}_${Date.now()}`;

    // 7. Determinar email del pagador
    const isTestMode = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
    const payerEmail = isTestMode ? 'test_user_92801501@testuser.com' : user.email;
    const payerName = user.name || 'Usuario KlinikMat';

    console.log(`📝 [CREATE-PREFERENCE] Creating preference:`, {
      userId,
      planId: plan.id,
      planName: plan.displayName,
      originalPrice: plan.price,
      finalPrice,
      discount: discountAmount,
      externalReference,
      isTestMode,
    });

    // 8. Crear preferencia en Mercado Pago
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: plan.id,
            title: `KlinikMat - ${plan.displayName}`,
            description: plan.description || `Suscripción ${plan.billingPeriod === 'MONTHLY' ? 'Mensual' : 'Anual'}`,
            quantity: 1,
            unit_price: finalPrice,
            currency_id: plan.currency,
            category_id: 'education', // Categoría de educación
          },
        ],
        payer: {
          name: payerName.split(' ')[0] || 'Usuario',
          surname: payerName.split(' ').slice(1).join(' ') || 'KlinikMat',
          email: payerEmail,
          phone: {
            area_code: '56', // Código de Chile
            number: '',
          },
          identification: {
            type: 'RUT',
            number: '12345678-9', // Genérico para testing
          },
        },
        back_urls: {
          success: `${MERCADOPAGO_URLS.success}?plan_id=${planId}&ref=${externalReference}`,
          failure: `${MERCADOPAGO_URLS.failure}?plan_id=${planId}&ref=${externalReference}`,
          pending: `${MERCADOPAGO_URLS.pending}?plan_id=${planId}&ref=${externalReference}`,
        },
        auto_return: 'approved', // Auto-redirect en aprobación
        notification_url: MERCADOPAGO_URLS.webhook,
        external_reference: externalReference,
        payment_methods: {
          excluded_payment_types: [
            { id: 'ticket' }, // Sin efectivo
          ],
          excluded_payment_methods: [
            { id: 'rapipago' },
            { id: 'pagofacil' },
          ],
          installments: plan.billingPeriod === 'MONTHLY' ? 1 : 12, // Hasta 12 cuotas en anual
        },
        statement_descriptor: 'KLINIKMAT', // Nombre en resumen tarjeta
        binary_mode: true, // Aprobación/rechazo inmediato
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        metadata: {
          user_id: userId,
          user_email: user.email,
          plan_id: planId,
          plan_name: plan.name,
          coupon_code: couponCode || null,
          discount_amount: discountAmount,
          original_price: Number(plan.price),
          final_price: finalPrice,
          billing_period: plan.billingPeriod,
          external_reference: externalReference,
        },
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [CREATE-PREFERENCE] Created in ${duration}ms:`, {
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });

    // 9. Registrar intento de pago en DB para auditoría (DESHABILITADO - PaymentAttempt model no existe)
    // TODO: Agregar modelo PaymentAttempt al schema si se necesita auditoría completa
    /*
    await prisma.paymentAttempt.create({
      data: {
        userId,
        planId,
        amount: finalPrice,
        currency: plan.currency,
        mpPreferenceId: preference.id!,
        externalReference,
        couponCode: couponCode || null,
        discountAmount,
        metadata: {
          preferenceId: preference.id,
          planName: plan.displayName,
          userEmail: user.email,
        },
      },
    }).catch(err => {
      console.error('⚠️  Failed to save payment attempt:', err);
      // No bloquear el flujo si falla el registro
    });
    */

    // 10. Usar sandbox_init_point en TEST, init_point en producción
    const initPoint = isTestMode 
      ? (preference.sandbox_init_point || preference.init_point)
      : preference.init_point;

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint,
      externalReference,
      amount: finalPrice,
      originalAmount: Number(plan.price),
      discount: discountAmount,
      planName: plan.displayName,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [CREATE-PREFERENCE] Error after ${duration}ms:`, {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { 
        error: 'Error al crear preferencia de pago',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Valida un cupón
 */
async function validateCoupon(
  code: string,
  planId: string,
  userId: string
): Promise<any | null> {
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

    if (!coupon) return null;

    // Verificar límite de usos globales
    if (coupon.maxRedemptions !== null && coupon.redemptionsCount >= coupon.maxRedemptions) {
      return null;
    }

    // Verificar si es solo para primera compra
    if (coupon.firstPurchaseOnly) {
      const hasSubscription = await prisma.subscription.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'PAST_DUE', 'CANCELED'] } },
      });
      if (hasSubscription) return null;
    }

    // Verificar planes aplicables
    const applicablePlans = coupon.applicablePlans as string[] | null;
    if (applicablePlans && !applicablePlans.includes(planId)) {
      return null;
    }

    return coupon;
  } catch (error) {
    console.error('Error validating coupon:', error);
    return null;
  }
}

/**
 * Calcula el descuento a aplicar
 */
async function calculateDiscount(coupon: any, price: number): Promise<number> {
  if (coupon.discountType === 'PERCENTAGE') {
    const discount = (price * coupon.discountValue) / 100;
    return coupon.maxDiscountAmount 
      ? Math.min(discount, coupon.maxDiscountAmount)
      : discount;
  } else {
    // FIXED
    return Math.min(coupon.discountValue, price);
  }
}
