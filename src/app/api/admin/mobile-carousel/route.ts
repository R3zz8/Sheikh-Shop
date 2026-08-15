// src/app/api/admin/mobile-carousel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

export const dynamic = "force-dynamic";

const carouselSchema = z.object({
  topTitle: z.string().optional().default('فروشگاه شیخ'),
  subtitle: z.string().optional().default('international store'),
  title: z.string().min(1, 'متن اصلی تبلیغاتی الزامی است'),
  ctaText: z.string().optional().default('مشاهده فروشگاه'),
  image: z.string().optional().default(''),
  link: z.string().min(1, 'لینک الزامی است'),
  order: z.number().int().optional().default(0),
});

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Health-check log: GET /api/admin/mobile-carousel');
  }

  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const carouselSlides = await prisma.mobileCarousel.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(carouselSlides);
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_GET]', error);
    return NextResponse.json({ message: 'An error occurred while fetching carousel slides' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Health-check log: POST /api/admin/mobile-carousel');
  }

  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = carouselSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' }, { status: 400 });
    }

    const { topTitle, subtitle, title, ctaText, image, link, order } = validation.data;

    const newSlide = await prisma.mobileCarousel.create({
      data: {
        topTitle: topTitle || 'فروشگاه شیخ',
        subtitle: subtitle || 'international store',
        title,
        ctaText: ctaText || 'مشاهده فروشگاه',
        image: image || '',
        link,
        order,
      },
    });

    // Invalidate Redis/In-Memory Cache & Next.js Path Cache
    await cacheService.del('mobile-carousel');
    revalidatePath('/');
    revalidatePath('/dashboard/mobile-carousel');

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_POST]', error);
    return NextResponse.json({ message: 'An error occurred while creating the carousel slide' }, { status: 500 });
  }
}
