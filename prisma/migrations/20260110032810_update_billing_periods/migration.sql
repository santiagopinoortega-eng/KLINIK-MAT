/*
  Warnings:

  - The values [QUARTERLY,YEARLY,BIANNUAL] on the enum `BillingPeriod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BillingPeriod_new" AS ENUM ('MONTHLY', 'SEMIANNUAL', 'ANNUAL');
ALTER TABLE "public"."subscription_plans" ALTER COLUMN "billingPeriod" DROP DEFAULT;
ALTER TABLE "subscription_plans" ALTER COLUMN "billingPeriod" TYPE "BillingPeriod_new" USING ("billingPeriod"::text::"BillingPeriod_new");
ALTER TYPE "BillingPeriod" RENAME TO "BillingPeriod_old";
ALTER TYPE "BillingPeriod_new" RENAME TO "BillingPeriod";
DROP TYPE "public"."BillingPeriod_old";
ALTER TABLE "subscription_plans" ALTER COLUMN "billingPeriod" SET DEFAULT 'MONTHLY';
COMMIT;
