import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

const packageSchema = z.object({
  serviceId: z.string().min(1, 'شناسه خدمت الزامی است'),
  name: z.string().min(1, 'نام پکیج الزامی است'),
  price: z.number().int().nonnegative().default(0),
  oldPrice: z.number().int().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional().default([]),
  badge: z.string().optional().nullable(),
  isPopular: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = packageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const newPackage = await prisma.webServicePackage.create({
      data: validation.data,
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_WEB_PACKAGES_POST_ERROR]', error);
    return NextResponse.json({ message: 'خطا در ایجاد پکیج جدید' }, { status: 500 });
  }
}
