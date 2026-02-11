/*
  Warnings:

  - The values [STARTER] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[auth0_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WebhookEvent" AS ENUM ('FLAG_CREATED', 'FLAG_UPDATED', 'FLAG_DELETED', 'FLAG_TOGGLED', 'ENVIRONMENT_CREATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'SEGMENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'SEGMENT_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'SEGMENT_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'WEBHOOK_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'WEBHOOK_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'WEBHOOK_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'SCHEDULE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'SCHEDULE_CANCELED';

-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'PRO', 'TEAM', 'ENTERPRISE');
ALTER TABLE "public"."subscriptions" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "flag_environments" ADD COLUMN     "scheduled_disable_at" TIMESTAMP(3),
ADD COLUMN     "scheduled_enable_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "custom_rate_limit" INTEGER,
ALTER COLUMN "stripe_customer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "sso_connection_id" TEXT,
ADD COLUMN     "sso_domain" TEXT,
ADD COLUMN     "sso_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sso_provider" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth0_id" TEXT;

-- CreateTable
CREATE TABLE "segments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rules" JSONB NOT NULL DEFAULT '[]',
    "project_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" "WebhookEvent"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "project_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "last_status" INTEGER,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "segments_project_id_name_key" ON "segments"("project_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth0_id_key" ON "users"("auth0_id");

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
