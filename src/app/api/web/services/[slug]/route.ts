import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ message: 'شناسه خدمت مشخص نشده است' }, { status: 400 });
    }

    const service = await prisma.webService.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!service || !service.isActive) {
      return NextResponse.json({ message: 'خدمت مورد نظر یافت نشد' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('[WEB_SERVICE_SLUG_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت اطلاعات خدمت وب' }, { status: 500 });
  }
}
