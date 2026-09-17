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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quotes.map((quote) => {
        const isUp = quote.direction === 'UP';
        const isDown = quote.direction === 'DOWN';

        return (
          <Link
            key={quote.symbol}
            href={`/market/${quote.slug}`}
            className="group relative overflow-hidden rounded-xl bg-stone-900/80 hover:bg-stone-800/90 border border-amber-900/30 hover:border-amber-500/50 p-4 transition-all duration-300 shadow-lg hover:shadow-amber-900/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/40 group-hover:scale-105 transition-transform">
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
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold ${
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
                <span dir="ltr">{toPersianDigits(Math.abs(quote.percentChange))}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-black text-amber-200">
                {formatMarketValue(quote.currentPrice, quote.unit)}
              </div>

              {quote.buyPrice && quote.sellPrice && (
                <div className="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-stone-800/60">
                  <span>خرید: {toPersianDigits(new Intl.NumberFormat('en-US').format(quote.buyPrice))}</span>
                  <span>فروش: {toPersianDigits(new Intl.NumberFormat('en-US').format(quote.sellPrice))}</span>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
