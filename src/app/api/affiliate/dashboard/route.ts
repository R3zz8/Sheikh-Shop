
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: user.id },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate data not found' }, { status: 404 });
    }

    return NextResponse.json(affiliate);
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
