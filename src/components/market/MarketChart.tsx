'use client';

import React, { useState } from 'react';
import type { HistoryPoint } from '@/lib/market-data/types';
import { toPersianDigits } from '@/lib/market-data/normalize';

interface MarketChartProps {
  history: HistoryPoint[];
  unit: string;
}

export function MarketChart({ history, unit }: MarketChartProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '1Y'>('7D');

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-stone-900/40 rounded-2xl border border-stone-800 text-stone-400 text-sm">
        داده‌های نموداری برای این نماد در دسترس نیست.
      </div>
    );
  }

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // SVG Polyline Calculations
  const chartHeight = 220;
  const chartWidth = 700;

  const pointsString = history
    .map((point, index) => {
      const x = (index / (history.length - 1)) * chartWidth;
      const normalizedY = (point.price - minPrice) / priceRange;
      const y = chartHeight - normalizedY * (chartHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(' ');

  const firstPoint = history[0];
  const lastPoint = history[history.length - 1];
  const isUp = firstPoint && lastPoint ? lastPoint.price >= firstPoint.price : true;
  const strokeColor = isUp ? '#34d399' : '#f87171';
  const fillColor = isUp ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)';

  const areaPoints = `0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`;

  return (
    <div className="rounded-2xl bg-stone-900/80 border border-amber-900/30 p-5 space-y-4 backdrop-blur-md shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
          <span>نمودار روند تغییرات قیمت</span>
          <span className="text-xs font-normal text-stone-400">({unit})</span>
        </h3>

        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
          {(['1D', '7D', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg font-mono transition-all ${
                timeframe === tf
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#chartGradient)" />

          {/* Trend Line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />
        </svg>

        <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-800/80">
          <span>کف قیمت: <strong className="text-stone-200">{toPersianDigits(new Intl.NumberFormat('en-US').format(minPrice))}</strong></span>
          <span>سقف قیمت: <strong className="text-stone-200">{toPersianDigits(new Intl.NumberFormat('en-US').format(maxPrice))}</strong></span>
        </div>
      </div>
    </div>
  );
}
