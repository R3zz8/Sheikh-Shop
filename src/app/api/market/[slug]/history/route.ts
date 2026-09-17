import { NextResponse } from 'next/server';
import { getAssetHistory } from '@/lib/market-data/service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const timeframeParam = searchParams.get('timeframe') || '7D';
    const timeframe = ['1D', '7D', '1M', '1Y'].includes(timeframeParam)
      ? (timeframeParam as '1D' | '7D' | '1M' | '1Y')
      : '7D';

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    const history = await getAssetHistory(slug, timeframe);

    return NextResponse.json({
      success: true,
      data: history,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('API /api/market/[slug]/history Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch asset price history',
      },
      { status: 500 }
    );
  }
}
