-- RemoveAISystem: Elimina las tablas de IA y campos relacionados

-- Drop tables de IA
DROP TABLE IF EXISTS "ai_usage" CASCADE;
DROP TABLE IF EXISTS "cache_entries" CASCADE;

-- Remove campos de IA del modelo Case (si existen)
ALTER TABLE "cases" DROP COLUMN IF EXISTS "objetivos_aprendizaje";
ALTER TABLE "cases" DROP COLUMN IF EXISTS "blueprint";
ALTER TABLE "cases" DROP COLUMN IF EXISTS "escenario";
ALTER TABLE "cases" DROP COLUMN IF EXISTS "feedback_dinamico";
ALTER TABLE "cases" DROP COLUMN IF EXISTS "referencias";
ALTER TABLE "cases" DROP COLUMN IF EXISTS "aprendizaje";
ALTER TABLE "cases" DROP COLUMN IF EXISTS "ai";
