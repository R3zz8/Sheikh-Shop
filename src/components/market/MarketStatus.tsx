'use client';

import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { toPersianDigits } from '@/lib/market-data/normalize';

interface MarketStatusProps {
  lastUpdated: string;
  isStale?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MarketStatus({
  lastUpdated,
  isStale = false,
  onRefresh,
  isRefreshing = false,
}: MarketStatusProps) {
  const formattedTime = React.useMemo(() => {
    try {
      const date = new Date(lastUpdated);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return toPersianDigits(`${hours}:${minutes}:${seconds}`);
    } catch {
      return toPersianDigits('--:--');
    }
  }, [lastUpdated]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-stone-900/60 border border-amber-900/30 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isStale ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              isStale ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        </span>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-amber-100/80">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>آخرین نرخ دریافت‌شده:</span>
          <span className="font-mono font-bold text-amber-300">{formattedTime}</span>
          {isStale && (
            <span className="mr-1 text-xs text-amber-400/80 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
              (بروزرسانی موقت)
            </span>
          )}
        </div>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-200 bg-amber-900/30 hover:bg-amber-800/40 border border-amber-700/40 transition-all duration-200 disabled:opacity-50"
          aria-label="بروزرسانی نرخ بازار"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>بروزرسانی</span>
        </button>
      )}
    </div>
  );
}
