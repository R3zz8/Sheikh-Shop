// src/app/api/mobile-carousel/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';

export async function GET() {
  try {
    const cacheKey = 'mobile-carousel';
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return NextResponse.json(cached);
    }

    const carouselSlides = await prisma.mobileCarousel.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    if (carouselSlides && carouselSlides.length > 0) {
      await cacheService.set(cacheKey, carouselSlides, 300);
    }

    return NextResponse.json(carouselSlides);
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_GET_PUBLIC]', error);
    return NextResponse.json({ message: 'An error occurred while fetching carousel slides' }, { status: 500 });
  }
}
