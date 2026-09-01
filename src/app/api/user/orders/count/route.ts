import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.order.count({
      where: { userId: user.id },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to fetch user order count:', error);
    return NextResponse.json({ count: 0 });
  }
}
