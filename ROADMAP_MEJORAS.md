# 🗺️ ROADMAP DE MEJORAS - KLINIK-MAT

**Fecha:** Diciembre 2025  
**Versión Actual:** 0.1.0  
**Estado del Análisis:** Completo

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual del Proyecto
- ✅ **54 casos clínicos** funcionando correctamente
- ✅ **Design System 4.0** implementado (paleta médica roja)
- ✅ **Timer Mode** (OSCE/Emergency) operativo
- ✅ **Mi Progreso** funcional con persistencia en BD
- ⚠️ **Autenticación deshabilitada** (Clerk comentado)
- ❌ **Sin tests** (0% coverage)
- ❌ **Sin monitoreo** de performance/errores

### Métricas Clave
- **Tecnologías:** Next.js 14.2.33, React 18, Prisma 6.19.0, PostgreSQL (Neon)
- **Base de datos:** 54 casos, 270+ preguntas, usuarios con demografía
- **Rendimiento:** No optimizado (sin ISR, sin caché, imágenes sin comprimir)

---

## 🔴 PRIORIDAD CRÍTICA (Implementar Ya)

### 1. Habilitar Sistema de Autenticación Real ⚠️

**Problema Actual:**
```typescript
// middleware.ts - COMPLETAMENTE DESHABILITADO
// Clerk está comentado, NO hay protección de rutas
const TEMP_USER_ID = 'temp-user-dev'; // Todos comparten el mismo ID
```

**Impacto:**
- ❌ Cualquiera puede acceder sin login
- ❌ Todos los usuarios comparten ID → "Mi Progreso" muestra datos mezclados
- ❌ Sin seguridad en producción
- ❌ Webhooks de Clerk inactivos

**Solución - Paso a Paso:**

1. **Obtener claves válidas de Clerk** (10 min)
   ```bash
   # Dashboard: https://dashboard.clerk.com
   # Crear nuevo proyecto o usar existente
   # Copiar: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   # Copiar: CLERK_SECRET_KEY
   # Configurar: CLERK_WEBHOOK_SECRET
   ```

2. **Actualizar `.env.local`** (5 min)
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_xxxxx"
   CLERK_SECRET_KEY="sk_live_xxxxx"
   CLERK_WEBHOOK_SECRET="whsec_xxxxx"
   ```

3. **Descomentar `middleware.ts`** (5 min)
   ```typescript
   // Restaurar protección de rutas
   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
   
   const isProtectedRoute = createRouteMatcher([
     '/areas(.*)',
     '/casos(.*)',
     '/mi-progreso(.*)',
   ]);
   
   export default clerkMiddleware(async (auth, req) => {
     if (isProtectedRoute(req)) {
       await auth.protect();
     }
   });
   ```

4. **Reemplazar `TEMP_USER_ID` en APIs** (30 min)
   ```typescript
   // app/api/results/route.ts
   // ANTES:
   const userId = TEMP_USER_ID;
   
   // DESPUÉS:
   const { userId } = auth();
   if (!userId) {
     return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
   }
   ```

5. **Probar flujo completo** (20 min)
   - Sign up nuevo usuario
   - Verificar webhook crea user en DB
   - Completar caso → Validar resultado guarda con userId correcto
   - Revisar "Mi Progreso" → Solo debe mostrar resultados propios

**Archivos a modificar:**
- `middleware.ts` (descomentar)
- `app/api/results/route.ts` (reemplazar TEMP_USER_ID)
- `app/api/profile/route.ts` (validar auth)
- `.env.local` (agregar claves)

**Tiempo estimado:** 1.5 horas  
**Impacto:** 🔥🔥🔥 CRÍTICO - Seguridad y funcionalidad básica  
**Dependencias:** Cuenta activa de Clerk  
**Riesgo:** BAJO (código ya existe, solo descomentar)

---

### 2. Testing = 0% Coverage 🧪

**Problema:**
```bash
# Búsqueda de archivos de test
find . -name "*.test.*" -o -name "*.spec.*"
# Resultado: 0 archivos encontrados
```

**Impacto:**
- ❌ Bugs en producción (ej: scoring incorrecto)
- ❌ Regresiones al agregar features
- ❌ Refactoring arriesgado
- ❌ Sin validación de lógica crítica

**Solución - Setup Inicial:**

1. **Instalar dependencias** (10 min)
   ```bash
   npm install --save-dev \
     @testing-library/react \
     @testing-library/jest-dom \
     @testing-library/user-event \
     jest \
     jest-environment-jsdom \
     @types/jest
   ```

2. **Configurar Jest** (15 min)
   ```javascript
   // jest.config.js
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/$1',
     },
     collectCoverageFrom: [
       'app/**/*.{ts,tsx}',
       'lib/**/*.{ts,tsx}',
       '!**/*.d.ts',
       '!**/node_modules/**',
     ],
   };
   
   // jest.setup.js
   import '@testing-library/jest-dom';
   ```

3. **Scripts de prueba** (5 min)
   ```json
   // package.json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

