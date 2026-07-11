// src/app/api/affiliate/payout/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { paypalClient } from '@/lib/paypalClient';

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const limitResult = await rateLimit(`payout:${ip}`, 5, 10);

  if (!limitResult.allowed) {
    const retryAfter = limitResult.retryAfter || 'unknown';
    return NextResponse.json({ message: `Too many requests. Try again in ${retryAfter} seconds.` }, { status: 429 });
  }

  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { affiliateId, amount } = await req.json();

  if (!affiliateId || !amount) {
    return NextResponse.json({ message: 'Missing affiliateId or amount' }, { status: 400 });
  }

  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: { user: true },
    });

    if (!affiliate) {
      return NextResponse.json({ message: 'Affiliate not found' }, { status: 404 });
    }

    // 1. Create a payout with the PayPal client
    const payout = await paypalClient.payouts.create({
      sender_batch_header: {
        sender_batch_id: `PAYOUT-${Date.now()}`,
        email_subject: 'You have a payout!',
        email_message: 'You have received a payout for your affiliate commissions.',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency: 'USD',
          },
          receiver: affiliate.user.email,
          note: 'Thank you for your partnership!',
          sender_item_id: affiliate.id,
        },
      ],
    });

    // 2. If the payout is successful, update the database
    if (payout.batch_header.batch_status === 'SUCCESS') {
      await prisma.$transaction(async (tx: any) => {
        await tx.affiliate.update({
          where: { id: affiliateId },
          data: {
            commissionEarned: {
              decrement: amount,
            },
          },
        });

        await tx.affiliateTransaction.create({
          data: {
            affiliateId,
            amount,
            status: 'COMPLETED',
            paymentGateway: 'PayPal',
            transactionId: payout.batch_header.payout_batch_id,
          },
        });
      });

      return NextResponse.json({ message: 'Payout successful', payout });
    } else {
        await prisma.affiliateTransaction.create({
            data: {
              affiliateId,
              amount,
              status: 'FAILED',
              paymentGateway: 'PayPal',
            },
          });
      return NextResponse.json({ message: 'Payout failed' }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred during payout' }, { status: 500 });
  }
}
