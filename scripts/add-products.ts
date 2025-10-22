#!/usr/bin/env tsx

import { PrismaClient, ProductStatus, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function addProducts() {
  try {
    console.log('🔄 Adding five new products...');
    
    // Get available units for reference
    const units = await prisma.unit.findMany({ where: { isActive: true } });
    if (units.length === 0) {
      throw new Error('No active units found. Please ensure units are created first.');
    }
    
    const baseUnit = units[0]; // Use first available unit
    if (!baseUnit) {
      throw new Error('Failed to get base unit from units array');
    }

    const otherCategory = await prisma.category.findUnique({
      where: { name: 'Other' },
    });

    if (!otherCategory) {
      throw new Error('Category "Other" not found. Please seed the database first.');
    }
    
    // Product 1: Premium Black Tea (with discount)
    const product1 = await prisma.product.create({
      data: {
        name: 'Premium Black Tea',
        categoryId: otherCategory.id,
        description: 'High-quality black tea leaves from premium estates',
        basePrice: 12.99,
        baseUnitId: baseUnit.id,
        quantity: 50,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
        isAmazing: false
      }
    });
    
    // Add 15% discount for Black Tea
    await prisma.discount.create({
      data: {
        productId: product1.id,
        discountType: 'PERCENTAGE',
        value: 15.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
      }
    });
    
    console.log('✅ Product 1: Premium Black Tea (15% discount)');
    
    // Product 2: Organic Green Tea (with discount)
    const product2 = await prisma.product.create({
      data: {
        name: 'Organic Green Tea',
        categoryId: otherCategory.id,
        description: 'Certified organic green tea with antioxidant properties',
        basePrice: 15.99,
        baseUnitId: baseUnit.id,
        quantity: 40,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: true,
        isAmazing: false
      }
    });
    
    // Add $2.50 fixed discount for Green Tea
    await prisma.discount.create({
      data: {
        productId: product2.id,
        discountType: 'FIXED',
        value: 2.50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        isActive: true
      }
    });
    
    console.log('✅ Product 2: Organic Green Tea ($2.50 discount)');
    
    // Product 3: Premium Coffee Beans (with discount)
    const product3 = await prisma.product.create({
      data: {
        name: 'Premium Coffee Beans',
        categoryId: otherCategory.id,
        description: 'Single-origin coffee beans, medium roast',
        basePrice: 18.99,
        baseUnitId: baseUnit.id,
        quantity: 35,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: false,
        isAmazing: true
      }
    });
    
    // Add 25% discount for Coffee Beans
    await prisma.discount.create({
      data: {
        productId: product3.id,
        discountType: 'PERCENTAGE',
        value: 25.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        isActive: true
      }
    });
    
    console.log('✅ Product 3: Premium Coffee Beans (25% discount)');
    
    // Product 4: Herbal Tea Collection (no discount)
    const product4 = await prisma.product.create({
      data: {
        name: 'Herbal Tea Collection',
        categoryId: otherCategory.id,
        description: 'Assorted herbal tea blend with chamomile, mint, and lavender',
        basePrice: 14.99,
        baseUnitId: baseUnit.id,
        quantity: 30,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
        isAmazing: false
      }
    });
    
    console.log('✅ Product 4: Herbal Tea Collection (no discount)');
    
    // Product 5: Premium Matcha Powder (no discount)
    const product5 = await prisma.product.create({
      data: {
        name: 'Premium Matcha Powder',
        categoryId: otherCategory.id,
        description: 'Ceremonial grade matcha powder for traditional tea preparation',
        basePrice: 22.99,
        baseUnitId: baseUnit.id,
        quantity: 25,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: true,
        isAmazing: false
      }
    });
    
    console.log('✅ Product 5: Premium Matcha Powder (no discount)');
    
    // Verify all products were created
    const allProducts = await prisma.product.findMany({
      where: { 
        name: { 
          in: ['Premium Black Tea', 'Organic Green Tea', 'Premium Coffee Beans', 'Herbal Tea Collection', 'Premium Matcha Powder'] 
        } 
      },
      include: { discounts: true, baseUnit: true }
    });
    
    console.log('\n🎉 All products added successfully!');
    console.log('\n📊 Product Summary:');
    allProducts.forEach(product => {
      const discountInfo = product.discounts.length > 0 && product.discounts[0]
        ? `- ${product.discounts[0].discountType === 'PERCENTAGE' ? `${product.discounts[0].value}% off` : `$${product.discounts[0].value} off`}`
        : '- No discount';
      console.log(`   ${product.name}: $${product.basePrice} ${discountInfo}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding products:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addProducts();
