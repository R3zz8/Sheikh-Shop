import React from 'react';
import { requireAuth } from '@/lib/auth/server-auth';
import PricingDashboardView from '@/modules/pricing/views/PricingDashboardView';

export const metadata = {
  title: 'مدیریت قیمت‌گذاری و موجودی محصولات | فروشگاه شیخ',
  description: 'سیستم قیمت‌گذاری سریع محصولات بر اساس کد اختصاصی کالا در فروشگاه شیخ',
};

export default async function PricingDashboardPage() {
  await requireAuth(['SUPERADMIN', 'ADMIN']);

  return <PricingDashboardView />;
}
