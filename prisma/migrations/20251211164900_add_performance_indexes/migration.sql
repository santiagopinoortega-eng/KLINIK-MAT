-- CreateIndex
CREATE INDEX "cases_area_difficulty_idx" ON "cases"("area", "difficulty");

-- CreateIndex
CREATE INDEX "cases_isPublic_created_at_idx" ON "cases"("isPublic", "created_at" DESC);

-- CreateIndex
CREATE INDEX "cases_area_isPublic_idx" ON "cases"("area", "isPublic");

-- CreateIndex
CREATE INDEX "users_specialty_idx" ON "users"("specialty");

-- CreateIndex
CREATE INDEX "users_country_idx" ON "users"("country");
