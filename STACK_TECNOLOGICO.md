# Stack Tecnológico de KLINIK-MAT

**Documento de Referencia Técnica**  
*Última actualización: 25 de diciembre de 2025*

---

## 1. Filosofía y Propósito del Proyecto

KLINIK-MAT es una plataforma educativa médica especializada en obstetricia que busca formar matrónes y matronas con razonamiento clínico sólido. No es solo una herramienta de exámenes, sino un ecosistema completo de aprendizaje clínico donde los estudiantes entrenan su pensamiento crítico mediante casos clínicos interactivos.

---

## 2. Arquitectura General

### Framework Principal: Next.js 14 (App Router)
- Sistema moderno de aplicación web que renderiza contenido tanto en el servidor como en el navegador
- Permite páginas extremadamente rápidas con carga optimizada
- Routing basado en carpetas (estructura intuitiva donde cada carpeta es una ruta)
- Soporte nativo para páginas estáticas, dinámicas y en tiempo real

### Lenguaje: TypeScript
- JavaScript con tipos (previene errores antes de que ocurran)
- Autocompletado inteligente y documentación integrada
- Código más mantenible y profesional
- Modo strict habilitado para máxima seguridad de tipos

---

## 3. Capa de Presentación (Frontend)

### Tailwind CSS
- Sistema de diseño mediante clases utilitarias (construcción rápida de interfaces)
- Paleta de colores médica personalizada:
  - **km-red**: Escala roja para obstetricia (herencia chilena)
  - **km-navy**: Escala navy para autoridad médica
  - **km-teal**: Acento teal para contextos clínicos
  - **km-warm**: Naranja cálido para toque humano
- Diseño responsivo optimizado:
  - Mobile: 375px - 640px
  - Tablet: 768px - 1024px
  - Desktop: 1280px+
- Plugins especializados:
  - @tailwindcss/typography (contenido médico)
  - @tailwindcss/forms (formularios optimizados)
  - @tailwindcss/container-queries
  - tailwindcss-animate (animaciones clínicas)

### Componentes UI
- **Heroicons**: Iconos médicos y de interfaz profesionales
- **Lucide React**: Sistema complementario de iconografía
- Animaciones médicas (pulsos, latidos, indicadores)
- Tipografía Inter optimizada para lectura médica

### Características Avanzadas de Frontend
- **Web Audio API**: 
  - Simulador de latidos cardiofetales (LCF)
  - Síntesis de audio en tiempo real (65Hz-75Hz sine waves)
  - OscillatorNode + GainNode + BiquadFilter
  - ADSR envelope para sonido realista "lub-dub"
- **Canvas API**: 
  - Visualización de ondas sonoras tipo monitor médico
  - Waveform display en tiempo real
  - AnalyserNode → getByteTimeDomainData
  - Renderizado a 60fps con requestAnimationFrame
- Simuladores interactivos para práctica de auscultación clínica

---

## 4. Capa de Datos (Backend)

### Base de Datos: PostgreSQL + Prisma ORM

**PostgreSQL**
- Base de datos relacional robusta (estándar en aplicaciones médicas)
- Hospedaje en Neon (PostgreSQL serverless con connection pooling)
- Soporte para JSON para datos flexibles (feedback dinámico, métricas)

**Prisma ORM**
- Capa de abstracción type-safe para base de datos
- Migrations automáticas con historial
- Client generation para autocompletado
- Seeding de datos con TypeScript

### Modelos de Datos Principales

#### Users (Estudiantes)
```prisma
- id, email, name, role (STUDENT/ADMIN/DOCENTE)
- Demográficos: country, university, yearOfStudy, specialty
- bio, avatar (integración con Clerk)
- Relaciones: results, favorites, sessions, subscriptions
```

#### Cases (Casos Clínicos)
```prisma
- id, title, area, difficulty (1-5)
- vignette (viñeta clínica), summary
- modulo, feedbackDinamico (JSON)
- Relaciones: images, questions, norms (MINSAL)
- Índices optimizados: [area, difficulty], [isPublic, createdAt]
```

