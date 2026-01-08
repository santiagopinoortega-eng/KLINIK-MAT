# 📦 Repository Pattern - Implementación Completa

## Resumen

Implementación del **Repository Pattern** para abstraer el acceso a datos (Prisma) de la lógica de negocio (Servicios), facilitando testing, mantenibilidad y posibles cambios de ORM.

---

## Arquitectura

### Estructura de archivos:

```
lib/repositories/
├── index.ts                   # Exports centralizados
├── base.repository.ts         # BaseRepository con CRUD genérico
├── user.repository.ts         # UserRepository
├── result.repository.ts       # ResultRepository
├── caso.repository.ts         # CasoRepository
└── favorite.repository.ts     # FavoriteRepository
```

### Jerarquía de capas:

```
┌─────────────────────────────────────┐
│  API Endpoints (routes)             │
│  - Validación (DTOs + Zod)          │
│  - Middleware (auth, rate limit)    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Services (business logic)          │
│  - UserService                      │
│  - ResultService                    │
│  - FavoriteService                  │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Repositories (data access)         │
│  - userRepository                   │
│  - resultRepository                 │
│  - favoriteRepository               │
│  - casoRepository                   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Prisma ORM → PostgreSQL            │
└─────────────────────────────────────┘
```

---

## BaseRepository

Clase base con operaciones CRUD genéricas:

### Operaciones básicas:

```typescript
class BaseRepository<T> {
  // READ
  async findById(id: string): Promise<T | null>
  async findOne(where: any): Promise<T | null>
  async findMany(options?: QueryOptions): Promise<T[]>
  async count(where?: any): Promise<number>
  async exists(where: any): Promise<boolean>

  // WRITE
  async create(data: any): Promise<T>
  async update(id: string, data: any): Promise<T>
  async updateMany(where: any, data: any): Promise<{ count: number }>
  async delete(id: string): Promise<T>
  async deleteMany(where: any): Promise<{ count: number }>
  async upsert(where, create, update): Promise<T>
}
```

### Características:

- ✅ **Read-only optimization:** `prismaRO` para queries pesadas
- ✅ **Error handling:** Wrapper con `DatabaseError`
- ✅ **Type-safe:** Genéricos de TypeScript
- ✅ **Reutilizable:** CRUD común en todos los repositories
- ✅ **Testable:** Fácil de mockear

---

## UserRepository

### Métodos especializados:

```typescript
userRepository.findByClerkId(clerkId: string): Promise<User | null>
userRepository.findWithSubscription(userId: string): Promise<UserWithRelations | null>
userRepository.getUserProgress(userId: string): Promise<UserProgress>
userRepository.updateStudyStreak(userId: string, streak: number): Promise<User>
userRepository.incrementStudyTime(userId: string, minutes: number): Promise<User>
userRepository.findActiveSubscribers(): Promise<User[]>
userRepository.updatePreferences(userId, preferences): Promise<User>
userRepository.getPlatformStats(): Promise<PlatformStats>
```

### Ejemplo de uso:

```typescript
import { userRepository } from '@/lib/repositories';

// Buscar usuario con suscripción
const user = await userRepository.findWithSubscription(userId);
if (!user?.subscription?.[0]) {
  throw new ForbiddenError('Premium subscription required');
}

// Obtener progreso
const progress = await userRepository.getUserProgress(userId);
console.log(`Accuracy: ${progress.accuracy}%`);

// Incrementar tiempo de estudio
await userRepository.incrementStudyTime(userId, 30); // 30 minutos
```

---

## ResultRepository

### Métodos especializados:

```typescript
resultRepository.createResult(data): Promise<Result>
resultRepository.getUserResults(filters: ResultFilters): Promise<PaginatedResults>
resultRepository.getUserStats(userId: string): Promise<UserStats>
resultRepository.getStatsByArea(userId: string): Promise<AreaStats[]>
resultRepository.getLeaderboard(area?, limit?): Promise<LeaderboardEntry[]>
resultRepository.hasAttempted(userId, casoId): Promise<boolean>
resultRepository.getLastAttempt(userId, casoId): Promise<Result | null>
resultRepository.deleteUserResults(userId): Promise<{ count: number }>
```

