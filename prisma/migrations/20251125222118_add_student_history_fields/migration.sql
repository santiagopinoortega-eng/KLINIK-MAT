-- DropForeignKey
ALTER TABLE "student_results" DROP CONSTRAINT "student_results_userId_fkey";

-- DropIndex
DROP INDEX "student_results_userId_caseId_key";

-- AlterTable
ALTER TABLE "student_results" ADD COLUMN     "answers" JSONB,
ADD COLUMN     "caseArea" TEXT,
ADD COLUMN     "caseTitle" TEXT,
ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 100;

-- CreateIndex
CREATE INDEX "student_results_userId_completedAt_idx" ON "student_results"("userId", "completedAt" DESC);

-- CreateIndex
CREATE INDEX "student_results_caseArea_idx" ON "student_results"("caseArea");

-- AddForeignKey
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
