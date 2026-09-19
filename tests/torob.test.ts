/**
 * @jest-environment node
 */
import { mapProductToTorob, mapProductToTorobV3, verifyTorobToken, getTorobConfig } from '@/lib/torob';
import sitemap from '@/app/sitemap';
import { generateMetadata } from '@/app/products/[slug]/page';
import { POST as TorobV3RouteHandler, GET as TorobV3GetHandler, OPTIONS as TorobV3OptionsHandler } from '@/app/torob_api/v3/products/route';
import { prisma } from '@/utils/prisma';
import { getProductByIdOrSlug } from '@/modules/products/services';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

const mockPrismaObj = {
  product: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
  review: {
    findMany: jest.fn(),
  },
};

jest.mock('@/utils/prisma', () => ({
  get prisma() {
    return mockPrismaObj;
  },
}));

jest.mock('@/lib/prisma', () => ({
  get prisma() {
    return mockPrismaObj;
  },
}));

jest.mock('@/modules/products/services', () => ({
  getProductByIdOrSlug: jest.fn(),
}));

// Helper to construct a test JWT signed with a custom Ed25519 key pair
function createTestJwt(
  payloadObj: Record<string, any>,
  privateKey: crypto.KeyObject,
  headerOverride?: Record<string, any>
): string {
  const header = { alg: 'EdDSA', typ: 'JWT', v: 1, ...(headerOverride || {}) };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const verifyData = `${headerB64}.${payloadB64}`;

  const sigBuf = crypto.sign(null, Buffer.from(verifyData, 'utf8'), privateKey);
  const sigB64 = sigBuf.toString('base64url');

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

describe('Torob Integration Tests', () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalApiToken = process.env.TOROB_API_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'https://sheikhshops.com';
    delete process.env.TOROB_API_TOKEN;
    delete process.env.TOROB_API_KEY;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    if (originalApiToken) process.env.TOROB_API_TOKEN = originalApiToken;
  });

  describe('mapProductToTorob Adapter (Legacy)', () => {
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
  });

  describe('mapProductToTorobV3 Adapter (API v3)', () => {
    it('maps active product into official Product API v3 schema correctly', () => {
      const mockProduct: any = {
        id: 'prod-v3-01',
        name: 'گوشی آیفون ۱۵ پرو',
        slug: 'iphone-15-pro',
        excerpt: 'پرچمدار آبل با تراشه A17 Pro',
        basePrice: 65000000,
        oldPrice: 70000000,
        quantity: 5,
        status: 'ACTIVE',
        inventoryStatus: 'AVAILABLE',
        warranty: '۱۸ ماه گارانتی شرکتی',
        Category: { name: 'موبایل و کالای دیجیتال' },
        createdAt: new Date('2026-01-01T10:00:00Z'),
        updatedAt: new Date('2026-01-02T12:00:00Z'),
        images: [
          { secureUrl: 'https://res.cloudinary.com/sheikh/iphone15.png' },
        ],
        specifications: { ram: '8GB', storage: '256GB' },
      };

      const result = mapProductToTorobV3(mockProduct);

      expect(result.page_unique).toBe('prod-v3-01');
      expect(result.page_url).toBe('https://sheikhshops.com/products/iphone-15-pro');
      expect(result.product_group_id).toBe('prod-v3-01');
      expect(result.title).toBe('گوشی آیفون ۱۵ پرو');
      expect(result.current_price).toBe(65000000);
      expect(result.old_price).toBe(70000000);
      expect(result.availability).toBe(true);
      expect(result.category_name).toBe('موبایل و کالای دیجیتال');
      expect(result.image_links).toEqual(['https://res.cloudinary.com/sheikh/iphone15.png']);
      expect(result.spec).toEqual({ ram: '8GB', storage: '256GB' });
      expect(result.guarantee).toBe('۱۸ ماه گارانتی شرکتی');
      expect(result.short_desc).toBe('پرچمدار آبل با تراشه A17 Pro');
      expect(result.date_added).toBe('2026-01-01T10:00:00.000Z');
      expect(result.date_updated).toBe('2026-01-02T12:00:00.000Z');
    });

    it('sanitizes protocol-relative image URLs cleanly', () => {
      const mockProduct: any = {
        id: 'prod-v3-proto',
        name: 'محصول عکس نسبی',
        basePrice: 1000000,
        quantity: 1,
        status: 'ACTIVE',
        ogImage: '//res.cloudinary.com/sheikh/og.jpg',
        images: [{ image: '//res.cloudinary.com/sheikh/img.jpg' }, { image: '/local/image.png' }],
      };

      const result = mapProductToTorobV3(mockProduct);
      expect(result.image_links).toEqual([
        'https://res.cloudinary.com/sheikh/og.jpg',
        'https://res.cloudinary.com/sheikh/img.jpg',
        'https://sheikhshops.com/local/image.png',
      ]);
    });

    it('returns empty spec object when specifications are absent or invalid', () => {
      const mockProduct: any = {
        id: 'prod-v3-02',
        name: 'هدفون بی سیم',
        basePrice: 1200000,
        quantity: 2,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = mapProductToTorobV3(mockProduct);
      expect(result.spec).toEqual({});
      expect(result.guarantee).toBeNull();
      expect(result.availability).toBe(true);
    });

    it('sets availability to false when quantity is 0 or status is OUT_OF_STOCK', () => {
      const mockProduct: any = {
        id: 'prod-v3-03',
        name: 'لب تاپ اگزوز',
        basePrice: 45000000,
        quantity: 0,
        status: 'ACTIVE',
        inventoryStatus: 'OUT_OF_STOCK',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = mapProductToTorobV3(mockProduct);
      expect(result.availability).toBe(false);
      expect(result.current_price).toBe(0); // Torob spec: "Use 0 for unavailable products"
    });
  });

  describe('Torob JWT Token Verification (verifyTorobToken)', () => {
    it('rejects verification if X-Torob-Token-Version is not "1"', async () => {
      const res = await verifyTorobToken('some-token', '2', 'sheikhshops.com');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('X-Torob-Token-Version header must be "1"');
    });

    it('rejects verification if token header is missing or empty', async () => {
      const res = await verifyTorobToken('', '1', 'sheikhshops.com');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('missing or empty');
    });

    it('verifies valid Ed25519 JWT token successfully with custom key', async () => {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

      const now = Math.floor(Date.now() / 1000);
      const token = createTestJwt(
        { aud: 'sheikhshops.com', exp: now + 3600, nbf: now - 10 },
        privateKey
      );

      const result = await verifyTorobToken(token, '1', 'sheikhshops.com', publicKey);
      expect(result.isValid).toBe(true);
      expect(result.payload.aud).toBe('sheikhshops.com');
    });

    it('verifies JWT tokens when audience is a full URL', async () => {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

      const now = Math.floor(Date.now() / 1000);
      const token = createTestJwt(
        { aud: 'https://sheikhshops.com/torob_api/v3/products', exp: now + 3600, nbf: now - 10 },
        privateKey
      );

      const result = await verifyTorobToken(token, '1', 'sheikhshops.com', publicKey);
      expect(result.isValid).toBe(true);
    });

    it('verifies static API token fallback when TOROB_API_TOKEN is set', async () => {
      process.env.TOROB_API_TOKEN = 'secret-static-token-123';

      const result = await verifyTorobToken('secret-static-token-123', null, 'sheikhshops.com');
      expect(result.isValid).toBe(true);
      expect(result.payload.sub).toBe('static_token');
    });

    it('rejects expired JWT token', async () => {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

      const now = Math.floor(Date.now() / 1000);
      const token = createTestJwt(
        { aud: 'sheikhshops.com', exp: now - 3600, nbf: now - 7200 },
        privateKey
      );

      const result = await verifyTorobToken(token, '1', 'sheikhshops.com', publicKey);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('rejects JWT token with invalid audience', async () => {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

      const now = Math.floor(Date.now() / 1000);
      const token = createTestJwt(
        { aud: 'unauthorized-site.com', exp: now + 3600, nbf: now - 10 },
        privateKey
      );

      const result = await verifyTorobToken(token, '1', 'sheikhshops.com', publicKey);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid audience claim');
    });
  });

  describe('Torob Meta Tags in generateMetadata', () => {
    it('returns Torob required meta tags inside metadata.other and uses primary image for OpenGraph image', async () => {
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
        images: [{ image: '/images/smartwatch.jpg', isFeatured: true }],
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

      const ogImages = metadata.openGraph?.images as any[];
      expect(ogImages).toBeDefined();
      expect(ogImages[0].url).toContain('/images/smartwatch.jpg');
      expect(ogImages[0].url).toMatch(/^https?:\/\//);
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

  describe('POST /torob_api/v3/products Route Handler Integration', () => {
    it('handles OPTIONS preflight request with 204 status and CORS headers', async () => {
      const res = await TorobV3OptionsHandler();
      expect(res.status).toBe(204);
      expect(res.headers.get('access-control-allow-origin')).toBe('*');
      expect(res.headers.get('access-control-allow-methods')).toContain('POST');
    });

    it('handles GET operational health check request with 200 status', async () => {
      const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
        method: 'GET',
      });
      const res = await TorobV3GetHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('ok');
      expect(data.endpoint).toBe('/torob_api/v3/products');
    });

    it('returns HTTP 401 when X-Torob-Token header is missing', async () => {
      const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-torob-token-version': '1',
        },
        body: JSON.stringify({ page: 1, sort: 'date_added_desc' }),
      });

      const res = await TorobV3RouteHandler(req);
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('returns HTTP 401 when X-Torob-Token-Version is missing or invalid', async () => {
      const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-torob-token': 'fake-token',
        },
        body: JSON.stringify({ page: 1, sort: 'date_added_desc' }),
      });

      const res = await TorobV3RouteHandler(req);
      expect(res.status).toBe(401);
    });

    describe('Authenticated Route Scenarios (With Static Token Auth)', () => {
      beforeEach(() => {
        process.env.TOROB_API_TOKEN = 'test-valid-torob-token';
      });

      it('handles valid page-based product list request successfully', async () => {
        const mockProducts = [
          {
            id: 'prod-001',
            name: 'محصول تست ۱',
            slug: 'test-product-1',
            basePrice: 100000,
            quantity: 5,
            status: 'ACTIVE',
            inventoryStatus: 'AVAILABLE',
            createdAt: new Date('2026-01-01T00:00:00Z'),
            updatedAt: new Date('2026-01-01T00:00:00Z'),
            images: [],
          },
        ];

        (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
        (prisma.product.count as jest.Mock).mockResolvedValue(1);

        const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-torob-token': 'test-valid-torob-token',
            'x-torob-token-version': '1',
          },
          body: JSON.stringify({ page: 1, sort: 'date_added_desc' }),
        });

        const res = await TorobV3RouteHandler(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.api_version).toBe('torob_api_v3');
        expect(data.current_page).toBe(1);
        expect(data.total).toBe(1);
        expect(data.max_pages).toBe(1);
        expect(data.products).toHaveLength(1);
        expect(data.products[0].page_unique).toBe('prod-001');
        expect(data.products[0].current_price).toBe(100000);
      });

      it('handles page request with null cursor without triggering cursor error', async () => {
        const mockProducts = [
          {
            id: 'prod-001',
            name: 'محصول تست',
            slug: 'test-product',
            basePrice: 500000,
            quantity: 2,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
          },
        ];

        (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
        (prisma.product.count as jest.Mock).mockResolvedValue(1);

        const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-torob-token': 'test-valid-torob-token',
            'x-torob-token-version': '1',
          },
          body: JSON.stringify({ page: 1, sort: 'date_added_desc', cursor: null }),
        });

        const res = await TorobV3RouteHandler(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.api_version).toBe('torob_api_v3');
        expect(data.current_page).toBe(1);
      });

      it('handles valid cursor-based product list request', async () => {
        const mockProducts = [
          {
            id: 'prod-002',
            name: 'محصول تست ۲',
            slug: 'test-product-2',
            basePrice: 200000,
            quantity: 10,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
          },
        ];

        (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

        const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-torob-token': 'test-valid-torob-token',
            'x-torob-token-version': '1',
          },
          body: JSON.stringify({ cursor: 'prod-010', sort: 'product_id_desc' }),
        });

        const res = await TorobV3RouteHandler(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.api_version).toBe('torob_api_v3');
        expect(data.products).toHaveLength(1);
        expect(data.products[0].page_unique).toBe('prod-002');
      });

      it('handles percent-encoded page_urls request correctly', async () => {
        (prisma.product.findMany as jest.Mock).mockResolvedValue([
          {
            id: 'prod-003',
            name: 'عسل طبیعی',
            slug: 'عسل-طبیعی',
            basePrice: 300000,
            quantity: 3,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
          },
        ]);

        const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-torob-token': 'test-valid-torob-token',
            'x-torob-token-version': '1',
          },
          body: JSON.stringify({ page_urls: ['https://sheikhshops.com/products/%D8%B9%D8%B3%D9%84-%D8%B7%D8%A8%DB%8C%D8%B9%DB%8C'] }),
        });

        const res = await TorobV3RouteHandler(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.products).toHaveLength(1);
        expect(data.products[0].page_unique).toBe('prod-003');
      });

      it('returns HTTP 400 when invalid page number is provided', async () => {
        const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-torob-token': 'test-valid-torob-token',
            'x-torob-token-version': '1',
          },
          body: JSON.stringify({ page: 0, sort: 'date_added_desc' }),
        });

        const res = await TorobV3RouteHandler(req);
        expect(res.status).toBe(400);

        const data = await res.json();
        expect(data.error).toContain('positive integer');
      });

      it('returns HTTP 400 when invalid JSON body is sent', async () => {
        const req = new NextRequest('https://sheikhshops.com/torob_api/v3/products', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-torob-token': 'test-valid-torob-token',
            'x-torob-token-version': '1',
          },
          body: 'not-json',
        });

        const res = await TorobV3RouteHandler(req);
        expect(res.status).toBe(400);

        const data = await res.json();
        expect(data.error).toContain('Invalid JSON request body');
      });
    });
  });

  describe('Torob Server Config Safety', () => {
    it('keeps TOROB_API_TOKEN strictly server-side', () => {
      process.env.TOROB_API_TOKEN = 'test-token';
      const config = getTorobConfig();
      expect(typeof config.isConfigured).toBe('boolean');
      expect(config.isConfigured).toBe(true);
      expect(process.env.NEXT_PUBLIC_TOROB_TOKEN).toBeUndefined();
    });
  });
});
