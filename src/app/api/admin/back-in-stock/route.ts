import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getServerUser } from '@/lib/auth/server-auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز است.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status') || 'ACTIVE';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));

    const where: any = {};
    if (productId) where.productId = productId;
    if (status && status !== 'ALL') where.status = status;

    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      prisma.backInStockSubscription.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              quantity: true,
              inventoryStatus: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.backInStockSubscription.count({ where }),
    ]);

    // Demand summary per product
    const demandSummaryRaw = await prisma.backInStockSubscription.groupBy({
      by: ['productId'],
      where: { status: 'ACTIVE' },
      _count: { _all: true },
    });

    // Count overall inventory stats
    const [availableCount, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.count({ where: { quantity: { gt: 3 }, inventoryStatus: 'AVAILABLE' } }),
      prisma.product.count({ where: { OR: [{ quantity: { lte: 3, gt: 0 } }, { inventoryStatus: 'LOW_STOCK' }] } }),
      prisma.product.count({ where: { OR: [{ quantity: 0 }, { inventoryStatus: 'OUT_OF_STOCK' }] } }),
    ]);

    return NextResponse.json({
      success: true,
      data: subscriptions,
      summary: {
        totalActiveSubscriptions: total,
        availableProducts: availableCount,
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        demandByProduct: demandSummaryRaw.map((d: any) => ({
          productId: d.productId,
          count: d._count._all,
        })),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('[Admin GET BackInStock Error]', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
