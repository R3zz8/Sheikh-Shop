'use client';

import React from 'react';
import type { NormalizedQuote } from '@/lib/market-data/types';

interface MarketOverviewProps {
  quotes: NormalizedQuote[];
}

export function MarketOverview({ quotes }: MarketOverviewProps) {
  const categoriesSummary = React.useMemo(() => {
    const list = [
      { key: 'IRAN_CURRENCY', label: 'ارز آزاد ایران' },
      { key: 'GOLD_COIN', label: 'طلا و سکه' },
      { key: 'GLOBAL_CURRENCY', label: 'ارزهای جهانی' },
      { key: 'ENERGY', label: 'انرژی و نفت' },
      { key: 'CRYPTO', label: 'رمزارزها' },
    ];

    return list.map((cat) => {
      const catQuotes = quotes.filter((q) => q.category === cat.key);
      if (catQuotes.length === 0) {
        return { ...cat, statusText: 'بدون تغییر محسوس', colorClass: 'text-stone-400 bg-stone-900 border-stone-800' };
      }

      const upCount = catQuotes.filter((q) => q.direction === 'UP').length;
      const downCount = catQuotes.filter((q) => q.direction === 'DOWN').length;

      let statusText = 'بدون تغییر محسوس';
      let colorClass = 'text-stone-300 bg-stone-900/80 border-stone-800';

      if (upCount > downCount && upCount > 0) {
        statusText = 'صعودی';
        colorClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
      } else if (downCount > upCount && downCount > 0) {
        statusText = 'نزولی';
        colorClass = 'text-rose-400 bg-rose-950/40 border-rose-800/50';
      } else if (upCount > 0 && downCount > 0) {
        statusText = 'نوسانی';
        colorClass = 'text-amber-400 bg-amber-950/40 border-amber-800/50';
      }

      return {
        ...cat,
        statusText,
        colorClass,
        count: catQuotes.length,
      };
    });
  }, [quotes]);

  return (
    <div className="rounded-2xl bg-stone-900/60 border border-amber-900/30 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>نمای کلی وضعیت بازارهای شیخ</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categoriesSummary.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${item.colorClass}`}
          >
            <span className="text-stone-200 font-semibold">{item.label}</span>
            <span className="font-bold px-2 py-0.5 rounded-md bg-stone-950/50">{item.statusText}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
