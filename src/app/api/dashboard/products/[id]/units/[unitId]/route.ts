import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { z } from 'zod';

// Validation schemas
const updateUnitSchema = z.object({
  name: z.string().min(1, 'Unit name is required').max(100, 'Unit name too long').optional(),
  price: z.number().positive('Price must be positive').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  isActive: z.boolean().optional(),
});

// Helper function to check admin permissions
async function checkAdminPermissions(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value;
    if (!token) return null;

    const user = await verifyJwtToken(token);
    if (!user || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(user.role)) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// GET - Fetch a specific unit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; unitId: string } }
) {
  try {
    const user = await checkAdminPermissions(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id: productId, unitId } = params;

    // Fetch the specific unit with product information
    const unit = await prisma.productUnit.findFirst({
      where: {
        id: unitId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: 'Product unit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error('Error fetching product unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a specific unit
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; unitId: string } }
) {
  try {
    const user = await checkAdminPermissions(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id: productId, unitId } = params;

    // Verify unit exists
    const existingUnit = await prisma.productUnit.findFirst({
      where: {
        id: unitId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Product unit not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateUnitSchema.parse(body);

    // Check if updating name and if it conflicts with existing units
    if (validatedData.name && validatedData.name !== existingUnit.name) {
      const conflictingUnit = await prisma.productUnit.findFirst({
        where: {
          productId,
          name: validatedData.name,
          id: { not: unitId },
        },
      });

      if (conflictingUnit) {
        return NextResponse.json(
          { error: 'Unit name already exists for this product' },
          { status: 400 }
        );
      }
    }

    // Update the unit using transaction for data consistency
    const updatedUnit = await prisma.$transaction(async (tx: any) => {
      const unit = await tx.productUnit.update({
        where: { id: unitId },
        data: validatedData,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      return unit;
    });

    return NextResponse.json({
      success: true,
      data: updatedUnit,
      message: 'Product unit updated successfully',
    });
  } catch (error) {
    console.error('Error updating product unit:', error);
    
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

// DELETE - Soft delete a specific unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; unitId: string } }
) {
  try {
    const user = await checkAdminPermissions(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id: productId, unitId } = params;

    // Verify unit exists
    const existingUnit = await prisma.productUnit.findFirst({
      where: {
        id: unitId,
        productId,
      },
    });

    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Product unit not found' },
        { status: 404 }
      );
    }

    // Check if unit is being used in cart items
    const cartItemsUsingUnit = await prisma.cartItem.count({
      where: {
        unitId,
      },
    });

    if (cartItemsUsingUnit > 0) {
      // Soft delete by deactivating the unit instead of hard delete
      const deactivatedUnit = await prisma.productUnit.update({
        where: { id: unitId },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        data: deactivatedUnit,
        message: 'Product unit deactivated (soft delete) due to existing cart items',
      });
    }

    // Hard delete if no cart items are using it
    await prisma.productUnit.delete({
      where: { id: unitId },
    });

    return NextResponse.json({
      success: true,
      message: 'Product unit deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
