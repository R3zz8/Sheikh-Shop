import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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

  // Get the kilogram unit as default base unit
  const kgUnit = units.find(u => u.symbol === 'kg');
  if (!kgUnit) {
    throw new Error('Kilogram unit not found');
  }

  // Create sample products with the new schema
  console.log('🛍️ Creating sample products...');
  const products = await Promise.all([
    prisma.product.upsert({
      where: { name: 'Premium Barhi Dates' },
      update: {},
      create: {
        name: 'Premium Barhi Dates',
        category: 'DATES',
        description: 'Sweet, soft, and naturally caramel-flavored, Barhi Dates are one of the most premium date varieties from southern Iran. Perfect as a healthy snack, for gifting, or for an elegant touch to your table.',
        basePrice: 12.06,
        baseUnitId: kgUnit.id,
        quantity: 100,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: true,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Kabkab Dates' },
      update: {},
      create: {
        name: 'Kabkab Dates',
        category: 'DATES',
        description: 'Discover the natural sweetness of Kabkab Dates – soft, rich, and full of energy. A healthy delight from the heart of nature.',
        basePrice: 9.20,
        baseUnitId: kgUnit.id,
        quantity: 150,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: true,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Premium Saffron' },
      update: {},
      create: {
        name: 'Premium Saffron',
        category: 'SAFFRON',
        description: 'The world\'s most precious spice, our premium saffron is hand-picked and carefully processed to maintain its exceptional quality and vibrant color.',
        basePrice: 45.00,
        baseUnitId: units.find(u => u.symbol === 'g')?.id || kgUnit.id,
        quantity: 50,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create sample discounts
  console.log('🏷️ Creating sample discounts...');
  const discounts = await Promise.all([
    prisma.discount.upsert({
      where: { 
        productId_discountType: {
          productId: products[0].id, // Barhi Dates
          discountType: 'PERCENTAGE'
        }
      },
      update: {},
      create: {
        productId: products[0].id,
        discountType: 'PERCENTAGE',
        value: 15.0, // 15% off
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
      },
    }),
    prisma.discount.upsert({
      where: { 
        productId_discountType: {
          productId: products[1].id, // Kabkab Dates
          discountType: 'FIXED'
        }
      },
      update: {},
      create: {
        productId: products[1].id,
        discountType: 'FIXED',
        value: 2.00, // $2 off
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${discounts.length} discounts`);

  // Create sample images for products
  console.log('🖼️ Creating sample images...');
  const images = await Promise.all([
    prisma.image.upsert({
      where: { id: 'barhi-dates-main' },
      update: {},
      create: {
        id: 'barhi-dates-main',
        image: 'https://images.unsplash.com/photo-1603046891744-76e6300f82b8?w=800&h=600&fit=crop',
        productId: products[0].id,
      },
    }),
    prisma.image.upsert({
      where: { id: 'kabkab-dates-main' },
      update: {},
      create: {
        id: 'kabkab-dates-main',
        image: 'https://images.unsplash.com/photo-1603046891744-76e6300f82b8?w=800&h=600&fit=crop',
        productId: products[1].id,
      },
    }),
    prisma.image.upsert({
      where: { id: 'saffron-main' },
      update: {},
      create: {
        id: 'saffron-main',
        image: 'https://images.unsplash.com/photo-1603046891744-76e6300f82b8?w=800&h=600&fit=crop',
        productId: products[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${images.length} images`);

  // Create Super Admin User
  console.log('👑 Creating super admin user...');
  
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'rezadhu615@gmail.com';
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'Temp#1234';
  
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

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 