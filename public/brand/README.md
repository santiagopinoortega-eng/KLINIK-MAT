# 🎨 Sistema de Logo KLINIK-MAT

## 📁 Estructura de archivos

```
/public/brand/
├── logo-centro.png        # Logo principal (reemplazar con tu versión mejorada)
├── logo-isotipo.png       # Solo símbolo (opcional - crear versión sin texto)
├── logo-dark.png          # Versión para fondos oscuros (opcional)
└── favicon.ico            # Favicon (generar desde el logo)
```

## 🎯 Componente Logo

El componente `<Logo />` es flexible y reutilizable en toda la aplicación.

### Props disponibles:

```typescript
variant?: 'full' | 'icon' | 'text'  // Tipo de logo a mostrar
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'  // Tamaño
theme?: 'light' | 'dark'  // Colores según fondo
href?: string  // Si debe ser clickeable (default: '/')
className?: string  // Clases CSS adicionales
showText?: boolean  // Mostrar/ocultar texto en variant='full'
priority?: boolean  // Prioridad de carga (usar en hero)
```

### Ejemplos de uso:

```tsx
// Logo completo en header
<Logo variant="full" size="sm" theme="light" priority />

// Logo grande en hero
<Logo variant="full" size="xl" theme="dark" href={null} priority />

// Solo isotipo en sidebar colapsado
<Logo variant="icon" size="sm" theme="light" />

// Logo en footer
<Logo variant="full" size="md" theme="dark" href="/" />
```

## 📍 Ubicaciones implementadas

### ✅ Header (Navbar)
- **Archivo:** `app/components/Header.tsx`
- **Ubicación:** Esquina superior izquierda
- **Variante:** `full`, tamaño `sm`, tema `light`
- **Clickeable:** Sí → va a `/`

### ✅ Footer
- **Archivo:** `app/components/Footer.tsx`
- **Ubicación:** Columna izquierda
- **Variante:** `full`, tamaño `md`, tema `dark`
- **Clickeable:** Sí → va a `/`

### ✅ Sidebar
- **Archivo:** `app/components/Sidebar.tsx`
- **Ubicación:** Top del sidebar
- **Variante:** `full` cuando expandido, `icon` cuando colapsado
- **Tamaño:** `sm`
- **Clickeable:** Sí → va a `/`

### ✅ Página principal (Hero)
- **Archivo:** `app/page.tsx`
- **Ubicación:** Centro del hero section
- **Variante:** `full`, tamaño `xl`, tema `dark`
- **Clickeable:** No (href={null})

## 🎨 Cómo reemplazar el logo

### Paso 1: Prepara tus archivos

Asegúrate de tener:
- **Logo principal** (PNG o SVG) → `logo-centro.png`
- Dimensiones recomendadas: 512x512px o vectorial
- Fondo transparente
- Formato PNG con buena calidad

### Paso 2: Reemplaza el archivo

```bash
# Opción 1: Mismo nombre (recomendado)
cp tu-nuevo-logo.png public/brand/logo-centro.png

# Opción 2: Nuevo nombre (actualizar ruta en Logo.tsx)
cp tu-nuevo-logo.png public/brand/logo-klinikmat.png
# Luego editar app/components/Logo.tsx línea 34
```

### Paso 3: Genera el favicon

Usa una herramienta como [Favicon.io](https://favicon.io/favicon-converter/):
1. Sube tu logo
2. Descarga el favicon.ico
3. Coloca en `/public/favicon.ico`

### Paso 4: Optimiza para diferentes tamaños (Opcional)

Si tu logo tiene detalles finos, crea versiones simplificadas:

```
logo-centro.png       # Versión completa (header, footer)
logo-isotipo.png      # Solo símbolo (sidebar colapsado, favicon)
logo-text.png         # Solo texto (casos especiales)
```

## 🔧 Ajustes de diseño

### Cambiar tamaño del logo

Edita `app/components/Logo.tsx` líneas 13-19:

```typescript
const sizeClasses = {
  xs: { height: 24, text: 'text-sm' },
  sm: { height: 32, text: 'text-base' },
  md: { height: 40, text: 'text-lg' },
  lg: { height: 56, text: 'text-2xl' },
  xl: { height: 80, text: 'text-4xl' },  // ← Ajusta según tu diseño
};
```

### Cambiar aspecto ratio

Si tu logo no es cuadrado, edita línea 25:

```typescript
// Antes (logo cuadrado)
const width = height;

// Después (logo rectangular, ej: 2:1)
const width = height * 2;
```

### Ajustar colores del texto

Edita líneas 29-31:

```typescript
const textColorClass = theme === 'dark' 
  ? 'text-white'           // Texto para fondos oscuros
  : 'text-gray-900';       // Texto para fondos claros
```

## 🎯 Componentes especializados incluidos

Para casos comunes, usa estos atajos:

```tsx
import { LogoHeader, LogoFooter, LogoHero } from '@/app/components/Logo';

// En header
<LogoHeader />

// En footer
<LogoFooter />

// En hero section
<LogoHero />
```

## 🚀 Próximos pasos recomendados

1. **Favicon completo:**
   - Genera favicon.ico de 16x16, 32x32, 48x48
   - Crea apple-touch-icon.png (180x180)
   - Genera manifest icons para PWA (192x192, 512x512)

2. **Variantes adicionales:**
   - Logo monocromático (para impresión)
   - Logo vertical (para layouts específicos)
   - Animación de carga con el logo

3. **Open Graph:**
   - Crea og-image.png (1200x630) con tu logo
   - Actualiza `app/layout.tsx` metadata

## 📝 Notas importantes

- El logo se carga con `priority` en header y hero (optimización Next.js)
- Formato SVG es preferible a PNG para escalabilidad
- Usa PNG de alta resolución si no tienes SVG
- El componente Logo es responsive automáticamente
- Los tamaños se ajustan según el viewport en mobile

## 🐛 Troubleshooting

**El logo no aparece:**
- Verifica que el archivo existe en `/public/brand/logo-centro.png`
- Reinicia el servidor de desarrollo (`npm run dev`)
- Limpia cache: `rm -rf .next && npm run dev`

**El logo se ve pixelado:**
- Usa una imagen de mayor resolución (mínimo 512x512)
- Considera usar formato SVG
- Verifica la calidad de exportación desde tu editor

**El logo no es clickeable:**
- Asegúrate de no pasar `href={null}` (solo usar en hero)
- Por defecto, el logo siempre enlaza a `/`

---

**Desarrollado para KLINIK-MAT** 🩺
Plataforma educativa de casos clínicos para estudiantes de Obstetricia
