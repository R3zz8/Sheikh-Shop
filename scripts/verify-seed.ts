#!/usr/bin/env tsx

/**
 * Seed Verification Script
 * 
 * This script verifies that the database seeding was successful by checking:
 * 1. Super admin user exists with correct role
 * 2. All 5 sample products exist with correct data
 * 3. Units are properly created
 * 4. Discounts are applied correctly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

async function main() {
  console.log('🔍 Verifying database seed...');
  
  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Verify super admin user
    const superAdmin = await prisma.user.findUnique({
      where: { email: 'rezadhu615@gmail.com' },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        canLogin: true,
        disabled: true,
      },
    });
    
    if (!superAdmin) {
      throw new Error('Super admin user not found');
    }
    
    if (superAdmin.role !== 'SUPERADMIN') {
      throw new Error(`Expected SUPERADMIN role, got ${superAdmin.role}`);
    }
    
    console.log('✅ Super admin user verified');
    
    // Verify units
    const units = await prisma.unit.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    
    const expectedUnits = ['g', 'kg', 'L', 'ml', 'pkg', 'pcs'];
    const foundUnits = units.map(u => u.symbol);
    
    for (const expectedUnit of expectedUnits) {
      if (!foundUnits.includes(expectedUnit)) {
        throw new Error(`Unit ${expectedUnit} not found`);
      }
    }
    
    console.log(`✅ All ${units.length} units verified`);
    
    // Verify products
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        baseUnit: true,
        discounts: {
          where: { isActive: true },
        },
      },
    });
    
    const expectedProducts = [
      'Premium Iranian Honey',
      'Organic Saffron Threads',
      'Medjool Dates Premium',
      'Persian Rose Water',
      'Mixed Nuts Premium Pack',
    ];
    
    const foundProducts = products.map(p => p.name);
    
    for (const expectedProduct of expectedProducts) {
      if (!foundProducts.includes(expectedProduct)) {
        throw new Error(`Product ${expectedProduct} not found`);
      }
    }
    
    console.log(`✅ All ${products.length} products verified`);
    
    // Verify discounts
    const discounts = await prisma.discount.findMany({
      where: { isActive: true },
      include: {
        product: {
          select: { name: true },
        },
      },
    });
    
    const honeyDiscount = discounts.find(d => 
      d.product.name === 'Premium Iranian Honey' && 
      d.discountType === 'PERCENTAGE' && 
      d.value === 20.0
    );
    
    const datesDiscount = discounts.find(d => 
      d.product.name === 'Medjool Dates Premium' && 
      d.discountType === 'FIXED' && 
      d.value === 3.5
    );
    
    if (!honeyDiscount) {
      throw new Error('Premium Iranian Honey 20% discount not found');
    }
    
    if (!datesDiscount) {
      throw new Error('Medjool Dates Premium $3.50 discount not found');
    }
    
    console.log('✅ All discounts verified');
    
    console.log('\n🎉 Database seed verification PASSED!');
    console.log('\n📊 Summary:');
    console.log(`   👑 Super admin: ${superAdmin.email}`);
    console.log(`   📏 Units: ${units.length}`);
    console.log(`   🛍️ Products: ${products.length}`);
    console.log(`   🏷️ Active discounts: ${discounts.length}`);
    
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
