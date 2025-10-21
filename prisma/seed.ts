import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
  console.log('🗄️ Database URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌');
  
  // Validate environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Test database connection
  try {
    await prisma.$connect();
    console.log('🔗 Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error('Failed to connect to database. Please check your DATABASE_URL and ensure the database is running.');
  }
  // Create Categories
  console.log('📚 Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'dates' },
      update: {},
      create: { name: 'Dates', slug: 'dates' },
    }),
    prisma.category.upsert({
      where: { slug: 'honey' },
      update: {},
      create: { name: 'Honey', slug: 'honey' },
    }),
    prisma.category.upsert({
      where: { slug: 'saffron' },
      update: {},
      create: { name: 'Saffron', slug: 'saffron' },
    }),
    prisma.category.upsert({
      where: { slug: 'other' },
      update: {},
      create: { name: 'Other', slug: 'other' },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Create Units
  console.log('📏 Creating units...');
  const units = await Promise.all([
    prisma.unit.upsert({
      where: { symbol: 'g' },
      update: {},
      create: {
        name: 'Gram',
        symbol: 'g',
        multiplier: 0.001, // 1g = 0.001kg
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.unit.upsert({
      where: { symbol: 'kg' },
      update: {},
      create: {
        name: 'Kilogram',
        symbol: 'kg',
        multiplier: 1.0, // Base unit
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.unit.upsert({
      where: { symbol: 'L' },
      update: {},
      create: {
        name: 'Liter',
        symbol: 'L',
        multiplier: 1.0, // Base unit for liquids
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.unit.upsert({
      where: { symbol: 'ml' },
      update: {},
      create: {
        name: 'Milliliter',
        symbol: 'ml',
        multiplier: 0.001, // 1ml = 0.001L
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.unit.upsert({
      where: { symbol: 'pkg' },
      update: {},
      create: {
        name: 'Package',
        symbol: 'pkg',
        multiplier: 1.0, // Base unit for packaged items
        sortOrder: 5,
        isActive: true,
      },
    }),
    prisma.unit.upsert({
      where: { symbol: 'pcs' },
      update: {},
      create: {
        name: 'Pieces',
        symbol: 'pcs',
        multiplier: 1.0, // Base unit for individual items
        sortOrder: 6,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${units.length} units`);

  // Get the required units
  const kgUnit = units.find((u: any) => u.symbol === 'kg');
  const gUnit = units.find((u: any) => u.symbol === 'g');
  const pkgUnit = units.find((u: any) => u.symbol === 'pkg');
  const LUnit = units.find((u: any) => u.symbol === 'L');
  
  if (!kgUnit || !gUnit || !pkgUnit || !LUnit) {
    throw new Error('Required units not found');
  }
  const honeyCategory = categories.find((c) => c.slug === 'honey');
  const saffronCategory = categories.find((c) => c.slug === 'saffron');
  const datesCategory = categories.find((c) => c.slug === 'dates');
  const otherCategory = categories.find((c) => c.slug === 'other');

  if (!honeyCategory || !saffronCategory || !datesCategory || !otherCategory) {
    throw new Error('Required categories not found');
  }

  // Create 5 new sample products as requested
  console.log('🛍️ Creating 5 new sample products...');
  const newProducts = await Promise.all([
    prisma.product.upsert({
      where: { name: 'Premium Iranian Honey' },
      update: {},
      create: {
        name: 'Premium Iranian Honey',
        categoryId: honeyCategory.id,
        description: 'Pure, natural honey sourced from the pristine mountains of Iran. Rich in antioxidants and natural enzymes, this premium honey offers a delicate floral taste with notes of wildflowers and herbs.',
        basePrice: 28.50,
        baseUnitId: kgUnit.id,
        quantity: 75,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: true,
        isAmazing: false,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Organic Saffron Threads' },
      update: {},
      create: {
        name: 'Organic Saffron Threads',
        categoryId: saffronCategory.id,
        description: 'Hand-picked organic saffron threads from the highest quality crocus flowers. Known for its intense color, aroma, and flavor, this premium saffron is perfect for culinary and medicinal use.',
        basePrice: 85.00,
        baseUnitId: gUnit.id,
        quantity: 30,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
        isAmazing: true,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Medjool Dates Premium' },
      update: {},
      create: {
        name: 'Medjool Dates Premium',
        categoryId: datesCategory.id,
        description: 'Large, soft, and incredibly sweet Medjool dates known as the "King of Dates". These premium dates are naturally rich in fiber, potassium, and antioxidants, making them a perfect healthy snack.',
        basePrice: 18.75,
        baseUnitId: kgUnit.id,
        quantity: 120,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: true,
        isAmazing: false,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Persian Rose Water' },
      update: {},
      create: {
        name: 'Persian Rose Water',
        categoryId: otherCategory.id,
        description: 'Traditional Persian rose water made from Damask roses. This authentic rose water is used in Persian cuisine, beauty treatments, and religious ceremonies. Pure, natural, and aromatic.',
        basePrice: 12.99,
        baseUnitId: LUnit.id,
        quantity: 50,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: false,
        isAmazing: true,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Mixed Nuts Premium Pack' },
      update: {},
      create: {
        name: 'Mixed Nuts Premium Pack',
        categoryId: otherCategory.id,
        description: 'Premium selection of mixed nuts including pistachios, almonds, walnuts, and cashews. Perfectly roasted and lightly salted, this premium pack is ideal for snacking or gifting.',
        basePrice: 22.50,
        baseUnitId: pkgUnit.id,
        quantity: 60,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
        isAmazing: false,
      },
    }),
  ]);

  console.log(`✅ Created ${newProducts.length} new products`);

  // Create discounts for 2 products as requested
  console.log('🏷️ Creating discounts for 2 products...');
  const newDiscounts = await Promise.all([
    prisma.discount.upsert({
      where: { 
        productId_discountType: {
          productId: newProducts[0].id, // Premium Iranian Honey
          discountType: 'PERCENTAGE'
        }
      },
      update: {},
      create: {
        productId: newProducts[0].id,
        discountType: 'PERCENTAGE',
        value: 20.0, // 20% off
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        isActive: true,
      },
    }),
    prisma.discount.upsert({
      where: { 
        productId_discountType: {
          productId: newProducts[2].id, // Medjool Dates Premium
          discountType: 'FIXED'
        }
      },
      update: {},
      create: {
        productId: newProducts[2].id,
        discountType: 'FIXED',
        value: 3.50, // $3.50 off
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${newDiscounts.length} discounts`);

  // Create Super Admin User with requested credentials
  console.log('👑 Creating super admin user...');
  
  const superadminEmail = 'rezadhu615@gmail.com';
  const superadminPassword = 'Temp@1374';
  
  // Hash the password securely
  const hashedPassword = await hashPassword(superadminPassword);
  
  const superadmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {
      // Update password if it changed
      password: hashedPassword,
      role: 'SUPERADMIN',
      emailVerified: true,
      canLogin: true,
      disabled: false,
    },
    create: {
      email: superadminEmail,
      password: hashedPassword,
      role: 'SUPERADMIN',
      emailVerified: true,
      canLogin: true,
      disabled: false,
    },
  });

  console.log(`✅ Super admin user created/updated: ${superadmin.email}`);
  console.log(`   Role: ${superadmin.role}`);
  console.log(`   Email Verified: ${superadmin.emailVerified}`);
  console.log(`   Can Login: ${superadmin.canLogin}`);
  console.log(`   Disabled: ${superadmin.disabled}`);
  console.log(`   Password: Securely hashed with bcrypt`);

  // Display product summary
  console.log('\n📋 Product Summary:');
  newProducts.forEach((product, index) => {
    const discount = newDiscounts.find(d => d.productId === product.id);
    console.log(`   ${index + 1}. ${product.name}`);
    console.log(`      Category: ${product.category}`);
    console.log(`      Price: $${product.basePrice}`);
    console.log(`      Stock: ${product.quantity}`);
    if (discount) {
      const discountText = discount.discountType === 'PERCENTAGE' 
        ? `${discount.value}% off` 
        : `$${discount.value} off`;
      console.log(`      Discount: ${discountText}`);
    }
    console.log('');
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n🔐 Login Credentials:');
  console.log(`   Email: ${superadminEmail}`);
  console.log(`   Password: ${superadminPassword}`);
  console.log(`   Role: SUPERADMIN`);
}

main()
  .then(() => {
    console.log('✨ Seed script completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n❌ SEEDING FAILED:');
    console.error('Error:', e.message);
    if (e.stack) {
      console.error('Stack trace:', e.stack);
    }
    
    // Provide helpful debugging information
    console.error('\n🔍 Debugging Information:');
    console.error('- Environment:', process.env.NODE_ENV || 'development');
    console.error('- Database URL present:', process.env.DATABASE_URL ? 'Yes' : 'No');
    console.error('- Current working directory:', process.cwd());
    
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
  }); 