**Tests Prioritarios (por orden de criticidad):**

**A. Lógica de Scoring** (CRÍTICO - 1 día)
```typescript
// __tests__/lib/scoring.test.ts
describe('Scoring Logic', () => {
  test('MCQ: 1 punto por respuesta correcta', () => {
    const score = calculateMCQScore({ isCorrect: true });
    expect(score).toBe(1);
  });
  
  test('Short Answer: 0-2 puntos según criterios', () => {
    const criterios = ['anticonceptivo', 'contraindicación'];
    const respuesta = 'Tiene migraña con aura, contraindicado anticonceptivo combinado';
    const score = evaluateShortAnswer(respuesta, criterios, 2);
    expect(score).toBe(2);
  });
  
  test('Porcentaje final: (puntos/total) * 100', () => {
    const percentage = calculatePercentage(7, 10);
    expect(percentage).toBe(70);
  });
});
```

**B. Contexto de Casos** (ALTO - 1 día)
```typescript
// __tests__/components/CasoContext.test.tsx
describe('CasoContext', () => {
  test('Navega al siguiente paso al responder', () => {
    const { result } = renderHook(() => useCaso(), {
      wrapper: ({ children }) => (
        <CasoProvider caso={mockCaso}>{children}</CasoProvider>
      ),
    });
    
    act(() => {
      result.current.handleSelect('paso-1', mockOpcion);
    });
    
    expect(result.current.currentStep).toBe(1);
  });
  
  test('Timer expira y auto-completa caso', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useCaso());
    
    act(() => {
      jest.advanceTimersByTime(720000); // 12 minutos
    });
    
    expect(result.current.isTimeExpired).toBe(true);
  });
});
```

**C. API de Resultados** (ALTO - 1 día)
```typescript
// __tests__/api/results.test.ts
describe('POST /api/results', () => {
  test('Guarda resultado correctamente', async () => {
    const payload = {
      caseId: 'caso-1',
      caseTitle: 'Test',
      score: 8,
      totalPoints: 10,
    };
    
    const response = await POST(new Request('http://localhost:3000/api/results', {
      method: 'POST',
      body: JSON.stringify(payload),
    }));
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.result.score).toBe(8);
  });
  
  test('Rechaza sin autenticación', async () => {
    // Mock auth() retorna null
    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });
});
```

**Estructura de archivos de test:**
```
__tests__/
├── components/
│   ├── CasoContext.test.tsx
│   ├── PasoRenderer.test.tsx
│   ├── CaseTimer.test.tsx
│   └── CaseNavigator.test.tsx
├── api/
│   ├── results.test.ts
│   ├── profile.test.ts
│   └── cases.test.ts
├── lib/
│   ├── scoring.test.ts
│   ├── progress.test.ts
│   └── auth.test.ts
└── utils/
    └── mappers.test.ts
```

**Meta de coverage:**
- **Fase 1 (Mes 1):** 40% coverage (lógica crítica)
- **Fase 2 (Mes 2):** 60% coverage (APIs + componentes)
- **Fase 3 (Mes 3):** 80% coverage (completo)

**Tiempo estimado:** 1 semana (setup + tests críticos)  
**Impacto:** 🔥🔥 ALTO - Confiabilidad y mantenibilidad  
**Dependencias:** Ninguna  
**Riesgo:** BAJO

---

## 🟠 PRIORIDAD ALTA (Semanas 1-2)

### 3. Performance & Loading States ⚡

**Problemas Detectados:**

#### A. Sin Incremental Static Regeneration (ISR)
```typescript
// app/casos/page.tsx - ACTUAL
// Genera página en cada request (dinámico)
export const dynamic = 'force-dynamic';

// DEBERÍA SER
export const revalidate = 3600; // Regenerar cada 1 hora
// Casos no cambian frecuentemente, ISR es ideal
```

**Beneficio:** 10x más rápido para usuarios recurrentes

#### B. Imágenes sin optimizar
```typescript
// ACTUAL: <img> tags HTML normales
<img src="/resources/cases/its/vph-condilomas.jpg" alt="VPH" />
// Peso: ~800KB, sin lazy loading, sin responsive

// DEBERÍA: Next.js Image Component
import Image from 'next/image';
<Image 
  src="/resources/cases/its/vph-condilomas.jpg"
  alt="VPH - Condilomas vulvares"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/..."
  sizes="(max-width: 768px) 100vw, 800px"
/>
// Peso: ~120KB (compresión automática), lazy load, responsive
```

