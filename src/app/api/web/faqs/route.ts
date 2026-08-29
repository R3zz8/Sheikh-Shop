import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const faqs = await prisma.webFaq.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('[WEB_FAQS_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت سوالات متداول' }, { status: 500 });
  }
}
