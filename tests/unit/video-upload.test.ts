/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST, GET as GETUpload } from '@/app/api/upload/route';
import { DELETE as DELETEVideo } from '@/app/api/upload/video/[id]/route';

// Mock dependencies
jest.mock('@/lib/checkAccess', () => ({
  checkAccess: jest.fn(),
}));

jest.mock('@/lib/cloudinary-safe', () => ({
  getCloudinary: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    video: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    image: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

jest.mock('@/lib/cache/redis', () => ({
  cacheService: {
    invalidateProductCache: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@/lib/cache', () => ({
  invalidateProductCache: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { checkAccess } from '@/lib/checkAccess';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { prisma } from '@/lib/prisma';

describe('Product Video Upload & Deletion API Routes', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      CLOUDINARY_CLOUD_NAME: 'test_cloud',
      CLOUDINARY_API_KEY: 'test_key',
      CLOUDINARY_API_SECRET: 'test_secret',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('POST /api/upload - Video Upload', () => {
    it('returns 403 when user is unauthorized', async () => {
      (checkAccess as jest.Mock).mockResolvedValue(false);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
      });
      const res = await POST(req);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe('You are not authorized to perform this action.');
    });

    it('returns 400 when invalid file type is uploaded', async () => {
      (checkAccess as jest.Mock).mockResolvedValue(true);

      const formData = new FormData();
      const file = new File(['text content'], 'file.txt', { type: 'text/plain' });
      formData.append('file', file);
      formData.append('productId', 'prod-123');

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid file type');
    });

    it('returns 413 when video file exceeds 15MB size limit', async () => {
      (checkAccess as jest.Mock).mockResolvedValue(true);

      const largeBuffer = new Uint8Array(16 * 1024 * 1024); // 16MB
      const file = new File([largeBuffer], 'large.mp4', { type: 'video/mp4' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', 'prod-123');

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error).toContain('Video too large');
    });

    it('returns 400 when productId is missing for video upload', async () => {
      (checkAccess as jest.Mock).mockResolvedValue(true);

      // Mock Cloudinary upload_stream
      const mockDestroy = jest.fn();
      (getCloudinary as jest.Mock).mockReturnValue({
        uploader: {
          destroy: mockDestroy,
          upload_stream: (options: any, callback: any) => {
            callback(null, {
              secure_url: 'https://res.cloudinary.com/demo/video/upload/v123/digitalshop/products/videos/sample.mp4',
              public_id: 'digitalshop/products/videos/sample',
            });
            return { end: jest.fn() };
          },
        },
      });

      const file = new File(['video content'], 'video.mp4', { type: 'video/mp4' });
      const formData = new FormData();
      formData.append('file', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Product ID is required for video uploads');
    });

    it('successfully uploads valid MP4 video and creates Video record', async () => {
      (checkAccess as jest.Mock).mockResolvedValue(true);

      (getCloudinary as jest.Mock).mockReturnValue({
        uploader: {
          upload_stream: (options: any, callback: any) => {
            callback(null, {
              secure_url: 'https://res.cloudinary.com/demo/video/upload/v123/digitalshop/products/videos/sample.mp4',
              public_id: 'digitalshop/products/videos/sample',
            });
            return { end: jest.fn() };
          },
        },
      });

      (prisma.video.create as jest.Mock).mockResolvedValue({
        id: 'vid-123',
        url: 'https://res.cloudinary.com/demo/video/upload/v123/digitalshop/products/videos/sample.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/demo/video/upload/v123/digitalshop/products/videos/sample.jpg',
        productId: 'prod-123',
      });

      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: 'prod-123',
        slug: 'sample-product',
      });

      const file = new File(['video content'], 'video.mp4', { type: 'video/mp4' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', 'prod-123');

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.type).toBe('video');
      expect(json.data.id).toBe('vid-123');
    });
  });

  describe('DELETE /api/upload/video/[id]', () => {
    it('returns 403 when user is unauthorized', async () => {
      (checkAccess as jest.Mock).mockResolvedValue(false);

      const req = new NextRequest('http://localhost:3000/api/upload/video/vid-123', {
        method: 'DELETE',
      });
      const context = { params: Promise.resolve({ id: 'vid-123' }) };

      const res = await DELETEVideo(req, context);
      expect(res.status).toBe(403);
    });

    it('returns 404 when video is not found', async () => {
      (checkAccess as jest.Mock).mockResolvedValue(true);
      (prisma.video.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/upload/video/non-existent', {
        method: 'DELETE',
      });
      const context = { params: Promise.resolve({ id: 'non-existent' }) };

      const res = await DELETEVideo(req, context);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Video not found');
    });

    it('destroys Cloudinary video asset and deletes Video record', async () => {
      (checkAccess as jest.Mock).mockResolvedValue(true);

      const mockDestroy = jest.fn().mockResolvedValue({ result: 'ok' });
      (getCloudinary as jest.Mock).mockReturnValue({
        uploader: { destroy: mockDestroy },
      });

      (prisma.video.findUnique as jest.Mock).mockResolvedValue({
        id: 'vid-123',
        url: 'https://res.cloudinary.com/demo/video/upload/v123/digitalshop/products/videos/sample.mp4',
        productId: 'prod-123',
      });

      (prisma.video.delete as jest.Mock).mockResolvedValue({ id: 'vid-123' });
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 'prod-123', slug: 'sample-product' });

      const req = new NextRequest('http://localhost:3000/api/upload/video/vid-123', {
        method: 'DELETE',
      });
      const context = { params: Promise.resolve({ id: 'vid-123' }) };

      const res = await DELETEVideo(req, context);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      expect(mockDestroy).toHaveBeenCalledWith('digitalshop/products/videos/sample', { resource_type: 'video' });
      expect(prisma.video.delete).toHaveBeenCalledWith({ where: { id: 'vid-123' } });
    });
  });
});