**Beneficio:** 70% reducción de peso, mejora LCP

#### C. Bundle size sin analizar
```bash
# Instalar
npm install --save-dev @next/bundle-analyzer

# next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);

# Ejecutar
ANALYZE=true npm run build
```

**Tareas específicas:**

1. **Implementar ISR en rutas estáticas** (2 horas)
   - `/casos` → `revalidate: 3600`
   - `/areas` → `revalidate: 86400`
   - `/casos/[id]` → `revalidate: 7200`

2. **Migrar a Next.js Image** (4 horas)
   - Componente `ImageViewer` → usar `<Image>`
   - Componente `CaseCard` → usar `<Image>` para thumbnails
   - Generar `blurDataURL` para placeholders

3. **Code splitting con dynamic imports** (2 horas)
   ```typescript
   // Cargar CasoDetalleClient solo cuando se necesita
   const CasoDetalleClient = dynamic(
     () => import('./CasoDetalleClient'),
     { 
       loading: () => <LoadingSkeleton />,
       ssr: false // Componente solo cliente
     }
   );
   ```

4. **Optimizar fuentes** (1 hora)
   ```typescript
   // app/layout.tsx
   import { Inter, Poppins } from 'next/font/google';
   
   const inter = Inter({ 
     subsets: ['latin'],
     display: 'swap',
     preload: true,
   });
   ```

5. **Analizar y reducir bundle** (3 horas)
   - Identificar librerías pesadas
   - Tree-shaking de Heroicons (importar solo los necesarios)
   - Lazy load de Lucide React

**Métricas objetivo:**
- **First Contentful Paint:** <1.5s (actual: ~2.5s)
- **Largest Contentful Paint:** <2.5s (actual: ~4s)
- **Bundle size:** <200KB (actual: ~350KB)

**Tiempo estimado:** 3 días  
**Impacto:** 🔥🔥 ALTO - UX significativamente mejor  
**Dependencias:** Ninguna  
**Riesgo:** BAJO-MEDIO (requiere testing visual)

---

### 4. Error Handling & Monitoring 🚨

**Problema Actual:**
```typescript
// app/api/results/route.ts - Línea 44
catch (error: any) {
  console.error('Error al guardar resultado:', error);
  return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
}
// ❌ Sin logging estructurado
// ❌ Sin alertas
// ❌ Mensaje genérico al usuario
```

**Solución - Sentry Integration:**

1. **Instalar Sentry** (15 min)
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Configurar error boundaries** (1 hora)
   ```typescript
   // app/components/ErrorBoundary.tsx
   'use client';
   
   import * as Sentry from '@sentry/nextjs';
   import { useEffect } from 'react';
   
   export default function ErrorBoundary({
     error,
     reset,
   }: {
     error: Error & { digest?: string };
     reset: () => void;
   }) {
     useEffect(() => {
       Sentry.captureException(error);
     }, [error]);
   
     return (
       <div className="card p-8 text-center">
         <h2 className="text-xl font-bold text-red-600 mb-4">
           Algo salió mal
         </h2>
         <p className="text-neutral-600 mb-6">
           {error.message || 'Error inesperado. Nuestro equipo fue notificado.'}
         </p>
         <button onClick={reset} className="btn btn-primary">
           Intentar nuevamente
         </button>
       </div>
     );
   }
   ```

3. **Logging estructurado en APIs** (2 horas)
   ```typescript
   // lib/logger.ts
   import * as Sentry from '@sentry/nextjs';
   
   export const logger = {
     error: (message: string, context?: any) => {
       console.error(message, context);
       Sentry.captureException(new Error(message), { extra: context });
     },
     warn: (message: string, context?: any) => {
       console.warn(message, context);
       Sentry.captureMessage(message, { level: 'warning', extra: context });
     },
   };
   
   // Usar en APIs
   catch (error: any) {
     logger.error('Error al guardar resultado', {
       userId,
       caseId,
       error: error.message,
       stack: error.stack,
     });
     return NextResponse.json({ 
       error: 'No pudimos guardar tu resultado. Por favor intenta de nuevo.' 
     }, { status: 500 });
   }
   ```

4. **Health checks endpoint** (1 hora)
   ```typescript
   // app/api/health/route.ts - MEJORAR
   export async function GET() {
     const checks = {
       database: false,
       redis: false, // Si se agrega caché
     };
     
     try {
       await prisma.$queryRaw`SELECT 1`;
       checks.database = true;
     } catch (e) {
       logger.error('Health check DB failed', e);
     }
     
     const allHealthy = Object.values(checks).every(Boolean);
     
     return NextResponse.json(
       { healthy: allHealthy, checks },
       { status: allHealthy ? 200 : 503 }
     );
   }
   ```

