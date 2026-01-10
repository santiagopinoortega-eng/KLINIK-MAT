/**
 * Data centralizada de planes de pricing
 * Funciones para calcular descuentos, equivalencias y filtros
 */

import type { 
  PricingPlan, 
  PlanDiscount, 
  MonthlyEquivalent,
  FAQItem 
} from '@/lib/types/pricing';

/**
 * Precio base mensual de referencia
 */
const BASE_MONTHLY_PRICE = 4990;

/**
 * Descuentos por período de facturación
 * SEMIANNUAL: 25% descuento (6 meses)
 * ANNUAL: 40% descuento (12 meses) - MEJOR OFERTA
 */
const DISCOUNT_RATES = {
  MONTHLY: 0,
  SEMIANNUAL: 25,  // 25% descuento - Asegura tu práctica
  ANNUAL: 40,      // 40% descuento - Asegura tu internado - MEJOR VALOR
  FREE: 0
} as const;

/**
 * Calcula el descuento de un plan comparado con el precio base mensual
 */
export function calculateDiscount(plan: PricingPlan): PlanDiscount {
  if (plan.isFree || plan.billingPeriod === 'MONTHLY') {
    return {
      originalPrice: plan.price,
      finalPrice: plan.price,
      savings: 0,
      percentage: 0,
      hasDiscount: false
    };
  }

  const months = {
    SEMIANNUAL: 6,  // 6 meses
    ANNUAL: 12      // 12 meses
  }[plan.billingPeriod] || 1;

  const originalPrice = BASE_MONTHLY_PRICE * months;
  const savings = originalPrice - plan.price;
  const percentage = Math.round((savings / originalPrice) * 100);

  return {
    originalPrice,
    finalPrice: plan.price,
    savings,
    percentage,
    hasDiscount: savings > 0
  };
}

/**
 * Calcula el equivalente mensual de un plan
 */
export function calculateMonthlyEquivalent(plan: PricingPlan): MonthlyEquivalent {
  const months = {
    MONTHLY: 1,
    SEMIANNUAL: 6,  // 6 meses
    ANNUAL: 12,     // 12 meses
    FREE: 1
  }[plan.billingPeriod];

  return {
    pricePerMonth: Math.round(plan.price / months),
    totalMonths: months,
    totalPrice: plan.price
  };
}

/**
 * Obtiene la duración legible del período de facturación
 */
export function getBillingPeriodLabel(period: PricingPlan['billingPeriod']): string {
  const labels = {
    MONTHLY: '1 mes',
    SEMIANNUAL: '6 meses',
    ANNUAL: '12 meses',
    FREE: 'Gratis para siempre'
  };

  return labels[period];
}

/**
 * Formatea precio en CLP
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Características comunes a todos los planes pagos
 */
const COMMON_PAID_FEATURES = [
  {
    id: 'cases',
    text: 'Casos clínicos ilimitados (6 áreas)',
    included: true,
    icon: 'check'
  },
  {
    id: 'area-embarazo',
    text: 'Embarazo y Control Prenatal',
    included: true,
    icon: 'check'
  },
  {
    id: 'area-parto',
    text: 'Parto y Atención Intraparto',
    included: true,
    icon: 'check'
  },
  {
    id: 'area-puerperio',
    text: 'Puerperio y Lactancia',
    included: true,
    icon: 'check'
  },
  {
    id: 'area-ginecologia',
    text: 'Ginecología',
    included: true,
    icon: 'check'
  },
  {
    id: 'area-salud-sexual',
    text: 'Salud Sexual y Anticoncepción',
    included: true,
    icon: 'check'
  },
  {
    id: 'area-neonatologia',
    text: 'Neonatología / Recién Nacido',
    included: true,
    icon: 'check'
  },
  {
    id: 'anticonceptivos',
    text: 'Guía interactiva de anticonceptivos',
    included: true,
    icon: 'check'
  },
  {
    id: 'minsal',
    text: 'Normativas MINSAL actualizadas',
    included: true,
    icon: 'check'
  },
  {
    id: 'pubmed',
    text: 'Búsqueda PubMed integrada',
    included: true,
    icon: 'check'
  },
  {
    id: 'stats',
    text: 'Estadísticas avanzadas de progreso',
    included: true,
    icon: 'check'
  },
  {
    id: 'pdf',
    text: 'Exportar reportes a PDF',
    included: true,
    icon: 'check'
  },
  {
    id: 'offline',
    text: 'Modo offline disponible',
    included: true,
    icon: 'check'
  }
];

/**
 * Obtiene las características de un plan según su tipo
 */
