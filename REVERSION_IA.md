# Reversión del Sistema de IA (Gemini Flash)

**Fecha:** 3 de enero de 2026
**Motivo:** Error en el deploy. Decisión de NO integrar sistema de IA en este momento.

## ✅ Cambios Revertidos

### Backend IA (Eliminado)
- ❌ `lib/gemini.ts` - Cliente de Gemini API con rate limiting
- ❌ `lib/ai/prompts.ts` - Sistema de prompts socráticos con 7 guardrails
- ❌ `lib/ai/evaluar-short.ts` - Evaluación automática de preguntas SHORT
- ❌ `app/api/ai/tutor/route.ts` - Endpoint tutor socrático
- ❌ `app/api/ai/evaluar-short/route.ts` - Endpoint evaluación SHORT
- ❌ `app/api/ai/gaps/route.ts` - Endpoint detección de gaps
- ❌ `app/api/ai/estadisticas/route.ts` - Endpoint estadísticas de IA

### Frontend IA (Eliminado)
- ❌ `app/components/TutorButton.tsx` - Botón de tutor IA
- ❌ `app/components/GapsAnalysis.tsx` - Visualización de análisis de gaps
- ❌ `app/hooks/useAITutor.ts` - Hook React para IA

### Generador de Casos IA (Eliminado)
- ❌ `scripts/ai/generar-caso.ts` - Generador con Claude/GPT-4
- ❌ `scripts/ai/prompts.ts` - Prompts para generación
- ❌ `scripts/ai/validar-caso.ts` - Validador de casos generados
- ❌ `scripts/ai/validar-casos-batch.ts` - Validación batch
- ❌ `scripts/ai/README.md` - Documentación del generador
- ❌ `scripts/ai/QUICK_START.md` - Guía rápida

### Base de Datos (Revertida)
**Modelos eliminados:**
- ❌ `AiUsage` - Registro de uso de IA
- ❌ `CacheEntry` - Cache general

**Campos eliminados del modelo `Case`:**
- ❌ `objetivosAprendizaje: String[]`
- ❌ `blueprint: Json`
- ❌ `escenario: Json`
- ❌ `feedbackDinamico: Json`
- ❌ `referencias: String[]`
- ❌ `aprendizaje: Json`
- ❌ `ai: Json`

**Relaciones eliminadas:**
- ❌ `User.aiUsage`
- ❌ `Case.aiUsage`

**Migración creada:**
```
prisma/migrations/20260103211650_remove_ai_system/migration.sql
```

### Dependencias (Eliminadas)
- ❌ `@google/generative-ai` v0.24.1

**Scripts npm eliminados:**
- ❌ `npm run generar:casos`
- ❌ `npm run validar:casos`

### Documentación (Eliminada)
- ❌ `SISTEMA_IA.md` - Documentación completa del sistema
- ❌ `CONFIGURACION_IA.md` - Configuración de API keys
- ❌ `EJEMPLO_INTEGRACION_IA.md` - Ejemplos de uso
- ❌ `RESUMEN_IMPLEMENTACION_IA.md` - Resumen técnico
- ❌ `IMPLEMENTACION_COMPLETA.txt` - Log completo
- ❌ `ROTACION_API_KEYS.md` - Sistema de rotación de keys

### Estructura de Casos (Restaurada)
**Eliminado:**
- ❌ `prisma/cases/hpp-atonia-v2.json5` (caso complejo con escenario de 426 líneas)

**Restaurado desde commit `895aad3`:**
- ✅ `prisma/cases.json5` - Archivo raíz de casos
- ✅ `prisma/cases/CASOS_README.md` - Documentación
- ✅ `prisma/cases/OBSTETRICIA/EMBARAZO.json5`
- ✅ `prisma/cases/OBSTETRICIA/PARTO.json5`
- ✅ `prisma/cases/OBSTETRICIA/PUERPERIO.json5`
- ✅ `prisma/cases/GINECOLOGIA/CLIMATERIO.json5`
- ✅ `prisma/cases/GINECOLOGIA/ITS.json5`
- ✅ `prisma/cases/SSR/ANTICONCEPCION.json5`
- ✅ `prisma/cases/SSR/CONSEJERIA.json5`
- ✅ `prisma/cases/NEONATOLOGIA/RN.json5`

---

## ✅ Cambios Conservados (Mejoras de Seguridad)

### Protección CSRF
- ✅ `lib/csrf.ts` - Sistema de tokens CSRF
- ✅ `lib/csrf-client.ts` - Cliente CSRF para frontend
- ✅ Implementado en:
  * `app/api/favorites/route.ts`
  * `app/api/profile/route.ts`
  * `app/api/engagement/route.ts`
  * `app/api/results/route.ts` (ya lo tenía)

