-- Add SEO fields to Product table
-- This migration adds slug and SEO-specific fields for better SEO optimization

-- Add slug field (nullable initially, will be populated by migration script)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(255);

-- Add SEO-specific fields
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "seoTitle" VARCHAR(60);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "seoDescription" VARCHAR(160);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "canonicalUrl" VARCHAR(500);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "ogImage" VARCHAR(500);

-- Create unique index on slug (only after ensuring no duplicates)
-- Note: This will fail if there are duplicate NULL values, but NULL values are allowed
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug") WHERE "slug" IS NOT NULL;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS "Product_slug_idx" ON "Product"("slug");

-- Create composite index for name and status
CREATE INDEX IF NOT EXISTS "idx_product_name_status" ON "Product"("name", "status");

