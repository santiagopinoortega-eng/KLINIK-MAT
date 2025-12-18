#!/bin/bash

# Script para ejecutar seed de planes en producción
# Este script se conecta a la base de datos de producción y crea los 6 planes

echo "🌱 Seeding subscription plans to production database..."

# Ejecutar seed usando la DATABASE_URL de producción
npx tsx prisma/seed-plans.ts

echo "✅ Seed completed!"
echo ""
echo "Verify plans were created:"
echo "SELECT id, name, slug, price, interval, active FROM \"SubscriptionPlan\";"
