// src/app/api/affiliate/transactions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { auth } from '@/lib/auth/index';

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

    const transactions = await prisma.affiliateTransaction.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred while fetching transactions' }, { status: 500 });
  }
}
