/**
 * Migration script to populate slug field for existing products
 * Run this after the Prisma migration that adds the slug field
 * 
 * Usage: npx tsx scripts/migrate-product-slugs.ts
 */

import { PrismaClient } from '@prisma/client';
import { generateProductSlug } from '../src/lib/utils/slug';

const prisma = new PrismaClient();

async function migrateProductSlugs() {
  try {
    console.log('🚀 Starting product slug migration...');
    
    // Fetch all products (use raw query to handle optional slug field)
    const products = await prisma.$queryRaw<Array<{ id: string; name: string; slug: string | null }>>`
      SELECT id, name, slug FROM "Product" ORDER BY "createdAt" ASC
    `;
    
    console.log(`📦 Found ${products.length} products to process`);
    
    // Get all existing slugs to ensure uniqueness
    const existingSlugs = products
      .map(p => p.slug)
      .filter((slug): slug is string => slug !== null && slug !== undefined);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const product of products) {
      try {
        // Skip if slug already exists
        if (product.slug) {
          console.log(`⏭️  Skipping ${product.name} - already has slug: ${product.slug}`);
          skipped++;
          continue;
        }
        
        // Generate unique slug
        const slug = generateProductSlug(
          product.name,
          existingSlugs,
          product.id
        );
        
        // Update product with slug using raw query
        await prisma.$executeRaw`
          UPDATE "Product" SET slug = ${slug} WHERE id = ${product.id}
        `;
        
        // Add to existing slugs array for next iterations
        existingSlugs.push(slug);
        
        console.log(`✅ Updated ${product.name} -> ${slug}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${product.name}:`, error);
        errors++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total: ${products.length}`);
    
    // Verify all products have slugs
    const productsWithoutSlugs = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
      SELECT id, name FROM "Product" WHERE slug IS NULL
    `;
    
    if (productsWithoutSlugs.length > 0) {
      console.log(`\n⚠️  Warning: ${productsWithoutSlugs.length} products still without slugs:`);
      productsWithoutSlugs.forEach(p => console.log(`   - ${p.name} (${p.id})`));
    } else {
      console.log('\n🎉 All products now have slugs!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateProductSlugs()
  .then(() => {
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });

