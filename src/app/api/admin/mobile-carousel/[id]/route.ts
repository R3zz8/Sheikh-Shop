// src/app/api/admin/mobile-carousel/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

export const dynamic = "force-dynamic";

const updateCarouselSchema = z.object({
  topTitle: z.string().optional(),
  subtitle: z.string().optional(),
  title: z.string().min(1, 'متن اصلی تبلیغاتی الزامی است').optional(),
  ctaText: z.string().optional(),
  image: z.string().optional(),
  link: z.string().min(1, 'لینک الزامی است').optional(),
  order: z.number().int().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (process.env.NODE_ENV === 'development') {
    console.log(`Health-check log: PUT /api/admin/mobile-carousel/${id}`);
  }

  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateCarouselSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' }, { status: 400 });
    }

    const { topTitle, subtitle, title, ctaText, image, link, order } = validation.data;

    const updatedSlide = await prisma.mobileCarousel.update({
      where: { id },
      data: {
        ...(topTitle !== undefined && { topTitle }),
        ...(subtitle !== undefined && { subtitle }),
        ...(title !== undefined && { title }),
        ...(ctaText !== undefined && { ctaText }),
        ...(image !== undefined && { image }),
        ...(link !== undefined && { link }),
        ...(order !== undefined && { order }),
      },
    });

    // Invalidate Redis/In-Memory Cache & Next.js Path Cache
    await cacheService.del('mobile-carousel');
    revalidatePath('/');
    revalidatePath('/dashboard/mobile-carousel');

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_PUT]', error);
    return NextResponse.json({ message: 'An error occurred while updating the carousel slide' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (process.env.NODE_ENV === 'development') {
    console.log(`Health-check log: DELETE /api/admin/mobile-carousel/${id}`);
  }

  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await prisma.mobileCarousel.delete({
      where: { id },
    });

    // Invalidate Redis/In-Memory Cache & Next.js Path Cache
    await cacheService.del('mobile-carousel');
    revalidatePath('/');
    revalidatePath('/dashboard/mobile-carousel');

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_DELETE]', error);
    return NextResponse.json({ message: 'An error occurred while deleting the carousel slide' }, { status: 500 });
  }
}