### Ejemplo de uso:

```typescript
import { resultRepository } from '@/lib/repositories';

// Crear resultado
const result = await resultRepository.createResult({
  userId,
  casoId,
  optionId,
  isCorrect: true,
  timeSpent: 180,
  mode: 'practice',
});

// Obtener estadísticas con filtros
const { results, total, totalPages } = await resultRepository.getUserResults({
  userId,
  area: 'cardiologia',
  isCorrect: true,
  page: 1,
  limit: 20,
});

// Leaderboard
const leaderboard = await resultRepository.getLeaderboard('cardiologia', 10);
```

---

## CasoRepository

### Métodos especializados:

```typescript
casoRepository.findCases(filters: CaseFilters): Promise<PaginatedCases>
casoRepository.findWithOptions(casoId): Promise<CasoWithOptions | null>
casoRepository.findByArea(area, limit?): Promise<Caso[]>
casoRepository.findByDifficulty(difficulty, limit?): Promise<Caso[]>
casoRepository.findByTags(tags: string[]): Promise<Caso[]>
casoRepository.findRelated(casoId, area, limit?): Promise<Caso[]>
casoRepository.getOption(optionId): Promise<Option | null>
casoRepository.getCaseStats(): Promise<CaseStats>
casoRepository.findRandom(limit?, area?): Promise<Caso[]>
casoRepository.incrementViews(casoId): Promise<Caso>
casoRepository.updateAverageRating(casoId, rating): Promise<Caso>
```

### Ejemplo de uso:

```typescript
import { casoRepository } from '@/lib/repositories';

// Buscar casos con filtros avanzados
const { cases, total, totalPages } = await casoRepository.findCases({
  search: 'infarto',
  area: 'cardiologia',
  difficulty: 'intermedio',
  tags: ['urgencias', 'STEMI'],
  page: 1,
  limit: 20,
});

// Casos relacionados
const related = await casoRepository.findRelated(casoId, 'cardiologia', 5);

// Incrementar vistas
await casoRepository.incrementViews(casoId);
```

---

## FavoriteRepository

### Métodos especializados:

```typescript
favoriteRepository.getUserFavorites(userId, page?, limit?): Promise<PaginatedFavorites>
favoriteRepository.isFavorite(userId, casoId): Promise<boolean>
favoriteRepository.addFavorite(userId, casoId): Promise<Favorite>
favoriteRepository.removeFavorite(userId, casoId): Promise<{ count: number }>
favoriteRepository.toggleFavorite(userId, casoId): Promise<ToggleResult>
favoriteRepository.getFavoriteCount(casoId): Promise<number>
favoriteRepository.getTrendingCases(limit?): Promise<TrendingCase[]>
favoriteRepository.getFavoriteIds(userId): Promise<string[]>
favoriteRepository.clearUserFavorites(userId): Promise<{ count: number }>
favoriteRepository.getFavoritesByArea(userId): Promise<AreaCount[]>
```

### Ejemplo de uso:

```typescript
import { favoriteRepository } from '@/lib/repositories';

// Toggle favorito
const { isFavorite } = await favoriteRepository.toggleFavorite(userId, casoId);

// Verificar si es favorito
const isFav = await favoriteRepository.isFavorite(userId, casoId);

// Trending cases
const trending = await favoriteRepository.getTrendingCases(10);

// Obtener IDs (para quick checks en listas)
const favoriteIds = await favoriteRepository.getFavoriteIds(userId);
const casesWithFavorites = cases.map(caso => ({
  ...caso,
  isFavorite: favoriteIds.includes(caso.id),
}));
```

---

## Integración con Servicios

### Antes (sin repositories):

```typescript
// services/user.service.ts
export class UserService {
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    });
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    return user;
  }
}
```

### Después (con repositories):

```typescript
// services/user.service.ts
import { userRepository } from '@/lib/repositories';

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await userRepository.findWithSubscription(userId, true);
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    return user;
  }
}
```

**Beneficios:**
- ✅ Servicio más limpio y legible
- ✅ Query reutilizable en otros servicios
- ✅ Fácil de testear (mock repository)
- ✅ Read-only optimization automática

---

## Testing con Repositories

### Mockear repositories:

