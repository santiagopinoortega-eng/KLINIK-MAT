# Sistema de Recomendaciones Personalizadas - Guía Rápida

## 🎯 ¿Qué hace este sistema?

Proporciona recomendaciones inteligentes de casos clínicos basadas en la especialidad del usuario para **aumentar engagement y retención**.

## 📋 Componentes Principales

### 1. **Motor de Recomendaciones** (`lib/recommendations.ts`)
```typescript
import { generatePersonalizedRecommendations } from '@/lib/recommendations';

const recs = generatePersonalizedRecommendations(
  userSpecialty,    // "Ginecología", "Obstetricia", etc.
  allCases,         // Array de todos los casos
  userProgress      // Progreso del usuario
);
```

**Retorna:**
- Casos nuevos en especialidad del usuario
- Casos fallados para repasar
- Desafíos avanzados (alta dificultad)
- Casos trending/populares

### 2. **Onboarding** (`app/components/SpecialtySelector.tsx`)
```tsx
import SpecialtySelector from './components/SpecialtySelector';

<SpecialtySelector 
  onComplete={(specialty) => console.log(specialty)}
  showSkip={true}
/>
```

Captura la especialidad del usuario en su primera visita.

### 3. **Dashboard de Recomendaciones** (`app/components/RecommendedCases.tsx`)
```tsx
import RecommendedCases from './components/RecommendedCases';

<RecommendedCases 
  allCases={casos}
  showOnboarding={true}
/>
```

Muestra grupos de recomendaciones con estadísticas de progreso.

### 4. **Tracking de Engagement** (`lib/useEngagement.ts`)
```tsx
import { useEngagement } from '@/lib/useEngagement';

const { trackRecommendationClick } = useEngagement();

// Al hacer clic en caso recomendado:
trackRecommendationClick(caseId, 'specialty');
```

Registra interacciones del usuario con recomendaciones.

## 🚀 Uso en Páginas

### Home Page (`app/page.tsx`)
```tsx
'use client';
import RecommendedCases from './components/RecommendedCases';

// Si el usuario está autenticado, mostrar recomendaciones
{isSignedIn && <RecommendedCases allCases={casos} />}
```

### Areas Page (`app/areas/page.tsx`)
```tsx
// Server Component - puede cargar datos directamente
const cases = await prisma.case.findMany({ where: { isPublic: true }});

return (
  <>
    <RecommendedCases allCases={cases} />
    <AreasClient />
  </>
);
```

## 📊 Métricas Capturadas

### API Endpoint: `/api/engagement`

**POST:** Registrar métrica
```typescript
fetch('/api/engagement', {
  method: 'POST',
  body: JSON.stringify({
    caseId: '123',
    source: 'recommendation',
    recommendationGroup: 'specialty',
    action: 'click',
    sessionDuration: 120 // segundos
  })
});
```

**GET:** Obtener métricas
```typescript
fetch('/api/engagement?limit=50&source=recommendation')
  .then(res => res.json())
  .then(data => {
    console.log(data.metrics); // Array de métricas
    console.log(data.stats);   // Estadísticas agregadas
  });
```

## 🔧 Configuración

### 1. Especialidades Disponibles
En `lib/recommendations.ts`:
```typescript
export const SPECIALTY_AREAS = {
  'Ginecología': 'ginecologia',
  'Obstetricia': 'obstetricia',
  'Neonatología': 'neonatologia',
  'SSR (Salud Sexual y Reproductiva)': 'ssr',
  'Todas las áreas': 'all',
};
```

### 2. Límites de Recomendaciones
```typescript
const notAttempted = getNotAttemptedCases(cases, progress, specialty, 6); // 6 casos
const failed = getFailedCases(cases, progress, specialty, 6);
const challenges = getChallengeCases(cases, progress, specialty, 4); // 4 casos
const trending = getTrendingCases(cases, progress, specialty, 4);
```

## 📈 Flujo del Usuario

1. **Usuario nuevo** → Se registra → Onboarding (modal) → Selecciona especialidad
2. **Dashboard personalizado** → Ve recomendaciones en 4 categorías
3. **Click en caso** → Tracking automático → Resuelve caso
4. **Regresa** → Dashboard actualizado con nuevo progreso

## 🎨 Personalización

### Cambiar Iconos de Categorías
En `RecommendedCases.tsx`:
```typescript
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'specialty': return <Target />;     // 🎯
    case 'review': return <RefreshCcw />;    // 🔄
    case 'challenge': return <TrendingUp />; // 💪
    case 'trending': return <Flame />;       // 🔥
  }
}
```

### Agregar Nueva Categoría
1. Actualizar tipo en `lib/recommendations.ts`:
```typescript
category: 'specialty' | 'review' | 'challenge' | 'trending' | 'nueva';
```

2. Crear función getter:
```typescript
export function getNuevaCases(cases, progress, specialty, limit) {
  // Lógica de filtrado
  return filteredCases;
}
```

3. Agregar al generador:
```typescript
const nueva = getNuevaCases(allCases, userProgress, userSpecialty, 6);
if (nueva.length > 0) {
  groups.push({
    title: 'Nueva Categoría',
    icon: '✨',
    cases: nueva,
    priority: 5,
    category: 'nueva'
  });
}
```

## 🐛 Troubleshooting

### "No veo recomendaciones"
- ✅ Verifica que el usuario tenga especialidad: `user?.unsafeMetadata?.specialty`
- ✅ Verifica que haya casos en esa especialidad
- ✅ Revisa console para errores de fetch

### "Tracking no funciona"
- ✅ Verifica autenticación: usuario debe estar logged in
- ✅ Revisa que el caso exista en DB
- ✅ Verifica rate limits no excedidos
- ✅ Mira logs en `/api/engagement`

### "Onboarding no aparece"
- ✅ Verifica `showOnboarding={true}` en props
- ✅ Verifica que usuario NO tenga especialidad
- ✅ Revisa estado `showSelector` en RecommendedCases

## 📚 Referencias

- **Motor:** `lib/recommendations.ts` (257 líneas)
- **Onboarding:** `app/components/SpecialtySelector.tsx` (222 líneas)
- **Dashboard:** `app/components/RecommendedCases.tsx` (345 líneas)
- **Tracking:** `lib/useEngagement.ts` (72 líneas)
- **API:** `app/api/engagement/route.ts` (155 líneas)
- **Schema:** `prisma/schema.prisma` (modelo EngagementMetric)

## 🔐 Seguridad

- ✅ Autenticación requerida en todos los endpoints
- ✅ Rate limiting: 200 req/min para usuarios autenticados
- ✅ Validación de inputs
- ✅ Verificación de existencia de casos
- ✅ Cascade delete (si user se elimina, métricas también)

## 📊 Queries Útiles

### Ver métricas en DB
```sql
-- Métricas por fuente
SELECT source, COUNT(*) as count 
FROM engagement_metrics 
GROUP BY source;

-- Métricas por grupo de recomendación
SELECT recommendation_group, COUNT(*) as count 
FROM engagement_metrics 
WHERE source = 'recommendation'
GROUP BY recommendation_group;

-- Usuarios más activos
SELECT user_id, COUNT(*) as interactions
FROM engagement_metrics
GROUP BY user_id
ORDER BY interactions DESC
LIMIT 10;
```

---

**Estado:** ✅ Sistema completo, testeado y listo para producción

**Changelog completo:** Ver `CHANGELOG_DIC_11_2025.md`
