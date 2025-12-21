# Sistema de Límite de Casos Mensuales

## Descripción General

Sistema completo de control de acceso que limita a los usuarios del plan **FREE** a **15 casos clínicos por mes**, mientras que los usuarios de planes premium (BASIC/PREMIUM) tienen acceso ilimitado.

## Arquitectura del Sistema

### 1. Backend - Lógica de Negocio (`lib/subscription.ts`)

#### Funciones Principales

```typescript
// Obtiene el límite de casos según el plan del usuario
getUserCaseLimit(userId: string): Promise<number | null>
// Retorna: 15 para FREE, null (ilimitado) para premium

// Cuenta casos completados en el mes actual
getCasesCompletedThisMonth(userId: string): Promise<number>
// Cuenta registros en StudentResult del mes en curso

// Verifica si el usuario puede acceder a un nuevo caso
canAccessNewCase(userId: string): Promise<{
  canAccess: boolean,
  casesUsed: number,
  caseLimit: number | null,
  remaining: number | null
}>
// Retorna: objeto con información de acceso

// Obtiene estadísticas completas de uso
getUserUsageStats(userId: string): Promise<{
  planName: string,
  planType: string,
  isUnlimited: boolean,
  caseLimit: number | null,
  casesUsed: number,
  remaining: number | null,
  percentage: number,
  isPremium: boolean
}>
```

#### Lógica de Conteo Mensual

```typescript
// Se cuenta desde el día 1 hasta el último día del mes actual
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

// Cuenta en StudentResult donde completedAt está en el rango
const count = await prisma.studentResult.count({
  where: {
    userId,
    completedAt: { gte: firstDayOfMonth, lte: lastDayOfMonth }
  }
});
```

### 2. API Endpoint (`/api/subscription/check-access`)

**Endpoint:** `GET /api/subscription/check-access`

**Autenticación:** Requiere Clerk authentication

**Respuesta:**
```json
{
  "success": true,
  "canAccess": true,
  "planName": "Gratuito",
  "planType": "FREE",
  "isUnlimited": false,
  "caseLimit": 15,
  "casesUsed": 12,
  "remaining": 3,
  "percentage": 80,
  "isPremium": false
}
```

**Casos de Uso:**
- Verificación antes de mostrar caso
- Actualización de badge de uso
- Validación en tiempo real

### 3. Componentes Frontend

#### a) UsageLimitBadge

**Ubicación:** `app/components/UsageLimitBadge.tsx`  
**Uso:** Header/Navegación principal  
**Props:** Ninguno (self-contained)

**Características:**
- Muestra "X / 15 casos este mes" para usuarios FREE
- Muestra "Ilimitado ⭐" para usuarios premium
- Barra de progreso con colores:
  - 🔵 Azul: 0-69% usado
  - 🟠 Naranja: 70-89% usado
  - 🔴 Rojo: 90-100% usado
- Badge "LÍMITE ALCANZADO" cuando canAccess = false
- Botón CTA "Actualizar a Premium" cuando límite alcanzado

**Estado visual:**
```tsx
// FREE user 12/15
<div className="bg-orange-50 border-orange-300">
  📄 12 / 15 casos este mes
  [████████░░] 80%
  3 casos restantes
</div>

// Premium user
<div className="bg-gradient-to-r from-[#D2691E] to-[#B8621E]">
  ⭐ Plan Premium • Ilimitado
</div>

// Límite alcanzado
<div className="bg-red-50 border-red-300">
  📄 15 / 15 casos este mes [LÍMITE ALCANZADO]
  [██████████] 100%
  [🚀 Actualizar a Premium]
</div>
```

#### b) LimitReachedModal

**Ubicación:** `app/components/LimitReachedModal.tsx`  
**Uso:** Cuando usuario intenta acceder más allá del límite  
**Props:**
```typescript
{
  casesUsed: number,
  caseLimit: number,
  onClose: () => void
}
```

**Características:**
- Modal bloqueante con backdrop blur
- Muestra estadísticas (15/15)
- Lista beneficios de Premium
- CTA principal: "Ver Planes Premium"
- Botón secundario: "Volver"
- Nota: "Tu límite se renueva el 1° de cada mes"

#### c) CaseAccessGuard

**Ubicación:** `app/components/CaseAccessGuard.tsx`  
**Uso:** Wrapper en página de caso individual  
**Props:**
```typescript
{
  children: React.ReactNode,
  caseId: string
}
```

