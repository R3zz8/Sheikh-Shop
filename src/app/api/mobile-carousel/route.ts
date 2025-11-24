// src/app/api/mobile-carousel/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export async function GET() {
  try {
    const carouselSlides = await prisma.mobileCarousel.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(carouselSlides);
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_GET_PUBLIC]', error);
    return NextResponse.json({ message: 'An error occurred while fetching carousel slides' }, { status: 500 });
  }
}
