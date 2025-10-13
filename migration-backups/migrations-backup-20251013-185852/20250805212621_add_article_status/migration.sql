-- CreateEnum
CREATE TYPE "public"."ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "public"."Article" ADD COLUMN     "status" "public"."ArticleStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "public"."Article"("status");
