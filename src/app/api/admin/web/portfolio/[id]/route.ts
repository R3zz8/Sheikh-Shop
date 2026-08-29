import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { getCloudinary } from '@/lib/cloudinary-safe';

export const dynamic = 'force-dynamic';

const updatePortfolioSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional(),
  projectUrl: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

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

    const existing = await prisma.webPortfolio.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'نمونه‌کار مورد نظر یافت نشد' }, { status: 404 });
    }

    const body = await req.json();
    const validation = updatePortfolioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
    }

    const updated = await prisma.webPortfolio.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN_WEB_PORTFOLIO_PATCH_ERROR]', error);
    return NextResponse.json({ message: 'خطا در به روزرسانی نمونه‌کار' }, { status: 500 });
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

    const existing = await prisma.webPortfolio.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'نمونه‌کار مورد نظر یافت نشد' }, { status: 404 });
    }

    await prisma.webPortfolio.delete({ where: { id } });

    if (existing.imagePublicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(existing.imagePublicId);
      } catch (err) {
        console.error('[ADMIN_WEB_PORTFOLIO_CLOUDINARY_DELETE_ERROR]', err);
      }
    }

    return NextResponse.json({ message: 'نمونه‌کار با موفقیت حذف شد' });
  } catch (error) {
    console.error('[ADMIN_WEB_PORTFOLIO_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'خطا در حذف نمونه‌کار' }, { status: 500 });
  }
}
