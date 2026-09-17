'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus, DollarSign, Sparkles, Disc, Flame } from 'lucide-react';
import type { NormalizedQuote } from '@/lib/market-data/types';
import { formatMarketValue, toPersianDigits } from '@/lib/market-data/normalize';

interface FeaturedMarketCardsProps {
  quotes: NormalizedQuote[];
}

export function FeaturedMarketCards({ quotes }: FeaturedMarketCardsProps) {
  const getIcon = (symbol: string) => {
    switch (symbol) {
      case 'USD':
        return <DollarSign className="w-5 h-5 text-amber-400" />;
      case 'GOLD_18K':
        return <Sparkles className="w-5 h-5 text-amber-300" />;
      case 'COIN_EMAMI':
        return <Disc className="w-5 h-5 text-amber-400" />;
      case 'BRENT_OIL':
        return <Flame className="w-5 h-5 text-amber-500" />;
      default:
        return <DollarSign className="w-5 h-5 text-amber-400" />;
    }
  };

  const renderSparkline = (sparkline?: number[], isUp?: boolean, isDown?: boolean) => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 100;
    const height = 28;

    const points = sparkline
      .map((val, idx) => {
        const x = (idx / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isUp ? '#34d399' : isDown ? '#f87171' : '#a8a29e';

    return (
      <svg className="w-24 h-7 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quotes.map((quote) => {
        const isUp = quote.direction === 'UP';
        const isDown = quote.direction === 'DOWN';
        const statusText = isUp ? 'صعودی' : isDown ? 'نزولی' : 'بدون تغییر';

        return (
          <Link
            key={quote.symbol}
            href={`/market/${quote.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900/90 to-stone-950/90 hover:from-stone-800/90 hover:to-stone-900/90 border border-amber-900/30 hover:border-amber-500/50 p-4 transition-all duration-300 shadow-xl hover:shadow-amber-900/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/40 group-hover:scale-105 transition-transform">
                  {getIcon(quote.symbol)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    {quote.nameFa}
                  </h3>
                  <span className="text-xs font-mono text-stone-400">{quote.symbol}</span>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isUp
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                    : isDown
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                    : 'bg-stone-800 text-stone-300 border border-stone-700'
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : isDown ? (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                <span>{statusText}</span>
                <span dir="ltr">({toPersianDigits(Math.abs(quote.percentChange))}%)</span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 pt-1">
              <div className="space-y-1">
                <div className="text-xl font-black text-amber-200">
                  {formatMarketValue(quote.currentPrice, quote.unit)}
                </div>

                {quote.buyPrice && quote.sellPrice && (
                  <div className="flex items-center gap-3 text-[11px] text-stone-400">
                    <span>خرید: {toPersianDigits(new Intl.NumberFormat('en-US').format(quote.buyPrice))}</span>
                    <span>فروش: {toPersianDigits(new Intl.NumberFormat('en-US').format(quote.sellPrice))}</span>
                  </div>
                )}
              </div>

              <div className="pb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {renderSparkline(quote.sparkline, isUp, isDown)}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
