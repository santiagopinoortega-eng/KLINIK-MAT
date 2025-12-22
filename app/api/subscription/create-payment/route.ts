// app/api/subscription/create-payment/route.ts
/**
 * API REAL DE PRODUCCIÓN - Crear Preferencia de Pago en Mercado Pago
 * 
 * POST /api/subscription/create-payment
 * Body: { planId: string, couponCode?: string }
 * 
 * Flujo completo:
 * 1. Validar autenticación y rate limiting
 * 2. Obtener usuario y plan
 * 3. Validar y aplicar cupón si existe
 * 4. Crear preferencia en Mercado Pago con metadata completa
 * 5. Registrar intento de pago en DB
 * 6. Retornar init_point para checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { preferenceClient, MERCADOPAGO_URLS } from '@/lib/mercadopago';
import { checkRateLimit, RATE_LIMITS } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreatePaymentRequest {
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
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    // 2. Rate limiting (máximo 5 intentos por minuto)
    const rateLimitResult = checkRateLimit(req, { windowMs: 60_000, maxRequests: 5 });
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { 
          error: 'Demasiados intentos. Por favor espera unos minutos.',
          retryAfter: rateLimitResult.resetAt 
        },
        { status: 429 }
      );
    }

    // 3. Parsear body
    const body = await req.json() as CreatePaymentRequest;
    const { planId, couponCode } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'El ID del plan es requerido' },
        { status: 400 }
      );
    }

    console.log(`💳 [CREATE-PAYMENT] Usuario ${userId} solicitando plan ${planId}`, {
      couponCode: couponCode || 'sin cupón',
      timestamp: new Date().toISOString(),
    });

    // 4. Obtener usuario y plan en paralelo
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, email: true, name: true }
      }),
      prisma.subscriptionPlan.findUnique({ 
        where: { id: planId },
        include: { subscriptions: false }
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: 'Plan no disponible' },
        { status: 404 }
      );
    }

    // 5. Calcular precio final con descuento
    let finalPrice = Number(plan.price);
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const couponResult = await validateAndApplyCoupon(couponCode, planId, userId, finalPrice);
      if (couponResult.valid) {
        appliedCoupon = couponResult.coupon;
        discountAmount = couponResult.discount ?? 0;
        finalPrice -= discountAmount;
        
        console.log(`🎫 [CREATE-PAYMENT] Cupón aplicado: ${couponCode}`, {
          discount: discountAmount,
          finalPrice,
        });
      } else {
        console.warn(`⚠️  [CREATE-PAYMENT] Cupón inválido: ${couponCode} - ${couponResult.reason}`);
      }
    }

    // 6. Generar referencia única
    const timestamp = Date.now();
    const externalReference = `KMAT_${userId.slice(0, 8)}_${planId.slice(0, 8)}_${timestamp}`;

    // 7. Preparar información del pagador
    const isTestMode = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
    const payerEmail = isTestMode 
      ? `test_${Math.floor(Math.random() * 100000)}@klinikmat.com`
      : user.email;
    const payerName = user.name || 'Usuario KlinikMat';
    const [firstName, ...lastNames] = payerName.split(' ');

    console.log(`📝 [CREATE-PAYMENT] Creando preferencia:`, {
      userId,
      userEmail: user.email,
      planId: plan.id,
      planName: plan.displayName,
      originalPrice: plan.price,
      finalPrice,
      discountAmount,
      externalReference,
      environment: isTestMode ? 'TEST' : 'PRODUCCIÓN',
    });

    // 8. Crear preferencia en Mercado Pago
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: plan.id,
            title: `KlinikMat - ${plan.displayName}`,
            description: plan.description || `Plan ${plan.billingPeriod === 'MONTHLY' ? 'Mensual' : 'Anual'}`,
            category_id: 'education',
            quantity: 1,
            unit_price: finalPrice,
            currency_id: plan.currency,
          },
        ],
        payer: {
          name: firstName || 'Usuario',
          surname: lastNames.join(' ') || 'KlinikMat',
          email: payerEmail,
          phone: {
            area_code: '56',
            number: '',
          },
          identification: {
            type: 'RUT',
            number: '12345678-9',
          },
          address: {
            zip_code: '',
            street_name: '',
          },
        },
        back_urls: {
          success: `${MERCADOPAGO_URLS.success}?plan_id=${planId}&ref=${externalReference}`,
          failure: `${MERCADOPAGO_URLS.failure}?plan_id=${planId}&ref=${externalReference}`,
          pending: `${MERCADOPAGO_URLS.pending}?plan_id=${planId}&ref=${externalReference}`,
        },
        auto_return: 'approved',
        notification_url: MERCADOPAGO_URLS.webhook,
        external_reference: externalReference,
        statement_descriptor: 'KLINIKMAT',
        payment_methods: {
          excluded_payment_types: [
            { id: 'ticket' },
            { id: 'atm' },
          ],
          excluded_payment_methods: [
            { id: 'rapipago' },
            { id: 'pagofacil' },
            { id: 'servipag' },
          ],
          installments: plan.billingPeriod === 'MONTHLY' ? 1 : 12,
        },
        binary_mode: true,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(timestamp + 30 * 60 * 1000).toISOString(), // 30 minutos
        metadata: {
          user_id: userId,
          user_email: user.email,
          user_name: user.name,
          plan_id: planId,
          plan_name: plan.name,
          plan_display_name: plan.displayName,
          billing_period: plan.billingPeriod,
          coupon_code: couponCode || null,
          discount_amount: discountAmount,
          original_price: Number(plan.price),
          final_price: finalPrice,
          external_reference: externalReference,
          created_at: new Date().toISOString(),
          environment: isTestMode ? 'test' : 'production',
        },
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [CREATE-PAYMENT] Preferencia creada en ${duration}ms:`, {
      preferenceId: preference.id,
      initPoint: isTestMode ? preference.sandbox_init_point : preference.init_point,
    });

    // 9. Registrar intento de pago en DB para auditoría (DESHABILITADO - PaymentAttempt model no existe)
    // TODO: Agregar modelo PaymentAttempt al schema si se necesita auditoría completa
    /*
    try {
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
          status: 'PENDING',
          metadata: {
            preferenceId: preference.id,
            planName: plan.displayName,
            userEmail: user.email,
            environment: isTestMode ? 'test' : 'production',
          },
        },
      });
    } catch (dbError) {
      console.error('⚠️  [CREATE-PAYMENT] Error guardando intento de pago:', dbError);
      // No bloqueamos el flujo si falla el registro
    }
    */

    // 10. Retornar datos para el frontend
    const initPoint = isTestMode 
      ? (preference.sandbox_init_point || preference.init_point)
      : preference.init_point;

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint,
      externalReference,
      payment: {
        amount: finalPrice,
        originalAmount: Number(plan.price),
        discount: discountAmount,
        currency: plan.currency,
        planName: plan.displayName,
        billingPeriod: plan.billingPeriod,
        expiresIn: 30, // minutos
      },
      coupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: Number(appliedCoupon.discountValue),
        applied: true,
      } : null,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [CREATE-PAYMENT] Error después de ${duration}ms:`, {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    // Determinar tipo de error para mensaje apropiado
    let errorMessage = 'Error al procesar el pago';
    let statusCode = 500;

    if (error.message?.includes('Plan')) {
      errorMessage = 'Plan no disponible';
      statusCode = 404;
    } else if (error.message?.includes('credentials') || error.message?.includes('access token')) {
      errorMessage = 'Error de configuración de pagos';
      statusCode = 503;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

/**
 * Valida y aplica un cupón de descuento
 */
async function validateAndApplyCoupon(
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

    // Verificar límite de usos globales
    if (coupon.maxUses !== null) {
      const usageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id },
      });
      if (usageCount >= coupon.maxUses) {
        return { valid: false, reason: 'Cupón agotado' };
      }
    }

    // Verificar límite de usos por usuario
    if (coupon.maxUsesPerUser !== null) {
      const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsageCount >= coupon.maxUsesPerUser) {
        return { valid: false, reason: 'Ya usaste este cupón' };
      }
    }

    // Verificar planes aplicables
    const applicablePlans = coupon.applicablePlans as string[] | null;
    if (applicablePlans && applicablePlans.length > 0 && !applicablePlans.includes(planId)) {
      return { valid: false, reason: 'Cupón no válido para este plan' };
    }

    // Calcular descuento
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (price * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      }
    } else {
      // FIXED
      discount = Math.min(Number(coupon.discountValue), price);
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount),
    };
  } catch (error) {
    console.error('Error validando cupón:', error);
    return { valid: false, reason: 'Error al validar cupón' };
  }
}
