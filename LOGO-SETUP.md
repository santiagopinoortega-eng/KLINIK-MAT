# 🎨 GUÍA RÁPIDA: Reemplazar tu Logo

## ✅ TU LOGO ESTÁ LISTO PARA IMPLEMENTARSE

### 📍 Paso 1: Reemplaza el archivo

```bash
# Copia tu logo mejorado al proyecto
cp TU-NUEVO-LOGO.png public/brand/logo-centro.png

# O usa el nombre que prefieras y actualiza la ruta en:
# app/components/Logo.tsx línea 34
```

### 🚀 Paso 2: Reinicia el servidor

```bash
rm -rf .next
npm run dev
```

## ✅ Dónde aparecerá tu logo automáticamente:

1. **Header** (esquina superior izquierda) - Tamaño pequeño
2. **Footer** (primera columna) - Tamaño mediano
3. **Sidebar** (arriba) - Isotipo cuando colapsado, completo expandido
4. **Página principal** (hero section) - Tamaño grande y prominente

## 📊 Especificaciones recomendadas:

- **Formato:** PNG con transparencia o SVG
- **Dimensiones:** 512x512px (cuadrado) o tu proporción preferida
- **Calidad:** Alta resolución, mínimo 300 DPI
- **Colores:** Funciona bien en fondos claros Y oscuros

## 🎯 Formatos opcionales adicionales:

```
public/brand/
├── logo-centro.png       ✅ PRINCIPAL (reemplazar)
├── logo-isotipo.png      ⭐ Solo símbolo (para favicon)
├── logo-dark.png         ⭐ Versión para fondos oscuros
└── favicon.ico           ⭐ Generar desde tu logo
```

## 🔧 Ajustes personalizados:

### Si tu logo NO es cuadrado:

Edita `app/components/Logo.tsx` línea 25:

```typescript
// Logo rectangular (ej: 2:1)
const width = height * 2;

// Logo vertical (ej: 1:2)
const width = height / 2;
```

### Cambiar tamaños:

Edita `app/components/Logo.tsx` líneas 13-19:

```typescript
const sizeClasses = {
  xs: { height: 20, text: 'text-xs' },   // Más pequeño
  sm: { height: 32, text: 'text-base' },
  md: { height: 48, text: 'text-xl' },   // Más grande
  lg: { height: 64, text: 'text-3xl' },
  xl: { height: 100, text: 'text-5xl' }, // Hero más grande
};
```

## ✨ Componente flexible:

El logo se adapta automáticamente a:
- ✅ Diferentes tamaños de pantalla (responsive)
- ✅ Sidebar colapsado/expandido
- ✅ Temas claro/oscuro
- ✅ Con o sin texto

## 🎨 Ejemplo de uso manual:

```tsx
import Logo from '@/app/components/Logo';

// Logo completo, tamaño mediano, tema claro
<Logo variant="full" size="md" theme="light" />

// Solo isotipo, pequeño
<Logo variant="icon" size="sm" />

// Logo grande sin link (para hero)
<Logo variant="full" size="xl" href={null} />
```

---

**¡Listo!** Solo reemplaza el archivo PNG y verás tu logo en toda la plataforma 🚀
