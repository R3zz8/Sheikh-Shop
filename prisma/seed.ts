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

  // Create Categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'dates' },
      update: {},
      create: {
        name: 'Dates',
        slug: 'dates',
        description: 'Premium quality dates from the finest orchards. Rich in natural sugars, fiber, and essential minerals.',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'honey' },
      update: {},
      create: {
        name: 'Honey',
        slug: 'honey',
        description: 'Pure, natural honey sourced from pristine locations. Rich in antioxidants and natural enzymes.',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'saffron' },
      update: {},
      create: {
        name: 'Saffron',
        slug: 'saffron',
        description: 'Premium saffron threads hand-picked from the highest quality crocus flowers.',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'other' },
      update: {},
      create: {
        name: 'Other',
        slug: 'other',
        description: 'A diverse collection of premium products including nuts, spices, and traditional items.',
        isActive: true,
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Get the required units and categories
  const kgUnit = units.find((u: any) => u.symbol === 'kg');
  const gUnit = units.find((u: any) => u.symbol === 'g');
  const pkgUnit = units.find((u: any) => u.symbol === 'pkg');
  const LUnit = units.find((u: any) => u.symbol === 'L');
  const pcsUnit = units.find((u: any) => u.symbol === 'pcs');
  
  const datesCategory = categories.find((c: any) => c.slug === 'dates');
  const honeyCategory = categories.find((c: any) => c.slug === 'honey');
  const saffronCategory = categories.find((c: any) => c.slug === 'saffron');
  const otherCategory = categories.find((c: any) => c.slug === 'other');
  
  if (!kgUnit || !gUnit || !pkgUnit || !LUnit || !pcsUnit) {
    throw new Error('Required units not found');
  }
  
  if (!datesCategory || !honeyCategory || !saffronCategory || !otherCategory) {
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
        category: 'HONEY',
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
        category: 'SAFFRON',
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
        category: 'DATES',
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
        category: 'OTHERS',
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
        category: 'OTHERS',
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
    prisma.product.upsert({
      where: { name: 'اسپیکر ایستاده شیخ مدل Luxury X9' },
      update: {},
      create: {
        name: 'اسپیکر ایستاده شیخ مدل Luxury X9',
        category: 'OTHERS',
        categoryId: otherCategory.id,
        description: 'اسپیکر ایستاده حرفه‌ای با صدای قدرتمند، طراحی لوکس و کیفیت صدای فوق‌العاده.',
        basePrice: 18900000,
        baseUnitId: pcsUnit.id,
        quantity: 15,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: true,
        isAmazing: true,
        categoryType: 'SheikhDigital',
        slug: 'luxury-x9-speaker',
        seoTitle: 'اسپیکر ایستاده شیخ مدل Luxury X9 | سیستم صوتی لوکس',
        seoDescription: 'خرید اسپیکر ایستاده حرفه‌ای شیخ مدل Luxury X9 با کیفیت صدای استثنایی و روکش طلا.',
        metaKeywords: ['اسپیکر شیخ', 'اسپیکر ایستاده', 'سیستم صوتی لوکس'],
        canonicalUrl: '/products/luxury-x9-speaker',
        brand: 'Sheikh Shop',
        sku: 'SH-SPK-X9',
        features: ['صدای سه‌بعدی استریو', 'روکش طلای ۲۴ عیار گلد تریم', 'بلوتوث نسخه ۵.۳'],
        technicalSpecs: { power: '200W RMS', frequency: '20Hz - 20KHz', weight: '12kg' },
        tags: ['اسپیکر', 'لوکس', 'صدا'],
        weight: 12.0,
        warranty: 'ضمانت طلایی ۲۴ ماهه شیخ',
        origin: 'ایران',
        color: 'طلایی / مشکی',
      },
    }),
    prisma.product.upsert({
      where: { name: 'اسپیکر هوشمند شیخ مدل Royal Sound Pro' },
      update: {},
      create: {
        name: 'اسپیکر هوشمند شیخ مدل Royal Sound Pro',
        category: 'OTHERS',
        categoryId: otherCategory.id,
        description: 'سیستم صوتی هوشمند با طراحی مدرن، اتصال بی‌سیم و صدایی شفاف برای تجربه‌ای متفاوت.',
        basePrice: 24500000,
        baseUnitId: pcsUnit.id,
        quantity: 25,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: true,
        isAmazing: false,
        categoryType: 'SheikhDigital',
        slug: 'royal-sound-pro-speaker',
        seoTitle: 'اسپیکر هوشمند شیخ مدل Royal Sound Pro | صدای رویال',
        seoDescription: 'خرید اسپیکر هوشمند شیخ مدل Royal Sound Pro با طراحی مدرن و اتصال بیسیم.',
        metaKeywords: ['اسپیکر هوشمند', 'صدای رویال', 'سیستم صوتی بی سیم'],
        canonicalUrl: '/products/royal-sound-pro-speaker',
        brand: 'Sheikh Shop',
        sku: 'SH-SPK-RSP',
        features: ['دستیار صوتی هوشمند', 'اتصال Wi-Fi و بلوتوث', 'طراحی مینیمال و لوکس'],
        technicalSpecs: { power: '120W RMS', frequency: '35Hz - 20KHz', weight: '4.5kg' },
        tags: ['اسپیکر هوشمند', 'بیسیم', 'صدا'],
        weight: 4.5,
        warranty: 'ضمانت طلایی ۲۴ ماهه شیخ',
        origin: 'ایران',
        color: 'طلایی / قهوه‌ای',
      },
    }),
  ]);

  console.log(`✅ Created ${newProducts.length} new products`);

  // Create ProductUnit and Image entries for our seeded digital speaker products
  console.log('🔊 Seeding product units & images for digital products...');
  const digitalSpeakers = newProducts.filter(p => p.categoryType === 'SheikhDigital');
  for (const speaker of digitalSpeakers) {
    await prisma.productUnit.upsert({
      where: { id: `unit_${speaker.id}` },
      update: {
        price: speaker.basePrice,
        stock: speaker.quantity,
        isActive: true,
      },
      create: {
        id: `unit_${speaker.id}`,
        productId: speaker.id,
        name: speaker.name,
        price: speaker.basePrice,
        stock: speaker.quantity,
        isActive: true,
      }
    });

    const imageUrl = speaker.slug === 'luxury-x9-speaker'
      ? 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop';

    await prisma.image.create({
      data: {
        id: `image_${speaker.id}`,
        productId: speaker.id,
        image: imageUrl,
        secureUrl: imageUrl,
      }
    });
  }

  // Add additional test products for each category
  console.log('🛍️ Adding additional test products for each category...');
  const additionalProducts = await Promise.all([
    // Additional Honey products
    prisma.product.upsert({
      where: { name: 'Wildflower Honey Premium' },
      update: {},
      create: {
        name: 'Wildflower Honey Premium',
        category: 'HONEY',
        categoryId: honeyCategory.id,
        description: 'Pure wildflower honey collected from diverse floral sources. Rich in natural enzymes and antioxidants.',
        basePrice: 24.99,
        baseUnitId: kgUnit.id,
        quantity: 45,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: false,
        isAmazing: true,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Manuka Honey Grade A' },
      update: {},
      create: {
        name: 'Manuka Honey Grade A',
        category: 'HONEY',
        categoryId: honeyCategory.id,
        description: 'Premium Manuka honey with high antibacterial properties. Perfect for health-conscious consumers.',
        basePrice: 45.00,
        baseUnitId: gUnit.id,
        quantity: 25,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
        isAmazing: false,
      },
    }),
    // Additional Saffron products
    prisma.product.upsert({
      where: { name: 'Spanish Saffron Premium' },
      update: {},
      create: {
        name: 'Spanish Saffron Premium',
        category: 'SAFFRON',
        categoryId: saffronCategory.id,
        description: 'High-quality Spanish saffron threads known for their intense color and aroma.',
        basePrice: 75.00,
        baseUnitId: gUnit.id,
        quantity: 20,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: true,
        isAmazing: false,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Kashmiri Saffron Deluxe' },
      update: {},
      create: {
        name: 'Kashmiri Saffron Deluxe',
        category: 'SAFFRON',
        categoryId: saffronCategory.id,
        description: 'Premium Kashmiri saffron with exceptional quality and potency.',
        basePrice: 95.00,
        baseUnitId: gUnit.id,
        quantity: 15,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
        isAmazing: true,
      },
    }),
    // Additional Dates products
    prisma.product.upsert({
      where: { name: 'Deglet Noor Dates' },
      update: {},
      create: {
        name: 'Deglet Noor Dates',
        category: 'DATES',
        categoryId: datesCategory.id,
        description: 'Semi-dry dates with a firm texture and sweet, nutty flavor. Perfect for snacking.',
        basePrice: 15.50,
        baseUnitId: kgUnit.id,
        quantity: 80,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: false,
        isAmazing: false,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Barhi Dates Fresh' },
      update: {},
      create: {
        name: 'Barhi Dates Fresh',
        category: 'DATES',
        categoryId: datesCategory.id,
        description: 'Fresh, soft Barhi dates with a caramel-like flavor and creamy texture.',
        basePrice: 22.00,
        baseUnitId: kgUnit.id,
        quantity: 60,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
        isAmazing: true,
      },
    }),
    // Additional Other products
    prisma.product.upsert({
      where: { name: 'Premium Pistachios' },
      update: {},
      create: {
        name: 'Premium Pistachios',
        category: 'OTHERS',
        categoryId: otherCategory.id,
        description: 'Premium quality pistachios, perfectly roasted and lightly salted.',
        basePrice: 28.00,
        baseUnitId: kgUnit.id,
        quantity: 40,
        status: 'ACTIVE',
        isNew: false,
        isBestSeller: true,
        isAmazing: false,
      },
    }),
    prisma.product.upsert({
      where: { name: 'Organic Turmeric Powder' },
      update: {},
      create: {
        name: 'Organic Turmeric Powder',
        category: 'OTHERS',
        categoryId: otherCategory.id,
        description: 'Pure organic turmeric powder with high curcumin content. Perfect for cooking and health benefits.',
        basePrice: 12.50,
        baseUnitId: gUnit.id,
        quantity: 100,
        status: 'ACTIVE',
        isNew: true,
        isBestSeller: false,
        isAmazing: false,
      },
    }),
  ]);

  console.log(`✅ Created ${additionalProducts.length} additional test products`);

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