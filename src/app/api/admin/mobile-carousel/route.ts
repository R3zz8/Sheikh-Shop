// src/app/api/admin/mobile-carousel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromToken } from '@/lib/jwt';
import { prisma } from '@/utils/prisma';

export const dynamic = "force-dynamic";

const carouselSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.union([z.string().url(), z.literal('')]).optional().default(''),
  link: z.string().url('Link must be a valid URL'),
  order: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Health-check log: GET /api/admin/mobile-carousel');
  }

  try {
    const user = getUserFromToken(req);

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
    const user = getUserFromToken(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = carouselSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
    }

    const { title, image, link, order } = validation.data;

    const newSlide = await prisma.mobileCarousel.create({
      data: {
        title,
        image,
        link,
        order,
      },
    });

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_POST]', error);
    return NextResponse.json({ message: 'An error occurred while creating the carousel slide' }, { status: 500 });
  }
}
