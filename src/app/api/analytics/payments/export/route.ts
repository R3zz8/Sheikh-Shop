import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { generateCSV } from '@/lib/reports/csv-export';
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

// Helper function to get date range
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
    default:
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

// GET /api/analytics/payments/export - Export payment analytics
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
    const format = searchParams.get('format') || 'csv';
    const range = searchParams.get('range') || 'monthly';
    const status = searchParams.get('status') || '';

    // Build date range
    const { start, end } = getDateRange(range);

    // Build where clause
    const where: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (status && status !== 'all' && status !== '') {
      where.status = status.toUpperCase();
    }

    // Fetch transactions (limit to 1000 for export)
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    // Calculate summary
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(
      (t: { status: string }) => t.status === 'COMPLETED' || t.status === 'SUCCESS'
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

    const summary = {
      totalTransactions,
      totalAmount,
      successRate,
      averageAmount,
      successfulCount: successfulTransactions.length,
      failedCount: transactions.filter((t: Transaction) => t.status === 'FAILED').length,
      pendingCount:
        transactions.length -
        successfulTransactions.length -
        transactions.filter((t: Transaction) => t.status === 'FAILED').length,
    };

    // Generate export based on format
    if (format === 'csv') {
      const csvContent = generateCSV(
        transactions.map(t => ({
          ...t,
          createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
        })),
        summary,
        range
      );
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'pdf') {
      // PDF export - for now return JSON, can be enhanced with reportlab
      return NextResponse.json(
        {
          message: 'PDF export coming soon',
          data: { transactions, summary },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (format === 'excel') {
      // Excel export - for now return JSON, can be enhanced with openpyxl or exceljs
      return NextResponse.json(
        {
          message: 'Excel export coming soon',
          data: { transactions, summary },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid export format' },
        { status: 400 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Payment Analytics Export] Error:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export analytics',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

