'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus, Star, ChevronLeft } from 'lucide-react';
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

  const renderSparkline = (sparkline?: number[], isUp?: boolean, isDown?: boolean) => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = sparkline
      .map((val, idx) => {
        const x = (idx / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isUp ? '#34d399' : isDown ? '#f87171' : '#a8a29e';

    return (
      <svg className="w-20 h-6 overflow-visible opacity-80" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Desktop Terminal Table (>=768px) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-amber-900/30 bg-stone-900/60 backdrop-blur-md shadow-xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-stone-950/80 text-amber-300/80 text-xs uppercase border-b border-amber-900/30">
            <tr>
              <th className="p-4 w-12 text-center">نشان</th>
              <th className="p-4">دارایی</th>
              <th className="p-4">نماد</th>
              <th className="p-4">آخرین نرخ</th>
              <th className="p-4">تغییر ۲۴h</th>
              <th className="p-4">وضعیت</th>
              <th className="p-4 text-center">روند</th>
              <th className="p-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60 text-stone-200">
            {quotes.map((quote) => {
              const isUp = quote.direction === 'UP';
              const isDown = quote.direction === 'DOWN';
              const isFav = favorites.includes(quote.symbol);
              const statusText = isUp ? 'صعودی' : isDown ? 'نزولی' : 'بدون تغییر';

              return (
                <tr
                  key={quote.symbol}
                  className="hover:bg-stone-800/50 transition-colors group"
                >
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onToggleFavorite(quote.symbol)}
                      className="p-1 rounded hover:bg-stone-700/50 transition-colors text-stone-400 hover:text-amber-400 cursor-pointer"
                      aria-label={`افزودن ${quote.nameFa} به علاقه‌مندی‌ها`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? 'fill-amber-400 text-amber-400' : 'text-stone-500'
                        }`}
                      />
                    </button>
                  </td>

                  <td className="p-4">
                    <Link href={`/market/${quote.slug}`} className="block font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                      {quote.nameFa}
                    </Link>
                  </td>

                  <td className="p-4 font-mono text-xs text-stone-400">
                    {quote.symbol}
                  </td>

                  <td className="p-4 font-extrabold text-amber-200">
                    {formatMarketValue(quote.currentPrice, quote.unit)}
                  </td>

                  <td className="p-4">
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

                  <td className="p-4 text-xs font-semibold text-stone-300">
                    {statusText}
                  </td>

                  <td className="p-4 text-center">
                    {renderSparkline(quote.sparkline, isUp, isDown)}
                  </td>

                  <td className="p-4 text-center">
                    <Link
                      href={`/market/${quote.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 transition-colors"
                    >
                      <span>جزئیات</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact Terminal Cards (<768px) */}
      <div className="md:hidden space-y-3">
        {quotes.map((quote) => {
          const isUp = quote.direction === 'UP';
          const isDown = quote.direction === 'DOWN';
          const isFav = favorites.includes(quote.symbol);
          const statusText = isUp ? 'صعودی' : isDown ? 'نزولی' : 'بدون تغییر';

          return (
            <div
              key={quote.symbol}
              className="rounded-2xl bg-stone-900/80 border border-amber-900/30 p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onToggleFavorite(quote.symbol)}
                    className="p-1 rounded hover:bg-stone-800 text-stone-400"
                    aria-label={`افزودن ${quote.nameFa} به علاقه‌مندی‌ها`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isFav ? 'fill-amber-400 text-amber-400' : 'text-stone-500'
                      }`}
                    />
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-stone-100">{quote.nameFa}</h3>
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

              <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                <div>
                  <div className="text-xs text-stone-400">آخرین نرخ</div>
                  <div className="text-base font-extrabold text-amber-200">
                    {formatMarketValue(quote.currentPrice, quote.unit)}
                  </div>
                </div>

                <Link
                  href={`/market/${quote.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/50 border border-amber-800/50"
                >
                  <span>جزئیات</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
