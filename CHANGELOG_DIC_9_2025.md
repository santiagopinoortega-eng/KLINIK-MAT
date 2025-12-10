# 📋 CHANGELOG - 9 de Diciembre 2025

## 🎯 Resumen de la Sesión

**Duración:** Sesión completa de debugging y mejoras
**Objetivo Principal:** Resolver problemas críticos de CSRF, guardado de datos y optimización

---

## ✅ PROBLEMAS CRÍTICOS RESUELTOS

### 1. Sistema CSRF Completamente Funcional

**Problema Inicial:**
- ❌ Token CSRF se guardaba en cookie `httpOnly=true`
- ❌ JavaScript NO podía leer cookies httpOnly con `document.cookie`
- ❌ `getCsrfTokenFromCookie()` siempre retornaba `null`
- ❌ Todas las mutaciones (POST/PATCH/DELETE) fallaban con 403 Forbidden
- ❌ Resultados de casos no se guardaban
- ❌ Cambios de perfil no se guardaban

**Root Cause:**
```typescript
// Cookie httpOnly no accesible desde JavaScript
response.cookies.set('csrf-token', token, {
  httpOnly: true,  // ← Bloquea acceso desde JS
  ...
});

// Intento de lectura fallaba
const token = document.cookie.split(';').find(...); // ← null siempre
```

**Solución Implementada:**
1. **Token en memoria** (`lib/csrf-client.ts`):
   ```typescript
   let csrfTokenInMemory: string | null = null;
   
   export function setCsrfTokenInMemory(token: string): void {
     csrfTokenInMemory = token;
   }
   
   export function getCsrfTokenFromCookie(): string | null {
     // Primero busca en memoria
     if (csrfTokenInMemory) return csrfTokenInMemory;
     // Fallback a cookie (por si no es httpOnly)
     // ...
   }
   ```

2. **API retorna token en body** (`app/api/csrf/route.ts`):
   ```typescript
   const response = NextResponse.json({
     ok: true,
     token  // ← Incluido en response body
   });
   ```

3. **Auto-inicialización** (`app/components/CsrfInitializer.tsx`):
   ```typescript
   fetch('/api/csrf')
     .then(res => res.json())
     .then(data => {
       setCsrfTokenInMemory(data.token);
       console.log('✅ CSRF token initialized and stored');
     });
   ```

4. **Auto-fetch en helpers** (`lib/fetch-with-csrf.ts`):
   ```typescript
   let token = getCsrfTokenFromCookie();
   if (!token) {
     const csrfResponse = await fetch('/api/csrf');
     const csrfData = await csrfResponse.json();
     setCsrfTokenInMemory(csrfData.token);
     token = csrfData.token;
   }
   ```

**Archivos Modificados:**
- ✅ `lib/csrf-client.ts` - Token en memoria
- ✅ `lib/fetch-with-csrf.ts` - Auto-fetch con validación
- ✅ `app/api/csrf/route.ts` - Token en response body
- ✅ `app/components/CsrfInitializer.tsx` - Inicialización automática
- ✅ `lib/csrf.ts` - Logging de validación

**Resultado:**
```
✅ Token se guarda en memoria
✅ Token se envía en header x-csrf-token
✅ Servidor valida correctamente
✅ hasCookie: true, hasHeader: true, match: true
```

---

### 2. Validación de Case ID Corregida

**Problema:**
```
[ERROR] Error en campo caseId: ID de caso inválido
POST /api/results 500
```

**Root Cause:**
```typescript
// lib/sanitize.ts - REGEX INCORRECTO
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Esperaba UUID v4, pero los IDs son slugs
```

**IDs Reales:**
- `ac-baja-postparto-migrante`
- `cx-consejeria-uso-condon-adolescente`
- `ob-hemorragia-postparto`

