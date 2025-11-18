import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { formatProductUnitResponse } from '@/lib/pricing';
import { toNumber } from '@/lib/currency';
import type { ProductWithUnits } from '@/types';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

function serializeProductForProductAPI(product: any) {
  if (!product) return null;
  return {
    ...product,
    basePrice: toNumber(product.basePrice),
    oldPrice: product.oldPrice ? toNumber(product.oldPrice) : null,
    units: product.units.map((u: any) => ({
      ...u,
      price: toNumber(u.price),
      oldPrice: u.oldPrice ? toNumber(u.oldPrice) : null,
    })),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category') || '';
    const categorySlug = searchParams.get('categorySlug') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    };

    // Handle category filtering - support both enum and slug-based filtering
    if (categorySlug) {
      // Find category by slug and filter by categoryId
      const categoryRecord = await prisma.category.findUnique({
        where: { 
          slug: categorySlug,
          isActive: true 
        }
      });
      
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      } else {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    } else if (category) {
      // Legacy enum-based filtering
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { 
          images: true,
          units: true,
          Category: true, // Include category information
          discounts: {
            where: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Transform products to include formatted units
    const serializedProducts = products.map(serializeProductForProductAPI).filter(Boolean);

    const productsWithUnits = serializedProducts.map(product => ({
      ...product,
      units: product.units.map((unit: any) => formatProductUnitResponse(unit)),
    }));

    return NextResponse.json({
      data: productsWithUnits,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
