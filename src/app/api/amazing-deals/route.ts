import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { formatProductUnitResponse } from '@/lib/pricing';
import type { ProductWithUnits } from '@/types';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Fetch amazing deals products with correct schema relations
    const amazingDeals = await prisma.product.findMany({
      where: {
        isAmazing: true,
        status: 'ACTIVE',
      },
      include: {
        images: true,
        baseUnit: true, // This is correct - it's the relation name in the schema
        units: true, // Include ProductUnits
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          orderBy: { value: 'desc' },
          take: 1, // Get the best active discount
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform products to include formatted units
    const amazingDealsWithUnits: ProductWithUnits[] = amazingDeals.map(product => ({
      id: product.id,
      name: product.name,
      basePrice: product.basePrice,
      units: product.units.map(unit => formatProductUnitResponse(unit)),
      // Keep backward compatibility - include original product data
      ...product
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
    // Get user info from middleware headers
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    // Check if user is authenticated and has required role
    if (!userId || !userRole || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
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
      include: {
        images: true,
        baseUnit: true,
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