**Solución:**
```typescript
// Cambiar regex para aceptar slugs
const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function sanitizeCaseId(id: string): string {
  const sanitized = id.trim();
  
  if (!slugRegex.test(sanitized)) {
    throw new Error('ID de caso inválido: debe ser un slug válido');
  }
  
  if (sanitized.length > 100) {
    throw new Error('ID de caso demasiado largo');
  }
  
  return sanitized;
}
```

**Resultado:**
```
✅ POST /api/results 201 Created
✅ Resultados se guardan correctamente
✅ Aparecen en Mi Progreso
```

---

### 3. Guardado de Perfil Funcionando

**Problema:**
```
PATCH /api/profile 403 Forbidden
hasHeader: false ← No se enviaba token
```

**Root Cause:**
```typescript
// MiProgresoClient.tsx - USO DIRECTO DE fetch()
const res = await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
});
// ← NO agrega x-csrf-token automáticamente
```

**Solución:**
```typescript
// Cambiar a patchJSON que incluye CSRF
import { patchJSON } from '@/lib/fetch-with-csrf';

const result = await patchJSON('/api/profile', {
  country: formData.country || null,
  university: formData.university || null,
  yearOfStudy: formData.yearOfStudy ? parseInt(...) : null,
  specialty: formData.specialty || null,
});
```

**Resultado:**
```
✅ PATCH /api/profile 200 OK
✅ País, universidad, año guardados
✅ Datos persisten en base de datos
```

---

### 4. CSP Headers Actualizados

**Problema:**
```
Creating a worker from 'blob:...' violates CSP directive
Loading script 'va.vercel-scripts.com' violates CSP directive
```

**Solución:**
```javascript
// next.config.mjs
const SCRIPT_SRC_BASE = [
  "'self'", 
  "'unsafe-inline'", 
  'https://*.clerk.accounts.dev',
  'https://va.vercel-scripts.com',  // ← Agregado
];

const WORKER_SRC = ["'self'", 'blob:'].join(' ');  // ← Nuevo

const CSP = [
  // ...
  `worker-src ${WORKER_SRC}`,  // ← Agregado
  // ...
].join('; ');
```

**Resultado:**
```
✅ Clerk workers funcionan sin errores
✅ Vercel Analytics carga correctamente
✅ Sin violaciones de CSP en consola
```

---

## 📊 OPTIMIZACIONES IMPLEMENTADAS

### 1. Rate Limits Ajustados

**Antes:**
```typescript
AUTHENTICATED: 60 req/min   ← Bloqueaba uso normal
WRITE: 30 req/min           ← Muy restrictivo
RESULTS: 20 req/min         ← Insuficiente
```

**Después:**
```typescript
AUTHENTICATED: 200 req/min  ✅ Permite navegación fluida
WRITE: 100 req/min          ✅ Múltiples actualizaciones
RESULTS: 50 req/min         ✅ Guardar múltiples casos
```

### 2. FavoritesContext Implementado

**Problema:**
- Cada `CaseCard` renderizaba `FavoriteButton`
- Cada botón llamaba `useFavorites()` independientemente
- 50+ requests simultáneos → 429 Too Many Requests

**Solución:**
```typescript
// app/context/FavoritesContext.tsx
export const FavoritesProvider = ({ children }) => {
  const favoritesData = useFavorites();  // ← UNA sola llamada
  
  return (
    <FavoritesContext.Provider value={favoritesData}>
      {children}
    </FavoritesContext.Provider>
  );
};

// app/components/FavoriteButton.tsx
const { favorites, toggleFavorite } = useFavoritesContext();  // ← Usa contexto
```

**Resultado:**
```
✅ 50+ requests → 1 request
✅ /favoritos carga instantáneamente
✅ Sin errores de rate limiting
```

### 3. Auto-Refresh en Mi Progreso

**Implementación:**
```typescript
// MiProgresoClient.tsx
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchData();  // Refresca cuando vuelves al tab
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => removeEventListener('visibilitychange', handleVisibilityChange);
}, [selectedArea]);

// useUserProgress.ts
// Mismo patrón para filtros de progreso
```

