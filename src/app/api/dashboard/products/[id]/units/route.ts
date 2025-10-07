import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { checkAccess } from '@/lib/checkAccess';
import { z } from 'zod';

// Validation schemas
const createUnitSchema = z.object({
  name: z.string().min(1, 'Unit name is required').max(100, 'Unit name too long'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  isActive: z.boolean().optional().default(true),
});

const updateUnitSchema = z.object({
  name: z.string().min(1, 'Unit name is required').max(100, 'Unit name too long').optional(),
  price: z.number().positive('Price must be positive').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  isActive: z.boolean().optional(),
});

// Helper function to check admin permissions using unified RBAC
async function checkAdminPermissions(request: NextRequest) {
  try {
    const allowed = await checkAccess(request, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) return null;

    // Return a mock user object for compatibility
    return { id: 'user', role: 'SUPERADMIN' };
  } catch (error) {
    return null;
  }
}

// GET - Fetch all units for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminPermissions(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const productId = params.id;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch all units for the product
    const units = await prisma.productUnit.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: units,
      product: product,
    });
  } catch (error) {
    console.error('Error fetching product units:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new unit for a product
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminPermissions(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const productId = params.id;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, status: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot add units to inactive products' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createUnitSchema.parse(body);

    // Check if unit name already exists for this product
    const existingUnit = await prisma.productUnit.findFirst({
      where: {
        productId,
        name: validatedData.name,
      },
    });

    if (existingUnit) {
      return NextResponse.json(
        { error: 'Unit name already exists for this product' },
        { status: 400 }
      );
    }

    // Create the new unit using transaction for data consistency
    const newUnit = await prisma.$transaction(async (tx) => {
      const unit = await tx.productUnit.create({
        data: {
          productId,
          name: validatedData.name,
          price: validatedData.price,
          stock: validatedData.stock,
          isActive: validatedData.isActive,
        },
      });

      return unit;
    });

    return NextResponse.json({
      success: true,
      data: newUnit,
      message: 'Product unit created successfully',
    });
  } catch (error) {
    console.error('Error creating product unit:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
