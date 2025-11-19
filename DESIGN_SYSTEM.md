# 🎨 Sistema de Diseño KLINIK-MAT

## Identidad Visual: Obstetricia Chilena

La obstetricia en Chile históricamente ha sido representada por el **color ROJO** y el **ÚTERO**. Este sistema de diseño refleja esa identidad profesional con una paleta médica moderna y cálida.

---

## 🔴 Paleta de Colores

### Primarios - Rojo Médico Profesional

```css
--km-crimson: #C41E3A      /* Rojo sangre/útero - Color principal */
--km-cardinal: #8B0000     /* Rojo oscuro - Títulos y énfasis */
--km-rose: #E63946         /* Rojo vibrante - CTAs y acciones */
```

**Uso:**
- `crimson`: Botones primarios, links, bordes destacados
- `cardinal`: Títulos principales, texto de énfasis
- `rose`: Hover states, llamados a la acción secundarios

### Secundarios - Tonos Orgánicos/Cálidos

```css
--km-terracotta: #D4756F   /* Terracota suave - Acentos */
--km-blush: #FFE5E5        /* Rosa pálido - Fondos suaves */
--km-cream: #FFF8F5        /* Crema cálido - Fondo principal */
```

**Uso:**
- `terracotta`: Badges, chips, elementos decorativos
- `blush`: Fondos de secciones, hover backgrounds
- `cream`: Fondo de página principal

### Acentos Clínicos

```css
--km-teal: #0D9488         /* Verde azulado médico - Info/Success */
--km-navy: #1E3A5F         /* Azul marino - Texto oscuro profesional */
```

**Uso:**
- `teal`: Mensajes de éxito, indicadores positivos
- `navy`: Subtítulos, texto secundario importante

### Neutrales Refinados

```css
--km-text-900: #1A1A1A     /* Negro suave - Texto principal */
--km-text-700: #4A5568     /* Gris medio - Texto secundario */
--km-text-500: #718096     /* Gris claro - Texto terciario */
```

---

## 🌈 Gradientes

```css
/* Gradiente principal - Hero sections, CTAs */
background: linear-gradient(135deg, #C41E3A 0%, #E63946 100%);

/* Gradiente cálido - Cards, destacados */
background: linear-gradient(135deg, #D4756F 0%, #FFE5E5 100%);

/* Gradiente hero - Secciones principales con overlay */
background: linear-gradient(135deg, rgba(196,30,58,0.95) 0%, rgba(139,0,0,0.85) 100%);
```

---

## 🎯 Sombras

```css
--km-shadow-sm: 0 2px 8px rgba(196, 30, 58, 0.08);
--km-shadow-md: 0 4px 16px rgba(196, 30, 58, 0.12);
--km-shadow-lg: 0 12px 32px rgba(196, 30, 58, 0.16);
--km-shadow-xl: 0 20px 48px rgba(196, 30, 58, 0.2);
```

**Características:**
- Sombras con tinte rojo sutil (rgba 196,30,58)
- Mayor impacto visual que sombras grises genéricas
- Coherencia con identidad de marca

---

## 📐 Radios de Borde

```css
--km-radius-sm: 8px
--km-radius: 12px
--km-radius-lg: 16px
--km-radius-xl: 24px
```

**Uso:**
- `sm`: Badges, chips pequeños
- `radius`: Botones, inputs estándar
- `lg`: Cards, contenedores
- `xl`: Secciones hero, CTAs grandes

---

## 🎨 Componentes Base

### Botones

**Primario (Gradiente rojo):**
```tsx
<button className="btn btn-primary">
  Comenzar ahora
</button>
```
- Gradiente rojo
- Sombra `km-shadow-md`
- Hover: escala 1.05 + sombra `km-shadow-lg`

**Secundario (Outline):**
```tsx
<button className="btn btn-secondary">
  Ver más
</button>
```
- Fondo blanco
- Borde rojo 2px
- Hover: fondo rosa pálido

### Cards

```tsx
<div className="card">
  {/* Contenido */}
</div>
```

**Características:**
- Borde superior rojo en hover (gradiente)
- Animación de elevación (-8px)
- Sombra aumenta en hover

### Chips/Badges

```tsx
<span className="chip chip-diff-1">Baja</span>
<span className="chip chip-diff-2">Media</span>
<span className="chip chip-diff-3">Alta</span>
```

**Variantes:**
- `diff-1`: Verde azulado (casos fáciles)
- `diff-2`: Terracota (casos intermedios)
- `diff-3`: Rojo crimson (casos difíciles)

---

## 🖼️ Uso del Símbolo del Útero

El ícono de útero (`UterusIcon.tsx`) debe usarse:

✅ **Apropiado:**
- Decoración sutil en fondos (opacity 0.05-0.1)
- Watermarks en secciones médicas
- Iconografía en navegación de módulos de obstetricia

❌ **Evitar:**
- Saturación excesiva (máximo 2-3 por vista)
- Uso en contextos no relacionados con contenido obstétrico
- Tamaños muy grandes que distraigan

---

## 🎭 Animaciones

```css
/* Fade in con traslación */
animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);

/* Slide in lateral */
animation: slide-in 0.3s ease-out;

/* Pulse suave */
animation: pulse-soft 2s ease-in-out infinite;
```

---

## 📱 Responsividad

- **Mobile-first**: Diseño optimizado para móvil primero
- **Breakpoints**: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- **Tipografía adaptativa**: h1 `text-4xl md:text-6xl`

---

## ♿ Accesibilidad

- **Contraste**: Todos los colores cumplen WCAG AA
  - Rojo crimson sobre blanco: 4.5:1
  - Texto negro sobre crema: 12:1
- **Focus states**: Anillo rojo `ring-km-crimson`
- **Semántica**: HTML5 semántico en todos los componentes

---

## 🎨 Inspiración y Referencia

**Obstetricia Chilena:**
- Rojo histórico de la profesión
- Útero como símbolo identitario
- Calidez y profesionalismo médico

**Diseño moderno:**
- Gradientes sutiles
- Sombras con tinte de marca
- Animaciones fluidas
- Espaciado generoso

---

## 📋 Checklist de Implementación

Al crear nuevos componentes, verifica:

- [ ] ¿Usa colores de la paleta `km-*`?
- [ ] ¿Tiene sombras con tinte rojo?
- [ ] ¿Radios de borde consistentes?
- [ ] ¿Animaciones suaves y profesionales?
- [ ] ¿Responsive en mobile?
- [ ] ¿Accesible (contraste, focus)?
- [ ] ¿Coherente con identidad de obstetricia?

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025  
**Autor:** KLINIK-MAT Design Team
