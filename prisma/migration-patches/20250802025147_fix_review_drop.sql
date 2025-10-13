-- Fix for migration 20250802025147_add_article_model
-- The Review table drop failed, need to ensure proper cleanup

-- Check if Review table has any data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Review') THEN
        -- Drop foreign key constraints first
        ALTER TABLE "public"."Review" DROP CONSTRAINT IF EXISTS "Review_productId_fkey";
        ALTER TABLE "public"."Review" DROP CONSTRAINT IF EXISTS "Review_userId_fkey";
        
        -- Drop the table
        DROP TABLE IF EXISTS "public"."Review";
        
        RAISE NOTICE 'Review table dropped successfully';
    ELSE
        RAISE NOTICE 'Review table does not exist';
    END IF;
END $$;
