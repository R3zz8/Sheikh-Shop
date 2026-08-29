import { NextResponse } from 'next/server';
import { getWebDesignShowcase } from '@/lib/services/getWebDesignShowcase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const showcase = await getWebDesignShowcase();
    return NextResponse.json(showcase ?? null);
  } catch (error) {
    console.error('[PUBLIC_WEB_DESIGN_SHOWCASE_GET]', error);
    return NextResponse.json(
      { message: 'خطا در دریافت اطلاعات خدمات طراحی سایت' },
      { status: 500 }
    );
  }
}
