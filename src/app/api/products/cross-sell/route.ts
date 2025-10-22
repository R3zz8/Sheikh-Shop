import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get cross-sell products based on different criteria
    const crossSellProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { isBestSeller: true },
          { isAmazing: true },
          { isNew: true },
        ],
      },
      select: {
        id: true,
        name: true,
        basePrice: true,
        category: {
          select: {
            name: true,
            slug: true,
          }
        },
        isBestSeller: true,
        isAmazing: true,
        isNew: true,
        images: {
          select: {
            image: true,
          },
          take: 1,
        },
      },
      orderBy: [
        { isAmazing: 'desc' },
        { isBestSeller: 'desc' },
        { isNew: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
    });

    return NextResponse.json({ products: crossSellProducts });
  } catch (error) {
    console.error('Cross-sell API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cross-sell products' },
      { status: 500 }
    );
  }
}





