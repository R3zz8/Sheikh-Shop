import { NextResponse } from 'next/server';
import { getBestSellers } from '@/lib/services/getBestSellers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    const products = await getBestSellers(limit);
    return NextResponse.json({ success: true, data: products, count: products.length });
  } catch (error) {
    console.error('API /api/best-sellers GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