5. **User-facing error messages** (1 hora)
   ```typescript
   // lib/errors.ts
   export const ErrorMessages = {
     SAVE_RESULT_FAILED: 'No pudimos guardar tu resultado. Verifica tu conexión e intenta nuevamente.',
     CASE_NOT_FOUND: 'Este caso no existe o fue eliminado.',
     UNAUTHORIZED: 'Debes iniciar sesión para continuar.',
     RATE_LIMIT: 'Demasiados intentos. Espera un momento antes de intentar nuevamente.',
   };
   ```

**Tiempo estimado:** 2 días  
**Impacto:** 🔥🔥 ALTO - Debugging y confiabilidad  
**Dependencias:** Cuenta Sentry (gratis para <5k errors/mes)  
**Riesgo:** BAJO

---

### 5. Database Backups & Disaster Recovery 💾

**Problema:**
- Sin backups automatizados visibles
- Sin plan de disaster recovery
- Sin rollback de migraciones

**Solución:**

1. **Configurar backups automáticos en Neon** (30 min)
   - Dashboard Neon → Settings → Backups
   - Habilitar daily backups (retención 7 días)
   - Habilitar point-in-time recovery

2. **Scripts de backup local** (2 horas)
   ```bash
   # scripts/db-backup.sh
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="./backups"
   mkdir -p $BACKUP_DIR
   
   echo "📦 Exportando base de datos..."
   pg_dump $DATABASE_URL > "$BACKUP_DIR/klinik_mat_$DATE.sql"
   
   echo "✅ Backup guardado: klinik_mat_$DATE.sql"
   
   # Mantener solo últimos 30 backups
   ls -t $BACKUP_DIR/*.sql | tail -n +31 | xargs rm -f
   ```

   ```bash
   # scripts/db-restore.sh
   #!/bin/bash
   if [ -z "$1" ]; then
     echo "Uso: ./db-restore.sh <archivo.sql>"
     exit 1
   fi
   
   echo "⚠️  ADVERTENCIA: Esto sobrescribirá la base de datos actual"
   read -p "¿Continuar? (y/N): " -n 1 -r
   echo
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
     exit 1
   fi
   
   psql $DATABASE_URL < "$1"
   echo "✅ Base de datos restaurada"
   ```

3. **Agregar scripts a package.json** (5 min)
   ```json
   {
     "scripts": {
       "db:backup": "bash scripts/db-backup.sh",
       "db:restore": "bash scripts/db-restore.sh",
       "db:backup:auto": "bash scripts/db-backup.sh && git add backups/ && git commit -m 'Auto backup'"
     }
   }
   ```

4. **GitHub Actions para backup semanal** (1 hora)
   ```yaml
   # .github/workflows/backup.yml
   name: Database Backup
   
   on:
     schedule:
       - cron: '0 2 * * 0' # Domingos 2 AM
     workflow_dispatch: # Manual trigger
   
   jobs:
     backup:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Install PostgreSQL client
           run: sudo apt-get install postgresql-client
         - name: Run backup
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
           run: npm run db:backup
         - name: Upload to artifacts
           uses: actions/upload-artifact@v4
           with:
             name: database-backup
             path: backups/*.sql
             retention-days: 90
   ```

5. **Documento de DR Plan** (1 hora)
   ```markdown
   # DISASTER_RECOVERY.md
   
   ## Escenarios y Soluciones
   
   ### 1. Base de datos corrupta
   - Restaurar desde Neon point-in-time recovery (última 7 días)
   - O usar backup local más reciente
   
   ### 2. Pérdida de datos de usuarios
   - Usar backups diarios
   - Scripts de restore
   
   ### 3. Migración fallida
   - Rollback: `npx prisma migrate resolve --rolled-back <migration_name>`
   ```

**Tiempo estimado:** 1 día  
**Impacto:** 🔥🔥 ALTO - Seguridad de datos críticos  
**Dependencias:** Neon Pro plan (opcional, para mejor retention)  
**Riesgo:** BAJO

---

## 🟡 PRIORIDAD MEDIA (Semanas 3-4)

### 6. Analytics & Metrics 📈

**Objetivo:** Decisiones basadas en datos

**Solución:**

