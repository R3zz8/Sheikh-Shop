import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSmartAnalytics } from '@/lib/ai/analytics';
import { withRole } from '@/lib/auth/withRole';
import { JWTPayload } from '@/lib/auth/jwt';
import { UserRole } from '@prisma/client';
import { withRateLimit } from '@/lib/rateLimiter';
import { apiRateLimiter } from '@/lib/rateLimiter';

const getHandler = async (request: NextRequest, user: JWTPayload) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const timeframe = searchParams.get('timeframe') || 'weekly';

    // Fetch products from database
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: true,
        baseUnit: true,
        units: true,
        discounts: true,
      },
    });

    // Fetch analytics data
    const analyticsEvents = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const productAnalytics = await prisma.productAnalytics.findMany({
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

    const userAnalytics = await prisma.userAnalytics.findMany();

    // Create smart analytics instance
    const smartAnalytics = createSmartAnalytics(products, analyticsEvents, userAnalytics);

    let responseData: any = {};

    switch (type) {
      case 'predictions':
        responseData = {
          predictions: smartAnalytics.generateSalesPredictions(timeframe as any),
        };
        break;

      case 'segments':
        responseData = {
          segments: smartAnalytics.generateCustomerSegments(),
        };
        break;

      case 'insights':
        responseData = {
          insights: smartAnalytics.generateMarketInsights(),
        };
        break;

      case 'metrics':
        responseData = {
          metrics: smartAnalytics.calculatePerformanceMetrics(),
        };
        break;

      case 'timing':
        responseData = {
          timing: smartAnalytics.getOptimalDealTiming(),
        };
        break;

      case 'all':
      default:
        responseData = {
          predictions: smartAnalytics.generateSalesPredictions(timeframe as any),
          segments: smartAnalytics.generateCustomerSegments(),
          insights: smartAnalytics.generateMarketInsights(),
          metrics: smartAnalytics.calculatePerformanceMetrics(),
          timing: smartAnalytics.getOptimalDealTiming(),
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Smart analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to generate smart analytics' },
      { status: 500 }
    );
  }
};

const postHandler = async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();
    const { query, filters, timeframe } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Fetch products from database
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: true,
        baseUnit: true,
        units: true,
        discounts: true,
      },
    });

    // Fetch analytics data based on filters
    const whereClause: any = {};
    
    if (filters?.dateRange) {
      whereClause.timestamp = {
        gte: new Date(filters.dateRange.start),
        lte: new Date(filters.dateRange.end),
      };
    }

    if (filters?.productId) {
      whereClause.productId = filters.productId;
    }

    if (filters?.category) {
      whereClause.categoryId = filters.category;
    }

    const analyticsEvents = await prisma.analyticsEvent.findMany({
      where: whereClause,
    });

    const productAnalytics = await prisma.productAnalytics.findMany({
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

    const userAnalytics = await prisma.userAnalytics.findMany();

    // Create smart analytics instance
    const smartAnalytics = createSmartAnalytics(products, analyticsEvents, userAnalytics);

    // Process custom query
    let result: any = {};

    switch (query) {
      case 'sales_forecast':
        result = {
          forecast: smartAnalytics.generateSalesPredictions(timeframe || 'weekly'),
        };
        break;

      case 'customer_analysis':
        result = {
          segments: smartAnalytics.generateCustomerSegments(),
          insights: smartAnalytics.generateMarketInsights().filter(insight => 
            insight.type === 'trend' || insight.type === 'recommendation'
          ),
        };
        break;

      case 'performance_dashboard':
        result = {
          metrics: smartAnalytics.calculatePerformanceMetrics(),
          insights: smartAnalytics.generateMarketInsights(),
          timing: smartAnalytics.getOptimalDealTiming(),
        };
        break;

      case 'optimization_recommendations':
        result = {
          insights: smartAnalytics.generateMarketInsights().filter(insight => 
            insight.actionable && insight.impact !== 'low'
          ),
          timing: smartAnalytics.getOptimalDealTiming(),
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown query type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      query,
      data: result,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Custom analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process custom analytics query' },
      { status: 500 }
    );
  }
}

// Apply rate limiting and admin role check
const rateLimitedGetHandler = withRateLimit(getHandler);
const rateLimitedPostHandler = withRateLimit(postHandler);

export const GET = withRole(UserRole.ADMIN)(rateLimitedGetHandler);
export const POST = withRole(UserRole.ADMIN)(rateLimitedPostHandler);