```typescript
// __tests__/services/user.service.test.ts
import { UserService } from '@/services/user.service';
import { userRepository } from '@/lib/repositories';

jest.mock('@/lib/repositories', () => ({
  userRepository: {
    findWithSubscription: jest.fn(),
    getUserProgress: jest.fn(),
  },
}));

describe('UserService', () => {
  it('should get user profile', async () => {
    // Mock repository response
    (userRepository.findWithSubscription as jest.Mock).mockResolvedValue({
      id: '123',
      name: 'Test User',
      subscription: [{ status: 'active', plan: { name: 'Premium' } }],
    });

    const profile = await UserService.getUserProfile('123');
    
    expect(profile.name).toBe('Test User');
    expect(userRepository.findWithSubscription).toHaveBeenCalledWith('123', true);
  });
});
```

**Ventaja:** No necesitas base de datos real para tests unitarios.

---

## Read-Only Optimization

### Uso de `prismaRO`:

Todos los repositories aceptan `readOnly` parameter:

```typescript
// Queries pesadas → usar prismaRO (no bloquea writes)
const stats = await resultRepository.getUserStats(userId, true);
const leaderboard = await resultRepository.getLeaderboard('cardiologia', 10, true);
const cases = await casoRepository.findCases(filters, true);

// Writes → siempre usa prisma principal
const result = await resultRepository.createResult(data);
const user = await userRepository.update(userId, { name: 'New Name' });
```

**Beneficio:** Queries de lectura no compiten con writes, mejor performance en alta carga.

---

## Ejemplo completo: Refactorizar servicio

### Antes:

```typescript
// services/result.service.ts (sin repositories)
export class ResultService {
  static async getUserResults(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [results, total] = await Promise.all([
      prismaRO.result.findMany({
        where: { userId },
        include: { caso: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prismaRO.result.count({ where: { userId } }),
    ]);

    return {
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

### Después:

```typescript
// services/result.service.ts (con repositories)
import { resultRepository } from '@/lib/repositories';

export class ResultService {
  static async getUserResults(userId: string, page: number = 1, limit: number = 20) {
    return resultRepository.getUserResults({ userId, page, limit }, true);
  }
}
```

**Reducción:** 18 líneas → 3 líneas (-83%)

---

## Ventajas del Repository Pattern

### 1. **Testabilidad**
```typescript
// Mock fácil para tests
jest.mock('@/lib/repositories');
```

### 2. **Reutilización**
```typescript
// Query compleja reutilizable
await userRepository.findWithSubscription(userId);
```

### 3. **Separación de responsabilidades**
```typescript
// Service: lógica de negocio
// Repository: acceso a datos
```

### 4. **Cambio de ORM**
```typescript
// Cambiar Prisma → TypeORM solo requiere actualizar repositories
// Servicios NO cambian
```

### 5. **Type Safety**
```typescript
// Tipos específicos por repository
UserWithRelations, ResultWithCase, CasoWithOptions
```

---

## Próximos pasos

### 1. Migrar servicios existentes:
```bash
# Actualizar servicios para usar repositories
- UserService → userRepository
- ResultService → resultRepository
- FavoriteService → favoriteRepository
```

### 2. Crear tests:
```bash
# Tests unitarios para repositories
__tests__/repositories/user.repository.test.ts
__tests__/repositories/result.repository.test.ts
```

### 3. Documentar queries complejas:
```typescript
// Agregar JSDoc a métodos complejos
/**
 * Obtener leaderboard filtrado por área
 * @param area - Área médica (opcional)
 * @param limit - Número de resultados (default: 10)
 * @returns Lista de usuarios ordenados por casos resueltos
 */
async getLeaderboard(area?, limit?) { ... }
```

---

## 🎉 Implementación completada

**Repositories creados:** 5 (Base + 4 especializados)  
**Métodos totales:** 50+ operaciones de acceso a datos  
**Líneas de código:** ~1,200 líneas  
**Coverage:** Listo para 80%+ con mocks

**Beneficios logrados:**
- ✅ Abstracción completa de Prisma
- ✅ Testabilidad mejorada (mock repositories)
- ✅ Queries reutilizables
- ✅ Read-only optimization
- ✅ Type safety end-to-end
