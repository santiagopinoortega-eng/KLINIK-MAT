/**
 * Types para sistema de pricing profesional
 * Arquitectura: Separación de concerns - Types → Data → UI
 */

/**
 * Plan de suscripción con toda la información necesaria
 */
export interface PricingPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingPeriod: 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'YEARLY' | 'FREE';
  features: PlanFeature[];
  benefits: PlanBenefit[];
  maxCasesPerMonth: number | null;
  trialDays: number;
  isActive: boolean;
  isPopular?: boolean;
  isBestValue?: boolean;
  isFree?: boolean;
  badge?: PlanBadge;
}

/**
 * Característica individual del plan
 */
export interface PlanFeature {
  id: string;
  text: string;
  included: boolean;
  icon?: string;
  description?: string;
}

/**
 * Beneficio del plan (usado para destacar ventajas)
 */
export interface PlanBenefit {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

/**
 * Badge para destacar planes
 */
export interface PlanBadge {
  text: string;
  variant: 'popular' | 'best-value' | 'free' | 'new';
  color: 'red' | 'green' | 'blue' | 'purple';
}

/**
 * Información de descuento calculada
 */
export interface PlanDiscount {
  originalPrice: number;
  finalPrice: number;
  savings: number;
  percentage: number;
  hasDiscount: boolean;
}

/**
 * Información de precio mensual equivalente
 */
export interface MonthlyEquivalent {
  pricePerMonth: number;
  totalMonths: number;
  totalPrice: number;
}

/**
 * Props para PricingCard component
 */
export interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planId: string) => void;
  discount?: PlanDiscount;
  monthlyEquivalent?: MonthlyEquivalent;
  isProcessing?: boolean;
  className?: string;
}

/**
 * Props para ComparisonTable component
 */
export interface ComparisonTableProps {
  plans: PricingPlan[];
  onSelectPlan: (planId: string) => void;
  className?: string;
}

/**
 * Props para TrustBadges component
 */
export interface TrustBadgesProps {
  className?: string;
}

/**
 * Props para FAQ component
 */
export interface FAQProps {
  items?: FAQItem[];
  className?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/**
 * Checkout step types
 */
export type CheckoutStep = 'plans' | 'confirm' | 'payment' | 'success';

/**
 * Response del API de planes
 */
export interface PlansAPIResponse {
  success: boolean;
  plans: PricingPlan[];
  error?: string;
}