1. **Vercel Analytics** (30 min - GRATIS)
   ```bash
   npm install @vercel/analytics
   ```
   
   ```typescript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **Custom Events** (2 horas)
   ```typescript
   // lib/analytics.ts
   import { track } from '@vercel/analytics';
   
   export const analytics = {
     caseStarted: (caseId: string, area: string) => {
       track('case_started', { caseId, area });
     },
     
     caseCompleted: (data: {
       caseId: string;
       score: number;
       timeSpent: number;
       mode: string;
     }) => {
       track('case_completed', data);
     },
     
     questionAnswered: (isCorrect: boolean, questionType: string) => {
       track('question_answered', { isCorrect, questionType });
     },
   };
   
   // Usar en componentes
   useEffect(() => {
     analytics.caseStarted(caso.id, caso.area);
   }, []);
   ```

3. **Dashboard de métricas** (4 horas)
   ```typescript
   // app/admin/analytics/page.tsx
   export default async function AnalyticsPage() {
     const stats = await prisma.studentResult.groupBy({
       by: ['caseArea'],
       _count: true,
       _avg: { score: true, timeSpent: true },
     });
     
     return (
       <div>
         <h1>Estadísticas de la Plataforma</h1>
         
         <div className="grid grid-cols-3 gap-4">
           <MetricCard 
             title="Casos Completados"
             value={stats.reduce((acc, s) => acc + s._count, 0)}
             trend="+12% vs semana pasada"
           />
           
           <MetricCard 
             title="Score Promedio"
             value={`${Math.round(avgScore)}%`}
           />
           
           <MetricCard 
             title="Tiempo Promedio"
             value={`${Math.round(avgTime / 60)} min`}
           />
         </div>
         
         <AreaPerformanceChart data={stats} />
       </div>
     );
   }
   ```

**Métricas a trackear:**
- Casos más/menos completados
- Áreas con mejor/peor rendimiento
- Tiempo promedio por caso
- Tasa de abandono por paso
- Preguntas con más errores (para mejorar enunciados)

**Tiempo estimado:** 1 día  
**Impacto:** 🔥 MEDIO - Data-driven improvements  
**Dependencias:** Vercel deployment  
**Riesgo:** BAJO

---

### 7. Accesibilidad (a11y) ♿

**Objetivo:** WCAG 2.1 Level AA compliance

**Tareas:**

1. **Auditoría inicial** (1 hora)
   ```bash
   npm install -g @axe-core/cli
   axe http://localhost:3000 --save audit.json
   ```

2. **Instalar herramientas** (30 min)
   ```bash
   npm install --save-dev eslint-plugin-jsx-a11y
   ```
   
   ```javascript
   // eslint.config.mjs
   import jsxA11y from 'eslint-plugin-jsx-a11y';
   
   export default [
     {
       plugins: { 'jsx-a11y': jsxA11y },
       rules: {
         'jsx-a11y/alt-text': 'error',
         'jsx-a11y/aria-props': 'error',
         'jsx-a11y/click-events-have-key-events': 'warn',
       },
     },
   ];
   ```

3. **Fixes prioritarios** (3 días)

   **A. Navegación por teclado**
   ```typescript
   // components/CaseNavigator.tsx
   <button
     onClick={handleNavigate}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         handleNavigate();
       }
     }}
     aria-label={`Ir a paso ${index + 1}: ${paso.tipo}`}
   >
   ```

   **B. Skip navigation**
   ```typescript
   // app/layout.tsx
   <a 
     href="#main-content"
     className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
   >
     Saltar al contenido
   </a>
   
   <main id="main-content">
     {children}
   </main>
   ```

   **C. ARIA labels**
   ```typescript
   // components/CaseTimer.tsx
   <div 
     role="timer" 
     aria-live="polite"
     aria-label={`Tiempo restante: ${minutes} minutos ${seconds} segundos`}
   >
   ```

   **D. Contraste de colores**
   ```bash
   # Validar con herramienta
   npm install -g wcag-contrast
   wcag-contrast "#DC2626" "#FFFFFF" # 4.5:1 (AA compliant)
   ```

4. **Testing con lectores de pantalla** (1 día)
   - NVDA (Windows)
   - VoiceOver (macOS)
   - JAWS (Windows)

**Tiempo estimado:** 1 semana  
**Impacto:** 🔥 MEDIO - Inclusión, SEO, compliance legal  
**Dependencias:** Ninguna  
**Riesgo:** BAJO-MEDIO (requiere testing exhaustivo)

---

### 8. Mobile-First Improvements 📱

**Problemas actuales:**
- Espaciado inconsistente en móvil
- Timer overlay pequeño en mobile
- Navegador de pasos trunca texto

**Solución:**

1. **Responsive audit** (2 horas)
   ```bash
   # Chrome DevTools → Device Mode
   # Probar en: iPhone SE, iPhone 12 Pro, Galaxy S20, iPad
   ```

2. **Touch targets 44x44px mínimo** (1 día)
   ```typescript
   // Todos los botones táctiles
   <button className="min-h-[44px] min-w-[44px] touch-manipulation">
   ```

3. **Mobile-specific components** (2 días)
   ```typescript
   // components/CaseNavigator.tsx
   const isMobile = useMediaQuery('(max-width: 768px)');
   
   if (isMobile) {
     return <CaseNavigatorMobile />;
   }
   return <CaseNavigatorDesktop />;
   ```

4. **Optimizar espaciado** (1 día)
   ```css
   /* Antes */
   .case-card { padding: 1.5rem; } /* 24px siempre */
   
   /* Después */
   .case-card { 
     padding: 1rem; /* 16px mobile */
   }
   @media (min-width: 768px) {
     .case-card { padding: 1.5rem; } /* 24px desktop */
   }
   ```

5. **PWA enablement** (1 día)
   ```javascript
   // next.config.mjs
   import withPWA from 'next-pwa';
   
   export default withPWA({
     dest: 'public',
     register: true,
     skipWaiting: true,
   })(nextConfig);
   ```

**Tiempo estimado:** 1 semana  
**Impacto:** 🔥🔥 ALTO - 70% usuarios en mobile  
**Dependencias:** Ninguna  
**Riesgo:** MEDIO (requiere mucho testing)

---

## 🟢 PRIORIDAD BAJA (Backlog - Meses 2-3)

### 9. Features Pedagógicos Avanzados

#### A. Spaced Repetition (Algoritmo SM-2)

**Beneficio:** Mejorar retención de conocimiento a largo plazo

```typescript
// lib/spaced-repetition.ts
interface ReviewSchedule {
  nextReview: Date;
  interval: number; // días
  easeFactor: number;
  repetitions: number;
}

