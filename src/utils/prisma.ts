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
  { id: 'u1', name: 'Gram', symbol: 'g', multiplier: 0.001, sortOrder: 1, isActive: true },
  { id: 'u2', name: 'Kilogram', symbol: 'kg', multiplier: 1.0, sortOrder: 2, isActive: true },
  { id: 'u3', name: 'Piece', symbol: 'pcs', multiplier: 1.0, sortOrder: 3, isActive: true },
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
    images: [{ id: 'img1', image: '/honey.webp' }],
    discounts: [{ id: 'd1', value: 200000, discountType: 'FIXED', isActive: true }], // Discount in native Toman
    units: [
      { id: 'pu1', price: 1250000, unitId: 'u2', unit: mockUnits[1] }
    ]
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
    images: [{ id: 'img2', image: '/saffron.webp' }],
    discounts: [],
    units: [
      { id: 'pu2', price: 4250000, unitId: 'u1', unit: mockUnits[0] }
    ]
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
    images: [{ id: 'img3', image: '/dates.webp' }],
    discounts: [{ id: 'd2', value: 100000, discountType: 'FIXED', isActive: true }], // Discount in native Toman
    units: [
      { id: 'pu3', price: 890000, unitId: 'u2', unit: mockUnits[1] }
    ]
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
    images: [{ id: 'img4', image: '/other.webp' }],
    discounts: [],
    units: [
      { id: 'pu4', price: 650000, unitId: 'u3', unit: mockUnits[2] }
    ]
  }
];

const mockCarousel = [
  { id: 'c1', title: 'Premium Dates', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop', link: '/product/p3', order: 1 },
  { id: 'c2', title: 'Mountain Honey', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600&auto=format&fit=crop', link: '/product/p1', order: 2 },
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