#### Questions & Options
```prisma
- Preguntas de opción múltiple
- feedback, feedbackDocente, guia
- images asociadas a preguntas
- isCorrect flag en opciones
```

#### StudentResults
```prisma
- userId, caseId, score, completedAt
- mode (study/exam), timeLimit, timeSpent
- answers (JSON), totalPoints
- Índices: [userId, completedAt], [caseArea]
```

#### Favorites
```prisma
- Sistema de casos favoritos
- Unique constraint [userId, caseId]
```

#### StudySessions
```prisma
- Tracking de rachas de estudio
- date, casesStudied, timeSpent
- Para gamificación y streaks
```

#### Subscriptions & Payments
```prisma
- Planes de suscripción (FREE/PREMIUM/ELITE)
- Integración con Mercado Pago
- status, startDate, endDate, autoRenew
- Payment records con transactionId
```

#### EngagementMetrics
```prisma
- source: recommendation/search/browse/trending
- recommendationGroup: specialty/review/challenge
- action: view/click/complete/favorite
- sessionDuration para analytics
```

#### MinsalNorms
```prisma
- Normas y guías clínicas chilenas
- Relación many-to-many con Cases
```

---

## 5. Autenticación y Seguridad

### Clerk Authentication
- Sistema de autenticación completo (sign-up, login, sesiones)
- Gestión de usuarios con perfiles y avatares
- Webhooks para sincronización con Prisma (user.created, user.updated, user.deleted)
- Integración con dominios personalizados (klinikmat.cl)
- Protección CAPTCHA con Cloudflare Turnstile
- Localización en español con @clerk/localizations

### Content Security Policy (CSP)
Headers estrictos implementados en `next.config.mjs`:
- **default-src**: 'self'
- **script-src**: Permite Clerk, Vercel Analytics, Mercado Pago, 'unsafe-eval' solo en dev
- **connect-src**: APIs externas (Neon, Clerk, Mercado Pago)
- **img-src**: Avatares de Clerk, assets propios
- **frame-src**: Clerk modals, Mercado Pago checkout
- **frame-ancestors**: 'none' (anti-clickjacking)
- **upgrade-insecure-requests**: Fuerza HTTPS en producción

### CSRF Protection
Implementado en `lib/csrf.ts`:
- **Pattern**: Double Submit Cookie
- Token de 32 bytes generado con crypto.getRandomValues
- Validación cookie vs header en cada mutación
- Middleware automático para APIs de escritura

### Rate Limiting
Sistema en memoria con `lib/ratelimit.ts`:
- **PUBLIC**: 100 req/min (APIs públicas)
- **AUTHENTICATED**: 200 req/min (usuarios logueados)
- **WRITE**: 100 req/min (mutaciones)
- **AUTH**: 5 req/5min (login/signup - anti brute-force)
- **RESULTS**: 50 req/min (guardar resultados)
- Tracking por IP y por userId
- Cleanup automático de buckets expirados

### Sanitización y Validación
- Sanitización de inputs HTML (prevención XSS)
- Validación de RUT chileno
- Escape de caracteres especiales en queries
- TypeScript strict mode para validación de tipos

### Otras Medidas de Seguridad
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Cross-Origin-Opener-Policy**: same-origin
- **Permissions-Policy**: Deshabilita cámara, micrófono, geolocation
- Variables de entorno en `.env.local` (nunca en git)
- `.env.example` solo con placeholders

---

## 6. Sistema de Pagos y Monetización

### Mercado Pago Integration
Implementado en `lib/mercadopago.ts`:

**SDK Oficial**
- mercadopago npm package (v2.11.0)
- MercadoPagoConfig con access token y idempotency
- Clientes específicos:
  - **Payment**: Pagos únicos
  - **Preference**: Checkout customizado
  - **PreApproval**: Suscripciones recurrentes

