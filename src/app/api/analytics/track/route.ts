import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/index';
import { prisma } from '@/lib/prisma';
import { analyticsRateLimiter } from '@/lib/rateLimiter';
import { withValidation } from '@/lib/validation';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: 'view' | 'click' | 'add_to_cart' | 'remove_from_cart' | 'purchase' | 'search';
  productId?: string;
  categoryId?: string;
  unitId?: string;
  quantity?: number;
  price?: number;
  searchQuery?: string;
  pageUrl: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const rateLimitResponse = analyticsRateLimiter(request);
        if (rateLimitResponse && rateLimitResponse.status === 429) {
            return rateLimitResponse;
        }

        const session = await auth();
        const event: AnalyticsEvent = await request.json();

    // Validate required fields
    if (!event.sessionId || !event.eventType || !event.pageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If user is authenticated, use their ID, otherwise use session ID
    const userId = session?.user?.id || null;

    // Store the event in the database
    const analyticsEvent = await prisma.analyticsEvent.create({
      data: {
        id: event.id,
        userId,
        sessionId: event.sessionId,
        eventType: event.eventType,
        productId: event.productId,
        categoryId: event.categoryId,
        unitId: event.unitId,
        quantity: event.quantity,
        price: event.price,
        searchQuery: event.searchQuery,
        pageUrl: event.pageUrl,
        timestamp: event.timestamp,
        metadata: event.metadata || {},
      },
    });

    // Update product analytics if it's a product-related event
    if (event.productId) {
      await updateProductAnalytics(event);
    }

    // Update user analytics if user is authenticated
    if (userId) {
      await updateUserAnalytics(userId, event);
    }

    return NextResponse.json({ success: true, id: analyticsEvent.id });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

async function updateProductAnalytics(event: AnalyticsEvent) {
  try {
    const productId = event.productId!;
    
    // Get or create product analytics record
    let productAnalytics = await prisma.productAnalytics.findUnique({
      where: { productId },
    });

    if (!productAnalytics) {
      productAnalytics = await prisma.productAnalytics.create({
        data: {
          productId,
          viewCount: 0,
          clickCount: 0,
          addToCartCount: 0,
          purchaseCount: 0,
          totalRevenue: 0,
        },
      });
    }

    // Update counters based on event type
    const updates: any = {};
    
    switch (event.eventType) {
      case 'view':
        updates.viewCount = { increment: 1 };
        break;
      case 'click':
        updates.clickCount = { increment: 1 };
        break;
      case 'add_to_cart':
        updates.addToCartCount = { increment: 1 };
        break;
      case 'purchase':
        updates.purchaseCount = { increment: 1 };
        if (event.price) {
          updates.totalRevenue = { increment: event.price * (event.quantity || 1) };
        }
        break;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.productAnalytics.update({
        where: { productId },
        data: updates,
      });
    }
  } catch (error) {
    console.error('Failed to update product analytics:', error);
  }
}

async function updateUserAnalytics(userId: string, event: AnalyticsEvent) {
  try {
    // Get or create user analytics record
    let userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId },
    });

    if (!userAnalytics) {
      userAnalytics = await prisma.userAnalytics.create({
        data: {
          userId,
          totalViews: 0,
          totalClicks: 0,
          totalAddToCart: 0,
          totalPurchases: 0,
          totalSpent: 0,
          lastActivity: new Date(),
        },
      });
    }

    // Update counters
    const updates: any = {
      lastActivity: new Date(),
    };
    
    switch (event.eventType) {
      case 'view':
        updates.totalViews = { increment: 1 };
        break;
      case 'click':
        updates.totalClicks = { increment: 1 };
        break;
      case 'add_to_cart':
        updates.totalAddToCart = { increment: 1 };
        break;
      case 'purchase':
        updates.totalPurchases = { increment: 1 };
        if (event.price) {
          updates.totalSpent = { increment: event.price * (event.quantity || 1) };
        }
        break;
    }

    await prisma.userAnalytics.update({
      where: { userId },
      data: updates,
    });
  } catch (error) {
    console.error('Failed to update user analytics:', error);
  }
}

// GET endpoint to retrieve analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user';
    const limit = parseInt(searchParams.get('limit') || '50');

    let data;

    switch (type) {
      case 'user':
        data = await prisma.userAnalytics.findUnique({
          where: { userId: session.user.id },
        });
        break;
      
      case 'events':
        data = await prisma.analyticsEvent.findMany({
          where: { userId: session.user.id },
          orderBy: { timestamp: 'desc' },
          take: limit,
        });
        break;
      
      case 'products':
        data = await prisma.productAnalytics.findMany({
          orderBy: { viewCount: 'desc' },
          take: limit,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        });
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
