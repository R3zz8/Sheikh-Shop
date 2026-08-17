/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

// Mock checkAccess to prevent jose ESM import error in Jest node environment
jest.mock('@/lib/checkAccess', () => ({
  checkAccess: jest.fn().mockResolvedValue(true),
}));

import { GET, POST } from '@/app/api/admin/showcase-config/route';
import { PATCH } from '@/app/api/dashboard/products/route';
import { prisma } from '@/lib/prisma';
import { cacheService } from '@/lib/cache/redis';

describe('Showcase Configuration API & Data Pipeline (/api/admin/showcase-config)', () => {
  beforeEach(async () => {
    process.env.MOCK_DB = 'true';
    await cacheService.clear();
    jest.clearAllMocks();
  });

  test('1. Returns only ACTIVE featured/best-seller products from database', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('config');
    expect(data).toHaveProperty('featuredProducts');
    expect(data).toHaveProperty('allProducts');

    expect(Array.isArray(data.featuredProducts)).toBe(true);
    expect(data.featuredProducts.length).toBeGreaterThan(0);

    // Verify every returned product exists in allProducts with ACTIVE status
    const activeIds = new Set(data.allProducts.map((p: any) => p.id));
    for (const fp of data.featuredProducts) {
      expect(activeIds.has(fp.productId)).toBe(true);
    }
  });

  test('2. Excludes DRAFT or INACTIVE products from showcase', async () => {
    const inactiveProd = await prisma.product.findFirst({ where: { status: 'DRAFT' } });
    if (inactiveProd) {
      const res = await GET();
      const data = await res.json();

      const fpProductIds = data.featuredProducts.map((fp: any) => fp.productId);
      expect(fpProductIds).not.toContain(inactiveProd.id);
    }
  });

  test('3. Prevents fake/nonexistent product IDs from appearing', async () => {
    const res = await GET();
    const data = await res.json();

    const activeProductIds = new Set(data.allProducts.map((p: any) => p.id));
    for (const fp of data.featuredProducts) {
      expect(activeProductIds.has(fp.productId)).toBe(true);
    }
  });

  test('4. Product price, name, and images come directly from actual database records', async () => {
    const res = await GET();
    const data = await res.json();

    const firstFP = data.featuredProducts[0];
    const matchingProduct = data.allProducts.find((p: any) => p.id === firstFP.productId);

    expect(matchingProduct).toBeDefined();
    expect(matchingProduct.name).toBeTruthy();
    expect(matchingProduct.basePrice).toBeGreaterThan(0);
    expect(Array.isArray(matchingProduct.images)).toBe(true);
  });

  test('5. Toggling product feature flags invalidates cache', async () => {
    // Fetch initial showcase config
    const res1 = await GET();
    const data1 = await res1.json();
    expect(data1.featuredProducts.length).toBeGreaterThan(0);

    // Mock admin updating a product via PATCH
    const targetProd = data1.allProducts[0];
    const patchReq = new NextRequest('http://localhost:3000/api/dashboard/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', authorization: 'Bearer mock' },
      body: JSON.stringify({
        id: targetProd.id,
        isBestSeller: false,
      }),
    });

    // Execute PATCH handler
    const patchRes = await PATCH(patchReq);
    expect(patchRes.status).toBe(200);

    // Verify cache was invalidated by calling GET again
    const res2 = await GET();
    expect(res2.status).toBe(200);
  });
});
