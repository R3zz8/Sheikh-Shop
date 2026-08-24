/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET as publicGET } from '@/app/api/bmw-carousel/route';
import { GET as adminGET, POST as adminPOST } from '@/app/api/admin/bmw-carousel/route';
import { PATCH as adminPATCH, DELETE as adminDELETE } from '@/app/api/admin/bmw-carousel/[id]/route';
import { PATCH as reorderPATCH } from '@/app/api/admin/bmw-carousel/reorder/route';

// Mock Auth utilities
jest.mock('@/lib/auth/utils', () => ({
  getUserFromRequest: jest.fn(),
}));

// Mock Prisma
jest.mock('@/utils/prisma', () => ({
  prisma: {
    bmwCarouselItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock Cache & Cloudinary
jest.mock('@/lib/cache/redis', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@/lib/cloudinary-safe', () => ({
  getCloudinary: jest.fn().mockReturnValue({
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        callback(null, {
          secure_url: 'https://res.cloudinary.com/test/image/upload/sample.jpg',
          public_id: 'digitalshop/bmw-carousel/sample',
        });
        return {
          end: jest.fn(),
        };
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  }),
}));

const { getUserFromRequest } = jest.requireMock('@/lib/auth/utils');
const { prisma } = jest.requireMock('@/utils/prisma');

const mockItems = [
  {
    id: 'bmw_1',
    title: 'Class A',
    imageUrl: 'https://res.cloudinary.com/test/image/upload/sample1.jpg',
    imagePublicId: 'pub_1',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'bmw_2',
    title: 'Class B',
    imageUrl: 'https://res.cloudinary.com/test/image/upload/sample2.jpg',
    imagePublicId: 'pub_2',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('3D BMW Carousel API & Authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public API /api/bmw-carousel', () => {
    it('returns active items sorted by sortOrder', async () => {
      prisma.bmwCarouselItem.findMany.mockResolvedValueOnce(mockItems);
      const res = await publicGET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveLength(2);
      expect(json[0].title).toBe('Class A');
    });

    it('handles empty database state gracefully returning empty array', async () => {
      prisma.bmwCarouselItem.findMany.mockResolvedValueOnce([]);
      const res = await publicGET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual([]);
    });
  });

  describe('SuperAdmin API /api/admin/bmw-carousel', () => {
    it('returns 401 when user is missing or not superadmin', async () => {
      getUserFromRequest.mockResolvedValueOnce(null);
      const req = new NextRequest('http://localhost:3000/api/admin/bmw-carousel');
      const res = await adminGET(req);
      expect(res.status).toBe(401);
    });

    it('returns all items for SUPERADMIN', async () => {
      getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
      prisma.bmwCarouselItem.findMany.mockResolvedValueOnce(mockItems);

      const req = new NextRequest('http://localhost:3000/api/admin/bmw-carousel');
      const res = await adminGET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toHaveLength(2);
    });

    it('creates new carousel item via JSON payload', async () => {
      getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
      prisma.bmwCarouselItem.create.mockResolvedValueOnce(mockItems[0]);

      const req = new NextRequest('http://localhost:3000/api/admin/bmw-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Class A',
          imageUrl: 'https://res.cloudinary.com/test/image/upload/sample1.jpg',
          imagePublicId: 'pub_1',
          sortOrder: 0,
          isActive: true,
        }),
      });

      const res = await adminPOST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('bmw_1');
    });
  });

  describe('SuperAdmin API /api/admin/bmw-carousel/[id]', () => {
    it('updates item metadata via PATCH', async () => {
      getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
      prisma.bmwCarouselItem.findUnique.mockResolvedValueOnce(mockItems[0]);
      prisma.bmwCarouselItem.update.mockResolvedValueOnce({
        ...mockItems[0],
        title: 'Class Premium',
      });

      const req = new NextRequest('http://localhost:3000/api/admin/bmw-carousel/bmw_1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Class Premium',
        }),
      });

      const res = await adminPATCH(req, { params: Promise.resolve({ id: 'bmw_1' }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.title).toBe('Class Premium');
    });

    it('deletes item and cleans up Cloudinary asset via DELETE', async () => {
      getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
      prisma.bmwCarouselItem.findUnique.mockResolvedValueOnce(mockItems[0]);
      prisma.bmwCarouselItem.delete.mockResolvedValueOnce(mockItems[0]);

      const req = new NextRequest('http://localhost:3000/api/admin/bmw-carousel/bmw_1', {
        method: 'DELETE',
      });

      const res = await adminDELETE(req, { params: Promise.resolve({ id: 'bmw_1' }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toContain('حذف شد');
    });
  });

  describe('SuperAdmin API /api/admin/bmw-carousel/reorder', () => {
    it('reorders slides via transaction', async () => {
      getUserFromRequest.mockResolvedValueOnce({ id: 'sa_1', role: 'SUPERADMIN' });
      prisma.$transaction.mockResolvedValueOnce([mockItems[1], mockItems[0]]);

      const req = new NextRequest('http://localhost:3000/api/admin/bmw-carousel/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: 'bmw_2', sortOrder: 0 },
            { id: 'bmw_1', sortOrder: 1 },
          ],
        }),
      });

      const res = await reorderPATCH(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toContain('بروزرسانی شد');
    });
  });
});
