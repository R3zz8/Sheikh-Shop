import React from 'react';
import PrePurchaseNoticeDashboardView from '@/modules/pre-purchase-notice/views/PrePurchaseNoticeDashboardView';

export const metadata = {
  title: 'اطلاعیه پیش از خرید | داشبورد مدیریت',
  description: 'مدیریت اطلاعیه عمومی نوسانات قیمت، موجودی کالا و شماره هماهنگی واحد فروشگاه شیخ',
};

export default function PrePurchaseNoticeAdminPage() {
  return <PrePurchaseNoticeDashboardView />;
}