export function getPlanFeatures(plan: PricingPlan) {
  if (plan.isFree) {
    return [
      {
        id: 'free-cases',
        text: '10 casos clínicos por mes',
        included: true,
        icon: 'check'
      },
      {
        id: 'free-areas',
        text: 'Acceso a las 6 áreas',
        included: true,
        icon: 'check'
      },
      {
        id: 'free-stats',
        text: 'Estadísticas básicas',
        included: true,
        icon: 'check'
      },
      {
        id: 'free-limit',
        text: 'Sin acceso a recursos premium',
        included: false,
        icon: 'x'
      }
    ];
  }

  const features = [...COMMON_PAID_FEATURES];

  // Agregar soporte prioritario para planes largos
  if (plan.billingPeriod === 'SEMIANNUAL' || plan.billingPeriod === 'ANNUAL') {
    features.push({
      id: 'priority-support',
      text: 'Soporte prioritario',
      included: true,
      icon: 'star'
    });
  }

  // Agregar beneficios extra para plan anual (mejor valor)
  if (plan.billingPeriod === 'ANNUAL') {
    features.push({
      id: 'early-access',
      text: 'Acceso anticipado a nuevas funcionalidades',
      included: true,
      icon: 'sparkles'
    });
    features.push({
      id: 'certificate',
      text: 'Certificado de estudios descargable',
      included: true,
      icon: 'award'
    });
  }

  return features;
}

/**
 * FAQs predefinidas
 */
export const PRICING_FAQS: FAQItem[] = [
  {
    id: 'trial',
    question: '¿Cómo funciona el período de prueba gratuito?',
    answer: 'Los planes Mensual y Trimestral incluyen 14 días de prueba completamente gratis. No realizamos ningún cargo durante este período y puedes cancelar cuando desees sin costo alguno.',
    category: 'general'
  },
  {
    id: 'change-plan',
    question: '¿Puedo cambiar de plan después de suscribirme?',
    answer: 'Sí, tienes total flexibilidad para actualizar o cambiar tu plan en cualquier momento desde tu panel de usuario. Los cambios se aplican de manera inmediata.',
    category: 'subscription'
  },
  {
    id: 'payment-methods',
    question: '¿Qué métodos de pago están disponibles?',
    answer: 'Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) a través de Mercado Pago. Todas las transacciones son 100% seguras y encriptadas.',
    category: 'payment'
  },
  {
    id: 'cancel',
    question: '¿Cómo puedo cancelar mi suscripción?',
    answer: 'Puedes cancelar tu suscripción desde tu perfil de usuario en cualquier momento. Tu acceso permanecerá activo hasta el final del período que ya has pagado. Sin complicaciones ni preguntas.',
    category: 'subscription'
  },
  {
    id: 'refund',
    question: '¿Ofrecen reembolsos?',
    answer: 'Sí, ofrecemos garantía de satisfacción de 7 días. Si no estás satisfecho con la plataforma, contáctanos y procesaremos tu reembolso sin preguntas.',
    category: 'payment'
  },
  {
    id: 'content-updates',
    question: '¿Con qué frecuencia se actualiza el contenido?',
    answer: 'Actualizamos nuestros casos clínicos y recursos semanalmente, siguiendo las últimas guías MINSAL y evidencia científica. Los suscriptores reciben notificaciones de nuevos contenidos.',
    category: 'content'
  }
];

/**
 * Filtra planes activos y los ordena
 */
export function filterActivePlans(plans: PricingPlan[]): PricingPlan[] {
  return plans
    .filter(plan => plan.isActive)
    .sort((a, b) => {
      // Orden: FREE → MONTHLY → SEMIANNUAL → ANNUAL
      const order = { FREE: 0, MONTHLY: 1, SEMIANNUAL: 2, ANNUAL: 3 };
      return (order[a.billingPeriod] || 99) - (order[b.billingPeriod] || 99);
    });
}

/**
 * Encuentra el mejor plan (más descuento)
 */
export function getBestValuePlan(plans: PricingPlan[]): PricingPlan | null {
  const activePlans = filterActivePlans(plans).filter(p => !p.isFree);
  
  if (activePlans.length === 0) return null;

  return activePlans.reduce((best, current) => {
    const bestDiscount = calculateDiscount(best);
    const currentDiscount = calculateDiscount(current);
    
    return currentDiscount.percentage > bestDiscount.percentage ? current : best;
  });
}

/**
 * Encuentra el plan más popular (semestral)
 */
export function getPopularPlan(plans: PricingPlan[]): PricingPlan | null {
  return filterActivePlans(plans).find(p => p.billingPeriod === 'SEMIANNUAL') || null;
}
