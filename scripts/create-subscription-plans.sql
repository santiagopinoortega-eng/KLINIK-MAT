-- scripts/create-subscription-plans.sql
-- Crear planes de suscripción con precios reales

-- Primero eliminar planes existentes si los hay
DELETE FROM "subscription_plans" WHERE name IN ('FREE', 'MONTHLY', 'QUARTERLY', 'BIANNUAL');

-- Plan FREE (siempre disponible)
INSERT INTO "subscription_plans" (
  id,
  name,
  "displayName",
  description,
  price,
  currency,
  "billingPeriod",
  features,
  "maxCasesPerMonth",
  "hasAI",
  "hasAdvancedStats",
  "hasPrioritySupport",
  "trialDays",
  "isActive"
) VALUES (
  'plan_free_v1',
  'FREE',
  'Plan Gratuito',
  'Perfecto para empezar a estudiar',
  0,
  'CLP',
  'MONTHLY',
  '{"unlimited_access": false, "ai_feedback": false, "advanced_stats": false, "priority_support": false}',
  15, -- 15 casos por mes
  false,
  false,
  false,
  0,
  true
);

-- Plan MENSUAL - $4.990
INSERT INTO "subscription_plans" (
  id,
  name,
  "displayName",
  description,
  price,
  currency,
  "billingPeriod",
  features,
  "maxCasesPerMonth",
  "hasAI",
  "hasAdvancedStats",
  "hasPrioritySupport",
  "trialDays",
  "isActive"
) VALUES (
  'plan_monthly_v1',
  'MONTHLY',
  'Plan Mensual',
  'Menos que un pasaje de micro. $166/día',
  4990,
  'CLP',
  'MONTHLY',
  '{"unlimited_access": true, "ai_feedback": true, "advanced_stats": true, "priority_support": false}',
  NULL, -- Ilimitado
  true,
  true,
  false,
  0,
  true
);

-- Plan TRIMESTRAL - $11.490 (ahorro $3.480)
INSERT INTO "subscription_plans" (
  id,
  name,
  "displayName",
  description,
  price,
  currency,
  "billingPeriod",
  features,
  "maxCasesPerMonth",
  "hasAI",
  "hasAdvancedStats",
  "hasPrioritySupport",
  "trialDays",
  "isActive"
) VALUES (
  'plan_quarterly_v1',
  'QUARTERLY',
  'Plan Trimestral',
  'Ahorras $3.480. Estudia todo el trimestre. $127/día',
  11490,
  'CLP',
  'QUARTERLY',
  '{"unlimited_access": true, "ai_feedback": true, "advanced_stats": true, "priority_support": true, "discount": 3480}',
  NULL, -- Ilimitado
  true,
  true,
  true,
  0,
  true
);

-- Plan SEMESTRAL - $16.490 (ahorro $13.450, casi 45% OFF) ⭐ MÁS POPULAR
INSERT INTO "subscription_plans" (
  id,
  name,
  "displayName",
  description,
  price,
  currency,
  "billingPeriod",
  features,
  "maxCasesPerMonth",
  "hasAI",
  "hasAdvancedStats",
  "hasPrioritySupport",
  "trialDays",
  "isActive"
) VALUES (
  'plan_biannual_v1',
  'BIANNUAL',
  'Plan Semestral',
  'La mejor oferta. Ahorras $13.450 (¡Casi un 45% OFF!). $91/día',
  16490,
  'CLP',
  'BIANNUAL',
  '{"unlimited_access": true, "ai_feedback": true, "advanced_stats": true, "priority_support": true, "popular": true, "discount": 13450}',
  NULL, -- Ilimitado
  true,
  true,
  true,
  0,
  true
);

-- Verificar creación
SELECT 
  name,
  "displayName",
  price,
  "billingPeriod",
  "maxCasesPerMonth",
  "isActive"
FROM "subscription_plans"
ORDER BY price ASC;
