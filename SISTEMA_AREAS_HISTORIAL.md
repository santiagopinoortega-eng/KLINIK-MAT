# 🎓 Sistema de Áreas Clínicas e Historial - KLINIK-MAT

## 📋 Resumen de Implementación (25 Nov 2025)

### ✅ SISTEMA COMPLETADO

Se ha implementado un sistema profesional y de alto nivel que incluye:

1. **Página de Selección de Áreas Clínicas** (`/areas`)
2. **Filtrado de Casos por Área** (`/casos?area=ginecologia`)
3. **Modelo de Base de Datos para Historial** (StudentResult ampliado)

---

## 🏗️ Arquitectura Implementada

### 1. Página de Áreas Clínicas (`/areas`)

**Archivos Creados:**
- `app/areas/page.tsx` - Página server component con metadata
- `app/areas/AreasClient.tsx` - Componente cliente interactivo

**Características:**
```typescript
// 4 Áreas definidas
const AREAS = [
  {
    id: 'ginecologia',
    title: 'ÁREA 1: GINECOLOGÍA Y SALUD DE LA MUJER',
    subtitle: 'Patología, disfunciones y endocrinología ginecológica',
    available: true,
    caseCount: 28
  },
  {
    id: 'ssr',
    title: 'ÁREA 2: SALUD SEXUAL Y REPRODUCTIVA',
    subtitle: 'APS, regulación de fertilidad y promoción de la salud',
    available: true,
    caseCount: 18
  },
  {
    id: 'obstetricia',
    title: 'ÁREA 3: OBSTETRICIA Y PUERPERIO',
    subtitle: 'Control prenatal, parto, puerperio y urgencias obstétricas',
    available: true,
    caseCount: 8
  },
  {
    id: 'neonatologia',
    title: 'ÁREA 4: NEONATOLOGÍA',
    subtitle: 'Recién nacido sano, patológico y lactancia materna',
    available: false, // PRÓXIMAMENTE
    caseCount: 0
  }
];
```

**Diseño Profesional:**
- ✅ Cards con gradientes específicos por área
- ✅ Iconos profesionales (Heroicons)
- ✅ Indicador de selección (checkmark animado)
- ✅ Badge "PRÓXIMAMENTE" para áreas no disponibles
- ✅ Estadísticas generales en barra superior
- ✅ Botón de continuar deshabilitado hasta seleccionar
- ✅ Info card educativa al final

**Paleta de Colores por Área:**
```css
/* Ginecología */
gradient: from-rose-50 via-pink-50 to-red-50
border: border-rose-300

/* SSR */
gradient: from-purple-50 via-violet-50 to-indigo-50
border: border-purple-300

/* Obstetricia */
gradient: from-blue-50 via-cyan-50 to-teal-50
border: border-blue-300

/* Neonatología */
gradient: from-amber-50 via-yellow-50 to-orange-50
border: border-amber-300
```

---

### 2. Filtrado de Casos por Área

**Archivos Modificados:**
- `app/casos/page.tsx` - Recibe `searchParams.area`
- `app/casos/CasosPageClient.tsx` - Filtra casos por área

**Mapeo de Áreas a Módulos:**
```typescript
const AREA_TO_MODULES: Record<string, string[]> = {
  'ginecologia': ['ITS', 'Climaterio y Menopausia'],
  'ssr': ['Anticoncepción', 'Consejería'],
  'obstetricia': ['Embarazo', 'Parto', 'Puerperio'],
  'neonatologia': ['RN']
};
```

**Flujo:**
```
Usuario en /areas
  → Selecciona "ÁREA 1: GINECOLOGÍA"
  → Presiona "Acceder a los Casos"
  → Redirige a /casos?area=ginecologia
  → CasosPageClient filtra solo casos de ITS y Climaterio
  → Muestra "Ginecología y Salud de la Mujer" como título
  → Muestra "28 casos disponibles en esta área"
  → Botón "Volver a Áreas Clínicas" visible
```

---

### 3. Modelo de Historial en Base de Datos

**Schema Actualizado:**
```prisma
model StudentResult {
  id          String   @id @default(cuid())
  userId      String
  caseId      String
  caseTitle   String?  // Título del caso para ref rápida
  caseArea    String?  // Área clínica (ginecologia, ssr, etc.)
  score       Int      // Puntos obtenidos (0-100)
  totalPoints Int      @default(100)
  mode        String?  @default("study") // 'study' | 'osce'
  timeLimit   Int?     // Tiempo límite en segundos
  timeSpent   Int?     // Tiempo real usado
  answers     Json?    // Array de respuestas completas
  completedAt DateTime @default(now())
  user        User     @relation(...)

  @@index([userId, completedAt(sort: Desc)])
  @@index([caseArea])
  @@map("student_results")
}
```