**Resultado:**
```
✅ Datos frescos al volver al tab
✅ No necesita F5 manual
✅ Cache busting con timestamps
```

---

## 🔧 DEBUGGING IMPLEMENTADO

### Logging Comprehensivo

**Agregado en:**

1. **csrf-client.ts:**
   ```typescript
   🔍 Token found in memory: xxx...
   ⚠️ No token in memory, trying cookie...
   ❌ No CSRF cookie found
   💾 Token saved in memory: xxx...
   ```

2. **fetch-with-csrf.ts:**
   ```typescript
   🔑 CSRF token added to request: xxx...
   ⚠️ No CSRF token available for PATCH /api/...
   🔧 patchJSON called: { url, hasToken }
   ✅ CSRF token obtained and stored in memory
   ```

3. **lib/csrf.ts (servidor):**
   ```typescript
   🔍 CSRF Validation: {
     hasCookie: true,
     hasHeader: true,
     cookiePreview: 'xxx...',
     headerPreview: 'xxx...'
   }
   🔍 CSRF tokens match: true
   ```

4. **CasoDetalleClient.tsx:**
   ```typescript
   🔄 Intentando guardar resultado...
   📡 Respuesta del servidor: { ok, data, error }
   ✅ Resultado guardado
   ❌ Error al guardar: ...
   ```

5. **MiProgresoClient.tsx:**
   ```typescript
   📊 Resultados cargados: { success, totalResults, ... }
   🔧 Guardando perfil...
   ✅ Perfil guardado exitosamente
   ```

**Beneficios:**
- ✅ Diagnóstico inmediato de problemas
- ✅ Trazabilidad completa del flujo CSRF
- ✅ Fácil identificar dónde falla cada paso

---

## 📝 COMMITS REALIZADOS

1. **`9e06f1f`** - feat: Implementar búsqueda por contenido y filtros de progreso
2. **`ed37dfc`** - fix: Resolver problemas de rate limiting y optimizar carga de favoritos
3. **`5c6867f`** - fix: Resolver problema de resultados no guardados y agregar auto-refresh
4. **`8b2f10f`** - fix: Solucionar problema CSRF token faltante/inválido
5. **`d146c15`** - fix: Mejorar obtención de CSRF token con verificación y delay
6. **`d36cb42`** - fix: Resolver problema httpOnly cookie con token en memoria
7. **`0bec42b`** - debug: Agregar logging extensivo para diagnosticar CSRF
8. **`3152dfa`** - fix: Corregir validación de caseId para aceptar slugs

---

## 🎯 PRÓXIMAS MEJORAS (Para mañana)

### 1. Revisión de Respuestas Incorrectas (ALTA PRIORIDAD)

**Objetivo:** Ayudar al estudiante a aprender de sus errores

**Implementación:**
```typescript
// Después de completar caso, mostrar:
interface RespuestaDetallada {
  pregunta: string;
  tuRespuesta: string;
  respuestaCorrecta: string;
  feedback: string;
  esCorrecta: boolean;
}

// Componente nuevo: app/components/ReviewIncorrectAnswers.tsx
// Mostrar tabla con:
// - ❌ Respuestas incorrectas resaltadas en rojo
// - ✅ Respuestas correctas resaltadas en verde
// - 💡 Feedback del docente
// - 📚 Link a guías/recursos MINSAL
```

**Beneficios:**
- Aprendizaje activo desde errores
- Refuerzo de conocimientos
- Conexión con material de estudio

---

### 2. Historial de Intentos por Caso (MEDIA PRIORIDAD)

**Objetivo:** Ver evolución y progreso en casos repetidos

**Implementación:**
```typescript
// En página de caso: /casos/[id]
interface IntentoHistorial {
  fecha: Date;
  score: number;
  tiempo: number;
  mode: 'study' | 'timed' | 'exam';
}

// Componente: app/components/CaseAttemptHistory.tsx
// Mostrar:
// - Timeline de intentos
// - Gráfico de tendencia (mejoró/empeoró)
// - Mejor score alcanzado
// - Promedio de tiempo
```

