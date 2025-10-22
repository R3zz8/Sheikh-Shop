// src/app/api/affiliate/me/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

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
