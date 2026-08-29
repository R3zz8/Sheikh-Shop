import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().nonnegative().optional(),
  oldPrice: z.number().int().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional(),
  badge: z.string().optional().nullable(),
  isPopular: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const validation = updatePackageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
    }

    const updated = await prisma.webServicePackage.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN_WEB_PACKAGE_PATCH_ERROR]', error);
    return NextResponse.json({ message: 'خطا در به روزرسانی پکیج' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.webServicePackage.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'پکیج با موفقیت حذف شد' });
  } catch (error) {
    console.error('[ADMIN_WEB_PACKAGE_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'خطا در حذف پکیج' }, { status: 500 });
  }
}
