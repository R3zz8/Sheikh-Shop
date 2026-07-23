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
    status: 'DRAFT',
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
      { id: 'pud_smartwatch', productId: 'pd_smartwatch', name: 'Piece', price: 32800000, unitId: 'u3', unit: mockUnits[2], isActive: true, stock: 30, createdAt: new Date(), updatedAt: new Date() }
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

const normalizeMockProduct = (item: any) => {
  if (!item || typeof item !== 'object') return item;
  if ('basePrice' in item || 'category' in item) {
    return {
      shippingCost: null,
      shippingMode: null,
      shippingDescription: null,
      allowFreeShipping: false,
      shippingPriority: null,
      ...item
    };
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
          const id = args?.where?.id || args?.where?.slug || args?.where?.name;
          if (id) {
            const item = data.find(item => item.id === id || item.slug === id || item.name === id) || data[0] || null;
            return normalizeMockProduct(item);
          }
          return normalizeMockProduct(data[0] || null);
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
          const id = args?.where?.id || args?.where?.slug || args?.where?.name;
          if (id) {
            const item = localData.find(item => item.id === id || item.slug === id || item.name === id) || localData[0] || null;
            return normalizeMockProduct(item);
          }
          return normalizeMockProduct(localData[0] || null);
        };
      }
      if (prop === 'create') {
        return async (args: any) => {
          const newItem = { id: `mock-${Date.now()}-${Math.random()}`, ...args.data, createdAt: new Date(), updatedAt: new Date() };
          localData.push(newItem);
          return normalizeMockProduct(newItem);
        };
      }
      if (prop === 'update' || prop === 'updateMany') {
        return async (args: any) => {
          const id = args?.where?.id;
          if (id) {
            const index = localData.findIndex(item => item.id === id);
            if (index !== -1) {
              localData[index] = { ...localData[index], ...args.data, updatedAt: new Date() };
              return normalizeMockProduct(localData[index]);
            }
          }
          if (localData[0]) {
            localData[0] = { ...localData[0], ...args.data, updatedAt: new Date() };
            return normalizeMockProduct(localData[0]);
          }
          return null;
        };
      }
      if (prop === 'delete' || prop === 'deleteMany') {
        return async (args?: any) => {
          const id = args?.where?.id;
          const userId = args?.where?.userId;
          if (id) {
            const index = localData.findIndex(item => item.id === id);
            if (index !== -1) {
              localData.splice(index, 1);
            }
          } else if (userId) {
            for (let i = localData.length - 1; i >= 0; i--) {
              if (localData[i].userId === userId) {
                localData.splice(i, 1);
              }
            }
          } else {
            localData.length = 0;
          }
          return { count: 1 };
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
    productId: 'p1',
    quantity: 2,
    unitId: 'pu1',
    unitPrice: 1250000,
    product: mockProducts[0],
    unit: mockUnits[1],
  },
  {
    id: 2,
    userId: 'mock-user-id',
    productId: 'p3',
    quantity: 1,
    unitId: 'pu3',
    unitPrice: 890000,
    product: mockProducts[2],
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

const createMockPrisma = () => {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'product') return makeMockModel('product', mockProducts);
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
