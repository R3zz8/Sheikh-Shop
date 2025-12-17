// src/app/api/track-referral/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { refCode, ip, userAgent } = await req.json();

  if (!refCode) {
    return NextResponse.json({ message: 'Missing refCode' }, { status: 400 });
  }

  try {
    const affiliate = await prisma.affiliate.findUnique({ where: { referralCode: refCode } });

    if (affiliate) {
      await prisma.referral.create({
        data: {
          affiliateId: affiliate.id,
          ipAddress: ip,
          userAgent: userAgent,
        },
      });

      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: { totalClicks: { increment: 1 } },
      });

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
          clicks: { increment: 1 },
        },
        create: {
          affiliateId: affiliate.id,
          date: today,
          clicks: 1,
          sales: 0,
          commissionEarned: 0,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (dbError) {
    console.error('Error logging referral visit:', dbError);
    return NextResponse.json({ message: 'Error logging referral visit' }, { status: 500 });
  }
}
