'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, Calculator } from 'lucide-react';
import type { NormalizedQuote } from '@/lib/market-data/types';
import { toPersianDigits } from '@/lib/market-data/normalize';

interface MarketConverterProps {
  quotes: NormalizedQuote[];
}

export function MarketConverter({ quotes }: MarketConverterProps) {
  const [fromSymbol, setFromSymbol] = useState<string>('USD');
  const [toSymbol, setToSymbol] = useState<string>('GOLD_18K');
  const [amount, setAmount] = useState<number>(100);

  const fromQuote = quotes.find((q) => q.symbol === fromSymbol) || quotes[0];
  const toQuote = quotes.find((q) => q.symbol === toSymbol) || quotes[1];

  const calculateConversion = () => {
    if (!fromQuote || !toQuote) return 0;

    // Convert source to Toman
    const usdQuote = quotes.find((q) => q.symbol === 'USD');
    const usdToman = usdQuote?.currentPrice || 94800;

    const fromToman = fromQuote.market === 'DOMESTIC' ? fromQuote.currentPrice : fromQuote.currentPrice * usdToman;
    const toToman = toQuote.market === 'DOMESTIC' ? toQuote.currentPrice : toQuote.currentPrice * usdToman;

    if (toToman === 0) return 0;
    const result = (amount * fromToman) / toToman;
    return result;
  };

  const convertedValue = calculateConversion();

  const handleSwap = () => {
    const temp = fromSymbol;
    setFromSymbol(toSymbol);
    setToSymbol(temp);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 p-6 border border-amber-900/40 shadow-xl space-y-5">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
        <Calculator className="w-5 h-5 text-amber-500" />
        <h2>مبدل هوشمند ارز و دارایی‌های شیخ</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
        {/* From Amount & Currency */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs text-stone-400">مقدار و دارایی مبدأ</label>
          <div className="flex rounded-xl bg-stone-950 border border-stone-800 focus-within:border-amber-500/60 overflow-hidden">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2.5 bg-transparent text-amber-200 font-extrabold text-sm focus:outline-none"
              placeholder="مقدار"
            />
            <select
              value={fromSymbol}
              onChange={(e) => setFromSymbol(e.target.value)}
              className="bg-stone-900 text-stone-200 text-xs px-3 py-2.5 border-r border-stone-800 focus:outline-none cursor-pointer"
            >
              {quotes.map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.nameFa}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pt-2 md:pt-4">
          <button
            onClick={handleSwap}
            className="p-3 rounded-full bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 text-amber-400 transition-transform active:scale-95"
            aria-label="تعویض مبدأ و مقصد"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To Amount & Currency */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs text-stone-400">نتیجه و دارایی مقصد</label>
          <div className="flex rounded-xl bg-stone-950 border border-stone-800 overflow-hidden">
            <div className="w-full px-3 py-2.5 bg-transparent text-emerald-400 font-extrabold text-sm flex items-center">
              {toPersianDigits(new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(convertedValue))}
            </div>
            <select
              value={toSymbol}
              onChange={(e) => setToSymbol(e.target.value)}
              className="bg-stone-900 text-stone-200 text-xs px-3 py-2.5 border-r border-stone-800 focus:outline-none cursor-pointer"
            >
              {quotes.map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.nameFa}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {fromQuote && toQuote && (
        <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs text-stone-400 flex flex-wrap items-center justify-between gap-2">
          <span>
            نتیجه محاسبه: <strong className="text-amber-300 font-bold">{toPersianDigits(amount)}</strong> {fromQuote.nameFa} معادل{' '}
            <strong className="text-emerald-300 font-bold">
              {toPersianDigits(new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(convertedValue))}
            </strong>{' '}
            {toQuote.nameFa} می‌باشد.
          </span>
          <span className="text-stone-500 text-[11px]">نرخ بر اساس محاسبه رسمی Toman/USD</span>
        </div>
      )}
    </div>
  );
}
