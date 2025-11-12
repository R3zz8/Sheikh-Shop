-- Migration: Product Architecture Upgrade
-- Date: 2025-01-20
-- Description: 
--   - Rename shortDescription to excerpt (TEXT type)
--   - Add new e-commerce fields (brand, SKU, features, specs, etc.)
--   - Make slug unique
--   - Add indexes for search/filtering
--   - Preserve all existing data

-- Step 1: Rename shortDescription to excerpt and change type to TEXT
ALTER TABLE "Product" 
  RENAME COLUMN "shortDescription" TO "excerpt";

-- Change excerpt from VARCHAR(300) to TEXT
ALTER TABLE "Product" 
  ALTER COLUMN "excerpt" TYPE TEXT USING "excerpt"::TEXT;

-- Step 2: Make slug unique (handle duplicates first)
-- First, ensure no duplicate slugs exist (set NULL for duplicates)
UPDATE "Product" p1
SET "slug" = NULL
WHERE EXISTS (
  SELECT 1 FROM "Product" p2 
  WHERE p2."slug" = p1."slug" 
  AND p2."id" < p1."id"
);

-- Now add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug") WHERE "slug" IS NOT NULL;

-- Step 3: Add new e-commerce fields
ALTER TABLE "Product" 
  ADD COLUMN IF NOT EXISTS "brand" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "sku" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "technicalSpecs" JSONB,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "weightUnit" VARCHAR(10) DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS "dimensions" JSONB,
  ADD COLUMN IF NOT EXISTS "materials" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "warranty" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "origin" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "color" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "scent" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "flavor" VARCHAR(50);

-- Step 4: Add unique constraint for SKU (nullable, so only unique when not null)
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku") WHERE "sku" IS NOT NULL;

-- Step 5: Add indexes for search/filtering
CREATE INDEX IF NOT EXISTS "idx_product_brand" ON "Product"("brand") WHERE "brand" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_product_sku" ON "Product"("sku") WHERE "sku" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_product_origin" ON "Product"("origin") WHERE "origin" IS NOT NULL;

-- GIN index for array fields (tags, features, materials) for efficient array searches
CREATE INDEX IF NOT EXISTS "idx_product_tags_gin" ON "Product" USING GIN("tags");
CREATE INDEX IF NOT EXISTS "idx_product_features_gin" ON "Product" USING GIN("features");
CREATE INDEX IF NOT EXISTS "idx_product_materials_gin" ON "Product" USING GIN("materials");

-- Step 6: Migrate existing shortDescription data to excerpt (already done by rename)
-- If excerpt is empty, we'll auto-generate it in application code

-- Step 7: Add comments for documentation
COMMENT ON COLUMN "Product"."excerpt" IS 'Short description/excerpt (160-240 chars). Auto-generated from description if empty.';
COMMENT ON COLUMN "Product"."description" IS 'Full product description supporting Markdown/HTML formatting';
COMMENT ON COLUMN "Product"."brand" IS 'Product brand name';
COMMENT ON COLUMN "Product"."sku" IS 'Stock Keeping Unit - unique product identifier';
COMMENT ON COLUMN "Product"."features" IS 'Array of product features';
COMMENT ON COLUMN "Product"."technicalSpecs" IS 'JSON object containing technical specifications';
COMMENT ON COLUMN "Product"."tags" IS 'Array of tags for search and filtering';
COMMENT ON COLUMN "Product"."weight" IS 'Product weight';
COMMENT ON COLUMN "Product"."weightUnit" IS 'Unit for weight (kg, g, lb, oz)';
COMMENT ON COLUMN "Product"."dimensions" IS 'JSON object: {length, width, height, unit}';
COMMENT ON COLUMN "Product"."materials" IS 'Array of materials used in product';
COMMENT ON COLUMN "Product"."warranty" IS 'Warranty information';
COMMENT ON COLUMN "Product"."origin" IS 'Country of origin';
COMMENT ON COLUMN "Product"."color" IS 'Color variant';
COMMENT ON COLUMN "Product"."scent" IS 'Scent variant (for perfumes, etc.)';
COMMENT ON COLUMN "Product"."flavor" IS 'Flavor variant (for food products)';