**Webhooks**
- Endpoint: `/api/webhooks/mercadopago`
- Topics procesados:
  - payment (pagos)
  - subscription_preapproval (suscripciones)
  - subscription_authorized_payment (cobros recurrentes)
  - subscription_preapproval_plan (planes)
- Validación con svix para seguridad
- Sincronización automática con Prisma

**URLs de Retorno**
```typescript
{
  success: `/subscription/success`,
  failure: `/subscription/failure`,
  pending: `/subscription/pending`,
}
```

**Estados de Pago**
- approved, pending, rejected, cancelled, refunded

### Sistema de Planes
- **FREE**: Acceso limitado
- **PREMIUM**: Casos ilimitados
- **ELITE**: Acceso total + recursos extra

### Cupones y Descuentos
- Modelo CouponUsage en Prisma
- Validación de uso único por usuario
- Descuentos porcentuales o fijos

---

## 7. Monitoreo y Observabilidad

### Sentry
Configurado en `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`:

**Características**
- Captura automática de errores client/server/edge
- Session Replay (10% de sesiones, 100% con errores)
- Performance monitoring (tracesSampleRate: 0.1 en prod)
- beforeSend para filtrar eventos sensibles
- ignoreErrors: ResizeObserver, Non-Error promises
- Integración con Vercel para source maps

**Ambientes**
- Development: DSN opcional, 100% traces
- Production: DSN requerido, 10% traces, replays habilitados

### Vercel Analytics & Speed Insights
- **Analytics**: Tráfico, páginas populares, demografía
- **Speed Insights**: Core Web Vitals (LCP, FID, CLS)
- Integración automática con paquetes @vercel

### Logger Personalizado
Implementado en `lib/logger.ts`:
```typescript
- logger.info(message, context)
- logger.warn(message, context)
- logger.error(message, error, context) → envía a Sentry
- logger.debug(message, context) → solo en dev
```

### Instrumentación
`instrumentation.ts` para OpenTelemetry:
- Tracking de latencia de funciones
- Métricas de performance
- Integración con Vercel observability

---

## 8. Optimizaciones de Rendimiento

### Bundle Optimization
- **@next/bundle-analyzer**: Análisis de tamaño (comando: `npm run build:analyze`)
- Code splitting automático por ruta
- Dynamic imports para componentes pesados
- Tree shaking de dependencias no usadas

### Cache Strategies
Implementado en `lib/cache.ts`:
- Cache en memoria para queries frecuentes
- TTL configurable por tipo de dato
- Invalidación selectiva
- globalThis para persistencia en Vercel

### Database Optimization
- **Índices estratégicos**:
  - [area, difficulty] para búsquedas de casos
  - [userId, completedAt] para historial
  - [isPublic, createdAt] para listados públicos
- **Connection Pooling**: PgBouncer en Neon
- **Prepared Statements**: Prisma genera queries optimizadas

### Image Optimization
- Next.js Image component con optimización automática
- WebP/AVIF generation
- Lazy loading nativo
- Responsive images con srcset

### CSS Optimization
- PurgeCSS integrado en Tailwind (solo CSS usado)
- Minificación automática en producción
- Critical CSS inline para FCP

---

## 9. Testing y Calidad de Código

### Jest + Testing Library
Configurado en `jest.config.js` y `jest.setup.js`:

**Tests Implementados**
- `__tests__/business-logic.test.ts`: Lógica de scoring, recomendaciones
- `__tests__/api/`: Tests de endpoints
- `__tests__/components/`: Tests de componentes React
- `__tests__/integration/`: Tests end-to-end
- `__tests__/performance/`: Tests de performance

**Comandos**
```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:ci       # CI/CD optimizado
```

**Coverage**
- Reportes en `/coverage/`
- Formatos: lcov, clover, HTML
- Meta: >80% cobertura en lógica crítica

