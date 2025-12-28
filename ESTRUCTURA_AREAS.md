# 📚 Estructura de Áreas Clínicas - KLINIK-MAT

## 🎯 Nueva Organización (8 Áreas)

Sistema escalable diseñado para soportar **500+ casos clínicos** con filtrado dinámico.

### Áreas Clínicas

1. **Embarazo y Control Prenatal** (`embarazo`)
   - Control prenatal normal y de alto riesgo
   - Ecografía obstétrica
   - Patología del embarazo
   - Screening prenatal

2. **Parto y Atención Intraparto** (`parto`)
   - Trabajo de parto normal
   - Monitoreo fetal intraparto
   - Atención del parto vaginal
   - Distocias

3. **Puerperio y Lactancia** (`puerperio`)
   - Puerperio fisiológico
   - Puerperio patológico
   - Lactancia materna
   - Manejo de complicaciones posparto

4. **Urgencias Obstétricas** (`urgencias-obstetricas`) ✅ **ACTIVO (1 caso)**
   - Hemorragia obstétrica (HPP, DPP)
   - Trastornos hipertensivos
   - Emergencias maternas
   - Código rojo obstétrico

5. **Ginecología** (`ginecologia`)
   - Patología ginecológica benigna
   - Climaterio y menopausia
   - Endocrinología ginecológica
   - Infertilidad

6. **Salud Sexual y Anticoncepción** (`salud-sexual`)
   - Regulación de fertilidad
   - Métodos anticonceptivos
   - Consejería en salud sexual
   - Derechos sexuales y reproductivos

7. **ITS (Infecciones de Transmisión Sexual)** (`its`)
   - Diagnóstico de ITS
   - Tratamiento y seguimiento
   - Prevención y educación
   - Manejo de parejas

8. **Neonatología / Recién Nacido** (`neonatologia`)
   - Atención inmediata del RN
   - Reanimación neonatal
   - Patología neonatal
   - Evaluación del RN sano

---

## � Estructura de Preguntas por Dificultad

### Reglas estrictas (validadas automáticamente):

| Dificultad | Total | MCQ (A-D) | Desarrollo (SHORT) |
|------------|-------|-----------|-------------------|
| **BAJA**   | 6     | 6         | 0                 |
| **MEDIA**  | 7     | 6         | 1                 |
| **ALTA**   | 8     | 7         | 1                 |

**Todas las preguntas MCQ deben tener exactamente 4 opciones (A, B, C, D)**

### Validación automática

El sistema valida automáticamente:
- ✅ Número correcto de preguntas según dificultad
- ✅ Proporción MCQ vs SHORT
- ✅ Exactamente 4 opciones por MCQ (A-D)

Archivo de validación: [lib/case-validation.ts](lib/case-validation.ts)

---

## �🗂️ Estructura de Base de Datos

### Modelo `Case` (Prisma)

```prisma
model Case {
  id       String  @id
  title    String
  area     String  // Una de las 8 áreas
  modulo   String? // Submódulo específico (ej: "Hemorragia postparto")
  ...
  @@index([area, isPublic])
  @@index([modulo])
}
```

### Nomenclatura de IDs

Formato: `{area}-{modulo-simplificado}-{numero}`

**Ejemplos:**
- `urgencias-obstetricas-hpp-atonia-001`
- `embarazo-diabetes-gestacional-001`
- `its-sifilis-diagnostico-001`
- `parto-distocia-hombros-001`

---

## 🔄 Flujo de Filtrado

### 1. Usuario selecciona área
```
/areas → Click en "Urgencias Obstétricas"
```

### 2. Navegación con filtro
```
→ /casos?area=urgencias-obstetricas
```

### 3. Normalización (CasosPageClient)
```typescript
normalizeAreaName("Urgencias obstétricas") → "urgencias-obstetricas"
```

### 4. Filtro de DB
```typescript
data.filter(caso => normalizeAreaName(caso.area) === selectedArea)
```

---

## 📊 Sistema Escalable

### ✅ Sin Mapeos Hardcodeados
```typescript
// ❌ Antes (No escalable)
const AREA_TO_MODULES = {
  'obstetricia': ['Embarazo', 'Parto', 'Puerperio']
};

// ✅ Ahora (Escalable)
function normalizeAreaName(area: string): string {
  // Normaliza cualquier variación del nombre
}
```

### ✅ Módulos Dinámicos
```typescript
// Extraídos automáticamente de la DB
const modulos = useMemo(() => {
  const uniqueModulos = new Set<string>();
  areaFilteredData.forEach(d => {
    if (d.modulo) uniqueModulos.add(d.modulo);
  });
  return ['all', ...Array.from(uniqueModulos).sort()];
}, [areaFilteredData]);
```

### ✅ Contadores Automáticos
- AreasClient: Actualizar `caseCount` manualmente por ahora
- Futura mejora: Query agregada en API para contar casos por área

---

## 🛠️ Archivos Modificados

1. **`prisma/schema.prisma`**
   - Comentario actualizado con las 8 áreas

2. **`app/areas/AreasClient.tsx`**
   - Array `AREAS` reemplazado con 8 nuevas categorías
   - Colores y gradientes específicos

3. **`app/casos/CasosPageClient.tsx`**
   - Función `normalizeAreaName()` actualizada
   - Mapeo `AREA_NAMES` con 8 áreas
   - Filtros dinámicos por `area` y `modulo`

4. **`app/api/cases/route.ts`**
   - Campo `modulo` agregado al `select`

5. **`services/caso.service.ts`**
   - Tipo `CasoListItem` incluye `modulo`

6. **`prisma/cases/hpp-atonia.json5`**
   - ID: `urgencias-obstetricas-hpp-atonia-001`
   - área: `Urgencias obstétricas`

7. **Base de datos**
   - Caso actualizado con nueva área e ID

---

## 🚀 Próximos Pasos

### Para agregar nuevos casos:

1. **Crear archivo JSON5**
   ```bash
   prisma/cases/{area}-{modulo}-{numero}.json5
   ```

2. **Definir área exacta**
   ```json5
   {
     id: 'embarazo-diabetes-001',
     area: 'Embarazo y control prenatal',
     modulo: 'Diabetes gestacional',
     ...
   }
   ```

3. **Importar a DB**
   ```bash
   npx ts-node scripts/import-case-json5.ts prisma/cases/embarazo-diabetes-001.json5
   ```

4. **Actualizar contador en AreasClient**
   ```typescript
   {
     id: 'embarazo',
     available: true,
     caseCount: 1  // Incrementar
   }
   ```

---

## 📈 Capacidad del Sistema

- ✅ Soporta 500+ casos sin cambios estructurales
- ✅ Filtrado por área + módulo
- ✅ Búsqueda full-text
- ✅ Filtrado por dificultad
- ✅ Filtrado por progreso del usuario
- ✅ Paginación y caché

**Listo para escalar** 🎉
