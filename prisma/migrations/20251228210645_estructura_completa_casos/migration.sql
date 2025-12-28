-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "ai" JSONB,
ADD COLUMN     "aprendizaje" JSONB,
ADD COLUMN     "blueprint" JSONB,
ADD COLUMN     "escenario" JSONB,
ADD COLUMN     "objetivos_aprendizaje" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "cases_version_idx" ON "cases"("version");
