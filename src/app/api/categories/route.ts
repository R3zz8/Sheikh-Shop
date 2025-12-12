import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Revalidate this route every hour
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const isActive = searchParams.get('isActive') !== 'false'; // Default to true

    // Build where clause
    const where: any = {};
    if (isActive) {
      where.isActive = true;
    }

    // Build include clause
    const include: any = {};
    if (includeProducts) {
      include.products = {
        where: {
          status: 'ACTIVE'
        },
        include: {
          images: true,
          units: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      };
    }

    const categories = await prisma.category.findMany({
      where,
      include,
      orderBy: {
        sortOrder: 'asc'
      }
    });

    const response = NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    });

    // Add cache control headers
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');

    return response;
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, image, isActive = true, sortOrder = 0 } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Name and slug are required' 
        },
        { status: 400 }
      );
    }

    // Check if category with same name or slug already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Category with this name or slug already exists' 
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}


