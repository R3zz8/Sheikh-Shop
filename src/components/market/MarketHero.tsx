'use client';

import React from 'react';
import { Activity, Sparkles } from 'lucide-react';
import { MarketStatus } from './MarketStatus';

interface MarketHeroProps {
  lastUpdated: string;
  isStale?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MarketHero({
  lastUpdated,
  isStale,
  onRefresh,
  isRefreshing,
}: MarketHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/40 p-6 md:p-8 border border-amber-500/20 shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>نبض بازار شیخ</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-100 tracking-tight leading-tight">
              قیمت لحظه‌ای دلار، طلا، سکه و بازارهای جهانی
            </h1>

            <p className="text-sm md:text-base text-stone-300/90 max-w-3xl leading-relaxed">
              آخرین نرخ ارزهای پرکاربرد، طلای داخلی، سکه، نفت و دارایی‌های جهانی را با نمودار، تغییرات و زمان به‌روزرسانی مشاهده کنید.
            </p>
          </div>
        </div>

        <MarketStatus
          lastUpdated={lastUpdated}
          isStale={isStale}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </div>
    </section>
  );
}
