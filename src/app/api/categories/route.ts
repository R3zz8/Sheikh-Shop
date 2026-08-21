import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache/redis';

// Force dynamic rendering for freshness when requested
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const cacheKey = `categories_list_${includeProducts}_${includeInactive}`;

    // Try cache first if not including inactive items or products
    if (!includeProducts && !includeInactive) {
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          count: cached.length,
          cached: true
        });
      }
    }

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const include: any = {};
    if (includeProducts) {
      include.products = {
        where: { status: 'ACTIVE' },
        include: { images: true, units: true },
        orderBy: { createdAt: 'desc' }
      };
    }

    const categories = await prisma.category.findMany({
      where,
      include,
      orderBy: { sortOrder: 'asc' }
    });

    if (!includeProducts && !includeInactive) {
      await cacheService.set(cacheKey, categories, 300); // 5 min TTL
    }

    const response = NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    });

    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
