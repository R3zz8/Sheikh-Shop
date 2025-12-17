// src/app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { auth } from '@/lib/auth/index';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const totalAffiliates = await prisma.affiliate.count();
    const totalUnpaidBalances = await prisma.affiliate.aggregate({
      _sum: {
        commissionEarned: true,
      },
    });

    const topPerformers = await prisma.affiliate.findMany({
      orderBy: {
        commissionEarned: 'desc',
      },
      take: 5,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const payoutLogs = await prisma.referral.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 10,
        include: {
            affiliate: {
                include: {
                    user: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            }
        }
    });

    return NextResponse.json({
      totalAffiliates,
      totalUnpaidBalances: totalUnpaidBalances._sum?.commissionEarned || 0,
      topPerformers,
      payoutLogs,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred while fetching admin dashboard data' }, { status: 500 });
  }
}
