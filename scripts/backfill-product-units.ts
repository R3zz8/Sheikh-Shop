#!/usr/bin/env tsx

/**
 * Backfill Script: Create ProductUnit records for existing products
 * 
 * This script creates default ProductUnit records for all existing products
 * using their current basePrice, quantity, and baseUnitId values.
 * 
 * The script is idempotent - it can be run multiple times safely.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BackfillStats {
  totalProducts: number;
  productsWithUnits: number;
  productsWithoutUnits: number;
  unitsCreated: number;
  errors: string[];
}

async function backfillProductUnits(): Promise<BackfillStats> {
  const stats: BackfillStats = {
    totalProducts: 0,
    productsWithUnits: 0,
    productsWithoutUnits: 0,
    unitsCreated: 0,
    errors: []
  };

  console.log('🔄 Starting ProductUnit backfill process...');
  console.log('📊 This script will create default ProductUnit records for existing products');
  console.log('');

  try {
    // Get all products with their base unit information
    const products = await prisma.product.findMany({
      include: {
        baseUnit: true,
        units: true // Include existing ProductUnits
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    stats.totalProducts = products.length;
    console.log(`📦 Found ${stats.totalProducts} products to process`);

    for (const product of products) {
      try {
        // Check if product already has ProductUnits
        if (product.units.length > 0) {
          stats.productsWithUnits++;
          console.log(`✅ Product "${product.name}" already has ${product.units.length} unit(s) - skipping`);
          continue;
        }

        stats.productsWithoutUnits++;

        // Create a default ProductUnit using existing product data
        const defaultUnitName = product.baseUnit ? 
          `Default (${product.baseUnit.symbol})` : 
          'Default Unit';

        const productUnit = await prisma.productUnit.create({
          data: {
            productId: product.id,
            name: defaultUnitName,
            price: product.basePrice,
            stock: product.quantity,
            isActive: product.status === 'ACTIVE'
          }
        });

        stats.unitsCreated++;
        console.log(`✨ Created default unit for "${product.name}": ${defaultUnitName} - Price: $${product.basePrice}, Stock: ${product.quantity}`);

      } catch (error) {
        const errorMsg = `Failed to process product "${product.name}": ${error}`;
        stats.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

  } catch (error) {
    const errorMsg = `Critical error during backfill: ${error}`;
    stats.errors.push(errorMsg);
    console.error(`💥 ${errorMsg}`);
  }

  return stats;
}

async function main() {
  console.log('🚀 ProductUnit Backfill Script');
  console.log('===============================');
  console.log('');

  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Run the backfill process
    const stats = await backfillProductUnits();

    // Print summary
    console.log('');
    console.log('📊 BACKFILL SUMMARY');
    console.log('==================');
    console.log(`Total Products Processed: ${stats.totalProducts}`);
    console.log(`Products Already Had Units: ${stats.productsWithUnits}`);
    console.log(`Products Without Units: ${stats.productsWithoutUnits}`);
    console.log(`Units Created: ${stats.unitsCreated}`);
    console.log(`Errors: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('');
      console.log('❌ ERRORS ENCOUNTERED:');
      stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (stats.unitsCreated > 0) {
      console.log('');
      console.log('✅ Backfill completed successfully!');
      console.log(`🎉 Created ${stats.unitsCreated} ProductUnit records`);
    } else {
      console.log('');
      console.log('ℹ️  No new units were created (all products already had units)');
    }

    // Verify the results
    console.log('');
    console.log('🔍 VERIFICATION');
    console.log('===============');
    
    const productsWithoutUnits = await prisma.product.findMany({
      where: {
        units: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    if (productsWithoutUnits.length === 0) {
      console.log('✅ All products now have at least one ProductUnit');
    } else {
      console.log(`⚠️  ${productsWithoutUnits.length} products still don't have units:`);
      productsWithoutUnits.forEach(product => {
        console.log(`   - ${product.name} (${product.id})`);
      });
    }

    const totalUnits = await prisma.productUnit.count();
    console.log(`📊 Total ProductUnits in database: ${totalUnits}`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('');
    console.log('👋 Disconnected from database');
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { backfillProductUnits };
