import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { z } from 'zod';

// Validation schemas
const bulkCreateSchema = z.object({
  units: z.array(z.object({
    name: z.string().min(1, 'Unit name is required').max(100, 'Unit name too long'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    isActive: z.boolean().optional().default(true),
  })).min(1, 'At least one unit is required'),
});

const bulkUpdateSchema = z.object({
  unitUpdates: z.array(z.object({
    unitId: z.string().min(1, 'Unit ID is required'),
    name: z.string().min(1, 'Unit name is required').max(100, 'Unit name too long').optional(),
    price: z.number().positive('Price must be positive').optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
    isActive: z.boolean().optional(),
  })).min(1, 'At least one unit update is required'),
});

const bulkDeleteSchema = z.object({
  unitIds: z.array(z.string()).min(1, 'At least one unit ID is required'),
  force: z.boolean().optional().default(false), // Force delete even if units are in use
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

// POST - Bulk create units
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
    const validatedData = bulkCreateSchema.parse(body);

    // Check for duplicate unit names within the request
    const unitNames = validatedData.units.map(unit => unit.name);
    const uniqueNames = new Set(unitNames);
    if (unitNames.length !== uniqueNames.size) {
      return NextResponse.json(
        { error: 'Duplicate unit names found in request' },
        { status: 400 }
      );
    }

    // Check for existing unit names
    const existingUnits = await prisma.productUnit.findMany({
      where: {
        productId,
        name: { in: unitNames },
      },
      select: { name: true },
    });

    if (existingUnits.length > 0) {
      const existingNames = existingUnits.map((unit: any) => unit.name).join(', ');
      return NextResponse.json(
        { error: `Unit names already exist: ${existingNames}` },
        { status: 400 }
      );
    }

    // Create all units in a transaction
    const createdUnits = await prisma.$transaction(async (tx: any) => {
      const units = await Promise.all(
        validatedData.units.map(unitData =>
          tx.productUnit.create({
            data: {
              productId,
              name: unitData.name,
              price: unitData.price,
              stock: unitData.stock,
              isActive: unitData.isActive,
            },
          })
        )
      );
      return units;
    });

    return NextResponse.json({
      success: true,
      data: createdUnits,
      message: `Successfully created ${createdUnits.length} product units`,
    });
  } catch (error) {
    console.error('Error bulk creating product units:', error);
    
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

// PUT - Bulk update units
export async function PUT(
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

    const body = await request.json();
    const validatedData = bulkUpdateSchema.parse(body);

    // Verify all units exist and belong to the product
    const unitIds = validatedData.unitUpdates.map(update => update.unitId);
    const existingUnits = await prisma.productUnit.findMany({
      where: {
        id: { in: unitIds },
        productId,
      },
      select: { id: true },
    });

    if (existingUnits.length !== unitIds.length) {
      return NextResponse.json(
        { error: 'One or more units not found or do not belong to this product' },
        { status: 404 }
      );
    }

    // Check for name conflicts
    const nameUpdates = validatedData.unitUpdates
      .filter(update => update.name)
      .map(update => ({ unitId: update.unitId, name: update.name! }));

    for (const nameUpdate of nameUpdates) {
      const conflictingUnit = await prisma.productUnit.findFirst({
        where: {
          productId,
          name: nameUpdate.name,
          id: { not: nameUpdate.unitId },
        },
      });

      if (conflictingUnit) {
        return NextResponse.json(
          { error: `Unit name "${nameUpdate.name}" already exists for this product` },
          { status: 400 }
        );
      }
    }

    // Update all units in a transaction
    const updatedUnits = await prisma.$transaction(async (tx: any) => {
      const units = await Promise.all(
        validatedData.unitUpdates.map(update =>
          tx.productUnit.update({
            where: { id: update.unitId },
            data: {
              ...(update.name && { name: update.name }),
              ...(update.price && { price: update.price }),
              ...(update.stock !== undefined && { stock: update.stock }),
              ...(update.isActive !== undefined && { isActive: update.isActive }),
            },
          })
        )
      );
      return units;
    });

    return NextResponse.json({
      success: true,
      data: updatedUnits,
      message: `Successfully updated ${updatedUnits.length} product units`,
    });
  } catch (error) {
    console.error('Error bulk updating product units:', error);
    
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

// DELETE - Bulk delete units
export async function DELETE(
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

    const body = await request.json();
    const validatedData = bulkDeleteSchema.parse(body);

    // Verify all units exist and belong to the product
    const existingUnits = await prisma.productUnit.findMany({
      where: {
        id: { in: validatedData.unitIds },
        productId,
      },
      select: { id: true },
    });

    if (existingUnits.length !== validatedData.unitIds.length) {
      return NextResponse.json(
        { error: 'One or more units not found or do not belong to this product' },
        { status: 404 }
      );
    }

    // Check if units are being used in cart items (unless force delete)
    if (!validatedData.force) {
      const unitsInUse = await prisma.cartItem.findMany({
        where: {
          unitId: { in: validatedData.unitIds },
        },
        select: { unitId: true },
        distinct: ['unitId'],
      });

      if (unitsInUse.length > 0) {
        return NextResponse.json(
          { 
            error: 'Some units are in use in cart items. Use force=true to deactivate them instead.',
            unitsInUse: unitsInUse.map((item: any) => item.unitId)
          },
          { status: 400 }
        );
      }
    }

    // Delete or deactivate units in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      if (validatedData.force) {
        // Soft delete by deactivating
        const deactivatedUnits = await Promise.all(
          validatedData.unitIds.map(unitId =>
            tx.productUnit.update({
              where: { id: unitId },
              data: { isActive: false },
            })
          )
        );
        return { type: 'deactivated', units: deactivatedUnits };
      } else {
        // Hard delete
        const deletedUnits = await Promise.all(
          validatedData.unitIds.map(unitId =>
            tx.productUnit.delete({
              where: { id: unitId },
            })
          )
        );
        return { type: 'deleted', units: deletedUnits };
      }
    });

    return NextResponse.json({
      success: true,
      data: result.units,
      message: `Successfully ${result.type} ${result.units.length} product units`,
    });
  } catch (error) {
    console.error('Error bulk deleting product units:', error);
    
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
