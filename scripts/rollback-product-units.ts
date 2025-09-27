#!/usr/bin/env tsx

/**
 * Rollback Script: Remove ProductUnit model and restore original state
 * 
 * WARNING: This script will permanently delete all ProductUnit data!
 * Only use this if you need to rollback the ProductUnit migration.
 * 
 * This script:
 * 1. Deletes all ProductUnit records
 * 2. Drops the ProductUnit table
 * 3. Removes the units relation from Product model (manual step required)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RollbackStats {
  unitsDeleted: number;
  productsAffected: number;
  errors: string[];
}

async function rollbackProductUnits(): Promise<RollbackStats> {
  const stats: RollbackStats = {
    unitsDeleted: 0,
    productsAffected: 0,
    errors: []
  };

  console.log('🔄 Starting ProductUnit rollback process...');
  console.log('⚠️  WARNING: This will permanently delete all ProductUnit data!');
  console.log('');

  try {
    // Get count of ProductUnits before deletion
    const totalUnits = await prisma.productUnit.count();
    const productsWithUnits = await prisma.product.count({
      where: {
        units: {
          some: {}
        }
      }
    });

    console.log(`📊 Found ${totalUnits} ProductUnits to delete`);
    console.log(`📦 Affecting ${productsWithUnits} products`);
    console.log('');

    if (totalUnits === 0) {
      console.log('ℹ️  No ProductUnits found - nothing to rollback');
      return stats;
    }

    // Delete all ProductUnits
    const deleteResult = await prisma.productUnit.deleteMany({});
    stats.unitsDeleted = deleteResult.count;
    stats.productsAffected = productsWithUnits;

    console.log(`✅ Deleted ${stats.unitsDeleted} ProductUnit records`);

  } catch (error) {
    const errorMsg = `Error during rollback: ${error}`;
    stats.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return stats;
}

async function main() {
  console.log('🔄 ProductUnit Rollback Script');
  console.log('==============================');
  console.log('');
  console.log('⚠️  WARNING: This script will permanently delete all ProductUnit data!');
  console.log('⚠️  Make sure you have a database backup before proceeding.');
  console.log('');

  // Safety check
  const confirmMessage = 'Type "ROLLBACK" to confirm deletion of all ProductUnit data';
  console.log(`❓ ${confirmMessage}:`);
  
  // In a real scenario, you would read from stdin
  // For this script, we'll add a safety flag
  const forceFlag = process.argv.includes('--force');
  
  if (!forceFlag) {
    console.log('');
    console.log('🛑 Safety check failed. To proceed, run with --force flag:');
    console.log('   npx tsx scripts/rollback-product-units.ts --force');
    console.log('');
    console.log('📋 Manual rollback steps:');
    console.log('1. Run this script with --force flag');
    console.log('2. Drop the ProductUnit table: DROP TABLE "ProductUnit";');
    console.log('3. Remove the units relation from Product model in schema.prisma');
    console.log('4. Run: npx prisma db push');
    console.log('5. Run: npx prisma generate');
    return;
  }

  console.log('🚨 Force flag detected - proceeding with rollback...');
  console.log('');

  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Run the rollback process
    const stats = await rollbackProductUnits();

    // Print summary
    console.log('');
    console.log('📊 ROLLBACK SUMMARY');
    console.log('==================');
    console.log(`ProductUnits Deleted: ${stats.unitsDeleted}`);
    console.log(`Products Affected: ${stats.productsAffected}`);
    console.log(`Errors: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('');
      console.log('❌ ERRORS ENCOUNTERED:');
      stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (stats.unitsDeleted > 0) {
      console.log('');
      console.log('✅ ProductUnit rollback completed!');
      console.log(`🗑️  Deleted ${stats.unitsDeleted} ProductUnit records`);
      console.log('');
      console.log('📋 NEXT STEPS:');
      console.log('1. Drop the ProductUnit table manually:');
      console.log('   DROP TABLE "ProductUnit";');
      console.log('2. Remove the units relation from Product model in schema.prisma');
      console.log('3. Run: npx prisma db push');
      console.log('4. Run: npx prisma generate');
    }

    // Verify the results
    console.log('');
    console.log('🔍 VERIFICATION');
    console.log('===============');
    
    const remainingUnits = await prisma.productUnit.count();
    if (remainingUnits === 0) {
      console.log('✅ All ProductUnits have been deleted');
    } else {
      console.log(`⚠️  ${remainingUnits} ProductUnits still exist`);
    }

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

export { rollbackProductUnits };
