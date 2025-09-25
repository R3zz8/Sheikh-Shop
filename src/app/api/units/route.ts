import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        symbol: true,
        multiplier: true,
        sortOrder: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: units,
    });
  } catch (error) {
    console.error('Failed to fetch units:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch units',
      },
      { status: 500 }
    );
  }
}
