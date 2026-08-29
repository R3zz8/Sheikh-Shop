import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { getCloudinary } from '@/lib/cloudinary-safe';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const updateServiceSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  shortDescription: z.string().min(1).max(500).optional(),
  fullDescription: z.string().optional().nullable(),
  startingPrice: z.number().int().nonnegative().optional(),
  previousPrice: z.number().int().optional().nullable(),
  currency: z.string().optional(),
  isStartingFrom: z.boolean().optional(),
  features: z.array(z.string()).optional(),
  estimatedDelivery: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  ctaText: z.string().optional().nullable(),
  ctaUrl: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const { id } = await params;

    const service = await prisma.webService.findUnique({
      where: { id },
      include: {
        packages: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ message: 'خدمت مورد نظر یافت نشد' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('[ADMIN_WEB_SERVICE_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت اطلاعات خدمت' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.webService.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'خدمت مورد نظر یافت نشد' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    let uploadedImageUrl: string | null = null;
    let uploadedImagePublicId: string | null = null;
    let removeImage = false;
    let bodyData: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (formData.get('title')) bodyData.title = formData.get('title')?.toString();
      if (formData.get('slug')) bodyData.slug = formData.get('slug')?.toString();
      if (formData.get('shortDescription')) bodyData.shortDescription = formData.get('shortDescription')?.toString();
      if (formData.get('fullDescription') !== null) bodyData.fullDescription = formData.get('fullDescription')?.toString() || null;
      if (formData.get('startingPrice')) bodyData.startingPrice = parseInt(formData.get('startingPrice')!.toString(), 10);
      if (formData.get('previousPrice') !== null) {
        const val = formData.get('previousPrice')?.toString();
        bodyData.previousPrice = val ? parseInt(val, 10) : null;
      }
      if (formData.get('currency')) bodyData.currency = formData.get('currency')?.toString();
      if (formData.get('isStartingFrom') !== null) bodyData.isStartingFrom = formData.get('isStartingFrom')?.toString() === 'true';
      if (formData.get('estimatedDelivery') !== null) bodyData.estimatedDelivery = formData.get('estimatedDelivery')?.toString() || null;
      if (formData.get('icon') !== null) bodyData.icon = formData.get('icon')?.toString() || null;
      if (formData.get('displayOrder')) bodyData.displayOrder = parseInt(formData.get('displayOrder')!.toString(), 10);
      if (formData.get('isActive') !== null) bodyData.isActive = formData.get('isActive')?.toString() === 'true';
      if (formData.get('isFeatured') !== null) bodyData.isFeatured = formData.get('isFeatured')?.toString() === 'true';
      if (formData.get('ctaText') !== null) bodyData.ctaText = formData.get('ctaText')?.toString() || null;
      if (formData.get('ctaUrl') !== null) bodyData.ctaUrl = formData.get('ctaUrl')?.toString() || null;
      if (formData.get('seoTitle') !== null) bodyData.seoTitle = formData.get('seoTitle')?.toString() || null;
      if (formData.get('seoDescription') !== null) bodyData.seoDescription = formData.get('seoDescription')?.toString() || null;

      const featuresRaw = formData.get('features')?.toString();
      if (featuresRaw) {
        try {
          bodyData.features = JSON.parse(featuresRaw);
        } catch {
          bodyData.features = featuresRaw.split('\n').map((s) => s.trim()).filter(Boolean);
        }
      }

      removeImage = formData.get('removeImage')?.toString() === 'true';

      if (file && file instanceof File) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json({ message: 'فرمت فایل غیرمجاز است' }, { status: 400 });
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json({ message: 'حجم تصویر بیش از حد مجاز است' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const cloudinary = getCloudinary();

        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'digitalshop/web-services',
              resource_type: 'image',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error: any, result: any) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });

        uploadedImageUrl = uploadResult.secure_url as string;
        uploadedImagePublicId = uploadResult.public_id as string;
      }
    } else {
      bodyData = await req.json();
      removeImage = bodyData.removeImage === true;
    }

    const validation = updateServiceSchema.safeParse(bodyData);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
    }

    let finalImageUrl = existing.imageUrl;
    let finalImagePublicId = existing.imagePublicId;

    if (uploadedImageUrl !== null) {
      finalImageUrl = uploadedImageUrl;
      finalImagePublicId = uploadedImagePublicId;
    } else if (removeImage) {
      finalImageUrl = null;
      finalImagePublicId = null;
    }

    const updated = await prisma.webService.update({
      where: { id },
      data: {
        ...validation.data,
        imageUrl: finalImageUrl,
        imagePublicId: finalImagePublicId,
      },
    });

    // Cleanup old Cloudinary asset if replaced/removed
    if (existing.imagePublicId && (uploadedImagePublicId || removeImage) && existing.imagePublicId !== uploadedImagePublicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(existing.imagePublicId);
      } catch (err) {
        console.error('[ADMIN_WEB_SERVICE_CLOUDINARY_DELETE_ERROR]', err);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN_WEB_SERVICE_PATCH_ERROR]', error);
    return NextResponse.json({ message: 'خطا در به روزرسانی خدمت' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.webService.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'خدمت مورد نظر یافت نشد' }, { status: 404 });
    }

    await prisma.webService.delete({ where: { id } });

    if (existing.imagePublicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(existing.imagePublicId);
      } catch (err) {
        console.error('[ADMIN_WEB_SERVICE_CLOUDINARY_DELETE_ERROR]', err);
      }
    }

    return NextResponse.json({ message: 'خدمت با موفقیت حذف شد' });
  } catch (error) {
    console.error('[ADMIN_WEB_SERVICE_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'خطا در حذف خدمت' }, { status: 500 });
  }
}