export function calculateNextReview(
  score: number, // 0-100
  previousSchedule?: ReviewSchedule
): ReviewSchedule {
  const quality = score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2;
  
  let { interval = 0, easeFactor = 2.5, repetitions = 0 } = previousSchedule || {};
  
  if (quality < 3) {
    // Resetear si falla
    interval = 1;
    repetitions = 0;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    
    repetitions++;
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);
  }
  
  return {
    nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
    interval,
    easeFactor,
    repetitions,
  };
}
```

**Implementación:**
- Agregar campo `nextReview` a `StudentResult`
- Dashboard "Casos para Revisar Hoy"
- Notificaciones de repaso

**Tiempo:** 2 semanas  
**Impacto:** ALTO - Diferenciación pedagógica

---

#### B. Peer Comparison & Leaderboards

```typescript
// app/api/leaderboard/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get('area') || 'all';
  
  const topPerformers = await prisma.user.findMany({
    where: {
      results: {
        some: area !== 'all' ? { caseArea: area } : {},
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      university: true,
      country: true,
      results: {
        select: { score: true, totalPoints: true },
      },
    },
    take: 100,
  });
  
  const rankings = topPerformers.map((user) => {
    const avgScore = user.results.reduce((acc, r) => 
      acc + (r.score / r.totalPoints), 0
    ) / user.results.length;
    
    return {
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      university: user.university,
      country: user.country,
      avgScore: Math.round(avgScore * 100),
      casesCompleted: user.results.length,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);
  
  return NextResponse.json({ rankings });
}
```

**Features:**
- Ranking nacional/internacional
- Comparación anónima con peers
- Badges y achievements
- Compartir en redes sociales

**Tiempo:** 2 semanas  
**Impacto:** MEDIO - Gamificación, engagement

---

#### C. Modo Examen Simulado

```typescript
// app/api/exam/generate/route.ts
export async function POST(req: Request) {
  const { areas, questionCount = 30, timeLimit = 5400 } = await req.json();
  
  // Seleccionar casos aleatorios
  const cases = await prisma.case.findMany({
    where: { area: { in: areas } },
    include: { questions: { include: { options: true } } },
  });
  
  // Extraer 30 preguntas aleatorias
  const allQuestions = cases.flatMap(c => c.questions);
  const selectedQuestions = shuffleArray(allQuestions).slice(0, questionCount);
  
  // Crear sesión de examen
  const exam = await prisma.exam.create({
    data: {
      userId,
      questionIds: selectedQuestions.map(q => q.id),
      timeLimit,
      startedAt: new Date(),
    },
  });
  
  return NextResponse.json({ 
    examId: exam.id, 
    questions: selectedQuestions.map(q => ({
      ...q,
      options: q.options.map(o => ({ id: o.id, text: o.text })) // Sin feedback
    }))
  });
}
```

**Características:**
- Sin feedback inmediato
- Tiempo límite estricto
- Resultados al final
- Simulación EUNACOM/exámenes oficiales

**Tiempo:** 3 semanas  
**Impacto:** ALTO - Preparación exámenes

---

#### D. Biblioteca de Referencias Integrada

**Ya documentado en:** `MEJORAS_CLINICAS_PROFESIONALES.md`

```typescript
// components/BibliotecaPanel.tsx
export function BibliotecaPanel({ 
  referencias, 
  isOpen, 
  onClose 
}: BibliotecaPanelProps) {
  return (
    <Drawer open={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">
          📚 Referencias del Caso
        </h3>
        
        {referencias.map((ref, idx) => (
          <ReferenceCard 
            key={idx}
            title={ref.titulo}
            authors={ref.autores}
            year={ref.año}
            type={ref.tipo} // 'Norma MINSAL', 'Guía Clínica', etc.
            url={ref.url}
            summary={ref.resumen}
          />
        ))}
        
        <ExternalLinks 
          minsal="https://..."
          who="https://..."
          uptodate="https://..."
        />
      </div>
    </Drawer>
  );
}
```

**Tiempo:** 2 semanas  
**Impacto:** MEDIO-ALTO - Aprendizaje profundo

---

### 10. Internacionalización (i18n) 🌎

**Objetivo:** Expandir a Latinoamérica

```bash
npm install next-intl
```

```typescript
// i18n/locales/es-CL.json
{
  "common": {
    "continue": "Continuar",
    "back": "Volver",
    "submit": "Enviar"
  },
  "cases": {
    "difficulty": {
      "low": "Baja",
      "medium": "Media",
      "high": "Alta"
    }
  }
}

// i18n/locales/es-MX.json
{
  "common": {
    "continue": "Continuar",
    "back": "Regresar",
    "submit": "Enviar"
  },
  "medical": {
    "anticonceptive": "Anticonceptivo" // vs "Método de planificación"
  }
}
```

**Regionalización de contenido:**
- Casos adaptados a normativas locales
- Terminología médica regional
- Referencias bibliográficas por país

**Tiempo:** 3-4 semanas  
**Impacto:** EXPANSIÓN - Market growth

---

## 📋 ROADMAP VISUAL (12 Semanas)

```
┌─────────┬──────────────────────────────────────────────────┐
│ Semana  │ Tareas                                           │
├─────────┼──────────────────────────────────────────────────┤
│ 1       │ 🔴 Habilitar Clerk Auth (1.5h)                   │
│         │ 🔴 Setup Jest + Tests críticos (3 días)          │
│         │ 🟠 Performance: ISR + Images (2 días)            │
├─────────┼──────────────────────────────────────────────────┤
│ 2       │ 🟠 Error handling + Sentry (2 días)              │
│         │ 🟠 Database backups (1 día)                      │
│         │ 🔴 Completar tests unitarios (2 días)            │
├─────────┼──────────────────────────────────────────────────┤
│ 3       │ 🟡 Analytics + Metrics (1 día)                   │
│         │ 🟡 Accesibilidad audit + fixes (4 días)          │
├─────────┼──────────────────────────────────────────────────┤
│ 4       │ 🟡 Mobile improvements (5 días)                  │
│         │ 🟡 PWA setup (1 día)                             │
├─────────┼──────────────────────────────────────────────────┤
│ 5-6     │ 🟢 Spaced Repetition (2 semanas)                 │
├─────────┼──────────────────────────────────────────────────┤
│ 7-8     │ 🟢 Peer Comparison + Leaderboards (2 semanas)    │
├─────────┼──────────────────────────────────────────────────┤
│ 9-11    │ 🟢 Modo Examen Simulado (3 semanas)              │
├─────────┼──────────────────────────────────────────────────┤
│ 12      │ 🟢 Biblioteca Integrada (2 semanas)              │
│         │ 📝 Testing final + QA                            │
└─────────┴──────────────────────────────────────────────────┘
```

---

## 🎯 QUICK WINS (Esta Semana - 8 horas totales)

### 1. README en español (30 min)
```markdown
# KLINIK-MAT 🏥

Plataforma de casos clínicos interactivos para estudiantes de obstetricia.

## 🚀 Inicio Rápido

\`\`\`bash
git clone https://github.com/santiagopinoortega-eng/KLINIK-MAT
cd KLINIK-MAT
npm install
cp .env.example .env.local
npm run dev
\`\`\`

## 📚 Características

- ✅ 54 casos clínicos de Ginecología, SSR, Obstetricia
- ✅ Modo OSCE con timer
- ✅ Feedback inmediato
- ✅ Sistema de progreso personalizado
```

### 2. ESLint strict mode (1 hora)
```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'react/no-unescaped-entities': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

```bash
npm run lint -- --fix
```

### 3. Health check script (1 hora)
```typescript
// scripts/health-check.ts
import { prisma } from '../lib/prisma';

async function healthCheck() {
  console.log('🏥 KLINIK-MAT Health Check\n');
  
  // 1. Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database: Connected');
  } catch (e) {
    console.log('❌ Database: Failed');
    process.exit(1);
  }
  
  // 2. Cases count
  const casesCount = await prisma.case.count();
  console.log(`✅ Cases: ${casesCount} loaded`);
  
  // 3. Users count
  const usersCount = await prisma.user.count();
  console.log(`✅ Users: ${usersCount} registered`);
  
  // 4. Recent results
  const recentResults = await prisma.studentResult.count({
    where: { completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });
  console.log(`✅ Results (7d): ${recentResults} completed`);
  
  console.log('\n🎉 All systems operational!');
}

healthCheck();
```

```json
// package.json
{
  "scripts": {
    "health": "node -r dotenv/config node_modules/ts-node/dist/bin.js scripts/health-check.ts"
  }
}
```

### 4. API Documentation (2 horas)
```markdown
# API.md

## Endpoints

### POST /api/results
Guarda el resultado de un caso completado.

**Headers:**
- `Authorization: Bearer <token>` (Clerk)

**Body:**
\`\`\`json
{
  "caseId": "caso-its-vph-1",
  "caseTitle": "VPH - Condilomas vulvares",
  "caseArea": "its",
  "score": 8,
  "totalPoints": 10,
  "mode": "study",
  "timeSpent": 420,
  "answers": [...]
}
\`\`\`

**Response:** 201
\`\`\`json
{
  "success": true,
  "result": {
    "id": "result-123",
    "score": 8,
    "totalPoints": 10,
    "percentage": 80
  }
}
\`\`\`

**Errors:**
- 401: No autenticado
- 400: Datos incompletos
- 500: Error del servidor
```

### 5. robots.txt y sitemap.xml (30 min)
```txt
# public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://klinikmat.cl/sitemap.xml
```

```typescript
// app/sitemap.ts
import { prisma } from '@/lib/prisma';

export default async function sitemap() {
  const cases = await prisma.case.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true },
  });
  
  return [
    {
      url: 'https://klinikmat.cl',
      lastModified: new Date(),
    },
    {
      url: 'https://klinikmat.cl/areas',
      lastModified: new Date(),
    },
    ...cases.map((c) => ({
      url: `https://klinikmat.cl/casos/${c.id}`,
      lastModified: c.updatedAt,
    })),
  ];
}
```

### 6. Environment validation (1 hora)
```typescript
// lib/env-validator.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  CLERK_SECRET_KEY: z.string().startsWith('sk_'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validated');
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
}
```

```javascript
// next.config.mjs
import { validateEnv } from './lib/env-validator.js';

