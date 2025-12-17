
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

const registerSchema = z.object({});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return redirect('/');
    }
    const user = session.user

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
