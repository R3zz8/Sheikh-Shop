import { NextResponse } from 'next/server';
import { getMarketOverview } from '@/lib/market-data/service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const data = await getMarketOverview(forceRefresh);

    return NextResponse.json({
      success: true,
      data,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('API /api/market Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch market overview',
      },
      { status: 500 }
    );
  }
}
