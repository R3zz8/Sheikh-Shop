import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const services = await prisma.webService.findMany({
      where: { isActive: true },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('[WEB_SERVICES_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت لیست خدمات وب' }, { status: 500 });
  }
}
