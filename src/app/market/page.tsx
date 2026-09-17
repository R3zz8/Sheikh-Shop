import type { Metadata } from 'next';
import { getMarketOverview } from '@/lib/market-data/service';
import { MarketDashboard } from '@/components/market/MarketDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'نبض بازار شیخ | قیمت لحظه‌ای دلار، طلا، سکه و بازارهای جهانی',
  description:
    'آخرین نرخ ارزهای پرکاربرد، طلای داخلی، سکه، نفت و دارایی‌های جهانی را با نمودار، تغییرات و زمان به‌روزرسانی مشاهده کنید.',
  keywords: [
    'قیمت دلار',
    'قیمت طلا',
    'قیمت سکه',
    'نبض بازار شیخ',
    'نرخ ارز آزاد',
    'قیمت یورو',
    'قیمت نفت برنت',
    'قیمت بیت کوین',
  ],
  alternates: {
    canonical: 'https://sheikhshops.com/market',
  },
  openGraph: {
    title: 'نبض بازار شیخ | قیمت لحظه‌ای دلار، طلا، سکه و بازارهای جهانی',
    description:
      'آخرین نرخ ارزهای پرکاربرد، طلای داخلی، سکه، نفت و دارایی‌های جهانی را با نمودار، تغییرات و زمان به‌روزرسانی مشاهده کنید.',
    url: 'https://sheikhshops.com/market',
    siteName: 'فروشگاه شیخ',
    locale: 'fa_IR',
    type: 'website',
  },
};

export default async function MarketPage() {
  const overview = await getMarketOverview();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialMarket',
    name: 'نبض بازار شیخ',
    description:
      'آخرین نرخ ارزهای پرکاربرد، طلای داخلی، سکه، نفت و دارایی‌های جهانی را با نمودار، تغییرات و زمان به‌روزرسانی مشاهده کنید.',
    url: 'https://sheikhshops.com/market',
  };

  return (
    <main id="main-content" className="min-h-screen bg-stone-950 text-stone-100 py-6 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto">
        <MarketDashboard initialData={overview} />
      </div>
    </main>
  );
}
