import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.webPortfolio.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('[WEB_PORTFOLIO_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت نمونه کارها' }, { status: 500 });
  }
}
