import type { Metadata } from 'next';
import BestSellersDashboardView from '@/modules/dashboard/BestSellersDashboardView';

export const metadata: Metadata = {
  title: 'مدیریت پرفروش‌ترین‌ها | داشبورد مدیریت شیخ',
  description: 'مدیریت محصولات پرفروش نمایش داده شده در حلقه طلایی صفحه اصلی',
};

export default function BestSellersPage() {
  return <BestSellersDashboardView />;
}
