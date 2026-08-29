import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

const ruleSchema = z.object({
  title: z.string().min(1, 'عنوان قانون الزامی است'),
  key: z.string().min(1, 'کلید قانون الزامی است'),
  category: z.string().min(1, 'دسته‌بندی (TYPE یا FEATURE) الزامی است'),
  price: z.number().int().nonnegative().default(0),
  icon: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const rules = await prisma.webCalculatorRule.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('[ADMIN_WEB_CALCULATOR_RULES_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت لیست قوانین محاسبات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = ruleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const existing = await prisma.webCalculatorRule.findUnique({
      where: { key: validation.data.key },
    });
    if (existing) {
      return NextResponse.json({ message: 'قانون دیگری با این کلید ثبت شده است' }, { status: 400 });
    }

    const newRule = await prisma.webCalculatorRule.create({
      data: validation.data,
    });

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_WEB_CALCULATOR_RULES_POST_ERROR]', error);
    return NextResponse.json({ message: 'خطا در ایجاد قانون برآورد قیمت' }, { status: 500 });
  }
}
