#!/usr/bin/env tsx

/**
 * Test Script: Verify ProductUnit functionality
 * 
 * This script tests the new ProductUnit model and relationships
 * to ensure everything is working correctly.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProductUnits() {
  console.log('🧪 Testing ProductUnit functionality...');
  console.log('');

  try {
    // Test 1: Query products with their units
    console.log('📋 Test 1: Query products with ProductUnits');
    const productsWithUnits = await prisma.product.findMany({
      include: {
        units: true,
        baseUnit: true
      },
      take: 3
    });

    console.log(`Found ${productsWithUnits.length} products:`);
    productsWithUnits.forEach(product => {
      console.log(`  📦 ${product.name}`);
      console.log(`     Base Unit: ${product.baseUnit?.symbol || 'N/A'}`);
      console.log(`     ProductUnits (${product.units.length}):`);
      product.units.forEach(unit => {
        console.log(`       - ${unit.name}: $${unit.price}, Stock: ${unit.stock}, Active: ${unit.isActive}`);
      });
    });
    console.log('');

    // Test 2: Create a new ProductUnit for an existing product
    console.log('📋 Test 2: Create additional ProductUnit');
    const firstProduct = productsWithUnits[0];
    if (firstProduct) {
      const newUnit = await prisma.productUnit.create({
        data: {
          productId: firstProduct.id,
          name: 'Large Pack',
          price: firstProduct.basePrice * 2,
          stock: 10,
          isActive: true
        }
      });
      console.log(`✅ Created new unit: ${newUnit.name} for ${firstProduct.name}`);
      console.log(`   Price: $${newUnit.price}, Stock: ${newUnit.stock}`);
    }
    console.log('');

    // Test 3: Query ProductUnits with product information
    console.log('📋 Test 3: Query ProductUnits with product info');
    const unitsWithProducts = await prisma.productUnit.findMany({
      include: {
        product: {
          select: {
            name: true,
            category: true,
            basePrice: true
          }
        }
      },
      take: 5
    });

    console.log(`Found ${unitsWithProducts.length} ProductUnits:`);
    unitsWithProducts.forEach(unit => {
      console.log(`  📦 ${unit.name} (${unit.product.name})`);
      console.log(`     Price: $${unit.price} | Stock: ${unit.stock} | Active: ${unit.isActive}`);
    });
    console.log('');

    // Test 4: Test filtering and counting
    console.log('📋 Test 4: Filtering and counting');
    const activeUnits = await prisma.productUnit.count({
      where: { isActive: true }
    });
    const lowStockUnits = await prisma.productUnit.findMany({
      where: { stock: { lte: 20 } },
      select: {
        name: true,
        stock: true,
        product: {
          select: { name: true }
        }
      }
    });

    console.log(`Active ProductUnits: ${activeUnits}`);
    console.log(`Low stock units (≤20): ${lowStockUnits.length}`);
    lowStockUnits.forEach(unit => {
      console.log(`  ⚠️  ${unit.name} (${unit.product.name}): ${unit.stock} in stock`);
    });
    console.log('');

    // Test 5: Verify backward compatibility
    console.log('📋 Test 5: Backward compatibility check');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        basePrice: true,
        quantity: true,
        baseUnit: {
          select: { symbol: true }
        }
      },
      take: 3
    });

    console.log('Original Product fields still accessible:');
    products.forEach(product => {
      console.log(`  📦 ${product.name}`);
      console.log(`     Base Price: $${product.basePrice}`);
      console.log(`     Quantity: ${product.quantity}`);
      console.log(`     Base Unit: ${product.baseUnit?.symbol || 'N/A'}`);
    });

    console.log('');
    console.log('✅ All tests passed! ProductUnit model is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🧪 ProductUnit Test Script');
  console.log('===========================');
  console.log('');

  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
    console.log('');

    await testProductUnits();

  } catch (error) {
    console.error('💥 Test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('');
    console.log('👋 Disconnected from database');
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { testProductUnits };
