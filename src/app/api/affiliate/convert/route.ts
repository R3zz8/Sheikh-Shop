
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const convertSchema = z.object({
  orderId: z.string().cuid(),
  orderTotal: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const referralCode = cookieStore.get('referral_code')?.value;

    if (!referralCode) {
      return NextResponse.json({ message: 'No referral code found' });
    }

    const body = await req.json();
    const { orderId, orderTotal } = convertSchema.parse(body);

    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    // Find the original referral record
    const referral = await prisma.referral.findFirst({
        where: {
            affiliateId: affiliate.id,
            isConverted: false
        }
    })

    if(!referral){
        return NextResponse.json({ error: "Referral not found"}, { status: 404 })
    }

    // Mark referral as converted
    await prisma.referral.update({
      where: { id: referral.id },
      data: { isConverted: true, orderId: orderId },
    });

    // Update affiliate stats
    const commissionRate = 0.1; // 10% commission
    const commission = orderTotal * commissionRate;

    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalSales: { increment: 1 },
        commissionEarned: { increment: commission },
      },
    });

    // New: Update daily stats for sales and commission
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.affiliateDailyStat.upsert({
      where: {
        affiliateId_date: {
          affiliateId: affiliate.id,
          date: today,
        },
      },
      update: {
        sales: { increment: 1 },
        commission: { increment: commission },
      },
      create: {
        affiliateId: affiliate.id,
        date: today,
        clicks: 0, // Clicks are tracked separately in middleware
        sales: 1,
        commission: commission,
      },
    });

    // Clear the referral cookie
    const response = NextResponse.json({ message: 'Conversion successful' });
    response.cookies.delete('referral_code');

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Conversion tracking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