### Linting y Type Checking
- **ESLint**: Reglas de Next.js + custom rules
- **TypeScript**: Modo strict, no implicit any
- **Prettier**: Formato automático (integrado con ESLint)

**Comandos**
```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript validation
npm run typecheck:paths # Debug de paths
```

### Pre-build Checks
Script `scripts/check-env.mjs`:
- Valida variables de entorno requeridas
- Previene builds con configuración incompleta
- Documentación de variables faltantes

---

## 10. Contenido y Funcionalidades Médicas

### Recursos Clínicos Implementados

#### Escalas Clínicas (8 totales)
Implementadas en `app/recursos/escalas-scores/data.ts`:

1. **Apgar** (Evaluación neonatal)
   - 5 parámetros: FC, respiración, tono, reflejos, color
   - Puntuación 0-10
   - Referencias: MINSAL, AAP

2. **Ballard** (Edad gestacional)
   - Madurez neuromuscular y física
   - 26-44 semanas
   - Referencias: MINSAL, Williams Obstetrics 26th

3. **Silverman-Andersen** (Dificultad respiratoria)
   - 5 signos clínicos
   - Score 0-10
   - Referencias: MINSAL, NeoReviews

4. **Bishop** (Maduración cervical)
   - 5 parámetros cervicales
   - Score 0-13
   - Referencias: ACOG, MINSAL

5. **Perfil Biofísico Fetal**
   - 5 variables ecográficas
   - Score 0-10
   - Referencias: ACOG, RCOG

6. **ILA** (Índice de Líquido Amniótico)
   - Medición ecográfica 4 cuadrantes
   - Oligohidramnios, normal, polihidramnios
   - Referencias: ACOG, Williams

7. **Robson** (Clasificación de cesáreas)
   - 10 grupos mutuamente excluyentes
   - Auditoría de tasa de cesáreas
   - Referencias: WHO, MINSAL

8. **Escalas de Glasgow, WHOQOL** (futuro)

#### Simulador LCF (Latidos Cardiofetales)
Implementado en `app/recursos/escalas-scores/components/LcfSimulator.tsx`:

**Características Técnicas**
- **Web Audio API**:
  - AudioContext con lazy initialization
  - OscillatorNode: 65Hz (lub) + 75Hz (dub)
  - GainNode con ADSR envelope (3.5x multiplier)
  - BiquadFilter lowpass 200Hz (emula estetoscopio)
  - Look-ahead scheduling (100ms, tick 25ms)
- **Canvas API**:
  - AnalyserNode (fftSize 2048)
  - getByteTimeDomainData para waveform real
  - 500x80px display optimizado
  - Grid style EKG
  - 60fps con requestAnimationFrame
- **Features Clínicas**:
  - Rango BPM: 110-180 lpm
  - Timer de 15 segundos
  - Sistema de tap para práctica
  - Cálculo automático de BPM detectado
  - Interpretación clínica MINSAL:
    - <110 lpm: Bradicardia
    - 110-160 lpm: Normal
    - >160 lpm: Taquicardia
  - Feedback educativo con recomendaciones

### Sistema de Casos Clínicos

**Estructura**
- Viñetas clínicas detalladas
- Imágenes médicas (ecografías, monitores, labs)
- Preguntas de opción múltiple
- Feedback docente y automático
- Referencias a normas MINSAL

**Áreas Cubiertas**
- Obstetricia
- Ginecología
- Neonatología
- Emergencias obstétricas
- Control prenatal
- Puerperio

**Niveles de Dificultad**
1. Fundamental
2. Intermedio
3. Avanzado
4. Experto
5. Maestría

### Sistema de Recomendaciones
Implementado en `lib/recommendations.ts`:

**Algoritmos**
- Basado en especialidad del estudiante
- Análisis de desempeño histórico
- Casos similares (por área y dificultad)
- Trending cases (popularidad)
- Challenges personalizados

**Métricas**
- Click-through rate (CTR)
- Completion rate
- Time on task
- Return rate