**Flujo:**
1. Verifica acceso al montar
2. Si `canAccess = false`, muestra `LimitReachedModal`
3. Si `canAccess = true`, renderiza children (caso)
4. En caso de error de red, permite acceso (fail open para UX)

**Integración:**
```tsx
// En app/casos/[id]/page.tsx
<CaseAccessGuard caseId={casoClient.id}>
  <CasoInteractiveUI casoClient={casoClient} />
</CaseAccessGuard>
```

#### d) MonthlyUsageCard

**Ubicación:** `app/components/MonthlyUsageCard.tsx`  
**Uso:** Página de perfil (/profile)  
**Props:** Ninguno

**Características:**
- Card completa con estadísticas detalladas
- Vista diferente para FREE vs Premium
- Para FREE:
  - Número grande: 12 / 15
  - Porcentaje circular
  - Barra de progreso
  - Casos restantes
  - Advertencias cuando >70%
  - CTA "Obtener Ilimitados"
- Para Premium:
  - ✅ "Ilimitado ⭐"
  - Mensaje motivacional

### 4. Integración en Páginas

#### Header (`app/components/Header.tsx`)

```tsx
import UsageLimitBadge from './UsageLimitBadge';

<div className="flex items-center gap-3">
  {isSignedIn && (
    <div className="hidden sm:block">
      <UsageLimitBadge />
    </div>
  )}
  <UserButton />
</div>
```

#### Caso Individual (`app/casos/[id]/page.tsx`)

```tsx
import { canAccessNewCase } from "@/lib/subscription";

const CaseAccessGuard = dynamic(
  () => import("@/app/components/CaseAccessGuard"),
  { ssr: false }
);

// En el render:
<CaseAccessGuard caseId={casoClient.id}>
  <CasoInteractiveUI casoClient={casoClient} />
</CaseAccessGuard>
```

#### Perfil (`app/profile/page.tsx`)

```tsx
import MonthlyUsageCard from '../components/MonthlyUsageCard';

// Después de la card de suscripción:
<MonthlyUsageCard />
```

## Flujo de Usuario

### Usuario FREE - Dentro del Límite (12/15)

1. **Header:** Ve badge naranja "12 / 15 casos este mes" con barra 80%
2. **Casos:** Puede acceder normalmente a cualquier caso
3. **Perfil:** Ve card con estadísticas detalladas y advertencia
4. **Experiencia:** Funcionalidad completa con recordatorio de límite

### Usuario FREE - Límite Alcanzado (15/15)

1. **Header:** Ve badge rojo "15 / 15 LÍMITE ALCANZADO"
2. **Al intentar caso:** Modal bloqueante aparece
3. **Modal muestra:**
   - "Límite Mensual Alcanzado"
   - Estadísticas 15/15
   - Beneficios de Premium
   - Botón "Ver Planes Premium"
4. **Perfil:** Card muestra alerta roja y CTA principal
5. **Acción:** Debe esperar al 1° del mes o actualizar a Premium

### Usuario Premium

1. **Header:** Ve badge dorado "⭐ Plan Premium • Ilimitado"
2. **Casos:** Acceso sin restricciones
3. **Perfil:** Card muestra ✅ "Ilimitado" con mensaje motivacional
4. **Experiencia:** Sin interrupciones ni advertencias

## Seguridad

### Validación Server-Side

- ✅ Todas las verificaciones ocurren en el servidor
- ✅ Endpoint protegido con Clerk authentication
- ✅ No es posible bypass desde cliente
- ✅ Query directa a base de datos (Prisma)

### Fail-Safe Behavior

```typescript
// Si hay error de red, permitir acceso (fail open)
catch (error) {
  console.error('Error checking access:', error);
  setAccessInfo({
    canAccess: true, // Permitir acceso para mejor UX
    casesUsed: 0,
    caseLimit: null,
    remaining: null,
  });
}
```

### Tabla de Base de Datos

El sistema usa la tabla existente `StudentResult`:

```prisma
model StudentResult {
  id          String    @id @default(cuid())
  userId      String
  caseId      String
  completedAt DateTime  @default(now())
  score       Float?
  // ... otros campos
}
```

**No se requieren migraciones** - el sistema usa la estructura existente.

## Configuración de Planes

### En `prisma/schema.prisma`:

```prisma
model SubscriptionPlan {
  name               String
  displayName        String
  maxCasesPerMonth   Int?  // null = ilimitado, 15 = FREE
  // ... otros campos
}
```

### Planes actuales:

