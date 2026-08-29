import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

const updateRuleSchema = z.object({
  title: z.string().min(1).optional(),
  key: z.string().min(1).optional(),
  category: z.string().optional(),
  price: z.number().int().nonnegative().optional(),
  icon: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
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

    const validation = updateRuleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
    }

    const updated = await prisma.webCalculatorRule.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN_WEB_CALCULATOR_RULE_PATCH_ERROR]', error);
    return NextResponse.json({ message: 'خطا در به روزرسانی قانون' }, { status: 500 });
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

    await prisma.webCalculatorRule.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'قانون با موفقیت حذف شد' });
  } catch (error) {
    console.error('[ADMIN_WEB_CALCULATOR_RULE_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'خطا در حذف قانون' }, { status: 500 });
  }
}
