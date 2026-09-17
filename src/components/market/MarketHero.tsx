'use client';

import React from 'react';
import { Activity, Sparkles, RefreshCw, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { toPersianDigits } from '@/lib/market-data/normalize';

interface MarketHeroProps {
  lastUpdated: string;
  isStale?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  providerName?: string;
}

export function MarketHero({
  lastUpdated,
  isStale,
  onRefresh,
  isRefreshing,
  providerName = 'شبکه داده‌های مالی شیخ',
}: MarketHeroProps) {
  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(lastUpdated);
      const timeStr = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return toPersianDigits(timeStr);
    } catch {
      return toPersianDigits(lastUpdated);
    }
  }, [lastUpdated]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/30 p-6 md:p-8 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
      {/* Subtle Radial Lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-inner">
              <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>نبض بازار شیخ</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-100 tracking-tight leading-tight">
              پایانه اختصاصی قیمت ارز، طلا، سکه و بازارهای جهانی
            </h1>

            <p className="text-sm md:text-base text-stone-300/90 max-w-2xl leading-relaxed">
              مرکز پایش هوشمند نرخ آزاد ارزهای معتبر، مظنه طلای ۱۸ عیار، انواع سکه بهار آزادی، نفت خام برنت و رمزارزهای پایه.
            </p>
          </div>

          {/* Action & Connectivity Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 p-4 rounded-2xl bg-stone-900/80 border border-amber-900/40 backdrop-blur-md shadow-lg min-w-[280px]">
            <div className="flex items-center gap-3">
              {isStale ? (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/50">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>آخرین نرخ دریافت‌شده (آرشیو)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>اتصال آنلاین پایداری برقرار است</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
              <div className="flex items-center gap-1.5 text-stone-300 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>بروزرسانی: {formattedDate}</span>
              </div>

              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  aria-label="به‌روزرسانی دستی نرخ‌های بازار"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-amber-500/40 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isRefreshing ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