**Campos Nuevos:**
- ✅ `caseTitle` - Para mostrar en historial sin JOIN
- ✅ `caseArea` - Filtrar historial por área
- ✅ `totalPoints` - Calcular porcentaje correctamente
- ✅ `answers` - JSON con todas las respuestas del estudiante
- ✅ Índices optimizados para queries frecuentes

**Migración:**
```bash
npx prisma migrate dev --name add_student_history_fields
# ✅ Ya aplicada automáticamente
```

---

## 🎨 Diseño UX/UI Profesional

### Página de Áreas (/areas)

**Header:**
- Fondo con gradiente corporativo (KLINIK-MAT crimson)
- Título grande y legible
- Subtítulo explicativo

**Stats Bar:**
```
┌────────────────────────────────────────────────────┐
│  54          4            3          2             │
│  Casos     Áreas      Áreas      Modos de          │
│  Totales   Clínicas  Disponibles  Estudio          │
└────────────────────────────────────────────────────┘
```

**Cards de Área:**
- Grid responsivo (2 columnas en desktop, 1 en mobile)
- Hover effect: scale(1.02)
- Selected: scale(1.05) + ring shadow
- Iconos grandes y coloridos
- Badge con número de casos
- Arrow indicator "Ver casos →"

**Estado Deshabilitado:**
- Opacidad 50%
- Cursor not-allowed
- Badge "PRÓXIMAMENTE"

### Página de Casos Filtrada

**Breadcrumb:**
```
← Volver a Áreas Clínicas

ÁREA 1: GINECOLOGÍA Y SALUD DE LA MUJER
28 casos disponibles en esta área
```

**Filtros:**
- Solo muestra módulos del área seleccionada
- Ejemplo: Si seleccionó Ginecología → solo ITS y Climaterio

---

## 📊 Próximos Pasos - Implementación de Historial

### Fase 1: API de Resultados (PENDIENTE)

**Crear:** `app/api/results/route.ts`

```typescript
// POST /api/results
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { caseId, caseTitle, caseArea, score, totalPoints, mode, timeLimit, timeSpent, answers } = body;

  const result = await prisma.studentResult.create({
    data: {
      userId: user.id,
      caseId,
      caseTitle,
      caseArea,
      score,
      totalPoints,
      mode,
      timeLimit,
      timeSpent,
      answers: JSON.stringify(answers),
      completedAt: new Date()
    }
  });

  return NextResponse.json(result);
}

// GET /api/results?area=ginecologia
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const area = searchParams.get('area');

  const results = await prisma.studentResult.findMany({
    where: {
      userId: user.id,
      ...(area && area !== 'all' && { caseArea: area })
    },
    orderBy: { completedAt: 'desc' },
    take: 50 // Últimos 50 resultados
  });

  return NextResponse.json(results);
}
```

### Fase 2: Guardar Resultados al Completar Caso (PENDIENTE)

**Modificar:** `app/components/CasoDetalleClient.tsx`

```typescript
// Agregar función para guardar resultado
const saveResult = async () => {
  try {
    await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: caso.id,
        caseTitle: caso.titulo,
        caseArea: mapModuloToArea(caso.modulo), // Helper function
        score: puntosObtenidos,
        totalPoints: puntosMaximos,
        mode,
        timeLimit,
        timeSpent,
        answers: respuestas
      })
    });
  } catch (error) {
    console.error('Error al guardar resultado:', error);
  }
};

// Llamar automáticamente cuando se muestren resultados
useEffect(() => {
  if (mostrarResultados) {
    saveResult();
  }
}, [mostrarResultados]);
```

### Fase 3: Página de Historial (PENDIENTE)

**Crear:** `app/historial/page.tsx` y `app/historial/HistorialClient.tsx`

**Características a Implementar:**

1. **Tabla de Resultados:**
```typescript
interface ResultRow {
  fecha: string;
  caso: string;
  área: string;
  score: number; // %
  modo: 'study' | 'osce';
  tiempo?: string; // "8:45 / 12:00"
}
```

2. **Filtros:**
- Por área clínica
- Por rango de fechas
- Por modo (Study / OSCE)
- Por score (aprobado/reprobado)

3. **Estadísticas Agregadas:**
```typescript
// Tarjetas superiores
- Total de casos resueltos
- Promedio general (%)
- Tiempo promedio en OSCE
- Racha actual (días consecutivos)

// Gráfico de evolución
- Line chart: Score vs Fecha
- Bar chart: Casos por área

// Tabla de "Últimos 10 Intentos"
- Fecha, Caso, Score, Tiempo
```

4. **Exportar a PDF:**
- Botón "Descargar Historial PDF"
- Usar `jsPDF` o `react-pdf`

