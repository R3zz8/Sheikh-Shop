/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET as getCategoriesHandler } from '@/app/api/categories/route';
import { POST as postImageHandler, DELETE as deleteImageHandler } from '@/app/api/admin/categories/[id]/image/route';
import { PATCH as patchCategoryHandler } from '@/app/api/admin/categories/[id]/route';

// Mock checkAccess & Cloudinary
jest.mock('@/lib/checkAccess', () => ({
  checkAccess: jest.fn(),
}));

jest.mock('@/lib/cloudinary-safe', () => ({
  getCloudinary: jest.fn().mockReturnValue({
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        callback(null, {
          secure_url: 'https://res.cloudinary.com/test/image/upload/v1/categories/new.jpg',
          public_id: 'digitalshop/categories/new',
        });
        return { end: jest.fn() };
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  }),
}));

const mockCategoryRecord = {
  id: 'cat_test_1',
  name: 'لوازم خانگی شیخ',
  slug: 'sheikh-home',
  description: 'توضیحات تست',
  image: 'https://res.cloudinary.com/test/image/upload/v1/categories/old.jpg',
  imagePublicId: 'digitalshop/categories/old',
  isActive: true,
  sortOrder: 1,
  updatedAt: new Date(),
  createdAt: new Date(),
};

jest.mock('@/lib/prisma', () => {
  const dummyCat = {
    id: 'cat_test_1',
    name: 'لوازم خانگی شیخ',
    slug: 'sheikh-home',
    description: 'توضیحات تست',
    image: 'https://res.cloudinary.com/test/image/upload/v1/categories/old.jpg',
    imagePublicId: 'digitalshop/categories/old',
    isActive: true,
    sortOrder: 1,
    updatedAt: new Date(),
    createdAt: new Date(),
  };
  return {
    prisma: {
      category: {
        findMany: jest.fn().mockResolvedValue([dummyCat]),
        findUnique: jest.fn().mockResolvedValue(dummyCat),
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...dummyCat, ...data })),
        delete: jest.fn().mockResolvedValue(dummyCat),
      },
    },
  };
});

describe('Category API Routes & Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/categories returns categories list', async () => {
    const req = new NextRequest('http://localhost:3000/api/categories');
    const res = await getCategoriesHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data[0].slug).toBe('sheikh-home');
  });

  it('POST /api/admin/categories/[id]/image rejects unauthorized requests', async () => {
    const { checkAccess } = require('@/lib/checkAccess');
    checkAccess.mockResolvedValue(false);

    const formData = new FormData();
    formData.append('file', new File(['fake'], 'test.jpg', { type: 'image/jpeg' }));

    const req = new NextRequest('http://localhost:3000/api/admin/categories/cat_test_1/image', {
      method: 'POST',
      body: formData,
    });

    const params = Promise.resolve({ id: 'cat_test_1' });
    const res = await postImageHandler(req, { params });
    expect(res.status).toBe(403);
  });

  it('POST /api/admin/categories/[id]/image updates DB and replaces Cloudinary image for admin', async () => {
    const { checkAccess } = require('@/lib/checkAccess');
    checkAccess.mockResolvedValue(true);

    const formData = new FormData();
    formData.append('file', new File(['fake_img_data'], 'new.jpg', { type: 'image/jpeg' }));

    const req = new NextRequest('http://localhost:3000/api/admin/categories/cat_test_1/image', {
      method: 'POST',
      body: formData,
    });

    const params = Promise.resolve({ id: 'cat_test_1' });
    const res = await postImageHandler(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.image).toContain('new.jpg');
  });

  it('DELETE /api/admin/categories/[id]/image clears image fields in DB and removes asset', async () => {
    const { checkAccess } = require('@/lib/checkAccess');
    checkAccess.mockResolvedValue(true);

    const req = new NextRequest('http://localhost:3000/api/admin/categories/cat_test_1/image', {
      method: 'DELETE',
    });

    const params = Promise.resolve({ id: 'cat_test_1' });
    const res = await deleteImageHandler(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.image).toBeNull();
  });

  it('PATCH /api/admin/categories/[id] updates category metadata', async () => {
    const { checkAccess } = require('@/lib/checkAccess');
    checkAccess.mockResolvedValue(true);

    const req = new NextRequest('http://localhost:3000/api/admin/categories/cat_test_1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'لوازم خانگی بروزرسانی شده', sortOrder: 5 }),
    });

    const params = Promise.resolve({ id: 'cat_test_1' });
    const res = await patchCategoryHandler(req, { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe('لوازم خانگی بروزرسانی شده');
  });
});
