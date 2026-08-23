/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/admin/marketing-showcase/route';
import { PATCH, DELETE } from '@/app/api/admin/marketing-showcase/[id]/route';

// Mock Auth utilities
jest.mock('@/lib/auth/utils', () => ({
  getUserFromRequest: jest.fn(),
}));

// Mock Prisma
jest.mock('@/utils/prisma', () => ({
  prisma: {
    marketingShowcaseSlide: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock Cache & Cloudinary
jest.mock('@/lib/cache/redis', () => ({
  cacheService: {
    del: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@/lib/cloudinary-safe', () => ({
  getCloudinary: jest.fn().mockReturnValue({
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  }),
}));

const { getUserFromRequest } = jest.requireMock('@/lib/auth/utils');
const { prisma } = jest.requireMock('@/utils/prisma');

const mockSlides = [
  {
    id: 'mss_1',
    title: 'اسپیکر ایستاده لوکس شیخ شاپ',
    imageUrl: '/sheikhdigital.webp',
    imagePublicId: 'pub_1',
    productId: 'pd_speaker_1',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id: 'pd_speaker_1',
      name: 'اسپیکر ایستاده شیخ',
      slug: 'luxury-x9-speaker',
      status: 'ACTIVE',
    },
  },
];

describe('Marketing Showcase API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when unauthorized or user is not SUPERADMIN', async () => {
    getUserFromRequest.mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost:3000/api/admin/marketing-showcase');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.message).toContain('دسترسی غیرمجاز');
  });

  it('returns 200 with empty array [] when 0 slides exist in database', async () => {
    getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
    prisma.marketingShowcaseSlide.findMany.mockResolvedValueOnce([]);

    const req = new NextRequest('http://localhost:3000/api/admin/marketing-showcase');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(0);
  });

  it('returns 200 with slides when slides exist in database', async () => {
    getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
    prisma.marketingShowcaseSlide.findMany.mockResolvedValueOnce(mockSlides);

    const req = new NextRequest('http://localhost:3000/api/admin/marketing-showcase');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
  });

  it('allows SUPERADMIN to create first slide via POST', async () => {
    getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'pd_speaker_1' });
    prisma.marketingShowcaseSlide.create.mockResolvedValueOnce(mockSlides[0]);

    const req = new NextRequest('http://localhost:3000/api/admin/marketing-showcase', {
      method: 'POST',
      body: JSON.stringify({
        title: 'اسپیکر ایستاده لوکس شیخ شاپ',
        imageUrl: '/sheikhdigital.webp',
        imagePublicId: 'pub_1',
        productId: 'pd_speaker_1',
        sortOrder: 0,
        isActive: true,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe('mss_1');
  });

  it('allows SUPERADMIN to update slide via PATCH', async () => {
    getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
    prisma.marketingShowcaseSlide.findUnique.mockResolvedValueOnce(mockSlides[0]);
    prisma.marketingShowcaseSlide.update.mockResolvedValueOnce({
      ...mockSlides[0],
      title: 'عنوان جدید اسلاید',
    });

    const req = new NextRequest('http://localhost:3000/api/admin/marketing-showcase/mss_1', {
      method: 'PATCH',
      body: JSON.stringify({
        title: 'عنوان جدید اسلاید',
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: 'mss_1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe('عنوان جدید اسلاید');
  });

  it('allows SUPERADMIN to delete slide via DELETE', async () => {
    getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
    prisma.marketingShowcaseSlide.findUnique.mockResolvedValueOnce(mockSlides[0]);
    prisma.marketingShowcaseSlide.delete.mockResolvedValueOnce(mockSlides[0]);

    const req = new NextRequest('http://localhost:3000/api/admin/marketing-showcase/mss_1', {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: 'mss_1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain('حذف شد');
  });
});
