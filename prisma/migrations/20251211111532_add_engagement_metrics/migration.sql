-- CreateTable
CREATE TABLE "engagement_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "recommendationGroup" TEXT,
    "action" TEXT NOT NULL,
    "sessionDuration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "engagement_metrics_userId_timestamp_idx" ON "engagement_metrics"("userId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "engagement_metrics_source_idx" ON "engagement_metrics"("source");

-- CreateIndex
CREATE INDEX "engagement_metrics_recommendationGroup_idx" ON "engagement_metrics"("recommendationGroup");

-- AddForeignKey
ALTER TABLE "engagement_metrics" ADD CONSTRAINT "engagement_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_metrics" ADD CONSTRAINT "engagement_metrics_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
