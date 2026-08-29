import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

const faqSchema = z.object({
  question: z.string().min(1, 'صورت سوال الزامی است'),
  answer: z.string().min(1, 'پاسخ سوال الزامی است'),
  category: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const faqs = await prisma.webFaq.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('[ADMIN_WEB_FAQS_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت لیست سوالات متداول' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = faqSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const newFaq = await prisma.webFaq.create({
      data: validation.data,
    });

    return NextResponse.json(newFaq, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_WEB_FAQS_POST_ERROR]', error);
    return NextResponse.json({ message: 'خطا در ایجاد سوال متداول' }, { status: 500 });
  }
}
