# 🎨 KLINIK-MAT Design System 4.0

**Medical Excellence Palette - Inspired by Modern Educational Platforms**

Red-centric design honoring Chilean obstetrics tradition, enhanced with sophisticated medical-grade visual language drawn from Osmosis, Medscape, Coursera, and Khan Academy.

---

## 🔴 Color Philosophy

### Primary: Clinical Red (Obstetrics Heritage)
Red is the soul of Chilean obstetrics. Our primary palette builds on this tradition with a comprehensive scale:

```css
--km-red-900: #7F1D1D  /* Deep burgundy - Maximum depth */
--km-red-800: #991B1B  /* Dark crimson - Headers, authority */
--km-red-700: #B91C1C  /* True medical red - Primary CTA */
--km-red-600: #DC2626  /* Bright red - Main actions ⭐ HERO */
--km-red-500: #EF4444  /* Vibrant red - Hover states */
--km-red-400: #F87171  /* Coral red - Accents */
--km-red-300: #FCA5A5  /* Light coral - Subtle highlights */
--km-red-200: #FECACA  /* Pale coral - Soft backgrounds */
--km-red-100: #FEE2E2  /* Very light - Cards, alerts */
--km-red-50: #FEF2F2   /* Barely there - Large surfaces */
```

**Usage:**
- **700-800**: Primary CTAs, important headers
- **600**: Default interactive elements (buttons, links)
- **400-500**: Hover states, secondary actions
- **100-200**: Backgrounds, cards, alerts
- **50**: Large surface areas, page backgrounds

### Secondary: Deep Navy (Medical Authority)
Professional, trustworthy, clean - the foundation of medical UI:

```css
--km-navy-900: #0C1E33  /* Almost black - Maximum contrast */
--km-navy-800: #1E293B  /* Deep slate - Dark text */
--km-navy-700: #334155  /* Primary text - Body copy ⭐ DEFAULT */
--km-navy-600: #475569  /* Secondary text */
--km-navy-500: #64748B  /* Muted text - Labels */
--km-navy-400: #94A3B8  /* Light text - Placeholders */
--km-navy-300: #CBD5E1  /* Borders - Dividers */
--km-navy-200: #E2E8F0  /* Light borders */
--km-navy-100: #F1F5F9  /* Subtle backgrounds */
--km-navy-50: #F8FAFC   /* Page background */
```

**Usage:**
- **700-900**: Text hierarchy (headings → body → captions)
- **300-500**: UI elements (borders, icons, disabled states)
- **50-200**: Backgrounds, surfaces, containers

### Accent: Medical Teal (Clinical Precision)
Complementary to red, evokes medical precision and success:

```css
--km-teal-600: #0D9488  /* Medical teal - Success, info */
--km-teal-500: #14B8A6  /* Bright teal - Interactive */
--km-teal-400: #2DD4BF  /* Light teal - Highlights */
--km-teal-100: #CCFBF1  /* Pale teal - Backgrounds */
--km-teal-50: #F0FDFA   /* Very light teal */
```

**Usage:**
- Success states, correct answers
- Informational badges
- Complementary interactive elements

### Warm Accent: Terracotta (Human Touch)
Adds warmth, approachability, and humanity:

```css
--km-warm-600: #C2410C  /* Deep terracotta */
--km-warm-500: #EA580C  /* Rich orange */
--km-warm-400: #FB923C  /* Warm orange - Warnings */
--km-warm-200: #FED7AA  /* Light warm */
--km-warm-100: #FFEDD5  /* Pale warm */
--km-warm-50: #FFF7ED   /* Barely warm */
```

**Usage:**
- Warning states
- Warm accents in illustrations
- Secondary CTAs

---

## 🎭 Semantic Colors

### Success (Correct Answers, Achievements)
```css
--km-success-dark: #059669
--km-success: #10B981       ⭐ PRIMARY
--km-success-light: #6EE7B7
--km-success-bg: #D1FAE5
```

### Warning (Attention Required)
```css
--km-warning-dark: #D97706
--km-warning: #F59E0B       ⭐ PRIMARY
--km-warning-light: #FCD34D
--km-warning-bg: #FEF3C7
```

### Info (Helpful Information)
```css
--km-info-dark: #1D4ED8
--km-info: #3B82F6          ⭐ PRIMARY
--km-info-light: #93C5FD
--km-info-bg: #DBEAFE
```

### Error (Mistakes, Critical)
```css
--km-error: #DC2626         (matches primary red)
--km-error-bg: #FEE2E2
```

---

## 🌊 Glassmorphism & Modern Effects

### Glass Components (Osmosis-inspired)
```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
}
```

**Usage:** Overlays, modals, floating navigation, hero sections

### Mesh Gradients
```css
background: 
  radial-gradient(at 0% 0%, #FEE2E2 0%, transparent 50%),
  radial-gradient(at 100% 0%, #DBEAFE 0%, transparent 50%),
  radial-gradient(at 100% 100%, #FFEDD5 0%, transparent 50%),
  radial-gradient(at 0% 100%, #F0FDFA 0%, transparent 50%);
```

**Usage:** Large background surfaces, hero sections

---

## 💫 Shadow System

### Elevation Hierarchy
```css
--km-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)           /* Subtle lift */
--km-shadow-sm: 0 2px 4px + 0 1px 2px                   /* Cards at rest */
--km-shadow-md: 0 4px 6px + 0 2px 4px                   /* Elevated cards */
--km-shadow-lg: 0 10px 15px + 0 4px 6px                 /* Floating elements */
--km-shadow-xl: 0 20px 25px + 0 10px 10px               /* Modals */
--km-shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.15)        /* Maximum elevation */
```

