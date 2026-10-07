import { NextResponse } from 'next/server';
import { getPrePurchaseNotice } from '@/lib/services/getPrePurchaseNotice';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notice = await getPrePurchaseNotice();

    return NextResponse.json(notice, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[PUBLIC_PRE_PURCHASE_NOTICE_GET_ERROR]', error);
    return NextResponse.json(
      {
        isEnabled: false,
        title: 'اطلاعیه مهم پیش از ثبت سفارش',
        message: 'با توجه به نوسانات قیمت ارز و محدودیت موجودی برخی کالاها، لطفاً پیش از ثبت نهایی سفارش و پرداخت، جهت اطمینان از قیمت روز و موجودی کالا با واحد فروش فروشگاه شیخ هماهنگ فرمایید.',
        phoneNumber: '09178769556',
      },
      { status: 200 }
    );
  }
}
