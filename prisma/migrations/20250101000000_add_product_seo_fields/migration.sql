-- AlterTable: Add new SEO fields to Product model
-- Migration: Add h1Override, shortDescription, ogTitle, ogDescription, schemaMarkup
-- Note: slug is NOT unique (can have multiple products with same slug for different contexts)

-- Add new SEO fields
ALTER TABLE "Product" 
  ADD COLUMN IF NOT EXISTS "h1Override" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "shortDescription" VARCHAR(300),
  ADD COLUMN IF NOT EXISTS "ogTitle" VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "ogDescription" VARCHAR(160),
  ADD COLUMN IF NOT EXISTS "schemaMarkup" JSONB;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS "idx_product_h1override" ON "Product"("h1Override") WHERE "h1Override" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_product_ogtitle" ON "Product"("ogTitle") WHERE "ogTitle" IS NOT NULL;

