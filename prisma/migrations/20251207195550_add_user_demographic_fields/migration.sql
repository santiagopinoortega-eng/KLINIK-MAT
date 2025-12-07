-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "university" TEXT,
ADD COLUMN     "year_of_study" INTEGER;

-- AddForeignKey
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