### Gamificación
Features implementadas y planificadas:

- ✅ Sistema de rachas (streaks)
- ✅ Tracking de tiempo de estudio
- ✅ Favoritos y colecciones
- ⏳ Badges y logros
- ⏳ Rankings y leaderboards
- ⏳ Desafíos semanales
- ⏳ Puntos de experiencia (XP)

---

## 11. Deployment y Hosting

### Vercel Platform
- **Deploy automático**: Git push → Build → Deploy
- **Edge Network**: >100 regiones globales
- **Serverless Functions**: APIs escalables automáticamente
- **Edge Runtime**: Middleware ultrarrápido
- **Preview Deployments**: URL única por PR
- **Environment Variables**: Por ambiente (dev/preview/prod)

### Ambientes

**Development**
```
URL: http://localhost:3000
NODE_ENV: development
Database: Neon development pool
```

**Preview**
```
URL: https://klinikmat-*.vercel.app
NODE_ENV: production (pero con preview vars)
Database: Mismo que prod (read-only)
```

**Production**
```
URL: https://klinikmat.cl
NODE_ENV: production
Database: Neon production pool
CDN: Vercel Edge Network
```

### Dominio Personalizado
- **klinikmat.cl**: Dominio principal
- **www.klinikmat.cl**: Redirect a principal
- SSL/TLS automático (Let's Encrypt)
- DNS configurado para Clerk (auth.klinikmat.cl)

### CI/CD Pipeline
```
1. Git push a main
2. Vercel detecta cambio
3. npm install (cache de node_modules)
4. npm run build
   - Prisma generate
   - TypeScript compile
   - Next.js build
   - Sentry source maps upload
5. Deploy a Edge Network
6. Smoke tests automáticos
7. Notificación (Slack/Email)
```

---

## 12. Integraciones Externas

### 1. Clerk (Autenticación)
- **URL**: https://clerk.com
- **Purpose**: Auth, user management, sessions
- **Webhooks**: user.created, user.updated, user.deleted
- **Custom Domain**: auth.klinikmat.cl

### 2. Mercado Pago (Pagos)
- **URL**: https://www.mercadopago.com
- **Purpose**: Suscripciones y pagos únicos
- **SDK**: mercadopago npm package
- **Webhooks**: payment, subscription events

### 3. Sentry (Monitoreo)
- **URL**: https://sentry.io
- **Organization**: klinik-mat
- **Project**: klinik-mat
- **Features**: Error tracking, performance, replays

### 4. Neon (Database)
- **URL**: https://neon.tech
- **Type**: PostgreSQL serverless
- **Regions**: US East (production), US West (dev)
- **Features**: Connection pooling, branching, auto-suspend

### 5. Vercel (Hosting)
- **URL**: https://vercel.com
- **Features**: Edge hosting, analytics, speed insights
- **Plan**: Pro (para dominios custom)

### 6. Cloudflare (DNS + CAPTCHA)
- **Turnstile**: CAPTCHA para Clerk
- **DNS**: Nameservers para klinikmat.cl

### 7. PubMed API (Futuro)
- **URL**: https://www.ncbi.nlm.nih.gov/home/develop/api/
- **Purpose**: Búsqueda de literatura médica
- **Status**: API key configurado, integración pendiente

---

## 13. Estructura de Carpetas

```
KLINIK-MAT/
├── app/                          # Next.js App Router
│   ├── api/                     # Backend endpoints
│   │   ├── webhooks/           # Clerk, Mercado Pago webhooks
│   │   ├── cases/              # CRUD de casos
│   │   ├── results/            # Guardar resultados
│   │   ├── favorites/          # Sistema de favoritos
│   │   └── subscription/       # Endpoints de pago
│   ├── casos/                   # Páginas de casos clínicos
│   │   ├── [id]/              # Caso individual
│   │   └── resolver/          # Interfaz de resolución
│   ├── recursos/                # Recursos educativos
│   │   └── escalas-scores/    # Escalas clínicas + Simulador LCF
│   ├── estadisticas/            # Dashboard de progreso
│   ├── favoritos/               # Casos favoritos
│   ├── mi-progreso/             # Perfil y estadísticas
│   ├── subscription/            # Planes y pagos
│   ├── login/                   # Auth pages
│   ├── components/              # Componentes compartidos
│   │   ├── CaseCard.tsx
│   │   ├── QuestionCard.tsx
│   │   └── ProgressChart.tsx
│   ├── hooks/                   # Custom React hooks
│   ├── context/                 # React Context providers
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Estilos globales
│
├── lib/                          # Lógica de negocio
│   ├── prisma.ts                # Cliente Prisma
│   ├── auth.ts                  # Helpers Clerk
│   ├── mercadopago.ts           # Cliente Mercado Pago
│   ├── csrf.ts                  # CSRF protection
│   ├── ratelimit.ts             # Rate limiting
│   ├── cache.ts                 # Sistema de caché
│   ├── logger.ts                # Logging structurado
│   ├── scoring.ts               # Cálculo de puntajes
│   ├── recommendations.ts       # Sistema de recomendaciones
│   ├── progress.ts              # Tracking de progreso
│   ├── subscription.ts          # Lógica de suscripciones
│   ├── sanitize.ts              # Sanitización de inputs
│   ├── types.ts                 # TypeScript types compartidos
│   └── env.ts                   # Validación de env vars
│
├── prisma/                       # Database schema y seeds
│   ├── schema.prisma            # Modelos de datos
│   ├── migrations/              # Historial de migraciones
│   ├── seed.ts                  # Seed principal
│   ├── seed-plans.ts            # Seed de planes
│   ├── cases/                   # Casos clínicos en JSON5
│   │   ├── obstetricia/
│   │   ├── ginecologia/
│   │   └── neonatologia/
│   └── cases.json5              # Índice de casos
│
├── scripts/                      # Herramientas de desarrollo
│   ├── check-env.mjs            # Validar env vars
│   ├── seed-cases.ts            # Importar casos
│   ├── create-admin.ts          # Crear usuario admin
│   ├── check-users.ts           # Debug usuarios
│   └── analizar-casos.mjs       # Análisis de casos
│
├── __tests__/                    # Tests
│   ├── business-logic.test.ts
│   ├── api/                     # Tests de API
│   ├── components/              # Tests de componentes
│   ├── integration/             # Tests E2E
│   └── performance/             # Performance tests
│
├── public/                       # Assets estáticos
│   ├── brand/                   # Logos, iconos
│   └── resources/               # PDFs, guías
│
├── coverage/                     # Coverage reports (gitignored)
│
├── .next/                        # Build output (gitignored)
│
├── node_modules/                 # Dependencies (gitignored)
│
├── .env.local                    # Env vars locales (gitignored)
├── .env.production               # Env vars producción (gitignored)
├── .env.example                  # Template de env vars
├── .gitignore                    # Archivos ignorados
├── next.config.mjs               # Configuración Next.js
├── tailwind.config.js            # Configuración Tailwind
├── tsconfig.json                 # Configuración TypeScript
├── jest.config.js                # Configuración Jest
├── package.json                  # Dependencies y scripts
├── README.md                     # Documentación principal
├── CHANGELOG.md                  # Historial de cambios
├── STACK_TECNOLOGICO.md          # Este documento
├── SECURITY.md                   # Política de seguridad
└── sentry.*.config.ts            # Configuración Sentry
```

---

## 14. Flujo de Datos

### Flujo de Autenticación
```
1. Usuario visita /login
2. Clerk component renderiza UI
3. Usuario ingresa credenciales
4. Clerk valida (server-side)
5. Webhook user.created dispara
6. API crea registro en Prisma.User
7. JWT en cookie httpOnly
8. Redirect a /casos
```

### Flujo de Resolución de Caso
```
1. Usuario navega a /casos/[id]
2. Server Component fetch case desde Prisma
3. Renderiza viñeta + primera pregunta
4. Usuario selecciona opción
5. Client Component valida (frontend)
6. Muestra feedback inmediato
7. Al finalizar caso:
   - POST /api/results
   - Guarda en StudentResult
   - Actualiza métricas de engagement
   - Calcula nuevo score
8. Redirect a resultados
```

### Flujo de Pago
```
1. Usuario selecciona plan en /pricing
2. Click "Suscribirse"
3. POST /api/subscription/create-preference
4. Server crea Preference en Mercado Pago
5. Retorna init_point (URL de checkout)
6. Redirect a Mercado Pago
7. Usuario completa pago
8. Mercado Pago envía webhook a /api/webhooks/mercadopago
9. API valida firma
10. Actualiza Subscription en Prisma
11. Envía email de confirmación (futuro)
12. Usuario redirected a /subscription/success
```

### Flujo de Recomendaciones
```
1. Usuario en /casos (browse)
2. Server Component llama getRecommendations(userId)
3. Algoritmo analiza:
   - Especialidad del usuario
   - Historial de resultados
   - Casos no completados
   - Trending cases
4. Retorna lista priorizada
5. Renderiza grid de casos
6. Usuario hace click
7. EngagementMetric registra evento
8. Navega a caso
```

### Flujo de Error
```
1. Error ocurre (client o server)
2. Sentry.captureException(error)
3. Error enviado a Sentry.io
4. Logger.error() registra contexto
5. Usuario ve error boundary
6. Equipo recibe alerta (email/Slack)
7. Source maps permiten debug exacto
```

---

## 15. Escalabilidad y Mantenibilidad

### Arquitectura Escalable

**Serverless por Diseño**
- Funciones que escalan automáticamente de 0 a ∞
- No hay servidores que aprovisionar
- Cold starts <100ms con Vercel Edge

**Database Scaling**
- Connection pooling con PgBouncer (Neon)
- Read replicas (futuro)
- Caching layer reduce queries en 70%
- Índices optimizados para queries comunes

**Frontend Optimization**
- Static Site Generation (SSG) para contenido estático
- Incremental Static Regeneration (ISR) para casos
- Edge caching con stale-while-revalidate
- Image optimization automática

### Code Organization

**Modularidad**
- Separación clara de concerns:
  - `/app`: UI y routing
  - `/lib`: Lógica de negocio
  - `/prisma`: Data layer
- Componentes reutilizables
- Custom hooks para lógica compartida
- Contexts para estado global

**Type Safety**
- TypeScript strict mode
- Prisma genera tipos automáticamente
- Zod para validación de runtime
- No any permitidos

**Testing Strategy**
- Unit tests para lógica pura
- Integration tests para APIs
- Component tests para UI
- E2E tests para flujos críticos (futuro)

### Mantenimiento Continuo

**Dependency Management**
- Dependabot automático
- npm audit en CI/CD
- Renovate para major updates
- Lock files committed (package-lock.json)

**Documentation**
- JSDoc en funciones complejas
- README por módulo
- Architecture Decision Records (ADRs)
- Este documento (STACK_TECNOLOGICO.md)

**Monitoring**
- Sentry para errors
- Vercel Analytics para uso
- Prisma query logging en dev
- Custom metrics en production

---

## 16. Roadmap Técnico

### Q1 2026 - Optimización y Pulido
- [ ] Implementar E2E tests con Playwright
- [ ] Optimizar Core Web Vitals (target: todos en verde)
- [ ] Implementar service worker para offline support
- [ ] Migrar a React Server Components más agresivamente
- [ ] Implementar OpenTelemetry completo

### Q2 2026 - Features Avanzadas
- [ ] Sistema de notificaciones push
- [ ] Chat en vivo para soporte (Intercom o similar)
- [ ] Exportar certificados de completación (PDF)
- [ ] Modo oscuro completo
- [ ] Accesibilidad WCAG 2.1 AA completa

### Q3 2026 - AI Integration
- [ ] Integrar Gemini AI para feedback personalizado
- [ ] Generación automática de preguntas
- [ ] Chatbot educativo con contexto médico
- [ ] Análisis de patrones de aprendizaje con ML

### Q4 2026 - Expansión
- [ ] App móvil nativa (React Native)
- [ ] Internacionalización (i18n) para más países
- [ ] Integración con LMS universitarios (Moodle, Canvas)
- [ ] API pública para terceros

---

## 17. Comandos Útiles

### Development
```bash
npm run dev                  # Start dev server
npm run dev:mail             # Start dev + Mailhog (email testing)
npm run dev:mail:down        # Stop Mailhog
```

### Build & Deploy
```bash
npm run build                # Production build
npm run build:analyze        # Build + bundle analysis
npm start                    # Start production server
npm run prebuild             # Check env vars antes de build
```

### Database
```bash
npx prisma generate          # Generar Prisma client
npx prisma migrate dev       # Crear y aplicar migración
npx prisma migrate deploy    # Aplicar migraciones en prod
npx prisma db push           # Push schema sin migración (dev only)
npx prisma studio            # GUI para explorar BD
npm run db:seed              # Seed database
npm run seed:cases           # Seed solo casos
```

### Testing
```bash
npm test                     # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm run test:ci              # CI optimizado
```

### Code Quality
```bash
npm run lint                 # ESLint
npm run typecheck            # TypeScript validation
npm run typecheck:paths      # Debug import paths
```

### Debugging
```bash
npm run test:env             # Ver DATABASE_URL actual
node scripts/check-users.ts  # Debug usuarios
node scripts/check-plans.ts  # Debug planes
```

---

## 18. Variables de Entorno Requeridas

### Producción (Vercel)
```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/login"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/casos"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/casos"

# Site
NEXT_PUBLIC_SITE_URL="https://klinikmat.cl"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
MERCADOPAGO_PUBLIC_KEY="APP_USR-..."

# Sentry
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="klinik-mat"
SENTRY_PROJECT="klinik-mat"
SENTRY_AUTH_TOKEN="sntryu_..."

# PubMed (opcional)
PUBMED_API_KEY="..."
```

### Development (.env.local)
```bash
# Mismo que producción pero con keys de test
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 19. Recursos y Referencias

### Documentación Oficial
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Clerk**: https://clerk.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Mercado Pago**: https://www.mercadopago.com/developers
- **Sentry**: https://docs.sentry.io
- **TypeScript**: https://www.typescriptlang.org/docs

### Guías Médicas de Referencia
- **MINSAL Chile**: https://www.minsal.cl
- **ACOG**: https://www.acog.org
- **WHO**: https://www.who.int
- **Williams Obstetrics**: McGraw-Hill Medical

### Comunidad y Soporte
- **GitHub**: https://github.com/santiagopinoortega-eng/KLINIK-MAT
- **Email**: contacto@klinikmat.cl (futuro)
- **Slack/Discord**: (futuro para comunidad)

---

## 20. Créditos y Licencia

**Creador**: Santiago Pino Ortega  
**Propósito**: Educación médica en obstetricia para estudiantes chilenos y latinoamericanos  
**Licencia**: Propietaria (uso educativo autorizado)  
**Año**: 2024-2025

### Tecnologías de Código Abierto Utilizadas
Agradecimientos a las comunidades de:
- Vercel (Next.js)
- Prisma Labs
- Clerk
- Tailwind Labs
- Facebook (React)
- Microsoft (TypeScript)
- PostgreSQL Global Development Group
- Y todas las librerías npm utilizadas

---

**Fin del Documento**  
*Última actualización: 25 de diciembre de 2025*  
*Versión: 1.0.0*
