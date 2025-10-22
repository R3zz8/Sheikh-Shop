// src/app/api/affiliate/payout/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { paypalClient } from '@/lib/paypalClient';

const prisma = new PrismaClient();

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

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
      await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      await prisma.transaction.create({
        data: {
          affiliateId,
          amount,
          status: 'COMPLETED',
          paymentGateway: 'PayPal',
          transactionId: payout.batch_header.payout_batch_id,
        },
      });

      return NextResponse.json({ message: 'Payout successful', payout });
    } else {
        await prisma.transaction.create({
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
