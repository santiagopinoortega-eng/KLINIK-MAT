// lib/repositories/index.ts
/**
 * Repositories - Capa de acceso a datos
 * 
 * Ventajas del Repository Pattern:
 * - ✅ Abstrae Prisma de la lógica de negocio
 * - ✅ Facilita testing (mock repositories)
 * - ✅ Centraliza queries complejas
 * - ✅ Permite cambio de ORM sin afectar servicios
 * - ✅ Operaciones CRUD reutilizables
 * 
 * Uso en servicios:
 * ```typescript
 * import { userRepository, gameRepository } from '@/lib/repositories';
 * 
 * const user = await userRepository.findById(userId);
 * const stats = await gameRepository.findByUserAndType(userId, 'wordsearch');
 * ```
 */

export { BaseRepository } from './base.repository';
export { UserRepository, userRepository } from './user.repository';
export { ResultRepository, resultRepository } from './result.repository';
export { CaseRepository, caseRepository as casoRepository } from './caso.repository';
export { CaseRepository as StaticCaseRepository } from './case.repository';
export { FavoriteRepository, favoriteRepository } from './favorite.repository';
export { GameRepository, gameRepository } from './game.repository';
export {
  SubscriptionRepository,
  SubscriptionPlanRepository,
  CouponRepository,
  PaymentRepository,
  UsageRecordRepository,
  subscriptionRepository,
  subscriptionPlanRepository,
  couponRepository,
  paymentRepository,
  usageRecordRepository,
} from './subscription.repository';

export type { UserWithRelations } from './user.repository';
export type { ResultWithCase, ResultFilters } from './result.repository';
export type { CaseWithOptions, CaseFilters } from './caso.repository';
export type { FavoriteWithCase } from './favorite.repository';
export type { GameType, UpdateGameStatsData } from './game.repository';
export type {
  SubscriptionWithPlan,
  SubscriptionWithRelations,
} from './subscription.repository';
