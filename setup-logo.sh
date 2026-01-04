#!/bin/bash

# Script para implementar el nuevo logo

echo "🎨 KLINIK-MAT - Implementación de Logo"
echo "======================================"
echo ""

# Verificar si la imagen existe
if [ -f "public/brand/logo-centro.png" ]; then
    echo "✅ Logo encontrado en public/brand/logo-centro.png"
    
    # Mostrar tamaño del archivo
    SIZE=$(ls -lh public/brand/logo-centro.png | awk '{print $5}')
    echo "📦 Tamaño del archivo: $SIZE"
    
    # Verificar dimensiones si imagemagick está instalado
    if command -v identify &> /dev/null; then
        DIMS=$(identify -format "%wx%h" public/brand/logo-centro.png 2>/dev/null)
        if [ ! -z "$DIMS" ]; then
            echo "📐 Dimensiones: $DIMS"
        fi
    fi
else
    echo "❌ Logo NO encontrado"
    echo ""
    echo "Por favor, guarda tu imagen como:"
    echo "  public/brand/logo-centro.png"
    echo ""
    echo "Puedes usar uno de estos comandos:"
    echo "  cp ~/Descargas/tu-logo.png public/brand/logo-centro.png"
    echo "  mv ~/Descargas/tu-logo.png public/brand/logo-centro.png"
    exit 1
fi

echo ""
echo "🧹 Limpiando cache de Next.js..."
rm -rf .next

echo ""
echo "✅ ¡Listo! Ahora ejecuta:"
echo "   npm run dev"
echo ""
echo "Tu logo aparecerá en:"
echo "  • Header (arriba izquierda)"
echo "  • Hero (centro página principal)"  
echo "  • Sidebar (cuando expandido)"
echo "  • Footer (primera columna)"
echo ""