**Beneficios:**
- Motivación al ver mejora
- Identificar casos problemáticos
- Saber cuándo dominar un caso

---

### 3. Badges Visuales de Estado (BAJA PRIORIDAD)

**Objetivo:** Feedback visual inmediato del progreso

**Implementación:**
```typescript
// En CaseCard agregar badge
<div className="badge">
  {status === 'not-attempted' && <span>🆕 Nuevo</span>}
  {status === 'failed' && <span className="text-red">❌ 45%</span>}
  {status === 'passed' && <span className="text-yellow">✓ 75%</span>}
  {status === 'mastered' && <span className="text-green">✅ 95%</span>}
</div>
```

**Beneficios:**
- At-a-glance progress
- Gamificación visual
- Motivación para mejorar

---

### 4. Limpiar Logs de Debugging (MANTENIMIENTO)

**Acción:**
- Remover `console.log` de producción
- Mantener solo logs críticos
- Usar niveles: error, warn, info, debug
- Integrar con Sentry para errores

**Archivos a limpiar:**
- `lib/csrf-client.ts`
- `lib/fetch-with-csrf.ts`
- `lib/csrf.ts`
- `app/components/CasoDetalleClient.tsx`
- `app/mi-progreso/MiProgresoClient.tsx`

---

## 📈 ESTADO ACTUAL DEL SISTEMA

### ✅ Funcionalidades Operativas

1. **Autenticación y Seguridad**
   - ✅ CSRF protection funcional
   - ✅ Tokens en memoria
   - ✅ Validación servidor
   - ✅ Rate limiting ajustado

2. **Casos Clínicos**
   - ✅ 54 casos disponibles
   - ✅ Modo Study/Timed/Exam
   - ✅ Timer funcional
   - ✅ Guardado de resultados
   - ✅ Feedback inmediato

3. **Progreso del Usuario**
   - ✅ Mi Progreso con estadísticas
   - ✅ Filtros por área
   - ✅ Auto-refresh
   - ✅ Historial completo

4. **Sistema de Favoritos**
   - ✅ Marcar/desmarcar casos
   - ✅ Página de favoritos
   - ✅ Contexto compartido
   - ✅ Sin rate limit errors

5. **Búsqueda y Filtros**
   - ✅ Búsqueda por contenido
   - ✅ Filtros de progreso (Nuevos, Fallé, Repasar, Dominados)
   - ✅ Búsqueda en vignette, título, preguntas

6. **Perfil de Usuario**
   - ✅ Guardar país, universidad
   - ✅ Año de estudio, especialidad
   - ✅ Datos persisten en BD

### ⏳ Pendientes

1. ⏳ Revisión de respuestas incorrectas
2. ⏳ Historial de intentos por caso
3. ⏳ Badges visuales de estado
4. ⏳ Limpiar logs de debugging
5. ⏳ Tests unitarios
6. ⏳ Tests E2E
7. ⏳ Optimización de imágenes
8. ⏳ ISR para casos estáticos

---

## 🏆 LOGROS DE LA SESIÓN

- ✅ **3 bugs críticos resueltos** (CSRF, caseId, profile)
- ✅ **8 commits** con documentación detallada
- ✅ **5 archivos** creados/modificados significativamente
- ✅ **Sistema 100% funcional** para uso estudiantil
- ✅ **Logging comprehensivo** para futuros debugs
- ✅ **Base sólida** para próximas features

---

## 🎓 Lecciones Aprendidas

1. **httpOnly cookies** no son accesibles desde JavaScript → usar memoria o localStorage
2. **Validación de tipos** debe coincidir con schema real (slug vs UUID)
3. **Context API** es excelente para eliminar requests duplicados
4. **Logging detallado** ahorra horas de debugging
5. **Auto-refresh** mejora UX significativamente
6. **CSRF auto-fetch** hace el sistema robusto y user-friendly

---

**Fin del Changelog - 9 de Diciembre 2025**
