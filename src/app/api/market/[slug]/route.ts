import { NextResponse } from 'next/server';
import { getAssetBySlug } from '@/lib/market-data/service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    const data = await getAssetBySlug(slug);
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('API /api/market/[slug] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch asset details',
      },
      { status: 500 }
    );
  }
}
