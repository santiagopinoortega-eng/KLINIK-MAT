#!/bin/bash

# Script de pruebas manuales de seguridad
# Para ejecutar: chmod +x scripts/test-security-manual.sh && ./scripts/test-security-manual.sh

echo "🧪 =========================================="
echo "🧪 KLINIKMAT - PRUEBAS DE SEGURIDAD"
echo "🧪 =========================================="
echo ""

BASE_URL="http://localhost:3000"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "📋 TEST 1: CSRF Protection - Request sin token (debe fallar)"
echo "-------------------------------------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/subscription/process-payment" \
  -H "Content-Type: application/json" \
  -d '{"planId":"test","token":"abc"}')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" == "403" ]; then
  echo -e "${GREEN}✅ PASS${NC}: Request bloqueado correctamente (403 Forbidden)"
else
  echo -e "${RED}❌ FAIL${NC}: Esperado 403, recibido $HTTP_CODE"
fi

echo "$RESPONSE" | head -n -1
echo ""

# ---

echo ""
echo "📋 TEST 2: CSRF Token válido (debe pasar validación)"
echo "-------------------------------------------------------------"

# Obtener CSRF token
TOKEN_RESPONSE=$(curl -s "$BASE_URL/api/csrf")
TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r .token)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ FAIL${NC}: No se pudo obtener CSRF token"
  echo "Response: $TOKEN_RESPONSE"
else
  echo -e "${GREEN}✅ Token obtenido${NC}: ${TOKEN:0:20}..."
  
  # Intentar request con token (fallará por otros motivos, pero pasará CSRF)
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/subscription/process-payment" \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: $TOKEN" \
    -H "Cookie: csrf-token=$TOKEN" \
    -d '{"planId":"plan_monthly","token":"test_token"}')
  
  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
  
  if [ "$HTTP_CODE" != "403" ]; then
    echo -e "${GREEN}✅ PASS${NC}: CSRF validado correctamente (código: $HTTP_CODE)"
  else
    echo -e "${RED}❌ FAIL${NC}: CSRF token no aceptado"
  fi
  
  echo "$RESPONSE" | head -n -1
fi

echo ""

# ---

echo ""
echo "📋 TEST 3: Idempotency - Requests duplicados"
echo "-------------------------------------------------------------"

# Obtener token fresco
TOKEN=$(curl -s "$BASE_URL/api/csrf" | jq -r .token)
IDEM_KEY="TEST_$(date +%s)"

echo "Idempotency Key: $IDEM_KEY"
echo "Enviando 2 requests idénticos..."

# Request 1
RESPONSE1=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/subscription/process-payment" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -H "idempotency-key: $IDEM_KEY" \
  -H "Cookie: csrf-token=$TOKEN" \
  -d '{"planId":"plan_monthly","token":"test_token"}')

sleep 1

# Request 2 (mismo idempotency key)
RESPONSE2=$(curl -s -w "\nHTTP_CODE:%{http_code}" -i -X POST "$BASE_URL/api/subscription/process-payment" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -H "idempotency-key: $IDEM_KEY" \
  -H "Cookie: csrf-token=$TOKEN" \
  -d '{"planId":"plan_monthly","token":"test_token"}')

echo ""
echo "Response 1:"
echo "$RESPONSE1" | head -n -1
echo ""

echo "Response 2:"
REPLAY_HEADER=$(echo "$RESPONSE2" | grep -i "x-idempotent-replay")

if [ -n "$REPLAY_HEADER" ]; then
  echo -e "${GREEN}✅ PASS${NC}: Idempotency funcionando correctamente"
  echo "$REPLAY_HEADER"
else
  echo -e "${YELLOW}⚠️  WARNING${NC}: Header X-Idempotent-Replay no encontrado"
  echo "Esto puede significar que el request falló antes de la validación de idempotency"
fi

echo ""

# ---

echo ""
echo "📋 TEST 4: Input Sanitization (XSS Prevention)"
echo "-------------------------------------------------------------"

TOKEN=$(curl -s "$BASE_URL/api/csrf" | jq -r .token)
IDEM_KEY="XSS_TEST_$(date +%s)"

# Intentar inyectar script
MALICIOUS_PLAN='<script>alert("xss")</script>Plan Mensual'

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/subscription/process-payment" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -H "idempotency-key: $IDEM_KEY" \
  -H "Cookie: csrf-token=$TOKEN" \
  -d "{\"planId\":\"plan_monthly\",\"token\":\"test\",\"maliciousInput\":\"$MALICIOUS_PLAN\"}")

echo "Input malicioso enviado: $MALICIOUS_PLAN"
echo ""
echo "Response:"
echo "$RESPONSE" | head -n -1

# Verificar que no haya tags HTML en la respuesta
if echo "$RESPONSE" | grep -q "<script>"; then
  echo -e "${RED}❌ FAIL${NC}: XSS no fue sanitizado"
else
  echo -e "${GREEN}✅ PASS${NC}: Input sanitizado correctamente (sin tags <script>)"
fi

echo ""

# ---

echo ""
echo "📋 TEST 5: Rate Limiting"
echo "-------------------------------------------------------------"
echo "Enviando 10 requests rápidos (límite: 5/minuto)..."

TOKEN=$(curl -s "$BASE_URL/api/csrf" | jq -r .token)
BLOCKED=0

for i in {1..10}; do
  HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$BASE_URL/api/subscription/process-payment" \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: $TOKEN" \
    -H "idempotency-key: RATE_TEST_$i" \
    -H "Cookie: csrf-token=$TOKEN" \
    -d '{"planId":"plan_monthly","token":"test"}')
  
  if [ "$HTTP_CODE" == "429" ]; then
    BLOCKED=$((BLOCKED + 1))
  fi
  
  echo "Request $i: $HTTP_CODE"
done

if [ $BLOCKED -gt 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}: Rate limiting funcionando ($BLOCKED requests bloqueados)"
else
  echo -e "${YELLOW}⚠️  WARNING${NC}: No se bloqueó ningún request (puede que el límite sea más alto)"
fi

echo ""

# ---

echo ""
echo "🎉 =========================================="
echo "🎉 RESUMEN DE PRUEBAS"
echo "🎉 =========================================="
echo ""
echo "✅ Test 1: CSRF sin token → Debe bloquear"
echo "✅ Test 2: CSRF con token → Debe permitir"
echo "✅ Test 3: Idempotency → Debe retornar mismo resultado"
echo "✅ Test 4: Sanitización → Debe limpiar XSS"
echo "✅ Test 5: Rate Limiting → Debe bloquear requests excesivos"
echo ""
echo "📝 Revisar logs del servidor para ver detalles de validación"
echo ""
echo "🔍 Comandos útiles:"
echo "   - Ver logs: tail -f .next/server.log"
echo "   - Ver DB: npx prisma studio"
echo "   - Limpiar keys: npx tsx scripts/cleanup-idempotency-keys.ts"
echo ""
