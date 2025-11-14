import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import type { Transaction } from '@prisma/client';

// Helper function to get user ID from JWT
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const accessToken = request.cookies.get('access-token')?.value;
    if (accessToken) {
      const user = await verifyJwtToken(accessToken);
      return user?.id || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper function to get date range based on filter
function getDateRange(range: string): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();

  switch (range) {
    case 'daily':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'yearly':
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'custom':
      // For custom, we'll expect startDate and endDate in query params
      // This will be handled separately
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      // Default to last 30 days
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

// GET /api/analytics/payments - Fetch payment analytics data
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is superadmin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - SuperAdmin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'monthly';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date range
    let dateFilter: { gte?: Date; lte?: Date } = {};
    if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      const { start, end } = getDateRange(range);
      dateFilter = {
        gte: start,
        lte: end,
      };
    }

    // Build where clause
    const where: any = {
      createdAt: dateFilter,
    };

    // Status filter
    if (status && status !== 'all' && status !== '') {
      where.status = status.toUpperCase();
    }

    // Get all transactions for calculations
    const allTransactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // Calculate statistics
    const totalTransactions = allTransactions.length;
    const successfulTransactions = allTransactions.filter(
      (t: { status: string }) => t.status === 'COMPLETED' || t.status === 'SUCCESS'
    );
    const failedTransactions = allTransactions.filter(
      (t: { status: string }) => t.status === 'FAILED'
    );

    const totalAmount = successfulTransactions.reduce(
      (sum: number, t: { amount: number }) => sum + t.amount,
      0
    );
    const successRate =
      totalTransactions > 0
        ? (successfulTransactions.length / totalTransactions) * 100
        : 0;
    const averageAmount =
      successfulTransactions.length > 0
        ? totalAmount / successfulTransactions.length
        : 0;

    // Generate transaction trend by date
    const trendMap = new Map<string, { count: number; amount: number }>();

    allTransactions.forEach((transaction: Transaction) => {
      const dateKey = new Date(transaction.createdAt)
        .toISOString()
        .split('T')[0];
      if (!dateKey) return;
      const existing = trendMap.get(dateKey) || { count: 0, amount: 0 };
      trendMap.set(dateKey, {
        count: existing.count + 1,
        amount:
          existing.amount +
          (transaction.status === 'COMPLETED' || transaction.status === 'SUCCESS'
            ? transaction.amount
            : 0),
      });
    });

    // Convert trend map to array and sort by date
    const transactionTrend = Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        amount: data.amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get monthly totals for bar chart
    const monthlyMap = new Map<string, { count: number; amount: number }>();

    allTransactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      if (isNaN(year) || isNaN(month)) return;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { count: 0, amount: 0 };
      monthlyMap.set(monthKey, {
        count: existing.count + 1,
        amount:
          existing.amount +
          (transaction.status === 'COMPLETED' || transaction.status === 'SUCCESS'
            ? transaction.amount
            : 0),
      });
    });

    const monthlyTotals = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        count: data.count,
        amount: data.amount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Success/Failed ratio for pie chart
    const successFailedRatio = [
      {
        name: 'Success',
        value: successfulTransactions.length,
        color: '#10b981',
      },
      {
        name: 'Failed',
        value: failedTransactions.length,
        color: '#ef4444',
      },
      {
        name: 'Pending',
        value: allTransactions.length - successfulTransactions.length - failedTransactions.length,
        color: '#f59e0b',
      },
    ];

    // Top countries (if we had country data, for now return empty)
    const topCountries: Array<{ country: string; count: number; amount: number }> = [];

    return NextResponse.json({
      success: true,
      data: {
        totalTransactions,
        totalAmount,
        successRate: Math.round(successRate * 100) / 100,
        averageAmount: Math.round(averageAmount * 100) / 100,
        transactionTrend,
        monthlyTotals,
        successFailedRatio,
        topCountries,
        successfulCount: successfulTransactions.length,
        failedCount: failedTransactions.length,
        pendingCount: allTransactions.length - successfulTransactions.length - failedTransactions.length,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Payment Analytics API] Error fetching analytics:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

