import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { formatProductUnitResponse } from '@/lib/pricing';
import { toNumber } from '@/lib/currency';
import type { ProductWithUnits } from '@/types';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

function serializeProductForAmazingDeals(product: any) {
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
    // Fetch amazing deals products with optimized select statements
    const amazingDeals = await prisma.product.findMany({
      where: {
        isAmazing: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        basePrice: true,
        baseUnitId: true,
        quantity: true,
        status: true,
        isNew: true,
        isBestSeller: true,
        isAmazing: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        categoryType: true,
        slug: true,
        excerpt: true,
        brand: true,
        sku: true,
        tags: true,
        features: true,
        allowFreeShipping: true,
        shippingCost: true,
        images: {
          select: {
            id: true,
            image: true,
            secureUrl: true,
            publicId: true,
            width: true,
            height: true,
            format: true,
            bytes: true,
            productId: true,
            createdAt: true,
            sortOrder: true,
            isFeatured: true,
            isVisible: true,
          }
        },
        baseUnit: {
          select: {
            id: true,
            name: true,
            symbol: true,
            multiplier: true,
            isActive: true,
          }
        },
        units: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
            productId: true,
            discountType: true,
            value: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
          orderBy: { value: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform products to include formatted units
    const serializedDeals = amazingDeals.map(serializeProductForAmazingDeals).filter(Boolean);

    const amazingDealsWithUnits = serializedDeals.map((product: any) => ({
      ...product,
      units: product.units.map((unit: any) => formatProductUnitResponse(unit)),
    }));

    return NextResponse.json({
      success: true,
      data: amazingDealsWithUnits,
      count: amazingDealsWithUnits.length,
    });
  } catch (error) {
    console.error('Amazing Deals API error:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      if (error.message.includes('Can\'t reach database server')) {
        errorMessage = 'Database connection failed. Please check if the database is running.';
      } else if (error.message.includes('Unknown column') || error.message.includes('column') && error.message.includes('does not exist')) {
        errorMessage = 'Database schema mismatch. Please run database migrations.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Get user info via unified access helper
    const { checkAccess } = await import('@/lib/checkAccess');
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const { productId, isAmazing } = await req.json();

    if (!productId || typeof isAmazing !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Update the product's amazing deals status
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isAmazing },
      select: {
        id: true,
        name: true,
        isAmazing: true,
        images: {
          select: {
            id: true,
            image: true,
            secureUrl: true,
            publicId: true,
          }
        },
        baseUnit: {
          select: {
            id: true,
            name: true,
            symbol: true,
          }
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: `Product ${isAmazing ? 'marked as' : 'removed from'} amazing deals`,
    });
  } catch (error) {
    console.error('Amazing Deals PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
