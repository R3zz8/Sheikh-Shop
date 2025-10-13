import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/actions/analytics';

export async function GET(req: NextRequest) {
  try {
    const result = await getAnalyticsData();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes('permissions') ? 403 : 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
    });
    
  } catch (error) {
    console.error('Error in analytics dashboard API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
