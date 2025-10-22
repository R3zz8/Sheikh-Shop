#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyKabkabDates() {
  try {
    console.log('🔍 Verifying Kabkab Dates product...');

    const product = await prisma.product.findUnique({
      where: { name: 'Kabkab Dates' },
      include: {
        baseUnit: {
          select: { name: true, symbol: true }
        },
        images: {
          select: { id: true, image: true, secureUrl: true }
        }
      }
    });

    if (!product) {
      console.log('❌ Product "Kabkab Dates" not found in database');
      return;
    }

    console.log('✅ Product found in database:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Base Price: $${product.basePrice}`);
    console.log(`   Quantity: ${product.quantity}`);
    console.log(`   Category: ${product.category}`);
    console.log(`   Status: ${product.status}`);
    console.log(`   Base Unit: ${product.baseUnit.name} (${product.baseUnit.symbol})`);
    console.log(`   Description: ${product.description?.substring(0, 100)}...`);
    console.log(`   Images: ${product.images.length} images`);
    console.log(`   Created: ${product.createdAt}`);
    console.log(`   Updated: ${product.updatedAt}`);

    // Check if it appears in the products list
    const allProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, category: true, basePrice: true },
      orderBy: { name: 'asc' }
    });

    const kabkabIndex = allProducts.findIndex(p => p.name === 'Kabkab Dates');
    if (kabkabIndex >= 0) {
      console.log(`✅ Product appears in active products list at position ${kabkabIndex + 1}`);
    } else {
      console.log('⚠️  Product not found in active products list');
    }

    console.log(`📊 Total active products: ${allProducts.length}`);

  } catch (error) {
    console.error('❌ Error verifying product:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyKabkabDates();
