// src/app/api/admin/affiliates/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { auth } from '@/lib/auth/index';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(affiliates);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred while fetching affiliates' }, { status: 500 });
  }
}
