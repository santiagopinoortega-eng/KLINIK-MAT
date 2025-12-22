#!/bin/bash

# Script de Testing Completo - KLINIK-MAT
# Ejecuta todos los tests y genera reportes

set -e

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║       🧪 SUITE DE TESTS COMPLETA - KLINIK-MAT v1.4.0             ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar sección
section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Verificar que Node modules estén instalados
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado, ejecutando npm install...${NC}"
    npm install
fi

# 1. Tests Unitarios
section "📦 Tests Unitarios - Lógica de Negocio"
echo "Ejecutando tests de lib/subscription.ts..."
npx jest __tests__/lib/subscription.test.ts --verbose --colors || true

# 2. Tests de API
section "🌐 Tests de API - Endpoints"
echo "Ejecutando tests de API endpoints..."
npx jest __tests__/api/subscription/check-access.test.ts --verbose --colors || true

# 3. Tests de Componentes
section "🎨 Tests de Componentes React"
echo "Ejecutando tests de componentes..."
npx jest __tests__/components/UsageLimitBadge.test.tsx --verbose --colors || true

# 4. Tests de Performance
section "⚡ Tests de Performance y Carga"
echo "Ejecutando tests de escalabilidad..."
npx jest __tests__/performance/load.test.ts --verbose --colors || true

# 5. Tests de Integración
section "🔗 Tests de Integración - Flujos Completos"
echo "Ejecutando tests de flujos end-to-end..."
npx jest __tests__/integration/full-flow.test.ts --verbose --colors || true

# 6. Resumen General
section "📊 Resumen y Cobertura"
echo "Ejecutando todos los tests con reporte de cobertura..."
npx jest --coverage --coverageReporters=text --coverageReporters=html --colors

# 7. Reporte Final
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║  ✅ TESTS COMPLETADOS                                             ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Tests unitarios${NC}"
echo -e "${GREEN}✓ Tests de API${NC}"
echo -e "${GREEN}✓ Tests de componentes${NC}"
echo -e "${GREEN}✓ Tests de performance${NC}"
echo -e "${GREEN}✓ Tests de integración${NC}"
echo ""
echo -e "${YELLOW}📄 Reporte de cobertura generado en: coverage/index.html${NC}"
echo ""
echo -e "${BLUE}Para ver el reporte de cobertura:${NC}"
echo -e "  ${GREEN}open coverage/index.html${NC}  (macOS)"
echo -e "  ${GREEN}xdg-open coverage/index.html${NC}  (Linux)"
echo ""
