import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/server-auth';
import { cacheService } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isBestSeller: true,
        status: true,
        basePrice: true,
        category: true,
        images: {
          select: {
            id: true,
            secureUrl: true,
            image: true,
            isFeatured: true,
          },
          take: 1,
        },
      },
      orderBy: [
        { isBestSeller: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('API /api/admin/best-sellers GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, isBestSeller } = body;

    if (!productId || typeof isBestSeller !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isBestSeller },
      select: {
        id: true,
        name: true,
        isBestSeller: true,
      },
    });

    // Clear cache
    await cacheService.del('bestsellers_products_limit_10');
    await cacheService.del('bestsellers_products_limit_12');
    await cacheService.del('bestsellers_products_limit_20');

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API /api/admin/best-sellers PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