### Sanitización de Input
- ✅ `lib/sanitize.ts` - Funciones de sanitización
  * `sanitizeCaseId()`
  * `sanitizeString()`
  * `sanitizeEnum()`
- ✅ Implementado en todos los endpoints mencionados

### Rate Limiting
- ✅ `lib/ratelimit.ts` - Sistema de rate limiting
- ✅ Implementado en:
  * `app/api/engagement/route.ts`

### Documentación de Seguridad
- ✅ `SEGURIDAD_ISSUES_RESUELTOS.md` (actualizado, sin referencias a IA)
- ✅ Análisis de arquitectura (mantiene sección de seguridad)

---

## 📊 Comparación de Estructura

### Antes (con IA) - Commit `e135ddd`
```
app/
├── api/
│   ├── ai/                      ❌ ELIMINADO
│   │   ├── tutor/
│   │   ├── evaluar-short/
│   │   ├── gaps/
│   │   └── estadisticas/
│   ├── favorites/              ✅ CONSERVADO (con CSRF)
│   └── profile/                ✅ CONSERVADO (con CSRF)
├── components/
│   ├── TutorButton.tsx         ❌ ELIMINADO
│   └── GapsAnalysis.tsx        ❌ ELIMINADO
└── hooks/
    └── useAITutor.ts           ❌ ELIMINADO

lib/
├── gemini.ts                   ❌ ELIMINADO
├── ai/                         ❌ ELIMINADO
│   ├── prompts.ts
│   └── evaluar-short.ts
├── csrf.ts                     ✅ CONSERVADO
├── sanitize.ts                 ✅ CONSERVADO
└── ratelimit.ts                ✅ CONSERVADO

prisma/
├── cases/
│   └── hpp-atonia-v2.json5     ❌ ELIMINADO
└── schema.prisma
    ├── AiUsage                 ❌ ELIMINADO
    └── CacheEntry              ❌ ELIMINADO
```

### Después (sin IA) - Commit actual
```
app/
├── api/
│   ├── favorites/              ✅ (con CSRF + sanitización)
│   ├── profile/                ✅ (con CSRF + sanitización)
│   └── engagement/             ✅ (con CSRF + rate limiting)
└── components/
    └── [componentes estándar]

lib/
├── csrf.ts                     ✅
├── sanitize.ts                 ✅
└── ratelimit.ts                ✅

prisma/
├── cases/                      ✅ RESTAURADO
│   ├── cases.json5
│   ├── CASOS_README.md
│   ├── OBSTETRICIA/
│   │   ├── EMBARAZO.json5
│   │   ├── PARTO.json5
│   │   └── PUERPERIO.json5
│   ├── GINECOLOGIA/
│   │   ├── CLIMATERIO.json5
│   │   └── ITS.json5
│   ├── SSR/
│   │   ├── ANTICONCEPCION.json5
│   │   └── CONSEJERIA.json5
│   └── NEONATOLOGIA/
│       └── RN.json5
└── schema.prisma               ✅ (sin modelos de IA)
```

---

## 🔄 Próximos Pasos

1. **Aplicar migración** (cuando la BD esté disponible):
   ```bash
   npx prisma migrate deploy
   ```

2. **Verificar build de producción**:
   ```bash
   npm run build
   ```

3. **Re-deployar a Vercel**:
   ```bash
   git push origin main
   ```

4. **Verificar que funcionen**:
   - ✅ Login/Signup
   - ✅ Navegación de casos
   - ✅ Resolución de casos
   - ✅ Favoritos
   - ✅ Perfil
   - ✅ Métricas de engagement

---

## 📝 Notas Técnicas

### Por qué esta reversión
- **Error en deploy**: El sistema de IA causó errores en producción
- **Decisión de negocio**: Se decidió posponer la integración de IA
- **Arquitectura compleja**: El sistema de escenarios JSON complejos no es necesario ahora

### Qué se mantiene
- **Mejoras de seguridad**: CSRF, sanitización, rate limiting (Score 9.2/10)
- **Estructura de casos simple**: JSON5 con `vignette`, `questions`, `options`
- **Sistema de suscripciones**: Mercado Pago funcionando
- **Métricas y analytics**: engagement, study sessions, resultados

### Migración segura
La reversión es **segura** porque:
1. Las tablas `ai_usage` y `cache_entries` se eliminan con `DROP TABLE IF EXISTS`
2. Los campos del modelo `Case` se eliminan con `DROP COLUMN IF EXISTS`
3. No hay datos de producción en esas tablas (sistema nuevo)
4. La estructura de casos anterior está respaldada en Git

---

**Commit anterior con IA**: `e135ddd`
**Commit de restauración**: `895aad3`
**Commit actual**: (pendiente - reversión completa)
