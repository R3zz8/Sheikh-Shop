// src/utils/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | any;
}

// Mock data for development when PostgreSQL is not running
const mockCategories = [
  { id: '1', name: 'Dates', slug: 'dates', description: 'Premium quality dates from the finest orchards. Rich in natural sugars, fiber, and essential minerals.', isActive: true, sortOrder: 1 },
  { id: '2', name: 'Honey', slug: 'honey', description: 'Pure, natural honey sourced from pristine locations. Rich in antioxidants and natural enzymes.', isActive: true, sortOrder: 2 },
  { id: '3', name: 'Saffron', slug: 'saffron', description: 'Premium saffron threads hand-picked from the highest quality crocus flowers.', isActive: true, sortOrder: 3 },
  { id: '4', name: 'Other', slug: 'other', description: 'A diverse collection of premium products including nuts, spices, and traditional items.', isActive: true, sortOrder: 4 },
];

const mockUnits = [
  { id: 'u1', name: 'Gram', symbol: 'g', multiplier: 0.001, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'u2', name: 'Kilogram', symbol: 'kg', multiplier: 1.0, sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'u3', name: 'Piece', symbol: 'pcs', multiplier: 1.0, sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const mockProducts = [
  {
    id: 'p_simple_stock_50',
    name: 'محصول تستی با موجودی ۵۰',
    category: 'OTHERS',
    categoryId: '4',
    description: 'یک محصول تستی بدون واحدهای متغیر (ProductUnit) که دارای ۵۰ عدد موجودی در انبار است.',
    basePrice: 100000,
    baseUnitId: 'u3',
    quantity: 50,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: false,
    isAmazing: false,
    categoryType: 'SheikhFood',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: 'img_simple', image: '/other.webp', secureUrl: '/other.webp', createdAt: new Date() }],
    discounts: [],
    units: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p1',
    name: 'Premium Iranian Honey',
    category: 'HONEY',
    categoryId: '2',
    description: 'Pure, natural honey sourced from the pristine mountains of Iran. Rich in antioxidants and natural enzymes, this premium honey offers a delicate floral taste with notes of wildflowers and herbs.',
    basePrice: 1250000, // Native Toman value
    baseUnitId: 'u2',
    quantity: 75,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: true,
    isAmazing: true,
    categoryType: 'SheikhFood',
    baseUnit: mockUnits[1],
    categoryRelation: mockCategories[1],
    images: [{ id: 'img1', image: '/honey.webp', secureUrl: '/honey.webp', createdAt: new Date() }],
    discounts: [{ id: 'd1', value: 200000, discountType: 'FIXED', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 100000000), createdAt: new Date(), updatedAt: new Date() }], // Discount in native Toman
    units: [
      { id: 'pu1', productId: 'p1', name: 'Kilogram', price: 1250000, unitId: 'u2', unit: mockUnits[1], isActive: true, stock: 75, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p2',
    name: 'Organic Saffron Threads',
    category: 'SAFFRON',
    categoryId: '3',
    description: 'Hand-picked organic saffron threads from the highest quality crocus flowers. Known for its intense color, aroma, and flavor, this premium saffron is perfect for culinary and medicinal use.',
    basePrice: 4250000, // Native Toman value
    baseUnitId: 'u1',
    quantity: 30,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: false,
    isAmazing: true,
    categoryType: 'SheikhFood',
    baseUnit: mockUnits[0],
    categoryRelation: mockCategories[2],
    images: [{ id: 'img2', image: '/saffron.webp', secureUrl: '/saffron.webp', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: 'pu2', productId: 'p2', name: 'Gram', price: 4250000, unitId: 'u1', unit: mockUnits[0], isActive: true, stock: 30, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p3',
    name: 'Medjool Dates Premium',
    category: 'DATES',
    categoryId: '1',
    description: 'Large, soft, and incredibly sweet Medjool dates known as the "King of Dates". These premium dates are naturally rich in fiber, potassium, and antioxidants, making them a perfect healthy snack.',
    basePrice: 890000, // Native Toman value
    baseUnitId: 'u2',
    quantity: 120,
    status: 'ACTIVE',
    isNew: false,
    isBestSeller: true,
    isAmazing: false,
    categoryType: 'SheikhFood',
    baseUnit: mockUnits[1],
    categoryRelation: mockCategories[0],
    images: [{ id: 'img3', image: '/dates.webp', secureUrl: '/dates.webp', createdAt: new Date() }],
    discounts: [{ id: 'd2', value: 100000, discountType: 'FIXED', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 100000000), createdAt: new Date(), updatedAt: new Date() }], // Discount in native Toman
    units: [
      { id: 'pu3', productId: 'p3', name: 'Kilogram', price: 890000, unitId: 'u2', unit: mockUnits[1], isActive: true, stock: 120, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p4',
    name: 'Persian Rose Water',
    category: 'OTHERS',
    categoryId: '4',
    description: 'Traditional Persian rose water made from Damask roses. This authentic rose water is used in Persian cuisine, beauty treatments, and religious ceremonies. Pure, natural, and aromatic.',
    basePrice: 650000, // Native Toman value
    baseUnitId: 'u3',
    quantity: 50,
    status: 'ACTIVE',
    isNew: false,
    isBestSeller: false,
    isAmazing: true,
    categoryType: 'SheikhFood',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: 'img4', image: '/other.webp', secureUrl: '/other.webp', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: 'pu4', productId: 'p4', name: 'Piece', price: 650000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 50, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'pd_speaker_1',
    name: 'اسپیکر ایستاده شیخ مدل Luxury X9',
    category: 'OTHERS',
    categoryId: '4',
    description: 'اسپیکر ایستاده حرفه‌ای با صدای قدرتمند، طراحی لوکس و کیفیت صدای فوق‌العاده.',
    basePrice: 18900000,
    baseUnitId: 'u3',
    quantity: 15,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: true,
    isAmazing: true,
    categoryType: 'SheikhTech',
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
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: 'img_pd1', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop', secureUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: 'pud_speaker_1', productId: 'pd_speaker_1', name: 'Piece', price: 18900000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 15, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'pd_speaker_2',
    name: 'اسپیکر هوشمند شیخ مدل Royal Sound Pro',
    category: 'OTHERS',
    categoryId: '4',
    description: 'سیستم صوتی هوشمند با طراحی مدرن، اتصال بی‌سیم و صدایی شفاف برای تجربه‌ای متفاوت.',
    basePrice: 24500000,
    baseUnitId: 'u3',
    quantity: 25,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: true,
    isAmazing: false,
    categoryType: 'SheikhTech',
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
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: 'img_pd2', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop', secureUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: 'pud_speaker_2', productId: 'pd_speaker_2', name: 'Piece', price: 24500000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 25, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'pd_headphones',
    name: 'هدفون بی‌سیم لوکس شیخ مدل Golden Scent',
    category: 'OTHERS',
    categoryId: '4',
    description: 'هدفون بیسیم با روکش آبکاری طلای ۲۴ عیار گلد تریم و صدای استودیویی مانیتورینگ.',
    basePrice: 14200000,
    baseUnitId: 'u3',
    quantity: 40,
    status: 'DRAFT',
    isNew: true,
    isBestSeller: true,
    isAmazing: true,
    categoryType: 'SheikhDigital',
    slug: 'golden-scent-headphones',
    brand: 'Sheikh Shop',
    sku: 'SH-HP-GS',
    features: ['صدای شفاف مانیتورینگ استودیویی', 'روکش طلای ۲۴ عیار', 'نویز کنسلینگ پیشرفته ANC'],
    technicalSpecs: { driver: '45mm', bluetooth: 'v5.3', battery: '45 hours' },
    tags: ['هدفون', 'بی‌سیم', 'لوکس'],
    weight: 0.35,
    warranty: 'ضمانت طلایی ۲۴ ماهه شیخ',
    origin: 'ایران',
    color: 'طلایی',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: 'img_pd_headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop', secureUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: 'pud_headphones', productId: 'pd_headphones', name: 'Piece', price: 14200000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 40, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'pd_smartwatch',
    name: 'ساعت هوشمند سلطنتی شیخ مدل Royal Watch V2',
    category: 'OTHERS',
    categoryId: '4',
    description: 'ساعت هوشمند با سنسورهای سلامتی پیشرفته، بند چرم شتر اصل و قاب تیتانیومی طلا.',
    basePrice: 32800000,
    baseUnitId: 'u3',
    quantity: 30,
    status: 'ACTIVE', // Set to ACTIVE so it loads in catalogs and views!
    isNew: true,
    isBestSeller: true,
    isAmazing: false,
    categoryType: 'SheikhDigital',
    slug: 'royal-watch-v2',
    brand: 'Sheikh Shop',
    sku: 'SH-W-RW2',
    features: ['بند چرم شتر دست‌دوز اصیل', 'بدنه تیتانیوم گرید ۵ آبکاری طلا', 'صفحه نمایش همیشه روشن AMOLED'],
    technicalSpecs: { size: '46mm', water: '50m', battery: '14 days' },
    tags: ['ساعت هوشمند', 'تیتانیوم', 'سلطنتی'],
    weight: 0.08,
    warranty: 'ضمانت طلایی ۲۴ ماهه شیخ',
    origin: 'ایران',
    color: 'طلایی / قهوه‌ای قهوه',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: 'img_pd_smartwatch', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', secureUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: 'pud_smartwatch_black_64', productId: 'pd_smartwatch', name: 'مشکی / 64 گیگابایت', price: 32800000, oldPrice: 35000000, sku: 'SH-W-BLK-64', isActive: true, stock: 12, createdAt: new Date(), updatedAt: new Date() },
      { id: 'pud_smartwatch_black_128', productId: 'pd_smartwatch', name: 'مشکی / 128 گیگابایت', price: 34800000, oldPrice: 38000000, sku: 'SH-W-BLK-128', isActive: true, stock: 5, createdAt: new Date(), updatedAt: new Date() },
      { id: 'pud_smartwatch_gold_128', productId: 'pd_smartwatch', name: 'طلایی / 128 گیگابایت', price: 39800000, oldPrice: null, sku: 'SH-W-GLD-128', isActive: true, stock: 3, createdAt: new Date(), updatedAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ph_refrigerator_1',
    name: 'یخچال فریزر هوشمند لوکس شیخ مدل Royal Frost X9',
    category: 'OTHERS',
    categoryId: '4',
    description: 'یخچال فریزر هوشمند با درب شیشه‌ای با قابلیت شفاف‌سازی خودکار، بدنه مشکی مات و اتصالات آبکاری شده با طلای ۲۴ عیار.',
    basePrice: 89500000,
    baseUnitId: 'u3',
    quantity: 12,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: true,
    isAmazing: true,
    categoryType: 'SheikhHome',
    slug: 'royal-frost-x9-refrigerator',
    seoTitle: 'یخچال فریزر هوشمند لوکس شیخ مدل Royal Frost X9 | شیخ هوم',
    seoDescription: 'خرید یخچال فریزر هوشمند و لاکچری شیخ مدل Royal Frost X9 با گلد تریم و برنه مشکی مات گلس.',
    metaKeywords: ['یخچال شیخ', 'یخچال لوکس', 'لوازم خانگی هوشمند'],
    canonicalUrl: '/products/royal-frost-x9-refrigerator',
    brand: 'Sheikh Shop',
    sku: 'SH-REF-RF9',
    features: ['درب با تکنولوژی شفاف‌سازی خودکار', 'سیستم برودت هوشمند دوگانه', 'اتصالات آبکاری طلای ۲۴ عیار'],
    technicalSpecs: { capacity: '30 Cubic Feet', energy: 'A+++', weight: '135kg' },
    tags: ['یخچال', 'لوکس', 'خانه هوشمند'],
    weight: 135.0,
    warranty: 'ضمانت طلایی ۲۴ ماهه شیخ',
    origin: 'ایران',
    color: 'مشکی مات / طلایی',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: 'img_ph_ref1', image: 'https://images.unsplash.com/photo-1571175432247-5c868b1a45b6?q=80&w=600&auto=format&fit=crop', secureUrl: 'https://images.unsplash.com/photo-1571175432247-5c868b1a45b6?q=80&w=600&auto=format&fit=crop', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: 'pud_refrigerator_1', productId: 'ph_refrigerator_1', name: 'Piece', price: 89500000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 12, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ph_washing_machine_1',
    name: 'ماشین لباسشویی لوکس شیخ مدل Golden Spin V2',
    category: 'OTHERS',
    categoryId: '4',
    description: 'ماشین لباسشویی هوشمند با بدنه تمام مشکی مات فول لوکس و طوقه دور درب از جنس طلای برس‌خورده.',
    basePrice: 42500000,
    baseUnitId: 'u3',
    quantity: 18,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: true,
    isAmazing: false,
    categoryType: 'SheikhHome',
    slug: 'golden-spin-v2-washing-machine',
    seoTitle: 'ماشین لباسشویی لوکس شیخ مدل Golden Spin V2 | شیخ هوم',
    seoDescription: 'خرید ماشین لباسشویی هوشمند و مدرن شیخ با موتور دایرکت درایو بی‌صدا و بدنه مشکی مات طلایی.',
    metaKeywords: ['لباسشویی هوشمند', 'لباسشویی لوکس', 'لوازم خانگی شیخ'],
    canonicalUrl: '/products/golden-spin-v2-washing-machine',
    brand: 'Sheikh Shop',
    sku: 'SH-WM-GS2',
    features: ['موتور Direct Drive بدون لرزش و بی‌صدا', 'سیستم حباب‌ساز هوشمند EcoBubble', 'طوقه درخشان طلای برس‌خورده'],
    technicalSpecs: { capacity: '10kg', rpm: '1400 RPM', weight: '78kg' },
    tags: ['لباسشویی', 'لوکس', 'شستشو'],
    weight: 78.0,
    warranty: 'ضمانت طلایی ۲۴ ماهه شیخ',
    origin: 'ایران',
    color: 'مشکی مات / طلایی',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: 'img_ph_wm1', image: 'https://images.unsplash.com/photo-1582730149719-61113dc52c7b?q=80&w=600&auto=format&fit=crop', secureUrl: 'https://images.unsplash.com/photo-1582730149719-61113dc52c7b?q=80&w=600&auto=format&fit=crop', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: 'pud_washing_machine_1', productId: 'ph_washing_machine_1', name: 'Piece', price: 42500000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 18, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Dynamically expand mockProducts with more high-quality items for pagination testing under MOCK_DB
for (let i = 5; i <= 25; i++) {
  mockProducts.push({
    id: `p_extra_food_${i}`,
    name: `محصول غذایی فرعی شماره ${i}`,
    category: 'OTHERS',
    categoryId: '4',
    description: `این یک محصول آزمایشی برای تست صفحه‌بندی لوکس فروشگاه شیخ است. محصول غذایی فرعی شماره ${i}.`,
    basePrice: 500000 + i * 50000,
    baseUnitId: 'u3',
    quantity: 50,
    status: 'ACTIVE',
    isNew: false,
    isBestSeller: false,
    isAmazing: false,
    categoryType: 'SheikhFood',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: `img_extra_food_${i}`, image: '/other.webp', secureUrl: '/other.webp', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: `pu_extra_food_${i}`, productId: `p_extra_food_${i}`, name: 'Piece', price: 500000 + i * 50000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 50, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(Date.now() - i * 3600000), // separate creation dates to order nicely
    updatedAt: new Date(),
  } as any);
}

for (let i = 5; i <= 25; i++) {
  mockProducts.push({
    id: `p_extra_digital_${i}`,
    name: `گجت دیجیتال فرعی شماره ${i}`,
    category: 'OTHERS',
    categoryId: '4',
    description: `این یک گجت آزمایشی صوتی و دیجیتالی برای تست صفحه‌بندی لوکس فروشگاه شیخ است. گجت دیجیتال فرعی شماره ${i}.`,
    basePrice: 12000000 + i * 1000000,
    baseUnitId: 'u3',
    quantity: 30,
    status: 'ACTIVE',
    isNew: false,
    isBestSeller: false,
    isAmazing: false,
    categoryType: 'SheikhDigital',
    slug: `extra-digital-gadget-${i}`,
    brand: 'Sheikh Shop',
    sku: `SH-D-EG${i}`,
    features: ['طراحی ارگونومیک ممتاز', 'بدنه با مقاومت بالا'],
    technicalSpecs: { size: 'Standard' },
    tags: ['دیجیتال', 'لوکس', 'تست'],
    weight: 0.5,
    warranty: 'ضمانت طلایی ۲۴ ماهه شیخ',
    origin: 'ایران',
    color: 'مشکی طلایی',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: `img_extra_digital_${i}`, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', secureUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: `pu_extra_digital_${i}`, productId: `p_extra_digital_${i}`, name: 'Piece', price: 12000000 + i * 1000000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 30, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(Date.now() - i * 3600000),
    updatedAt: new Date(),
  } as any);
}

for (let i = 5; i <= 25; i++) {
  mockProducts.push({
    id: `p_extra_home_${i}`,
    name: `لوازم خانگی فرعی شماره ${i}`,
    category: 'OTHERS',
    categoryId: '4',
    description: `این یک لوازم خانگی لوکس آزمایشی برای تست صفحه‌بندی لوکس فروشگاه شیخ است. محصول فرعی شماره ${i}.`,
    basePrice: 15000000 + i * 1500000,
    baseUnitId: 'u3',
    quantity: 15,
    status: 'ACTIVE',
    isNew: false,
    isBestSeller: false,
    isAmazing: false,
    categoryType: 'SheikhHome',
    slug: `extra-home-gadget-${i}`,
    brand: 'Sheikh Shop',
    sku: `SH-H-EG${i}`,
    features: ['طراحی ارگونومیک ممتاز', 'بدنه با مقاومت بالا'],
    technicalSpecs: { size: 'Standard' },
    tags: ['لوازم خانگی', 'لوکس', 'تست'],
    weight: 12.5,
    warranty: 'ضمانت طلایی ۲۴ ماهه شیخ',
    origin: 'ایران',
    color: 'مشکی طلایی',
    baseUnit: mockUnits[2],
    categoryRelation: mockCategories[3],
    images: [{ id: `img_extra_home_${i}`, image: 'https://images.unsplash.com/photo-1582730149719-61113dc52c7b?q=80&w=600&auto=format&fit=crop', secureUrl: 'https://images.unsplash.com/photo-1582730149719-61113dc52c7b?q=80&w=600&auto=format&fit=crop', createdAt: new Date() }],
    discounts: [],
    units: [
      { id: `pu_extra_home_${i}`, productId: `p_extra_home_${i}`, name: 'Piece', price: 15000000 + i * 1500000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 15, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date(Date.now() - i * 3600000),
    updatedAt: new Date(),
  } as any);
}

const mockCarousel = [
  { id: 'c1', title: 'Premium Dates', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop', link: '/product/p3', order: 1 },
  { id: 'c2', title: 'Mountain Honey', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600&auto=format&fit=crop', link: '/product/p1', order: 2 },
  { id: 'c3', title: 'International Store', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=600&auto=format&fit=crop', link: '/categories/international', order: 3 },
];

const mockShowcaseConfig = [
  {
    id: 'sc1',
    isEnabled: true,
    loopMode: true,
    autoplayInterval: 5000,
    animationSpeed: 1000,
    backgroundGlow: '#fbbf24',
    maxProducts: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockFeaturedProducts = [
  {
    id: 'fp1',
    productId: 'pd_speaker_1',
    order: 0,
    badgeType: 'BEST_SELLER',
    categoryEffect: 'SPEAKER',
    ctaText: 'مشاهده اسپیکر ایستاده',
    ctaLink: '/product/pd_speaker_1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'fp2',
    productId: 'pd_speaker_2',
    order: 1,
    badgeType: 'FEATURED',
    categoryEffect: 'SPEAKER',
    ctaText: 'مشاهده اسپیکر هوشمند',
    ctaLink: '/product/pd_speaker_2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'fp3',
    productId: 'pd_headphones',
    order: 2,
    badgeType: 'NEW',
    categoryEffect: 'HEADPHONES',
    ctaText: 'خرید هدفون بی‌سیم',
    ctaLink: '/product/pd_headphones',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'fp4',
    productId: 'pd_smartwatch',
    order: 3,
    badgeType: 'FEATURED',
    categoryEffect: 'LIGHTING',
    ctaText: 'خرید ساعت هوشمند',
    ctaLink: '/product/pd_smartwatch',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'fp5',
    productId: 'p1',
    order: 4,
    badgeType: 'BEST_SELLER',
    categoryEffect: 'HONEY',
    ctaText: 'خرید عسل طبیعی',
    ctaLink: '/product/p1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'fp6',
    productId: 'p2',
    order: 5,
    badgeType: 'NEW',
    categoryEffect: 'SAFFRON',
    ctaText: 'خرید زعفران نگین',
    ctaLink: '/product/p2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'fp7',
    productId: 'p3',
    order: 6,
    badgeType: 'BEST_SELLER',
    categoryEffect: 'DATES',
    ctaText: 'خرید خرما مجول',
    ctaLink: '/product/p3',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Initialize mock dynamic lists for images and videos from mockProducts initial state
let mockImages: any[] = mockProducts.flatMap(p => {
  const images = (p as any).images || [];
  return images.map((img: any, idx: number) => ({
    id: img.id || `img_${p.id}_${idx}`,
    image: img.image || null,
    secureUrl: img.secureUrl || img.image || null,
    productId: p.id,
    createdAt: img.createdAt || new Date(),
    isVisible: img.isVisible !== false,
    isFeatured: img.isFeatured || idx === 0,
    sortOrder: img.sortOrder || idx,
    publicId: img.publicId || null,
    bytes: img.bytes || null,
    format: img.format || null,
    width: img.width || null,
    height: img.height || null,
  }));
});

let mockVideos: any[] = [];

const matchFilter = (item: any, where: any): boolean => {
  if (!where) return true;
  for (const key in where) {
    const condition = where[key];
    if (condition === undefined) continue;

    const itemValue = item[key];

    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      if ('equals' in condition) {
        if (itemValue !== condition.equals) return false;
      } else if ('in' in condition) {
        if (!Array.isArray(condition.in) || !condition.in.includes(itemValue)) return false;
      } else if ('not' in condition) {
        if (itemValue === condition.not) return false;
      } else if ('contains' in condition) {
        const query = condition.contains;
        if (typeof itemValue === 'string' && typeof query === 'string') {
          const mode = condition.mode;
          if (mode === 'insensitive') {
            if (!itemValue.toLowerCase().includes(query.toLowerCase())) return false;
          } else {
            if (!itemValue.includes(query)) return false;
          }
        } else {
          return false;
        }
      }
    } else {
      if (itemValue !== condition) return false;
    }
  }
  return true;
};

const normalizeMockProduct = (item: any) => {
  if (!item || typeof item !== 'object') return item;

  // Dynamically query from the single mutable mock collections
  const productImages = mockImages.filter(img => img.productId === item.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const productVideos = mockVideos.filter(vid => vid.productId === item.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if ('basePrice' in item || 'category' in item) {
    let enriched = {
      shippingCost: null,
      shippingMode: null,
      shippingDescription: null,
      allowFreeShipping: false,
      shippingPriority: null,
      productAttributes: [] as any[],
      ...item,
      images: productImages,
      videos: productVideos,
    };

    if (enriched.id === 'pd_smartwatch') {
      enriched.productAttributes = [
        {
          id: 'pa1',
          productId: 'pd_smartwatch',
          attributeId: 'attr_color',
          attribute: {
            id: 'attr_color',
            name: 'Color',
            displayName: 'رنگ',
            type: 'COLOR',
            values: [
              { id: 'val_black', attributeId: 'attr_color', value: 'Black', hex: '#000000' },
              { id: 'val_gold', attributeId: 'attr_color', value: 'Gold', hex: '#D4AF37' },
              { id: 'val_white', attributeId: 'attr_color', value: 'White', hex: '#FFFFFF' },
            ]
          }
        },
        {
          id: 'pa2',
          productId: 'pd_smartwatch',
          attributeId: 'attr_storage',
          attribute: {
            id: 'attr_storage',
            name: 'Storage',
            displayName: 'حافظه',
            type: 'SELECT',
            values: [
              { id: 'val_64gb', attributeId: 'attr_storage', value: '64GB' },
              { id: 'val_128gb', attributeId: 'attr_storage', value: '128GB' },
            ]
          }
        }
      ];

      if (Array.isArray(enriched.units)) {
        enriched.units = enriched.units.map((unit: any) => {
          if (unit.id === 'pud_smartwatch_black_64') {
            return {
              ...unit,
              values: [
                {
                  productUnitId: 'pud_smartwatch_black_64',
                  attributeValueId: 'val_black',
                  attributeValue: { id: 'val_black', attributeId: 'attr_color', value: 'Black', hex: '#000000', attribute: { id: 'attr_color', name: 'Color', displayName: 'رنگ', type: 'COLOR' } }
                },
                {
                  productUnitId: 'pud_smartwatch_black_64',
                  attributeValueId: 'val_64gb',
                  attributeValue: { id: 'val_64gb', attributeId: 'attr_storage', value: '64GB', hex: null, attribute: { id: 'attr_storage', name: 'Storage', displayName: 'حافظه', type: 'SELECT' } }
                }
              ]
            };
          }
          if (unit.id === 'pud_smartwatch_black_128') {
            return {
              ...unit,
              values: [
                {
                  productUnitId: 'pud_smartwatch_black_128',
                  attributeValueId: 'val_black',
                  attributeValue: { id: 'val_black', attributeId: 'attr_color', value: 'Black', hex: '#000000', attribute: { id: 'attr_color', name: 'Color', displayName: 'رنگ', type: 'COLOR' } }
                },
                {
                  productUnitId: 'pud_smartwatch_black_128',
                  attributeValueId: 'val_128gb',
                  attributeValue: { id: 'val_128gb', attributeId: 'attr_storage', value: '128GB', hex: null, attribute: { id: 'attr_storage', name: 'Storage', displayName: 'حافظه', type: 'SELECT' } }
                }
              ]
            };
          }
          if (unit.id === 'pud_smartwatch_gold_128') {
            return {
              ...unit,
              values: [
                {
                  productUnitId: 'pud_smartwatch_gold_128',
                  attributeValueId: 'val_gold',
                  attributeValue: { id: 'val_gold', attributeId: 'attr_color', value: 'Gold', hex: '#D4AF37', attribute: { id: 'attr_color', name: 'Color', displayName: 'رنگ', type: 'COLOR' } }
                },
                {
                  productUnitId: 'pud_smartwatch_gold_128',
                  attributeValueId: 'val_128gb',
                  attributeValue: { id: 'val_128gb', attributeId: 'attr_storage', value: '128GB', hex: null, attribute: { id: 'attr_storage', name: 'Storage', displayName: 'حافظه', type: 'SELECT' } }
                }
              ]
            };
          }
          return unit;
        });
      }
    }

    return enriched;
  }
  return item;
};

const makeMockModel = (name: string, data: any[]) => {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'findMany') {
        return async (args?: any) => {
          let result = [...data];
          if (args?.where) {
            const where = args.where;
            result = result.filter(item => {
              for (const key in where) {
                if (where[key] !== undefined && item[key] !== where[key]) {
                  return false;
                }
              }
              return true;
            });
          }
          return result.map(normalizeMockProduct);
        };
      }
      if (prop === 'findFirst' || prop === 'findUnique') {
        return async (args?: any) => {
          if (args?.where) {
            const where = args.where;
            const item = data.find(item => {
              for (const key in where) {
                if (where[key] !== undefined && item[key] !== where[key]) {
                  return false;
                }
              }
              return true;
            });
            return normalizeMockProduct(item || null);
          }
          if (prop === 'findFirst') {
            return normalizeMockProduct(data[0] || null);
          }
          return null;
        };
      }
      if (prop === 'count') {
        return async () => data.length;
      }
      return async () => null;
    }
  });
};

const makeMockModelWithWrites = (name: string, data: any[]) => {
  let localData = data;
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'findMany') {
        return async (args?: any) => {
          let result = [...localData];
          if (args?.where) {
            result = result.filter(item => matchFilter(item, args.where));
          }
          if (args?.orderBy) {
            const orderBy = args.orderBy;
            const key = Object.keys(orderBy)[0];
            if (key) {
              const direction = orderBy[key];
              result.sort((a: any, b: any) => {
                if (direction === 'asc') return a[key] > b[key] ? 1 : -1;
                return a[key] < b[key] ? 1 : -1;
              });
            }
          }
          return result.map(normalizeMockProduct);
        };
      }
      if (prop === 'findFirst' || prop === 'findUnique') {
        return async (args?: any) => {
          let result = [...localData];
          if (args?.where) {
            result = result.filter(item => matchFilter(item, args.where));
          }
          return result[0] ? normalizeMockProduct(result[0]) : null;
        };
      }
      if (prop === 'create') {
        return async (args: any) => {
          const generatedId = name === 'product' ? `p_${Date.now()}` : `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          let newItem = { id: args?.data?.id || generatedId, ...args.data, createdAt: new Date(), updatedAt: new Date() };
          if (name === 'cartItem') {
            const product = mockProducts.find(p => p.id === newItem.productId);
            let unit = mockUnits.find(u => u.id === newItem.unitId);
            if (product && !unit) {
              unit = (product.units?.find((u: any) => u.id === newItem.unitId) || product.baseUnit) as any;
            }
            newItem = {
              ...newItem,
              product,
              unit: unit as any,
            };
          }
          localData.push(newItem);
          if (name === 'image') mockImages = localData;
          if (name === 'video') mockVideos = localData;
          if (name === 'product') {
            const temp = [...localData];
            mockProducts.length = 0;
            mockProducts.push(...temp);
          }
          return normalizeMockProduct(newItem);
        };
      }
      if (prop === 'update' || prop === 'updateMany') {
        return async (args: any) => {
          const where = args?.where || {};
          const updateData = args?.data || {};
          let updatedCount = 0;
          let firstUpdatedItem: any = null;

          localData = localData.map(item => {
            if (matchFilter(item, where)) {
              const updated = { ...item, ...updateData, updatedAt: new Date() };
              updatedCount++;
              if (!firstUpdatedItem) firstUpdatedItem = updated;
              return updated;
            }
            return item;
          });

          if (name === 'image') mockImages = localData;
          if (name === 'video') mockVideos = localData;
          if (name === 'product') {
            const temp = [...localData];
            mockProducts.length = 0;
            mockProducts.push(...temp);
          }

          if (prop === 'update') {
            return firstUpdatedItem ? normalizeMockProduct(firstUpdatedItem) : null;
          }
          return { count: updatedCount };
        };
      }
      if (prop === 'delete' || prop === 'deleteMany') {
        return async (args?: any) => {
          const where = args?.where || {};
          const beforeLength = localData.length;

          localData = localData.filter(item => !matchFilter(item, where));

          if (name === 'image') mockImages = localData;
          if (name === 'video') mockVideos = localData;
          if (name === 'product') {
            const temp = [...localData];
            mockProducts.length = 0;
            mockProducts.push(...temp);
          }

          return { count: beforeLength - localData.length };
        };
      }
      if (prop === 'count') {
        return async () => localData.length;
      }
      return async () => null;
    }
  });
};

const mockUser = [
  {
    id: 'mock-user-id',
    email: 'customer@sheikhshop.com',
    firstName: 'احمد',
    lastName: 'شیخ',
    role: 'SUPERADMIN',
    canLogin: true,
    disabled: false,
    emailVerified: true,
  }
];

const mockCartItems = [
  {
    id: 1,
    userId: 'mock-user-id',
    productId: 'p_simple_stock_50',
    quantity: 1,
    unitId: 'u3',
    unitPrice: 100000,
    product: mockProducts[0],
    unit: mockUnits[2],
  },
  {
    id: 2,
    userId: 'mock-user-id',
    productId: 'p1',
    quantity: 2,
    unitId: 'pu1',
    unitPrice: 1250000,
    product: mockProducts[1],
    unit: mockUnits[1],
  }
];

let globalCartItems = JSON.parse(JSON.stringify(mockCartItems));

const mockLuxuryUnboxingConfig = [
  {
    id: 'luc1',
    isEnabled: true,
    animationSpeed: 1.0,
    particleDensity: 1.0,
    lightIntensity: 1.0,
    cameraDistance: 5.0,
    enableAudio: true,
    ribbonColor: '#d97706',
    goldenGlow: '#f59e0b',
    backgroundStyle: 'dark-ambient',
    openingDuration: 3.0,
    featuredProductMode: 'pedestal',
    autoPreview: false,
    introDuration: 2.0,
    cameraSpeed: 1.0,
    fogIntensity: 1.0,
    audioVolume: 0.5,
    animationPreset: 'classic',
    autoClose: false,
    ctaStyle: 'luxury',
    themePreset: 'gold-chocolate',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockLuxuryUnboxingAssets = [
  {
    id: 'lua1',
    boxTextureUrl: null,
    crownLogoUrl: null,
    unlockSoundUrl: null,
    openSoundUrl: null,
    sparkleSoundUrl: null,
    unwrapSoundUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockLuxuryUnboxingSettings = [
  {
    id: 'lus1',
    key: 'theme',
    value: 'dark',
    description: 'default theme mode',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockArticles = [
  {
    id: 'art1',
    title: 'عسل طبیعی کوهستان: اکسیر طلایی طبیعت با خواص درمانی بی‌نظیر و استانداردهای ممتاز',
    slug: 'honey',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600&auto=format&fit=crop',
    summary: 'سفری به دنیای شگفت‌انگیز عسل طبیعی کوهستان؛ با خواص شگفت‌انگیز ضدباکتریایی، درمان‌های سنتی و بهبود سیستم ایمنی بدن آشنا شوید.',
    content: `<p>عسل طبیعی کوهستان فراتر از یک شیرین‌کننده لذیذ، معجزه درمان‌بخش طبیعت است که هزاران سال است در سراسر گیتی مورد ستایش بوده است. این شهد گران‌بها سرشار از آنزیم‌های فعال، آنتی‌اکسیدان‌های قوی و مواد معدنی حیاتی است.</p>
<h2>خواص معجزه‌آسای عسل طبیعی برای سلامت بدن</h2>
<p>پژوهش‌های کلینیکی نوین ثابت کرده‌اند که عسل خام و تصفیه‌نشده نقش بسیار موثری در درمان بیماری‌ها و ارتقای تندرستی ایفا می‌کند.</p>
<h3>۱. تقویت فوق‌العاده سیستم ایمنی بدن</h3>
<p>عسل به دلیل دارا بودن آنتی‌اکسیدان‌های غنی نظیر فلاونوئیدها، به مبارزه با رادیکال‌های آزاد پرداخته و مانع از بروز بیماری‌های مزمن و سرطان می‌گردد.</p>
<h3>۲. تسکین فوری سرفه و بهبود گلو درد</h3>
<p>این اکسیر طبیعی به عنوان یک لایه‌بردار و نرم‌کننده طبیعی گلو عمل کرده و التهابات مجاری تنفسی را در کوتاه‌ترین زمان کاهش می‌دهد.</p>
<h3>۳. التیام و ترمیم سریع زخم‌ها و سوختگی‌ها</h3>
<p>استعمال موضعی عسل مرغوب روی بریدگی‌ها و سوختگی‌ها، به علت خاصیت اسمزی و هیدروژن پراکسید طبیعی موجود در آن، روند بازسازی سلول‌های پوست را سرعت می‌بخشد.</p>

<h2>جدول ارزش غذایی عسل طبیعی کوهستان (در هر ۱۰۰ گرم)</h2>
<table class="min-w-full divide-y divide-white/10 text-right my-6">
  <thead>
    <tr class="bg-white/5">
      <th class="px-4 py-2 text-white font-medium">ماده مغذی</th>
      <th class="px-4 py-2 text-white font-medium">مقدار</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-white/5 text-gray-300">
    <tr>
      <td class="px-4 py-2">انرژی (کالری)</td>
      <td class="px-4 py-2">۳۰۴ کیلوکالری</td>
    </tr>
    <tr>
      <td class="px-4 py-2">کربوهیدرات طبیعی</td>
      <td class="px-4 py-2">۸۲ گرم</td>
    </tr>
    <tr>
      <td class="px-4 py-2">پتاسیم، کلسیم و روی</td>
      <td class="px-4 py-2">سرشار</td>
    </tr>
  </tbody>
</table>

<h2>سوالات متداول درباره عسل طبیعی کوهستان</h2>
<div class="space-y-4 my-6">
  <div class="bg-white/5 p-4 rounded-xl border border-white/10">
    <p class="font-bold text-amber-300">چگونه عسل طبیعی اصل را از تقلبی تشخیص دهیم؟</p>
    <p class="text-gray-300">مطمئن‌ترین روش، سنجش غلظت ساکاروز و انجام آزمایش‌های تخصصی در آزمایشگاه‌های معتبر است. عسل‌های فروشگاه شیخ تماماً دارای شناسنامه اصالت هستند.</p>
  </div>
  <div class="bg-white/5 p-4 rounded-xl border border-white/10">
    <p class="font-bold text-amber-300">آیا عسل طبیعی شکرک می‌زند؟</p>
    <p class="text-gray-300">بله، شکرک زدن (یا رس بستن) یکی از نشانه‌های طبیعی عسل خام و حرارت‌ندیده است که به دلیل وجود ذرات معلق گرده گل رخ می‌دهد.</p>
  </div>
</div>

<h2>نتیجه‌گیری و پیشنهاد خرید</h2>
<p>عسل طبیعی کوهستان تلاقی بی‌نظیر سنت‌های کهن و علم تندرستی مدرن است. برای بهره‌مندی از فواید واقعی این سوپرفود ممتاز، همواره عسل‌های ارگانیک و تصفیه‌نشده را انتخاب نمایید.</p>
<div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center my-8">
  <h3 class="text-xl font-bold text-amber-300 mb-2">همین امروز سلامت خود را تضمین کنید!</h3>
  <p class="text-gray-300 mb-4">کلکسیون عسل‌های طبیعی و خام فروشگاه شیخ با دقت مستقیم و گواهی اصالت در اختیار شماست.</p>
  <a href="https://sheikhshops.com/product/p1" class="inline-block bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">خرید عسل ممتاز کوهستان</a>
</div>`,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'mock-user-id',
    category: 'عسل طبیعی',
    tags: ['عسل', 'شیرین‌کننده طبیعی', 'ارگانیک', 'سلامت', 'زنبورها', 'دارویی', 'عسل خام', 'تغذیه', 'آنتی‌اکسیدان‌ها', 'تندرستی'],
    excerpt: 'خواص بی‌نظیر عسل طبیعی کوهستان برای سلامتی و تقویت قوی سیستم ایمنی بدن.',
    externalLinks: ['https://wikipedia.org'],
    internalLinks: ['https://sheikhshops.com/product/p1'],
    keywords: ['عسل طبیعی', 'عسل کوهستان', 'خواص عسل', 'عسل ارگانیک', 'خرید عسل'],
    metaTitle: 'عسل طبیعی کوهستان: اکسیر طلایی طبیعت با خواص بی‌نظیر درمانی',
    metaDescription: 'سفری به دنیای شگفت‌انگیز عسل طبیعی کوهستان؛ با خواص شگفت‌انگیز ضدباکتریایی، درمان‌های سنتی و بهبود سیستم ایمنی بدن آشنا شوید.',
    language: 'fa',
    views: 120,
    shares: 15,
    likes: 45,
    author: mockUser[0],
    comments: [],
  },
  {
    id: 'art2',
    title: 'زعفران نگین خراسان: طلای سرخ ناب با عطر بی‌نظیر و خواص شگفت‌انگیز درمانی',
    slug: 'saffron',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop',
    summary: 'با خواص درمانی بی‌نظیر، بهبود افسردگی و استرس، و جایگاه استثنایی زعفران نگین خراسان به عنوان گران‌ترین ادویه جهان آشنا شوید.',
    content: `<p>زعفران نگین که به شایستگی لقب «طلای سرخ» را به خود اختصاص داده است، ارزشمندترین ادویه در سراسر گیتی به شمار می‌رود. این چاشنی سلطنتی علاوه بر عطر و رنگ مسحورکننده در هنر آشپزی، یک داروی طبیعی فوق‌العاده قوی در طب سنتی و نوین است.</p>
<h2>چرا زعفران نگین خراسان مرغوب‌ترین نوع زعفران است؟</h2>
<p>کشت و برداشت زعفران فرآیندی بسیار ظریف و کارطلب است. کلاله‌های سه‌شاخه و سرخ‌رنگ زعفران نگین کاملاً دست‌چین شده و عاری از هرگونه ریشه یا بخش زرد رنگ هستند، که عطر فوق‌العاده و قدرت رنگ‌دهی بی‌رقیبی را به ارمغان می‌آورد.</p>
<h3>۱. بهبود شادابی ذهن و رفع افسردگی</h3>
<p>تحقیقات کلینیکی اثبات کرده‌اند که زعفران اثرات شگرفی در تنظیم نوسانات خلقی، بهبود کیفیت خواب و کاهش چشمگیر اضطراب و استرس روزمره دارد.</p>
<h3>۲. سلامت قلب و عروق</h3>
<p>مصرف متعادل این چاشنی سلطنتی به تنظیم فشار خون، کاهش کلسترول مضر و بهبود جریان خون در رگ‌ها کمک شایانی می‌کند.</p>
<h3>۳. خواص ضدسرطانی قوی</h3>
<p>ترکیبات فعال زیستی موجود در زعفران مانند کروسین و سافرانال، با رادیکال‌های آزاد مبارزه کرده و مانع از رشد سلول‌های سرطانی می‌شوند.</p>

<h2>جدول مشخصات کیفی زعفران ممتاز نگین</h2>
<table class="min-w-full divide-y divide-white/10 text-right my-6">
  <thead>
    <tr class="bg-white/5">
      <th class="px-4 py-2 text-white font-medium">شاخص سنجش</th>
      <th class="px-4 py-2 text-white font-medium">میزان غلظت</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-white/5 text-gray-300">
    <tr>
      <td class="px-4 py-2">کروسین (قدرت رنگ‌دهی طبیعی)</td>
      <td class="px-4 py-2">بالای ۲۴۰ (گرید ممتاز ممتاز)</td>
    </tr>
    <tr>
      <td class="px-4 py-2">سافرانال (رایحه و عطر اصیل)</td>
      <td class="px-4 py-2">بسیار بالا و خالص</td>
    </tr>
  </tbody>
</table>

<h2>سوالات متداول درباره زعفران نگین اصل</h2>
<div class="space-y-4 my-6">
  <div class="bg-white/5 p-4 rounded-xl border border-white/10">
    <p class="font-bold text-amber-300">بهترین روش مصرف زعفران برای بیشترین رنگ‌دهی چیست؟</p>
    <p class="text-gray-300">سابیدن کلاله‌ها به همراه مقدار کمی قند یا شکر و سپس دم کردن آن با چند قالب یخ کوچک به مدت ۲۰ دقیقه، بیشترین میزان رنگ و عطر را آزاد می‌کند.</p>
  </div>
</div>

<h2>نتیجه‌گیری و پیشنهاد خرید</h2>
<p>خرید زعفران اصیل، سرمایه‌گذاری بر روی طعم‌های جادویی آشپزی و تندرستی خانواده است. ما در فروشگاه شیخ مفتخریم که ناب‌ترین زعفران نگین خراسان را با شناسنامه تضمین کیفیت ارائه دهیم.</p>
<div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center my-8">
  <h3 class="text-xl font-bold text-amber-300 mb-2">تجربه طعم واقعی طلای سرخ ایرانی!</h3>
  <p class="text-gray-300 mb-4">هم‌اکنون زعفران نگین دست‌چین شده فروشگاه شیخ را با ضمانت مرجوعی سفارش دهید.</p>
  <a href="https://sheikhshops.com/product/p2" class="inline-block bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">خرید زعفران ممتاز نگین</a>
</div>`,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'mock-user-id',
    category: 'زعفران ممتاز',
    tags: ['زعفران', 'ادویه', 'ارگانیک', 'لوکس', 'سلامت', 'محصولات طبیعی', 'آشپزی', 'دارویی', 'ممتاز', 'بازار جهانی'],
    excerpt: 'بررسی جامع زعفران نگین خراسان، عطر شگفت‌انگیز و فواید آن در بهبود خلق و خو و ارتقای سلامتی.',
    externalLinks: ['https://wikipedia.org'],
    internalLinks: ['https://sheikhshops.com/product/p2'],
    keywords: ['زعفران نگین', 'زعفران خراسان', 'خواص زعفران', 'طلای سرخ', 'قیمت زعفران'],
    metaTitle: 'زعفران نگین خراسان: طلای سرخ ناب با عطر بی‌نظیر و خواص درمانی',
    metaDescription: 'با خواص درمانی بی‌نظیر، بهبود افسردگی و استرس، و جایگاه استثنایی زعفران نگین خراسان به عنوان گران‌ترین ادویه جهان آشنا شوید.',
    language: 'fa',
    views: 250,
    shares: 30,
    likes: 85,
    author: mockUser[0],
    comments: [],
  },
  {
    id: 'art3',
    title: 'خرمای مجول پادشاه خرماها: سوپرفود باستانی با ارزش غذایی بی‌نظیر و انرژی پایدار',
    slug: 'dates',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop',
    summary: 'آشنایی جامع با خرمای مجول لوکس؛ ارزش غذایی فوق‌العاده، خواص بی‌شمار برای شادابی و تندرستی روزانه.',
    content: `<p>خرمای مجول به دلیل اندازه بزرگ، بافت نرم کاراملی و طعم عسلی مسحورکننده به شایستگی لقب «پادشاه خرماها» را از آن خود کرده است. این میوه باستانی، منبع غنی از فیبر, پتاسیم و انرژی ارگانیک است.</p>
<h2>خواص شگفت‌انگیز خرمای مجول ممتاز برای سلامتی</h2>
<p>خرما مجول به عنوان یک میان‌وعده سالم و کامل، جایگزینی ایده‌آل برای شیرینی‌های مصنوعی در رژیم غذایی مدرن به شمار می‌رود.</p>
<h3>۱. بمب انرژی طبیعی و رفع خستگی</h3>
<p>قندهای طبیعی موجود در خرمای مجول (فروکتوز و گلوکز) به آرامی جذب بدن شده و بدون ایجاد نوسانات ناگهانی قند خون، انرژی پایدار و طولانی‌مدتی را برای ورزشکاران و کارهای روزانه تامین می‌کنند.</p>
<h3>۲. ارتقای سلامت دستگاه گوارش</h3>
<p>فیبر بالا در این سوپرفود، عملکرد روده را تسهیل نموده، از بروز یبوست پیشگیری کرده و به عنوان یک پری‌بیوتیک طبیعی به تغذیه باکتری‌های مفید گوارشی کمک می‌کند.</p>
<h3>۳. تنظیم فشار خون و سلامت قلب</h3>
<p>به دلیل غنای بالا در ماده معدنی پتاسیم، خرمای مجول نقش مهمی در تنظیم فشار خون، آرامش ماهیچه‌های قلب و کاهش خطر بروز سکته‌های ناگهانی دارد.</p>

<h2>جدول ارزش غذایی خرمای مجول (در هر ۱۰۰ گرم)</h2>
<table class="min-w-full divide-y divide-white/10 text-right my-6">
  <thead>
    <tr class="bg-white/5">
      <th class="px-4 py-2 text-white font-medium">ماده معدنی و مغذی</th>
      <th class="px-4 py-2 text-white font-medium">مقدار در هر ۱۰۰ گرم</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-white/5 text-gray-300">
    <tr>
      <td class="px-4 py-2">پتاسیم</td>
      <td class="px-4 py-2">۶۹۶ میلی‌گرم</td>
    </tr>
    <tr>
      <td class="px-4 py-2">فیبر رژیمی</td>
      <td class="px-4 py-2">۶.۷ گرم</td>
    </tr>
    <tr>
      <td class="px-4 py-2">آهن و منیزیم</td>
      <td class="px-4 py-2">بسیار عالی</td>
    </tr>
  </tbody>
</table>

<h2>سوالات متداول درباره خرمای مجول لوکس</h2>
<div class="space-y-4 my-6">
  <div class="bg-white/5 p-4 rounded-xl border border-white/10">
    <p class="font-bold text-amber-300">چرا قیمت خرمای مجول نسبت به سایر خرماها بیشتر است؟</p>
    <p class="text-gray-300">پرورش خرمای مجول نیازمند شرایط اقلیمی خاص، نگهداری بسیار حساس و چیدن تک به تک به روش دستی است. اندازه بسیار درشت و کیفیت برتر آن نیز بر ارزش ویژه آن می‌افزاید.</p>
  </div>
</div>

<h2>نتیجه‌گیری و پیشنهاد خرید</h2>
<p>خرما مجول انتخابی لوکس برای ارتقای سلامت فردی و شیرین کردن لحظات زندگی به روشی ۱۰۰ درصد ارگانیک است.</p>
<div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center my-8">
  <h3 class="text-xl font-bold text-amber-300 mb-2">طعم بی‌بدیل شکلات طبیعی طبیعت را تجربه کنید!</h3>
  <p class="text-gray-300 mb-4">کلکسیون خرمای مجول لوکس فروشگاه شیخ با بسته‌بندی سلطنتی آماده ارسال به سراسر کشور است.</p>
  <a href="https://sheikhshops.com/product/p3" class="inline-block bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">خرید خرمای لوکس مجول</a>
</div>`,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'mock-user-id',
    category: 'خرمای لوکس',
    tags: ['خرما', 'میوه', 'تغذیه', 'خاورمیانه', 'انرژی', 'سوپرفود', 'طبیعی', 'سلامت', 'سنتی', 'تجارت جهانی'],
    excerpt: 'آشنایی با ارزش غذایی فوق‌العاده، خواص بی‌شمار و تاثیرات تندرستی خرمای مجول لوکس پادشاه خرماها.',
    externalLinks: ['https://wikipedia.org'],
    internalLinks: ['https://sheikhshops.com/product/p3'],
    keywords: ['خرمای مجول', 'خرما مجول', 'ارزش غذایی خرما', 'خرید خرما', 'پادشاه خرماها'],
    metaTitle: 'خرمای مجول پادشاه خرماها: سوپرفود باستانی با ارزش غذایی بی‌نظیر',
    metaDescription: 'درباره خرمای مجول لوکس و تاثیرات شگفت‌انگیز آن بر افزایش سطح انرژی، تندرستی و سلامت گوارش بیشتر بخوانید.',
    language: 'fa',
    views: 180,
    shares: 20,
    likes: 60,
    author: mockUser[0],
    comments: [],
  },
  {
    id: 'art4',
    title: 'زرشک پفکی سوپرفود ایرانی: یاقوت سرخ با خواص معجزه‌آسا برای کبد و قلب',
    slug: 'premium-barberries-superfood',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=600&auto=format&fit=crop',
    summary: 'خواص زرشک پفکی ممتاز خراسان برای سلامت قلب، پاکسازی کبد چرب و شادابی پوست؛ بررسی علمی و کاربردها.',
    content: `<p>زرشک پفکی ممتاز که به عنوان «یاقوت سرخ» ایران شناخته می‌شود، یکی از غنی‌ترین سوپرفودهای طبیعی جهان است. فرآیند خشک کردن طولانی و اصیل این محصول در سایه، رنگ درخشان، بافت نرم و طعم ترش ترش متمایز آن را کاملاً حفظ می‌کند.</p>
<h2>خواص شگفت‌انگیز زرشک پفکی برای تندرستی</h2>
<p>زرشک حاوی ترکیب زیستی فعال بسیار قدرتمندی به نام بربرین (Berberine) است که فواید خارق‌العاده‌ای برای ارگان‌های مختلف بدن دارد.</p>
<h3>۱. پاکسازی کبد و بهبود کبد چرب</h3>
<p>بربرین موجود در زرشک پفکی، ترشح صفرا را افزایش داده، به سم‌زدایی طبیعی کبد کمک کرده و مانع تجمع چربی‌های مضر در بافت کبد می‌گردد.</p>
<h3>۲. کنترل قند خون و چربی خون</h3>
<p>پژوهش‌های نوین نشان می‌دهند مصرف مداوم دمنوش یا آب زرشک به تنظیم میزان قند خون کمک کرده و سطح چربی‌های مضر مانند کلسترول LDL را کاهش می‌دهد.</p>
<h3>۳. تقویت قلب و شادابی پوست</h3>
<p>آنتی‌اکسیدان‌های قوی و ویتامین C فراوان در زرشک پفکی، رگ‌های خونی را تقویت کرده و با رفع جوش‌ها، موجب شفافیت و جوانی پوست می‌شوند.</p>

<h2>جدول فواید بیوشیمیایی زرشک ممتاز</h2>
<table class="min-w-full divide-y divide-white/10 text-right my-6">
  <thead>
    <tr class="bg-white/5">
      <th class="px-4 py-2 text-white font-medium">ترکیب فعال</th>
      <th class="px-4 py-2 text-white font-medium">تاثیر درمانی روی بدن</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-white/5 text-gray-300">
    <tr>
      <td class="px-4 py-2">بربرین (Berberine)</td>
      <td class="px-4 py-2">تنظیم انسولین، رفع کبد چرب و بهبود هضم غذا</td>
    </tr>
    <tr>
      <td class="px-4 py-2">ویتامین C</td>
      <td class="px-4 py-2">کلاژن‌سازی پوست و تقویت قوی سیستم دفاعی بدن</td>
    </tr>
  </tbody>
</table>

<h2>سوالات متداول درباره زرشک پفکی</h2>
<div class="space-y-4 my-6">
  <div class="bg-white/5 p-4 rounded-xl border border-white/10">
    <p class="font-bold text-amber-300">تفاوت زرشک پفکی با زرشک دانه اناری چیست؟</p>
    <p class="text-gray-300">زرشک پفکی در سایه و در طی چند ماه به آرامی خشک می‌شود، بنابراین پفکی و خوش‌رنگ باقی می‌ماند. زرشک دانه اناری در آفتاب مستقیم و با سرعت خشک شده و رنگ تیره‌تری دارد.</p>
  </div>
</div>

<h2>نتیجه‌گیری و پیشنهاد خرید</h2>
<p>زرشک پفکی ممتاز انتخابی عالی برای عطرآگین کردن برنج اصیل ایرانی و ارتقای سلامت کبد است.</p>
<div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center my-8">
  <h3 class="text-xl font-bold text-amber-300 mb-2">یاقوت سرخ خراسان را به سفره خود هدیه دهید!</h3>
  <p class="text-gray-300 mb-4">زرشک پفکی درجه یک و اعلای دست‌چین شده فروشگاه شیخ را با کیفیت و تمیزی تضمینی تهیه کنید.</p>
  <a href="https://sheikhshops.com/product/p4" class="inline-block bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">خرید زرشک پفکی ممتاز</a>
</div>`,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'mock-user-id',
    category: 'سایر محصولات',
    tags: ['زرشک', 'سوپرفود', 'سلامتی', 'یاقوت سرخ', 'زرشک خراسان'],
    excerpt: 'خواص شگفت‌انگیز زرشک پفکی ممتاز برای سلامت قلب، کبد چرب، سم‌زدایی بدن و شادابی پوست.',
    externalLinks: ['https://wikipedia.org'],
    internalLinks: ['https://sheikhshops.com/product/p4'],
    keywords: ['زرشک پفکی', 'زرشک ممتاز', 'خواص زرشک', 'زرشک خراسان', 'یاقوت سرخ'],
    metaTitle: 'زرشک پفکی سوپرفود ایرانی: یاقوت سرخ با خواص معجزه‌آسا برای کبد',
    metaDescription: 'درباره خواص زرشک پفکی ممتاز و تاثیر بیوشیمیایی و بی نظیر آن در تنظیم قند خون، کاهش غلظت خون و پاکسازی کبد چرب بخوانید.',
    language: 'fa',
    views: 95,
    shares: 8,
    likes: 32,
    author: mockUser[0],
    comments: [],
  },
  {
    id: 'art5',
    title: 'زرشک کوهی ممتاز: هدیه وحشی طبیعت با خواص معجزه‌آسای سم‌زدایی و درمانی',
    slug: 'barberries',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=600&auto=format&fit=crop',
    summary: 'بررسی خواص بی‌نظیر زرشک کوهی ممتاز؛ بمب ویتامین ث برای تقویت تندرستی، شادابی و تصفیه قوی خون.',
    content: `<p>زرشک کوهی ممتاز هدیه‌ای گران‌بها و وحشی از دامنه‌های بکر کوهستان است. این نوع زرشک ارگانیک به دلیل رشد کاملاً طبیعی در آغوش طبیعت، سرشار از املاح معدنی، آنتی‌اکسیدان‌های کوهستانی و ویتامین‌های سر زنده است.</p>
<h2>خواص بی‌نظیر و تایید شده زرشک کوهی ممتاز</h2>
<p>زرشک وحشی کوهستان از دیرباز به عنوان تصفیه‌کننده طبیعی خون و بهبوددهنده عملکرد کبد و طحال مورد استفاده قرار گرفته است.</p>
<h3>۱. تصفیه قوی جریان خون</h3>
<p>این یاقوت‌های وحشی ترش‌مزه به طرز اعجاب‌انگیزی به پاکسازی سموم از جریان خون کمک کرده و غلظت خون را تنظیم می‌نمایند.</p>
<h3>۲. تنظیم فشار خون و کمک به سیستم عروقی</h3>
<p>ترکیبات طبیعی موجود در زرشک کوهی سبب آرامش رگ‌ها و بهبود گردش خون شده و فشار خون بالا را به شکل ارگانیک متعادل می‌سازد.</p>
<h3>۳. بمب ویتامین C برای شادابی پوست</h3>
<p>ویتامین C غنی موجود در زرشک کوهستان وحشی، در بهبود لک‌های پوستی، بازسازی کلاژن و رفع جوش‌های کبد چرب معجزه می‌کند.</p>

<h2>جدول مقایسه زرشک کوهی با زرشک پرورشی</h2>
<table class="min-w-full divide-y divide-white/10 text-right my-6">
  <thead>
    <tr class="bg-white/5">
      <th class="px-4 py-2 text-white font-medium">ویژگی بارز</th>
      <th class="px-4 py-2 text-white font-medium">زرشک کوهی ممتاز</th>
      <th class="px-4 py-2 text-white font-medium">زرشک پرورشی معمولی</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-white/5 text-gray-300">
    <tr>
      <td class="px-4 py-2">شیوه رشد</td>
      <td class="px-4 py-2">کاملاً وحشی و بدون کود و سموم شیمیایی</td>
      <td class="px-4 py-2">پرورش یافته در مزارع کشاورزی با مراقبت انسانی</td>
    </tr>
    <tr>
      <td class="px-4 py-2">غلظت املاح معدنی</td>
      <td class="px-4 py-2">بسیار غنی به دلیل رشد دیم در خاک کوهستان</td>
      <td class="px-4 py-2">متوسط و استاندارد</td>
    </tr>
  </tbody>
</table>

<h2>نتیجه‌گیری و پیشنهاد خرید</h2>
<p>زرشک کوهی وحشی بهترین گزینه برای دمنوش‌های درمانی، تهیه آب زرشک طبیعی و ارتقای جادویی سلامت جسمانی است.</p>
<div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center my-8">
  <h3 class="text-xl font-bold text-amber-300 mb-2">سلامت کبد و خون خود را با طعم ترش کوهستان احیا کنید!</h3>
  <p class="text-gray-300 mb-4">زرشک کوهی مرغوب دست‌چین شده از مناطق بکر کوهستانی هم‌اکنون در فروشگاه شیخ موجود است.</p>
  <a href="https://sheikhshops.com/product/p4" class="inline-block bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">خرید زرشک کوهی ممتاز</a>
</div>`,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'mock-user-id',
    category: 'سایر محصولات',
    tags: ['زرشک', 'سوپرفود', 'سلامتی', 'زرشک کوهی', 'وحشی'],
    excerpt: 'بررسی خواص بی‌نظیر زرشک کوهی وحشی؛ بمب ویتامین ث برای تصفیه خون، سم‌زدایی بدن و افزایش تندرستی.',
    externalLinks: ['https://wikipedia.org'],
    internalLinks: ['https://sheikhshops.com/product/p4'],
    keywords: ['زرشک کوهی', 'زرشک ممتاز', 'خواص زرشک', 'زرشک وحشی', 'تصفیه خون'],
    metaTitle: 'زرشک کوهی ممتاز: هدیه وحشی طبیعت با خواص معجزه‌آسای سم‌زدایی',
    metaDescription: 'درباره خواص زرشک کوهی ممتاز وحشی و تاثیرات جادویی آن بر افزایش سطح انرژی، تصفیه جریان خون و سلامت پوست بیشتر بخوانید.',
    language: 'fa',
    views: 99,
    shares: 9,
    likes: 33,
    author: mockUser[0],
    comments: [],
  }
];

const createMockPrisma = () => {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'article') return makeMockModelWithWrites('article', mockArticles);
      if (prop === 'product') return makeMockModelWithWrites('product', mockProducts);
      if (prop === 'image') return makeMockModelWithWrites('image', mockImages);
      if (prop === 'video') return makeMockModelWithWrites('video', mockVideos);
      if (prop === 'category') return makeMockModel('category', mockCategories);
      if (prop === 'unit') return makeMockModel('unit', mockUnits);
      if (prop === 'mobileCarousel') return makeMockModel('mobileCarousel', mockCarousel);
      if (prop === 'discount') return makeMockModel('discount', []);
      if (prop === 'user') return makeMockModel('user', mockUser);
      if (prop === 'cartItem') return makeMockModelWithWrites('cartItem', globalCartItems);
      if (prop === 'order') return makeMockModelWithWrites('order', []);
      if (prop === 'orderItem') return makeMockModelWithWrites('orderItem', []);
      if (prop === 'transaction') return makeMockModelWithWrites('transaction', []);
      if (prop === 'showcaseConfig') return makeMockModelWithWrites('showcaseConfig', mockShowcaseConfig);
      if (prop === 'featuredProduct') return makeMockModelWithWrites('featuredProduct', mockFeaturedProducts);
      if (prop === 'luxuryUnboxingConfig') return makeMockModelWithWrites('luxuryUnboxingConfig', mockLuxuryUnboxingConfig);
      if (prop === 'luxuryUnboxingAssets') return makeMockModelWithWrites('luxuryUnboxingAssets', mockLuxuryUnboxingAssets);
      if (prop === 'luxuryUnboxingSettings') return makeMockModelWithWrites('luxuryUnboxingSettings', mockLuxuryUnboxingSettings);
      if (prop === '$connect') return async () => {};
      if (prop === '$disconnect') return async () => {};

      // Default mock model for any other accesses
      return makeMockModel(String(prop), []);
    }
  });
};

const createPrismaClient = () => {
  // Use mock prisma ONLY if MOCK_DB is explicitly set to 'true' (e.g. locally or during builds)
  if (process.env.MOCK_DB === 'true') {
    console.log('🔌 Using Mock Prisma Client with Native Toman Prices for local sandbox & screenshot generation...');
    return createMockPrisma();
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
};

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
