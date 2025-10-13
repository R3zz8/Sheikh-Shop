-- Remove duplicate indexes that may cause conflicts
-- These indexes are created multiple times across different migrations

DROP INDEX IF EXISTS "Product_name_idx"; -- Created in multiple migrations
DROP INDEX IF EXISTS "Product_category_status_idx"; -- Created in multiple migrations
DROP INDEX IF EXISTS "Product_basePrice_status_idx"; -- Created in multiple migrations

-- Recreate with proper naming
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_product_name_unique" ON "Product"("name");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_product_category_status_unique" ON "Product"("category", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_product_baseprice_status_unique" ON "Product"("basePrice", "status");
