import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { monitoringSystem } from '@/lib/monitoring';
import { withRole } from '@/lib/jwt';
import { withRateLimit } from '@/lib/rateLimiter';
import { apiRateLimiter } from '@/lib/rateLimiter';

// Apply rate limiting and admin role check
const rateLimitedHandler = withRateLimit(apiRateLimiter);
const adminHandler = withRole('ADMIN');

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse && rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'health';
    const limit = parseInt(searchParams.get('limit') || '50');
    const timeRange = searchParams.get('timeRange') || '1h';

    let responseData: any = {};

    switch (type) {
      case 'health':
        responseData = {
          health: monitoringSystem.getSystemHealth(),
        };
        break;

      case 'events':
        const eventType = searchParams.get('eventType') as any;
        responseData = {
          events: monitoringSystem.getRecentEvents(limit, eventType),
        };
        break;

      case 'metrics':
        const metricName = searchParams.get('metricName');
        const startTime = new Date(Date.now() - getTimeRangeMs(timeRange));
        const endTime = new Date();
        
        responseData = {
          metrics: monitoringSystem.getPerformanceMetrics(metricName || undefined, {
            start: startTime,
            end: endTime,
          }),
        };
        break;

      case 'anomalies':
        const status = searchParams.get('status') as any;
        responseData = {
          anomalies: monitoringSystem.getAnomalies(status),
        };
        break;

      case 'dashboard':
        responseData = {
          health: monitoringSystem.getSystemHealth(),
          events: monitoringSystem.getRecentEvents(20),
          anomalies: monitoringSystem.getAnomalies('active'),
          metrics: monitoringSystem.getPerformanceMetrics('response_time', {
            start: new Date(Date.now() - 60 * 60 * 1000), // Last hour
            end: new Date(),
          }),
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve monitoring data' },
      { status: 500 }
    );
  }
}

// POST endpoint for resolving events and anomalies
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse && rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { action, id, resolvedBy } = body;

    if (!action || !id || !resolvedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case 'resolve_event':
        success = monitoringSystem.resolveEvent(id, resolvedBy);
        break;

      case 'resolve_anomaly':
        success = monitoringSystem.resolveAnomaly(id, resolvedBy);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed successfully`,
    });

  } catch (error) {
    console.error('Monitoring resolution error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve item' },
      { status: 500 }
    );
  }
}

// Helper function to convert time range to milliseconds
function getTimeRangeMs(timeRange: string): number {
  const timeRangeMap: Record<string, number> = {
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
  };
  
  return timeRangeMap[timeRange] || 60 * 60 * 1000; // Default to 1 hour
}

