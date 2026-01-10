// prisma/migrations/YYYYMMDDHHMMSS_add_idempotency_keys/migration.sql
/**
 * Migración: Agregar tabla para idempotency keys
 * 
 * Esta tabla almacena las respuestas de operaciones idempotentes
 * para prevenir pagos duplicados.
 */

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Índice único en key para prevenir duplicados
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
-- Índice en expiresAt para limpieza eficiente de keys expirados
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");

-- CreateIndex
-- Índice en createdAt para queries de auditoría
CREATE INDEX "IdempotencyKey_createdAt_idx" ON "IdempotencyKey"("createdAt");

-- Comentarios
COMMENT ON TABLE "IdempotencyKey" IS 'Almacena respuestas de operaciones idempotentes para prevenir duplicados';
COMMENT ON COLUMN "IdempotencyKey"."key" IS 'Key único de la operación (ej: IDEM_payment_userId_planId_timestamp)';
COMMENT ON COLUMN "IdempotencyKey"."response" IS 'Respuesta JSON de la operación original';
COMMENT ON COLUMN "IdempotencyKey"."expiresAt" IS 'Fecha de expiración (típicamente 24h después de creación)';
