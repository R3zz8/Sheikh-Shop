const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking database for products...');
    
    // Check all products
    const products = await prisma.product.findMany({
      include: {
        images: true,
        baseUnit: true,
      }
    });
    
    console.log(`📦 Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`  - ${product.name} (isAmazing: ${product.isAmazing})`);
    });
    
    if (products.length === 0) {
      console.log('❌ No products found. Running seed script...');
      return;
    }
    
    // Update first two products to be amazing deals
    console.log('\n✨ Updating products to amazing deals...');
    
    const updatedProducts = await Promise.all([
      prisma.product.update({
        where: { id: products[0].id },
        data: { isAmazing: true },
        include: { images: true, baseUnit: true }
      }),
      prisma.product.update({
        where: { id: products[1].id },
        data: { isAmazing: true },
        include: { images: true, baseUnit: true }
      })
    ]);
    
    console.log('✅ Updated products to amazing deals:');
    updatedProducts.forEach(product => {
      console.log(`  - ${product.name} (isAmazing: ${product.isAmazing})`);
    });
    
    // Check amazing deals
    const amazingDeals = await prisma.product.findMany({
      where: { isAmazing: true },
      include: {
        images: true,
        baseUnit: true,
        discounts: true,
      }
    });
    
    console.log(`\n🎯 Found ${amazingDeals.length} amazing deals:`);
    amazingDeals.forEach(product => {
      console.log(`  - ${product.name} (Price: $${product.basePrice})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