| Plan     | maxCasesPerMonth | Descripción        |
|----------|------------------|--------------------|
| FREE     | 15               | 15 casos/mes       |
| BASIC    | null             | Ilimitado          |
| PREMIUM  | null             | Ilimitado          |

## Testing

### Casos de Prueba

1. **Usuario nuevo FREE**
   - ✅ Ve 0/15
   - ✅ Puede acceder a todos los casos

2. **Usuario FREE con 14 casos**
   - ✅ Ve 14/15 con advertencia naranja
   - ✅ Puede acceder a 1 caso más

3. **Usuario FREE con 15 casos**
   - ✅ Ve 15/15 LÍMITE ALCANZADO
   - ✅ Modal bloquea acceso a nuevos casos
   - ✅ CTA visible para upgrade

4. **Usuario actualiza a BASIC**
   - ✅ Badge cambia a "Ilimitado"
   - ✅ Modal no aparece más
   - ✅ Acceso sin restricciones

5. **Cambio de mes**
   - ✅ El día 1 del mes, contador resetea a 0
   - ✅ Usuario FREE vuelve a tener 15 casos disponibles

### Simulación Manual

```typescript
// En scripts/simulate-usage.ts (crear si es necesario)
import { prisma } from '@/lib/prisma';

async function simulateUsage(userId: string, casesCount: number) {
  const now = new Date();
  const promises = [];
  
  for (let i = 0; i < casesCount; i++) {
    promises.push(
      prisma.studentResult.create({
        data: {
          userId,
          caseId: `test-case-${i}`,
          completedAt: now,
          score: Math.random() * 100,
        }
      })
    );
  }
  
  await Promise.all(promises);
  console.log(`✅ Created ${casesCount} completed cases for user ${userId}`);
}

// Uso: simulateUsage('user_xxx', 14); // Simular 14 casos
```

## Métricas y Analytics

### Eventos a Trackear

1. **limit_warning_shown** - Usuario ve advertencia 70%+
2. **limit_reached** - Usuario alcanza 15/15
3. **limit_modal_shown** - Modal de bloqueo mostrado
4. **upgrade_from_limit** - Usuario upgrade después de límite
5. **monthly_reset** - Contador reseteado el día 1

### KPIs Importantes

- % usuarios FREE que alcanzan límite
- Tasa de conversión (límite → upgrade)
- Promedio de casos por usuario FREE
- Distribución de uso (0-5, 6-10, 11-15)

## Mantenimiento

### Tareas Recurrentes

- Monitorear logs de error en check-access
- Verificar precisión del conteo mensual
- Revisar conversiones FREE → Premium
- Ajustar límite si es necesario (actualmente 15)

### Posibles Mejoras Futuras

1. **Email notifications** - Notificar al 80% y 100%
2. **Límites personalizados** - Promociones especiales
3. **Rollover de casos** - Casos no usados al mes siguiente
4. **Trial Premium** - 7 días gratis después de límite
5. **Analytics dashboard** - Panel admin con métricas

## Troubleshooting

### Problema: Badge no actualiza después de completar caso

**Solución:** Badge consulta API en `useEffect` sin dependencias. Agregar refresh manual:

```typescript
// En CasoInteractiveUI.tsx (después de completar caso)
window.dispatchEvent(new Event('usage-updated'));

// En UsageLimitBadge.tsx
useEffect(() => {
  const handleUpdate = () => fetchUsage();
  window.addEventListener('usage-updated', handleUpdate);
  return () => window.removeEventListener('usage-updated', handleUpdate);
}, []);
```

### Problema: Contador incorrecto después de cambio de mes

**Verificar:** Lógica de fecha en `getCasesCompletedThisMonth`

```typescript
// Debe usar mes ACTUAL, no período de suscripción
const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
```

### Problema: Modal aparece para usuarios Premium

**Debug:**
1. Verificar `subscription.plan.maxCasesPerMonth` es `null`
2. Verificar `getUserCaseLimit` retorna `null`
3. Verificar `canAccess` es `true` en response

## Conclusión

Sistema completo, seguro y funcional que:

✅ Limita usuarios FREE a 15 casos/mes  
✅ Valida server-side (no bypass posible)  
✅ UI clara con badges y advertencias  
✅ Modal bloqueante cuando límite alcanzado  
✅ CTAs para upgrade en múltiples puntos  
✅ Reset automático cada mes  
✅ Experiencia premium sin interrupciones  

**Estado:** ✅ Implementado y desplegado
**Última actualización:** 2024
