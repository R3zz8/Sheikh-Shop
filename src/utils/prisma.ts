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
    status: 'ACTIVE',
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
    status: 'ACTIVE',
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
  }
];

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
          return result;
        };
      }
      if (prop === 'findFirst' || prop === 'findUnique') {
        return async (args?: any) => {
          const id = args?.where?.id || args?.where?.slug || args?.where?.name;
          if (id) {
            return data.find(item => item.id === id || item.slug === id || item.name === id) || data[0] || null;
          }
          return data[0] || null;
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
  let localData = [...data];
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
          return result;
        };
      }
      if (prop === 'findFirst' || prop === 'findUnique') {
        return async (args?: any) => {
          const id = args?.where?.id || args?.where?.slug || args?.where?.name;
          if (id) {
            return localData.find(item => item.id === id || item.slug === id || item.name === id) || localData[0] || null;
          }
          return localData[0] || null;
        };
      }
      if (prop === 'create') {
        return async (args: any) => {
          const newItem = { id: `mock-${Date.now()}-${Math.random()}`, ...args.data, createdAt: new Date(), updatedAt: new Date() };
          localData.push(newItem);
          return newItem;
        };
      }
      if (prop === 'update' || prop === 'updateMany') {
        return async (args: any) => {
          const id = args?.where?.id;
          if (id) {
            const index = localData.findIndex(item => item.id === id);
            if (index !== -1) {
              localData[index] = { ...localData[index], ...args.data, updatedAt: new Date() };
              return localData[index];
            }
          }
          if (localData[0]) {
            localData[0] = { ...localData[0], ...args.data, updatedAt: new Date() };
            return localData[0];
          }
          return null;
        };
      }
      if (prop === 'delete' || prop === 'deleteMany') {
        return async (args?: any) => {
          const id = args?.where?.id;
          if (id) {
            localData = localData.filter(item => item.id !== id);
          } else {
            localData = [];
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
    role: 'USER',
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

const createMockPrisma = () => {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'product') return makeMockModel('product', mockProducts);
      if (prop === 'category') return makeMockModel('category', mockCategories);
      if (prop === 'unit') return makeMockModel('unit', mockUnits);
      if (prop === 'mobileCarousel') return makeMockModel('mobileCarousel', mockCarousel);
      if (prop === 'discount') return makeMockModel('discount', []);
      if (prop === 'user') return makeMockModel('user', mockUser);
      if (prop === 'cartItem') return makeMockModel('cartItem', mockCartItems);
      if (prop === 'order') return makeMockModel('order', []);
      if (prop === 'orderItem') return makeMockModel('orderItem', []);
      if (prop === 'showcaseConfig') return makeMockModelWithWrites('showcaseConfig', mockShowcaseConfig);
      if (prop === 'featuredProduct') return makeMockModelWithWrites('featuredProduct', mockFeaturedProducts);
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