validateEnv();

export default nextConfig;
```

### 7. Git hooks con Husky (1 hora)
```bash
npm install --save-dev husky lint-staged

npx husky init
```

```bash
# .husky/pre-commit
npm run lint
npm run typecheck
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 8. Contributing Guidelines (30 min)
```markdown
# CONTRIBUTING.md

## Cómo Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commits descriptivos: `git commit -m 'feat: agregar modo noche'`
4. Push: `git push origin feature/nueva-feature`
5. Crea un Pull Request

## Estándares de Código

- TypeScript estricto
- Tests para features nuevas
- Documentar funciones complejas
- Seguir convenciones de nombres
```

---

## 📊 MÉTRICAS DE ÉXITO

### Fase 1 (Semanas 1-4)
- ✅ Auth habilitado (100% usuarios autenticados)
- ✅ 40% test coverage
- ✅ Lighthouse score >90
- ✅ Error rate <0.1%
- ✅ Backups automáticos diarios

### Fase 2 (Semanas 5-8)
- ✅ 60% test coverage
- ✅ Mobile score >85
- ✅ WCAG AA compliance
- ✅ Analytics implementado
- ✅ 3 features pedagógicos nuevos

### Fase 3 (Semanas 9-12)
- ✅ 80% test coverage
- ✅ I18n para 3 países
- ✅ PWA funcional
- ✅ Spaced repetition activo
- ✅ Modo examen simulado

---

## 🚀 SIGUIENTE ACCIÓN

**AHORA MISMO (próximas 2 horas):**

1. Habilitar Clerk Auth
2. Crear primer test unitario
3. Implementar ISR en `/casos`

**Esta Semana:**
- Completar Quick Wins
- Setup Sentry
- Configurar backups

**Este Mes:**
- Alcanzar 40% test coverage
- Optimizar performance
- Implementar analytics

---

## 📞 CONTACTO Y SOPORTE

**Desarrollador Principal:** Santiago Pino Ortega  
**Email:** santiagopinoortega@gmail.com  
**GitHub:** @santiagopinoortega-eng

**Issues:** https://github.com/santiagopinoortega-eng/KLINIK-MAT/issues  
**Documentación:** Ver carpeta `/docs`

---

**Última Actualización:** Diciembre 7, 2025  
**Versión del Roadmap:** 1.0  
**Próxima Revisión:** Enero 2026
