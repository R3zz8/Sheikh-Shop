import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = 'bmw_carousel_items_active';
    const cachedData = await cacheService.get<any[]>(cacheKey);

    if (cachedData && Array.isArray(cachedData)) {
      return NextResponse.json(cachedData, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
      });
    }

    const items = await prisma.bmwCarouselItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    await cacheService.set(cacheKey, items, 300);

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('[BMW_CAROUSEL_PUBLIC_GET]', error);
    return NextResponse.json({ message: 'خطا در دریافت تصاویر کروسل ۳بعدی' }, { status: 500 });
  }
}
