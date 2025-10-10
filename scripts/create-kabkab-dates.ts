#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createKabkabDates() {
  try {
    console.log('🌱 Creating Kabkab Dates product...');

    // Get the kilogram unit as default base unit
    const kgUnit = await prisma.unit.findFirst({
      where: { symbol: 'kg' },
      select: { id: true, name: true, symbol: true }
    });

    if (!kgUnit) {
      throw new Error('Kilogram unit not found. Please run the seed script first.');
    }

    console.log(`📏 Using base unit: ${kgUnit.name} (${kgUnit.symbol})`);

    // Check if product already exists
    const existingProduct = await prisma.product.findUnique({
      where: { name: 'Kabkab Dates' }
    });

    if (existingProduct) {
      console.log('⚠️  Product "Kabkab Dates" already exists. Updating...');
      
      const updatedProduct = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          basePrice: 9.7,
          quantity: 40,
          description: 'Kabkab Dates are one of the most popular and naturally sweet date varieties, known for their soft texture, rich flavor, and high energy content. Our Kabkab Dates are freshly harvested and carefully packed to bring you the authentic taste of premium quality dates straight from the palm groves.',
          category: 'DATES',
          status: 'ACTIVE',
          baseUnitId: kgUnit.id,
        }
      });

      console.log('✅ Product updated successfully:', {
        id: updatedProduct.id,
        name: updatedProduct.name,
        basePrice: updatedProduct.basePrice,
        quantity: updatedProduct.quantity,
        category: updatedProduct.category,
        status: updatedProduct.status,
        baseUnit: `${kgUnit.name} (${kgUnit.symbol})`
      });
    } else {
      // Create new product
      const newProduct = await prisma.product.create({
        data: {
          name: 'Kabkab Dates',
          basePrice: 9.7,
          quantity: 40,
          description: 'Kabkab Dates are one of the most popular and naturally sweet date varieties, known for their soft texture, rich flavor, and high energy content. Our Kabkab Dates are freshly harvested and carefully packed to bring you the authentic taste of premium quality dates straight from the palm groves.',
          category: 'DATES',
          status: 'ACTIVE',
          baseUnitId: kgUnit.id,
        }
      });

      console.log('✅ Product created successfully:', {
        id: newProduct.id,
        name: newProduct.name,
        basePrice: newProduct.basePrice,
        quantity: newProduct.quantity,
        category: newProduct.category,
        status: newProduct.status,
        baseUnit: `${kgUnit.name} (${kgUnit.symbol})`
      });
    }

    // Verify the product exists
    const verifyProduct = await prisma.product.findUnique({
      where: { name: 'Kabkab Dates' },
      include: {
        baseUnit: {
          select: { name: true, symbol: true }
        }
      }
    });

    if (verifyProduct) {
      console.log('🔍 Verification successful - Product details:');
      console.log(`   ID: ${verifyProduct.id}`);
      console.log(`   Name: ${verifyProduct.name}`);
      console.log(`   Base Price: $${verifyProduct.basePrice}`);
      console.log(`   Quantity: ${verifyProduct.quantity}`);
      console.log(`   Category: ${verifyProduct.category}`);
      console.log(`   Status: ${verifyProduct.status}`);
      console.log(`   Base Unit: ${verifyProduct.baseUnit.name} (${verifyProduct.baseUnit.symbol})`);
      console.log(`   Description: ${verifyProduct.description?.substring(0, 100)}...`);
      console.log(`   Created: ${verifyProduct.createdAt}`);
      console.log(`   Updated: ${verifyProduct.updatedAt}`);
    }

  } catch (error) {
    console.error('❌ Error creating Kabkab Dates product:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createKabkabDates();
