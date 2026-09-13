import { NextResponse } from 'next/server';
import { getBestSellers } from '@/lib/services/getBestSellers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 15;

    const products = await getBestSellers(limit);
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('API /api/best-sellers GET error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست محصولات پرفروش' },
      { status: 500 }
    );
  }
}
