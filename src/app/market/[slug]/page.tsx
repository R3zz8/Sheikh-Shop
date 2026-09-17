import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, ChevronLeft } from 'lucide-react';
import { getAssetBySlug, getAssetHistory, getMarketOverview } from '@/lib/market-data/service';
import { formatMarketValue, toPersianDigits } from '@/lib/market-data/normalize';
import { MarketChart } from '@/components/market/MarketChart';
import { MarketConverter } from '@/components/market/MarketConverter';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const assetData = await getAssetBySlug(slug);

  if (!assetData) {
    return {
      title: 'نماد یافت نشد | نبض بازار شیخ',
    };
  }

  const { quote } = assetData;
  const title = quote.seoTitle || `قیمت ${quote.nameFa} (${quote.symbol}) | نبض بازار شیخ`;
  const description =
    quote.seoDescription ||
    `قیمت لحظه‌ای ${quote.nameFa}، نرخ خرید و فروش، نمودار تغییرات و زمان بروزرسانی در پایانه نبض بازار شیخ.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://sheikhshops.com/market/${quote.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://sheikhshops.com/market/${quote.slug}`,
      siteName: 'فروشگاه شیخ',
      locale: 'fa_IR',
      type: 'website',
    },
  };
}

export default async function MarketAssetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assetData = await getAssetBySlug(slug);

  if (!assetData) {
    notFound();
  }

  const { quote, related } = assetData;
  const history = await getAssetHistory(quote.slug, '7D');
  const overview = await getMarketOverview();

  const isUp = quote.direction === 'UP';
  const isDown = quote.direction === 'DOWN';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialMarket',
    name: quote.nameFa,
    description: quote.seoDescription || `پایش زنده قیمت ${quote.nameFa}`,
    url: `https://sheikhshops.com/market/${quote.slug}`,
  };

  return (
    <main id="main-content" className="min-h-screen bg-stone-950 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-stone-600" />
          <Link href="/market" className="hover:text-amber-400 transition-colors">
            نبض بازار شیخ
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-stone-600" />
          <span className="text-amber-300 font-bold">{quote.nameFa}</span>
        </nav>

        {/* Asset Header Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/40 p-6 sm:p-8 border border-amber-900/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>نرخ تاییدشده در پایانه مالی</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-100">
                قیمت {quote.nameFa} ({quote.symbol})
              </h1>
              <p className="text-xs sm:text-sm text-stone-400">
                {quote.nameEn} • واحد سنجش: <strong className="text-stone-300">{quote.unit}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-amber-200">
                {formatMarketValue(quote.currentPrice, quote.unit)}
              </div>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isUp
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                    : isDown
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : isDown ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                <span dir="ltr">
                  {toPersianDigits(Math.abs(quote.priceChange))} ({toPersianDigits(Math.abs(quote.percentChange))}%)
                </span>
              </div>
            </div>
          </div>

          {/* Key Quote Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800">
              <span className="text-stone-400 block mb-1">قیمت خرید (در صورت وجود)</span>
              <strong className="text-emerald-400 font-bold">
                {quote.buyPrice ? formatMarketValue(quote.buyPrice, quote.unit) : '—'}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800">
              <span className="text-stone-400 block mb-1">قیمت فروش (در صورت وجود)</span>
              <strong className="text-amber-300 font-bold">
                {quote.sellPrice ? formatMarketValue(quote.sellPrice, quote.unit) : '—'}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800">
              <span className="text-stone-400 block mb-1">منبع ارائه دهنده</span>
              <strong className="text-stone-200 font-bold">{quote.provider}</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800">
              <span className="text-stone-400 block mb-1">آخرین ثبت نرخ</span>
              <strong className="text-stone-200 font-bold font-mono">
                {toPersianDigits(new Date(quote.providerTimestamp).toLocaleTimeString('fa-IR'))}
              </strong>
            </div>
          </div>
        </section>

        {/* Historical Interactive Chart */}
        <section>
          <MarketChart history={history} unit={quote.unit} />
        </section>

        {/* Converter Section */}
        <section>
          <MarketConverter quotes={overview.quotes} />
        </section>

        {/* Related Assets */}
        {related.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-stone-100">دارایی‌ها و شاخص‌های هم‌گروه</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.symbol}
                  href={`/market/${rel.slug}`}
                  className="p-4 rounded-2xl bg-stone-900/80 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/40 transition-all space-y-2 group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-100 group-hover:text-amber-300 text-sm">
                      {rel.nameFa}
                    </span>
                    <span className="text-xs font-mono text-stone-400">{rel.symbol}</span>
                  </div>
                  <div className="text-base font-extrabold text-amber-200">
                    {formatMarketValue(rel.currentPrice, rel.unit)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
