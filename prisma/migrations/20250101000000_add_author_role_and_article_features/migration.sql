-- Add AUTHOR role to UserRole enum
ALTER TYPE "public"."UserRole" ADD VALUE 'AUTHOR';

-- Add category and tags to Article table
ALTER TABLE "public"."Article" ADD COLUMN "category" VARCHAR(100);
ALTER TABLE "public"."Article" ADD COLUMN "tags" TEXT[] DEFAULT '{}';

-- Create CommentStatus enum
CREATE TYPE "public"."CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create Comment table
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "public"."CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "articleId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Comment table
CREATE INDEX "Comment_articleId_idx" ON "public"."Comment"("articleId");
CREATE INDEX "Comment_authorId_idx" ON "public"."Comment"("authorId");
CREATE INDEX "Comment_createdAt_idx" ON "public"."Comment"("createdAt");
CREATE INDEX "Comment_status_idx" ON "public"."Comment"("status");

-- Create index for Article category
CREATE INDEX "Article_category_idx" ON "public"."Article"("category");

-- Add foreign key constraints for Comment table
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;



