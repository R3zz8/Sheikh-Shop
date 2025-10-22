
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { nanoid } from 'nanoid';

const registerSchema = z.object({});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { userId: user.id },
    });

    if (existingAffiliate) {
      return NextResponse.json({ error: 'User is already an affiliate' }, { status: 400 });
    }

    const referralCode = nanoid(10);

    const affiliate = await prisma.affiliate.create({
      data: {
        userId: user.id,
        referralCode,
      },
    });

    return NextResponse.json(affiliate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Affiliate registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
