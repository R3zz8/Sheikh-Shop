import { NextRequest, NextResponse } from 'next/server';
import { createPhase7Analytics } from '@/lib/monitoring/phase7-analytics';
import { withRateLimit } from '@/lib/rateLimiter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'kpis';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const analytics = createPhase7Analytics();
    
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    let data;
    switch (type) {
      case 'arvr':
        data = await analytics.getARVRAnalytics(start, end);
        break;
      case 'gamification':
        data = await analytics.getGamificationAnalytics(start, end);
        break;
      case 'social':
        data = await analytics.getSocialEngagementAnalytics(start, end);
        break;
      case 'realtime':
        data = await analytics.getRealTimeMetrics();
        break;
      case 'kpis':
      default:
        data = await analytics.getPhase7KPIs(start, end);
        break;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching Phase 7 analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
