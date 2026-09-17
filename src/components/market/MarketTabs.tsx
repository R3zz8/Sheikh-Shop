'use client';

import React from 'react';
import type { MarketCategory } from '@/lib/market-data/types';

interface MarketTabsProps {
  categories: { key: string; labelFa: string; count?: number }[];
  activeCategory: string;
  onSelectCategory: (key: string) => void;
}

export function MarketTabs({
  categories,
  activeCategory,
  onSelectCategory,
}: MarketTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-800/80">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.key;

        return (
          <button
            key={cat.key}
            onClick={() => onSelectCategory(cat.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive
                ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800/80'
            }`}
          >
            <span>{cat.labelFa}</span>
            {typeof cat.count === 'number' && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-stone-950/30 text-stone-950' : 'bg-stone-800 text-amber-400'
                }`}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
