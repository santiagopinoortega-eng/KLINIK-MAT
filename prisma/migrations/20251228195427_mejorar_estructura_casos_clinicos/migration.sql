/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `options` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `options` table. All the data in the column will be lost.
  - You are about to drop the column `caseId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `feedbackDocente` on the `questions` table. All the data in the column will be lost.
  - Added the required column `question_id` to the `options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `case_id` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enunciado` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "options" DROP CONSTRAINT "options_questionId_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_caseId_fkey";

-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "referencias" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "options" DROP COLUMN "isCorrect",
DROP COLUMN "questionId",
ADD COLUMN     "explicacion" TEXT,
ADD COLUMN     "is_correct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "question_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "caseId",
DROP COLUMN "feedbackDocente",
ADD COLUMN     "case_id" TEXT NOT NULL,
ADD COLUMN     "criterios_evaluacion" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "enunciado" TEXT NOT NULL,
ADD COLUMN     "feedback_docente" TEXT,
ADD COLUMN     "puntos_maximos" INTEGER DEFAULT 0,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'mcq',
ALTER COLUMN "text" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "cases_modulo_idx" ON "cases"("modulo");

-- CreateIndex
CREATE INDEX "questions_case_id_order_idx" ON "questions"("case_id", "order");

-- CreateIndex
CREATE INDEX "questions_tipo_idx" ON "questions"("tipo");

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