### Red-Tinted Shadows (for primary elements)
```css
--km-shadow-red-sm: 0 2px 8px rgba(220, 38, 38, 0.1)
--km-shadow-red-md: 0 4px 16px rgba(220, 38, 38, 0.15)
--km-shadow-red-lg: 0 12px 24px rgba(220, 38, 38, 0.2)
--km-shadow-red-xl: 0 20px 40px rgba(220, 38, 38, 0.25)
```

**Usage:** Primary CTAs, important cards, hero elements

---

## ✨ Animations & Micro-interactions

### Fade Effects
```css
.animate-fade-in         /* Simple fade (0.4s) */
.animate-fade-in-up      /* Fade + slide up (0.5s) */
.animate-scale-in        /* Fade + scale (0.3s) */
```

### Slides
```css
.animate-slide-in-left   /* Slide from left (0.4s) */
```

### Pulses
```css
.animate-pulse-soft      /* Gentle opacity pulse */
.animate-pulse-red       /* Red ring expansion */
```

### Shimmer & Skeleton
```css
.animate-shimmer         /* Loading shimmer */
.animate-gradient        /* Gradient animation */
```

### Hover Effects
```css
.hover-lift              /* Translate Y + shadow */
.hover\:scale-102        /* Subtle scale */
.hover\:scale-105        /* Noticeable scale */
```

---

## 🎯 Component Patterns

### Primary Button
```html
<button class="btn btn-primary">
  Get Started
</button>
```
- Gradient background: `--km-gradient-primary`
- Red-tinted shadow
- Ripple effect on click
- Smooth hover lift

### Card with Glass Effect
```html
<div class="card card-glass">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```
- Frosted glass background
- Top accent bar on hover
- Shimmer effect
- Smooth elevation

### Difficulty Chips
```html
<span class="chip chip-diff-1">Baja</span>     <!-- Green -->
<span class="chip chip-diff-2">Media</span>    <!-- Orange -->
<span class="chip chip-diff-3">Alta</span>     <!-- Red -->
```

---

## 🎨 Gradients Library

### Primary Gradients
```css
--km-gradient-primary:       135deg, #B91C1C → #DC2626 → #EF4444
--km-gradient-primary-hover: 135deg, #991B1B → #B91C1C → #DC2626
--km-gradient-hero:          135deg, #7F1D1D → #DC2626 → #EF4444
```

### Utility Gradients
```css
--km-gradient-subtle:   135deg, #FEF2F2 → #FFFFFF
--km-gradient-warm:     135deg, #FFF7ED → #FFEDD5 → #FED7AA
--km-gradient-success:  135deg, #059669 → #10B981 → #34D399
--km-gradient-glass:    135deg, rgba(255,255,255,0.9) → rgba(255,255,255,0.7)
```

---

## 📐 Spacing & Sizing

### Border Radius Scale
```css
--km-radius-xs:   4px
--km-radius-sm:   6px
--km-radius-md:   8px   ⭐ DEFAULT
--km-radius-lg:   12px
--km-radius-xl:   16px
--km-radius-2xl:  20px
--km-radius-3xl:  24px
--km-radius-full: 9999px
```

### Transition Speeds
```css
--km-transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1)
--km-transition-base:   200ms cubic-bezier(0.4, 0, 0.2, 1)  ⭐ DEFAULT
--km-transition-slow:   300ms cubic-bezier(0.4, 0, 0.2, 1)
--km-transition-bounce: 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## 🎯 Usage Examples

### Hero Section
```jsx
<section className="bg-gradient-km-hero text-white">
  <div className="glass-strong p-8 rounded-2xl">
    <h1 className="text-gradient-red">KLINIK-MAT</h1>
    <button className="btn btn-primary hover-lift">
      Comenzar →
    </button>
  </div>
</section>
```

### Case Card
```jsx
<div className="card hover-lift animate-fade-in-up">
  <span className="chip chip-diff-2">Media</span>
  <h3 className="text-km-navy-800">Caso Clínico</h3>
  <p className="text-km-navy-600">Descripción...</p>
</div>
```

### Success Alert
```jsx
<div className="p-4 bg-km-success-bg border-l-4 border-km-success rounded-lg">
  <p className="text-km-success-dark font-semibold">
    ✓ ¡Respuesta correcta!
  </p>
</div>
```

---

## 🌟 Key Improvements Over v3.0

1. **Comprehensive Color Scales**: Full 50-900 scales for red and navy
2. **Glassmorphism**: Modern frosted glass effects throughout
3. **Enhanced Shadows**: Layered depth with red-tinted variants
4. **Micro-interactions**: Ripple, shimmer, pulse effects
5. **Better Accessibility**: Improved contrast ratios, focus states
6. **Semantic System**: Clear success/warning/info/error hierarchy
7. **Mesh Gradients**: Subtle, sophisticated backgrounds
8. **Advanced Animations**: Fade-in-up, scale-in, gradient animations
9. **Professional Typography**: Enhanced spacing, letter-spacing
10. **Medical-Grade Polish**: Inspired by industry-leading platforms

---

## 🎓 Inspiration Sources

- **Osmosis**: Glassmorphism, mesh gradients, modern cards
- **Medscape**: Medical authority, clean layout, red accents
- **Coursera**: Card elevation, smooth transitions
- **Khan Academy**: Friendly colors, accessible contrast
- **Duolingo**: Playful animations, success states

---

*Design System v4.0 - December 2025*
*Honoring Chilean obstetrics tradition with world-class design*
