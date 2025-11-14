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

// GET /api/transactions - Fetch transactions with filtering and pagination
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

    // Check if user is admin or superadmin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {};

    // Status filter
    if (status && status !== 'all' && status !== '') {
      where.status = status.toUpperCase();
    }

    // Search filter (authority, reference, or description)
    if (search) {
      where.OR = [
        { authority: { contains: search, mode: 'insensitive' as const } },
        { reference: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    const validSortFields = ['createdAt', 'amount', 'status', 'authority'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';

    // Execute queries in parallel
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate summary statistics
    const [totalAmount, successCount, failedCount, pendingCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.count({ where: { status: 'FAILED' } }),
      prisma.transaction.count({ where: { status: 'PENDING' } }),
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalTransactions: total,
        totalAmount: totalAmount._sum.amount || 0,
        successCount,
        failedCount,
        pendingCount,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Transactions API] Error fetching transactions:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

