import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth/utils';
import { Parser } from '@json2csv/plainjs';

const analyticsQuerySchema = z.object({
  range: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
  format: z.enum(['json', 'csv']).default('json'),
});

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate account not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const query = analyticsQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!query.success) {
      return NextResponse.json({ error: query.error.flatten().fieldErrors }, { status: 400 });
    }

    const { range, format } = query.data;

    let startDate: Date | undefined;
    const now = new Date();

    switch (range) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'all':
        startDate = undefined; // No start date for all time
        break;
    }

    const dailyStats = await prisma.affiliateDailyStat.findMany({
      where: {
        affiliateId: affiliate.id,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate totals
    const totals = dailyStats.reduce(
      (acc, stat) => {
        acc.clicks += stat.clicks;
        acc.sales += stat.sales;
        acc.commission += Number(stat.commissionEarned);
        return acc;
      },
      { clicks: 0, sales: 0, commission: 0 }
    );

    // Calculate trend indicators
    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return ((current - previous) / previous) * 100;
    };

    const previousPeriodStartDate = new Date(startDate || 0);
    if(startDate) {
        const diff = new Date().getTime() - startDate.getTime();
        previousPeriodStartDate.setTime(startDate.getTime() - diff);
    }

    const previousPeriodStats = await prisma.affiliateDailyStat.findMany({
        where: {
            affiliateId: affiliate.id,
            date: {
                gte: previousPeriodStartDate,
                lt: startDate
            }
        },
    });

    const previousTotals = previousPeriodStats.reduce(
        (acc, stat) => {
          acc.clicks += stat.clicks;
          acc.sales += stat.sales;
          acc.commission += Number(stat.commissionEarned);
          return acc;
        },
        { clicks: 0, sales: 0, commission: 0 }
    );

    const trends = {
        clicks: calculateTrend(totals.clicks, previousTotals.clicks),
        sales: calculateTrend(totals.sales, previousTotals.sales),
        commission: calculateTrend(totals.commission, previousTotals.commission),
    };


    if (format === 'csv') {
      if (dailyStats.length === 0) {
        return new NextResponse("No data available to export.", {
          status: 404,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      const parser = new Parser({
        fields: ['date', 'clicks', 'sales', 'commission'],
      });
      const csv = parser.parse(dailyStats.map(d => ({...d, date: d.date.toISOString().split('T')[0]})));
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="affiliate_analytics_${range}.csv"`,
        },
      });
    }

    return NextResponse.json({
      range,
      totals,
      trends,
      dailyStats,
    });

  } catch (error) {
    console.error('Failed to fetch affiliate analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
