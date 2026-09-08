import { mapProductToTorob, getTorobConfig } from '@/lib/torob';
import sitemap from '@/app/sitemap';
import { generateMetadata } from '@/app/products/[slug]/page';
import { prisma } from '@/lib/prisma';
import { getProductByIdOrSlug } from '@/modules/products/services';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/modules/products/services', () => ({
  getProductByIdOrSlug: jest.fn(),
}));

describe('Torob Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapProductToTorob Adapter', () => {
    it('maps an available product to instock with Toman price', () => {
      const mockProduct: any = {
        id: 'prod-101',
        name: 'عسل طبیعی شیخ',
        slug: 'sheikh-honey',
        basePrice: 450000,
        quantity: 10,
        status: 'ACTIVE',
        inventoryStatus: 'AVAILABLE',
        category: 'HONEY',
        images: [{ image: '/images/honey.jpg' }],
        warranty: 'ضمانت اصالت و بازگشت ۱۰ روزه',
      };

      const result = mapProductToTorob(mockProduct);

      expect(result.product_id).toBe('prod-101');
      expect(result.title).toBe('عسل طبیعی شیخ');
      expect(result.price).toBe(450000);
      expect(result.availability).toBe('instock');
      expect(result.guarantee).toBe('ضمانت اصالت و بازگشت ۱۰ روزه');
      expect(result.page_url).toContain('/products/sheikh-honey');
    });

    it('maps an out-of-stock product to outofstock', () => {
      const mockProduct: any = {
        id: 'prod-102',
        name: 'زعفران ممتاز',
        slug: 'saffron',
        basePrice: 850000,
        quantity: 0,
        status: 'ACTIVE',
        inventoryStatus: 'OUT_OF_STOCK',
        category: 'SAFFRON',
        images: [],
      };

      const result = mapProductToTorob(mockProduct);

      expect(result.availability).toBe('outofstock');
      expect(result.guarantee).toBeUndefined();
    });

    it('omits guarantee when warranty field is null or empty', () => {
      const mockProduct: any = {
        id: 'prod-103',
        name: 'خرمای پیارم',
        slug: 'dates',
        basePrice: 200000,
        quantity: 5,
        status: 'ACTIVE',
        inventoryStatus: 'AVAILABLE',
        warranty: '   ',
      };

      const result = mapProductToTorob(mockProduct);

      expect(result.guarantee).toBeUndefined();
    });

    it('resolves default variable product price correctly', () => {
      const mockProduct: any = {
        id: 'prod-104',
        name: 'پاد سیستم شیک',
        slug: 'pod-system',
        basePrice: 1500000,
        quantity: 3,
        status: 'ACTIVE',
        inventoryStatus: 'AVAILABLE',
        units: [
          { id: 'unit-1', price: 1200000, isActive: true },
          { id: 'unit-2', price: 1400000, isActive: true },
        ],
      };

      const result = mapProductToTorob(mockProduct);

      expect(result.price).toBe(1200000);
    });
  });

  describe('Torob Meta Tags in generateMetadata', () => {
    it('returns Torob required meta tags inside metadata.other', async () => {
      const mockProduct: any = {
        id: 'prod-201',
        name: 'ساعت هوشمند شیخ',
        slug: 'smart-watch',
        basePrice: 2500000,
        quantity: 12,
        status: 'ACTIVE',
        inventoryStatus: 'AVAILABLE',
        warranty: '۱۸ ماه گارانتی شرکتی',
        seoTitle: 'خرید ساعت هوشمند شیخ',
        seoDescription: 'ساعت هوشمند با کیفیت بالا',
        metaKeywords: ['ساعت', 'شیخ'],
        baseUnit: { id: 'u1', name: 'عدد', symbol: 'عدد' },
      };

      (getProductByIdOrSlug as jest.Mock).mockResolvedValue(mockProduct);

      const params = Promise.resolve({ slug: 'smart-watch' });
      const metadata = await generateMetadata({ params });

      expect(metadata.other).toBeDefined();
      expect(metadata.other?.product_price).toBe('2500000');
      expect(metadata.other?.availability).toBe('instock');
      expect(metadata.other?.product_name).toBe('ساعت هوشمند شیخ');
      expect(metadata.other?.product_id).toBe('prod-201');
      expect(metadata.other?.guarantee).toBe('۱۸ ماه گارانتی شرکتی');
    });
  });

  describe('Dynamic XML Sitemap', () => {
    it('generates sitemap containing public active product URLs', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'prod-301',
          slug: 'vape-kit',
          updatedAt: new Date('2026-01-01T00:00:00Z'),
        },
      ]);
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);

      const entries = await sitemap();

      const productEntry = entries.find((e) => e.url.includes('/products/vape-kit'));
      expect(productEntry).toBeDefined();
      expect(productEntry?.priority).toBe(0.8);
    });
  });

  describe('Torob Server Config Safety', () => {
    it('keeps TOROB_API_TOKEN strictly server-side', () => {
      const config = getTorobConfig();
      expect(typeof config.isConfigured).toBe('boolean');
      expect(process.env.NEXT_PUBLIC_TOROB_TOKEN).toBeUndefined();
    });
  });
});
