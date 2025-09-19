#!/usr/bin/env tsx

/**
 * Migration script to convert existing product prices to EUR
 * 
 * IMPORTANT: This script assumes current prices are in USD.
 * If your current prices are in AED or another currency, update the FROM_CURRENCY constant.
 * 
 * Usage:
 * 1. Backup your database first!
 * 2. Run: npx tsx scripts/migrate-currency-to-eur.ts
 * 3. Verify the results before deploying
 */

import { PrismaClient } from '@prisma/client';
import { convertCurrency } from '../src/lib/currency';

const prisma = new PrismaClient();

// Configuration - UPDATE THIS BASED ON YOUR CURRENT CURRENCY
const FROM_CURRENCY = 'USD' as const; // Change to 'AED' if your current prices are in AED
const TO_CURRENCY = 'EUR' as const;

async function migrateProductPrices() {
  console.log('🚀 Starting currency migration...');
  console.log(`📊 Converting prices from ${FROM_CURRENCY} to ${TO_CURRENCY}`);
  
  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        basePrice: true,
      },
    });

    console.log(`📦 Found ${products.length} products to migrate`);

    if (products.length === 0) {
      console.log('✅ No products found. Migration complete.');
      return;
    }

    // Show preview of first few products
    console.log('\n📋 Preview of products to be migrated:');
    products.slice(0, 5).forEach((product, index) => {
      const newPrice = convertCurrency(product.basePrice, FROM_CURRENCY, TO_CURRENCY);
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ${FROM_CURRENCY} ${product.basePrice} → ${TO_CURRENCY} ${newPrice.toFixed(2)}`);
    });

    if (products.length > 5) {
      console.log(`   ... and ${products.length - 5} more products`);
    }

    // Ask for confirmation (in a real script, you might want to add readline for interactive confirmation)
    console.log('\n⚠️  WARNING: This will update all product prices in the database!');
    console.log('💡 Make sure you have a database backup before proceeding.');
    console.log('🔄 Starting migration in 3 seconds...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    let migratedCount = 0;
    let errorCount = 0;

    // Migrate each product
    for (const product of products) {
      try {
        const newPrice = convertCurrency(product.basePrice, FROM_CURRENCY, TO_CURRENCY);
        
        await prisma.product.update({
          where: { id: product.id },
          data: { basePrice: newPrice },
        });

        migratedCount++;
        
        if (migratedCount % 10 === 0) {
          console.log(`✅ Migrated ${migratedCount}/${products.length} products...`);
        }
      } catch (error) {
        console.error(`❌ Error migrating product ${product.name}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} products`);
    if (errorCount > 0) {
      console.log(`❌ Errors encountered: ${errorCount} products`);
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const sampleProducts = await prisma.product.findMany({
      take: 3,
      select: {
        name: true,
        basePrice: true,
      },
    });

    console.log('📊 Sample of migrated prices:');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}: ${TO_CURRENCY} ${product.basePrice}`);
    });

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateProductPrices()
  .then(() => {
    console.log('✨ Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });

