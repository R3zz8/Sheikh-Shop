import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const includeProducts = searchParams.get('includeProducts') !== 'false'; // Default to true
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid pagination parameters' 
        },
        { status: 400 }
      );
    }

    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { 
        slug,
        isActive: true 
      }
    });

    if (!category) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Category not found' 
        },
        { status: 404 }
      );
    }

    let responseData: any = {
      ...category,
      products: []
    };

    if (includeProducts) {
      // Get products for this category with pagination
      const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
          where: {
            categoryId: category.id,
            status: 'ACTIVE'
          },
          include: {
            images: true,
            units: true,
            discounts: {
              where: {
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.product.count({
          where: {
            categoryId: category.id,
            status: 'ACTIVE'
          }
        })
      ]);

      responseData.products = products;
      responseData.pagination = {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        hasNext: page < Math.ceil(totalProducts / limit),
        hasPrev: page > 1
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Category API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { name, description, image, isActive, sortOrder } = body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Category not found' 
        },
        { status: 404 }
      );
    }

    // Check for name conflicts if name is being updated
    if (name && name !== existingCategory.name) {
      const nameConflict = await prisma.category.findFirst({
        where: {
          name,
          id: { not: existingCategory.id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Category with this name already exists' 
          },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { slug },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: true
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Category not found' 
        },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory.products.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot delete category with existing products. Please move or delete products first.' 
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { slug }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}


