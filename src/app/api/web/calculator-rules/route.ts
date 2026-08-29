import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rules = await prisma.webCalculatorRule.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('[WEB_CALCULATOR_RULES_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت قوانین برآورد قیمت' }, { status: 500 });
  }
}
