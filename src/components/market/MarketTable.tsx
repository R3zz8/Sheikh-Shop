'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus, Star } from 'lucide-react';
import type { NormalizedQuote } from '@/lib/market-data/types';
import { formatMarketValue, toPersianDigits } from '@/lib/market-data/normalize';

interface MarketTableProps {
  quotes: NormalizedQuote[];
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
}

export function MarketTable({ quotes, favorites, onToggleFavorite }: MarketTableProps) {
  if (quotes.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800">
        <p className="text-stone-400 text-sm">هیچ دارایی یا نمادی مطابق با فیلتر یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-amber-900/30 bg-stone-900/60 backdrop-blur-md shadow-xl">
      <table className="w-full text-right text-sm">
        <thead className="bg-stone-950/80 text-amber-300/80 text-xs uppercase border-b border-amber-900/30">
          <tr>
            <th className="p-3 sm:p-4 w-10 text-center">نشان</th>
            <th className="p-3 sm:p-4">دارایی / نماد</th>
            <th className="p-3 sm:p-4">قیمت لحظه‌ای</th>
            <th className="p-3 sm:p-4 hidden sm:table-cell">خرید / فروش</th>
            <th className="p-3 sm:p-4">تغییر ۲۴h</th>
            <th className="p-3 sm:p-4 text-center">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-800/60 text-stone-200">
          {quotes.map((quote) => {
            const isUp = quote.direction === 'UP';
            const isDown = quote.direction === 'DOWN';
            const isFav = favorites.includes(quote.symbol);

            return (
              <tr
                key={quote.symbol}
                className="hover:bg-stone-800/50 transition-colors group"
              >
                <td className="p-3 sm:p-4 text-center">
                  <button
                    onClick={() => onToggleFavorite(quote.symbol)}
                    className="p-1 rounded hover:bg-stone-700/50 transition-colors text-stone-400 hover:text-amber-400"
                    aria-label={`افزودن ${quote.nameFa} به علاقه‌مندی‌ها`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isFav ? 'fill-amber-400 text-amber-400' : 'text-stone-500'
                      }`}
                    />
                  </button>
                </td>

                <td className="p-3 sm:p-4">
                  <Link href={`/market/${quote.slug}`} className="block">
                    <div className="font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                      {quote.nameFa}
                    </div>
                    <div className="text-xs font-mono text-stone-400">{quote.symbol}</div>
                  </Link>
                </td>

                <td className="p-3 sm:p-4 font-extrabold text-amber-200">
                  {formatMarketValue(quote.currentPrice, quote.unit)}
                </td>

                <td className="p-3 sm:p-4 hidden sm:table-cell text-xs text-stone-400">
                  {quote.buyPrice && quote.sellPrice ? (
                    <div className="space-y-0.5">
                      <div>خرید: {toPersianDigits(new Intl.NumberFormat('en-US').format(quote.buyPrice))}</div>
                      <div>فروش: {toPersianDigits(new Intl.NumberFormat('en-US').format(quote.sellPrice))}</div>
                    </div>
                  ) : (
                    <span className="text-stone-600">—</span>
                  )}
                </td>

                <td className="p-3 sm:p-4">
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
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
                </td>

                <td className="p-3 sm:p-4 text-center">
                  <Link
                    href={`/market/${quote.slug}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 transition-colors"
                  >
                    نمودار و جزئیات
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
