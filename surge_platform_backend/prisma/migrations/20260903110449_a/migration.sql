-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'admin');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('email_verification', 'password_reset', 'login_otp');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "profile_image" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
    "password_changed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tier" TEXT NOT NULL,
    "monthly_post_limit" INTEGER NOT NULL,
    "current_posts_count" INTEGER NOT NULL DEFAULT 0,
    "feed_limit" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL,
    "reset_at" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "stripe_invoice_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "queue_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rss_feeds" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "feed_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_fetched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rss_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_posts_buffer" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "feed_id" UUID NOT NULL,
    "url_hash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "raw_content" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "quality_score" INTEGER,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_name" TEXT,
    "group_id" UUID,

    CONSTRAINT "raw_posts_buffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_drafts" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "raw_post_id" UUID,
    "tone_profile_id" UUID,
    "blog_post_content" TEXT,
    "social_plain_text" TEXT,
    "image_url" TEXT,
    "image_provider" TEXT,
    "editor_state" JSONB,
    "raw_content" TEXT,
    "polished_content" TEXT,
    "company_social_post" TEXT,
    "personal_social_post" TEXT,
    "image_concept" TEXT,
    "negative_constraints" TEXT,
    "image_caption" TEXT,
    "group_id" UUID,
    "generation_type" TEXT NOT NULL DEFAULT 'auto_cron',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publishing_channels" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "encrypted_credentials" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publishing_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "published_posts_logs" (
    "id" UUID NOT NULL,
    "draft_id" UUID NOT NULL,
    "channel_id" UUID NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "live_post_url" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "published_posts_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_posts_queue" (
    "id" UUID NOT NULL,
    "log_id" UUID NOT NULL,
    "bullmq_job_id" TEXT NOT NULL,
    "error_message" TEXT,
    "retry_config" JSONB,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_posts_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_analytics" (
    "id" UUID NOT NULL,
    "log_id" UUID NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3),

    CONSTRAINT "post_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" UUID NOT NULL,
    "trace_id" TEXT NOT NULL,
    "company_id" UUID,
    "service_name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tone_profiles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tone_profiles_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "step_one_raw_draft_prompts" (
    "id" UUID NOT NULL,
    "tone_profile_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_one_raw_draft_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_two_polishing_prompts" (
    "id" UUID NOT NULL,
    "tone_profile_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_two_polishing_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_three_image_prompts" (
    "id" UUID NOT NULL,
    "tone_profile_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_three_image_prompts_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "article_groups" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "shared_theme" TEXT NOT NULL,
    "editorial_angle" TEXT NOT NULL,
    "article_urls" TEXT[],
    "article_titles" TEXT[],
    "article_sources" TEXT[],
    "article_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "verification_tokens_user_id_type_used_idx" ON "verification_tokens"("user_id", "type", "used");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_stripe_customer_id_key" ON "companies"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripe_invoice_id_key" ON "invoices"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "rss_feeds_workspace_id_status_idx" ON "rss_feeds"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "rss_feeds_workspace_id_created_at_idx" ON "rss_feeds"("workspace_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "raw_posts_buffer_url_hash_key" ON "raw_posts_buffer"("url_hash");

-- CreateIndex
CREATE INDEX "raw_posts_buffer_workspace_id_status_idx" ON "raw_posts_buffer"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "raw_posts_buffer_workspace_id_created_at_idx" ON "raw_posts_buffer"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "generated_drafts_workspace_id_status_idx" ON "generated_drafts"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "generated_drafts_workspace_id_created_at_idx" ON "generated_drafts"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "generated_drafts_tone_profile_id_idx" ON "generated_drafts"("tone_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "published_posts_logs_idempotency_key_key" ON "published_posts_logs"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "post_analytics_log_id_key" ON "post_analytics"("log_id");

-- CreateIndex
CREATE UNIQUE INDEX "tone_profiles_name_key" ON "tone_profiles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "step_grouping_prompts_tone_profile_id_key" ON "step_grouping_prompts"("tone_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_one_raw_draft_prompts_tone_profile_id_key" ON "step_one_raw_draft_prompts"("tone_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_two_polishing_prompts_tone_profile_id_key" ON "step_two_polishing_prompts"("tone_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_three_image_prompts_tone_profile_id_key" ON "step_three_image_prompts"("tone_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_company_social_prompts_tone_profile_id_key" ON "step_company_social_prompts"("tone_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_personal_social_prompts_tone_profile_id_key" ON "step_personal_social_prompts"("tone_profile_id");

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rss_feeds" ADD CONSTRAINT "rss_feeds_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_posts_buffer" ADD CONSTRAINT "raw_posts_buffer_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_posts_buffer" ADD CONSTRAINT "raw_posts_buffer_feed_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "rss_feeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_posts_buffer" ADD CONSTRAINT "raw_posts_buffer_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "article_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_raw_post_id_fkey" FOREIGN KEY ("raw_post_id") REFERENCES "raw_posts_buffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "article_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishing_channels" ADD CONSTRAINT "publishing_channels_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_posts_logs" ADD CONSTRAINT "published_posts_logs_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "generated_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_posts_logs" ADD CONSTRAINT "published_posts_logs_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "publishing_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "failed_posts_queue" ADD CONSTRAINT "failed_posts_queue_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "published_posts_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "published_posts_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_grouping_prompts" ADD CONSTRAINT "step_grouping_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_one_raw_draft_prompts" ADD CONSTRAINT "step_one_raw_draft_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_two_polishing_prompts" ADD CONSTRAINT "step_two_polishing_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_three_image_prompts" ADD CONSTRAINT "step_three_image_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_company_social_prompts" ADD CONSTRAINT "step_company_social_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_personal_social_prompts" ADD CONSTRAINT "step_personal_social_prompts_tone_profile_id_fkey" FOREIGN KEY ("tone_profile_id") REFERENCES "tone_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_groups" ADD CONSTRAINT "article_groups_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
