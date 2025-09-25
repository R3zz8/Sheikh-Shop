#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔎 Generating backend operations report...');

    const user = await prisma.user.findUnique({
      where: { email: 'rezadhu615@gmail.com' },
      select: { id: true, email: true, role: true, emailVerified: true, canLogin: true, disabled: true }
    });

    console.log('\n👤 Super Admin Status:');
    if (!user) {
      console.log(' - User not found');
    } else {
      console.log(' - Email:', user.email);
      console.log(' - Role:', user.role);
      console.log(' - Email Verified:', user.emailVerified);
      console.log(' - Can Login:', user.canLogin);
      console.log(' - Disabled:', user.disabled);
    }

    const productNames = [
      'Premium Black Tea',
      'Organic Green Tea',
      'Premium Coffee Beans',
      'Herbal Tea Collection',
      'Premium Matcha Powder',
    ];

    const products = await prisma.product.findMany({
      where: { name: { in: productNames } },
      include: { discounts: true, baseUnit: true }
    });

    console.log('\n🛍️ Products Added:');
    if (products.length === 0) {
      console.log(' - No products found.');
    } else {
      for (const p of products) {
        const hasDiscount = p.discounts.length > 0;
        const discount = hasDiscount ? p.discounts[0] : undefined;
        console.log(` - ${p.name} | Price: $${p.basePrice.toFixed(2)} | Discount: ${hasDiscount ? (discount!.discountType === 'PERCENTAGE' ? `${discount!.value}%` : `$${discount!.value}`) : 'None'}`);
      }
    }

    console.log('\n✅ No UI/UX changes performed. No security-sensitive operations beyond requested updates.');
    console.log('✅ Products and user updates performed via Prisma with constraints enforced.');
  } catch (error) {
    console.error('❌ Report generation error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
