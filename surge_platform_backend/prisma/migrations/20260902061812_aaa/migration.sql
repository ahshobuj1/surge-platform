-- DropIndex
DROP INDEX "generated_drafts_workspace_id_idx";

-- CreateTable
CREATE TABLE "step_grouping_prompts" (
    "id" UUID NOT NULL,
    "tone_profile_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_grouping_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_company_social_prompts" (
    "id" UUID NOT NULL,
    "tone_profile_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_company_social_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_personal_social_prompts" (
    "id" UUID NOT NULL,
    "tone_profile_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_personal_social_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "step_grouping_prompts_tone_profile_id_key" ON "step_grouping_prompts"("tone_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_company_social_prompts_tone_profile_id_key" ON "step_company_social_prompts"("tone_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_personal_social_prompts_tone_profile_id_key" ON "step_personal_social_prompts"("tone_profile_id");

-- CreateIndex
CREATE INDEX "generated_drafts_workspace_id_status_idx" ON "generated_drafts"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "generated_drafts_workspace_id_created_at_idx" ON "generated_drafts"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "raw_posts_buffer_workspace_id_status_idx" ON "raw_posts_buffer"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "raw_posts_buffer_workspace_id_created_at_idx" ON "raw_posts_buffer"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "rss_feeds_workspace_id_status_idx" ON "rss_feeds"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "rss_feeds_workspace_id_created_at_idx" ON "rss_feeds"("workspace_id", "created_at");

-- AddForeignKey
ALTER TABLE "step_grouping_prompts" ADD CONSTRAINT "step_grouping_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_company_social_prompts" ADD CONSTRAINT "step_company_social_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_personal_social_prompts" ADD CONSTRAINT "step_personal_social_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