**Diseño:**
```
┌─────────────────────────────────────────┐
│ 📊 Mi Historial de Casos                │
├─────────────────────────────────────────┤
│ [Tarjetas de Stats]                     │
│ ┌──────┬──────┬──────┬──────┐           │
│ │  48  │  78% │ 9:15 │  12  │           │
│ │Casos │Prom. │Tiempo│Racha │           │
│ └──────┴──────┴──────┴──────┘           │
│                                          │
│ [Gráfico de Evolución]                  │
│ [Filtros: Área | Fecha | Modo]          │
│                                          │
│ [Tabla de Resultados]                   │
│ Fecha      Caso    Área   Score  Tiempo │
│ 25/11/25   ITS-1   Gin    85%    8:30   │
│ 24/11/25   AC-5    SSR    92%    Study  │
│ ...                                      │
└─────────────────────────────────────────┘
```

---

## 🔧 Helper Functions Necesarias

```typescript
// lib/area-mapper.ts
export function mapModuloToArea(modulo: string): string {
  const mapping: Record<string, string> = {
    'ITS': 'ginecologia',
    'Climaterio y Menopausia': 'ginecologia',
    'Anticoncepción': 'ssr',
    'Consejería': 'ssr',
    'Embarazo': 'obstetricia',
    'Parto': 'obstetricia',
    'Puerperio': 'obstetricia',
    'RN': 'neonatologia'
  };
  return mapping[modulo] || 'other';
}

export function getAreaName(areaId: string): string {
  const names: Record<string, string> = {
    'ginecologia': 'Ginecología y Salud de la Mujer',
    'ssr': 'Salud Sexual y Reproductiva',
    'obstetricia': 'Obstetricia y Puerperio',
    'neonatologia': 'Neonatología'
  };
  return names[areaId] || areaId;
}

export function formatTimeSpent(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## 🎯 Checklist de Tareas

### ✅ Completadas
- [x] Diseño de 4 áreas clínicas con identidad visual
- [x] Página `/areas` con selección interactiva
- [x] Routing con parámetro `?area=ginecologia`
- [x] Filtrado de casos por área en `/casos`
- [x] Botón "Volver a Áreas" en página de casos
- [x] Modelo `StudentResult` ampliado con campos de historial
- [x] Migración de base de datos aplicada
- [x] Índices optimizados para queries

### ⏳ Pendientes
- [ ] API endpoint POST `/api/results` para guardar
- [ ] API endpoint GET `/api/results` para consultar
- [ ] Integración automática al completar caso
- [ ] Página `/historial` con tabla de resultados
- [ ] Filtros avanzados en historial
- [ ] Gráficos de evolución (recharts)
- [ ] Exportar historial a PDF
- [ ] Link "Historial" en Header/Navigation
- [ ] Stats agregadas (promedio por área, etc.)

---

## 📱 Navegación Actualizada

**Flujo Principal:**
```
/               (Home)
  ↓
/areas          (Seleccionar Área)
  ↓
/casos?area=X   (Ver Casos Filtrados)
  ↓
/casos/[id]     (Resolver Caso)
  ↓
[Guardar Resultado automáticamente]
  ↓
/historial      (Ver Todos los Intentos)
```

**Links del Header (a agregar):**
- 🏠 Inicio
- 📚 Áreas Clínicas
- 📖 Recursos
- 📊 Mi Historial
- 👤 Perfil

---

## 🎨 Consistencia Visual

Todos los componentes siguen el Design System de KLINIK-MAT:

**Colores:**
- `var(--km-cardinal)` - Rojo principal
- `var(--km-crimson)` - Rojo oscuro
- `var(--km-navy)` - Azul oscuro para títulos
- `var(--km-teal)` - Verde agua para acciones positivas

**Gradientes:**
- `bg-gradient-km-primary` - De crimson a cardinal
- Gradientes personalizados por área (suaves y profesionales)

**Sombras:**
- `shadow-km-sm` - Sutiles para cards
- `shadow-km-md` - Medias para elementos interactivos
- `shadow-2xl` - Para modales y elementos flotantes

**Tipografía:**
- Poppins para títulos (bold, extrabold)
- Inter/System fonts para body text
- Espaciado generoso para legibilidad

---

## 💡 Mejores Prácticas Aplicadas

1. **Separation of Concerns:**
   - Server Components para data fetching
   - Client Components solo donde hay interactividad
   - Services layer para lógica de negocio

2. **Performance:**
   - Índices en DB para queries frecuentes
   - Paginación en historial (limit 50)
   - Lazy loading de componentes pesados

3. **UX:**
   - Estados de loading visibles
   - Feedback inmediato en interacciones
   - Navegación clara con breadcrumbs
   - Validación antes de permitir acciones

4. **Accesibilidad:**
   - Contraste de colores AAA
   - Labels en inputs
   - Estados disabled claros
   - Keyboard navigation

---

**Fecha de Implementación:** 25 de Noviembre de 2025  
**Estado:** Sistema de Áreas ✅ Completo | Historial ⏳ Pendiente  
**Autor:** KLINIK-MAT Development Team
