// src/app/api/affiliate/me/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: session.user.id },
    });

    if (!affiliate) {
      return NextResponse.json({ message: 'Affiliate not found' }, { status: 404 });
    }

    // In a real application, you would also fetch performance and progress data.
    // For this example, we'll return the basic affiliate data.
    return NextResponse.json(affiliate);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred while fetching affiliate data' }, { status: 500 });
  }
}
