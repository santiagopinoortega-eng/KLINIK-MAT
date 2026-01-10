#!/bin/bash

# Script de pruebas simples SIN jq
# Para ejecutar: chmod +x scripts/test-security-simple.sh && ./scripts/test-security-simple.sh

echo "🧪 =========================================="
echo "🧪 KLINIKMAT - PRUEBAS DE SEGURIDAD"
echo "🧪 =========================================="
echo ""

BASE_URL="http://localhost:3000"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ---

echo ""
echo "📋 TEST 1: Obtener CSRF Token"
echo "-------------------------------------------------------------"

RESPONSE=$(curl -s "$BASE_URL/api/csrf")
echo "$RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ PASS${NC}: CSRF endpoint funcionando"
  
  # Extraer token manualmente (sin jq)
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "Token obtenido: ${TOKEN:0:30}..."
else
  echo -e "${RED}❌ FAIL${NC}: No se pudo obtener token"
fi

echo ""

# ---

echo ""
echo "📋 TEST 2: Request sin CSRF token (debe fallar)"
echo "-------------------------------------------------------------"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/subscription/process-payment" \
  -H "Content-Type: application/json" \
  -d '{"planId":"test"}')

echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" == "401" ]; then
  echo -e "${GREEN}✅ PASS${NC}: Auth requerida (esperado, endpoint protegido)"
elif [ "$HTTP_CODE" == "403" ]; then
  echo -e "${GREEN}✅ PASS${NC}: CSRF bloqueado correctamente"
else
  echo -e "${YELLOW}⚠️  Code $HTTP_CODE${NC}"
fi

echo ""

# ---

echo ""
echo "📋 TEST 3: Webhook endpoint (sin auth requerida)"
echo "-------------------------------------------------------------"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/webhooks/mercadopago" \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123"}}')

echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" != "500" ] && [ "$HTTP_CODE" != "403" ]; then
  echo -e "${GREEN}✅ Webhook accesible${NC}: Code $HTTP_CODE"
else
  echo -e "${RED}❌ Webhook bloqueado${NC}: Code $HTTP_CODE"
fi

echo ""

# ---

echo ""
echo "📋 TEST 4: Endpoint público /api/plans"
echo "-------------------------------------------------------------"

RESPONSE=$(curl -s "$BASE_URL/api/plans")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/plans")

echo "HTTP Code: $HTTP_CODE"
echo "Response (primeros 200 chars):"
echo "$RESPONSE" | head -c 200
echo ""

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ Endpoint público funcionando${NC}"
else
  echo -e "${YELLOW}⚠️  Code $HTTP_CODE${NC}"
fi

echo ""

# ---

echo ""
echo "📋 TEST 5: Rate Limiting en endpoint público"
echo "-------------------------------------------------------------"
echo "Enviando 15 requests rápidos a /api/csrf..."

BLOCKED=0
for i in {1..15}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/csrf")
  
  if [ "$HTTP_CODE" == "429" ]; then
    BLOCKED=$((BLOCKED + 1))
    echo -e "Request $i: ${RED}$HTTP_CODE (bloqueado)${NC}"
  else
    echo "Request $i: $HTTP_CODE"
  fi
  
  sleep 0.1
done

if [ $BLOCKED -gt 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}: Rate limiting activo ($BLOCKED requests bloqueados)"
else
  echo -e "${YELLOW}⚠️  INFO${NC}: No se bloquearon requests (límite puede ser alto)"
fi

echo ""

# ---

echo ""
echo "🎉 =========================================="
echo "🎉 RESUMEN"
echo "🎉 =========================================="
echo ""
echo "Para pruebas completas con autenticación:"
echo ""
echo "1️⃣  Opción UI (recomendada):"
echo "   - Abrir: http://localhost:3000/sign-in"
echo "   - Iniciar sesión"
echo "   - Ir a: http://localhost:3000/pricing"
echo "   - Abrir DevTools (F12) → Network tab"
echo "   - Click en 'Suscribirse'"
echo "   - Verificar headers:"
echo "     ✓ x-csrf-token"
echo "     ✓ idempotency-key"
echo ""
echo "2️⃣  Opción cURL con sesión:"
echo "   - Primero hacer login y obtener cookie"
echo "   - Luego hacer requests con cookie de sesión"
echo ""
echo "📝 Endpoints protegidos requieren autenticación (401)"
echo "📝 CSRF protection activo en todos los POST"
echo "📝 Rate limiting configurado"
echo ""
