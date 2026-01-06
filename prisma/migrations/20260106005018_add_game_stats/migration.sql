-- CreateTable
CREATE TABLE "game_stats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_type" TEXT NOT NULL,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "games_played" INTEGER NOT NULL DEFAULT 0,
    "games_won" INTEGER NOT NULL DEFAULT 0,
    "best_streak" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_stats_user_id_idx" ON "game_stats"("user_id");

-- CreateIndex
CREATE INDEX "game_stats_game_type_idx" ON "game_stats"("game_type");

-- CreateIndex
CREATE UNIQUE INDEX "game_stats_user_id_game_type_key" ON "game_stats"("user_id", "game_type");

-- CreateIndex
CREATE INDEX "case_images_caseId_order_idx" ON "case_images"("caseId", "order");

-- CreateIndex
CREATE INDEX "favorites_caseId_created_at_idx" ON "favorites"("caseId", "created_at" DESC);

-- CreateIndex
CREATE INDEX "options_question_id_order_idx" ON "options"("question_id", "order");

-- CreateIndex
CREATE INDEX "question_images_questionId_order_idx" ON "question_images"("questionId", "order");

-- CreateIndex
CREATE INDEX "student_results_userId_caseArea_idx" ON "student_results"("userId", "caseArea");

-- CreateIndex
CREATE INDEX "student_results_caseId_idx" ON "student_results"("caseId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at" DESC);
