#!/usr/bin/env tsx

/**
 * SEO Validation Script
 *
 * This script runs through all products in the database and validates their SEO data.
 * It checks for common issues like missing meta titles, descriptions, and other
 * important SEO attributes.
 *
 * It will exit with a non-zero status code if any errors are found, making it
 * suitable for use in a CI/CD pipeline or a pre-commit hook.
 */

import { PrismaClient } from '@prisma/client';
import { getProductSEO, validateProductSEO } from '../src/lib/seo/product-seo';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Starting SEO validation...');

  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');

    const products = await prisma.product.findMany({
      include: {
        images: true,
        videos: true,
        baseUnit: true,
        discounts: true,
        units: true,
      },
    });

    console.log(`Found ${products.length} products to validate...`);

    let errorCount = 0;
    let warningCount = 0;

    for (const product of products) {
      const transformedProduct = {
        ...product,
        oldPrice: null,
        units: product.units.map(unit => ({ ...unit, oldPrice: null, price: unit.price.toNumber() })),
      };
      const seoData = getProductSEO(transformedProduct, { logFallbacks: true });
      const validation = validateProductSEO(seoData);

      if (!validation.isValid || validation.warnings.length > 0) {
        console.log(`\n❌ Found issues with product: ${product.name} (ID: ${product.id})`);
        if (!validation.isValid) {
          errorCount += validation.errors.length;
          validation.errors.forEach(error => console.error(`   - ERROR: ${error}`));
        }
        if (validation.warnings.length > 0) {
          warningCount += validation.warnings.length;
          validation.warnings.forEach(warning => console.warn(`   - WARNING: ${warning}`));
        }
      }
    }

    console.log('\n--------------------');
    console.log('✅ SEO Validation Complete');
    console.log(`   - Products scanned: ${products.length}`);
    console.log(`   - Errors found: ${errorCount}`);
    console.log(`   - Warnings found: ${warningCount}`);
    console.log('--------------------');

    if (errorCount > 0) {
      console.error('\n❌ SEO validation failed with errors.');
      process.exit(1);
    } else {
      console.log('\n🎉 SEO validation passed.');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ An unexpected error occurred during SEO validation:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
