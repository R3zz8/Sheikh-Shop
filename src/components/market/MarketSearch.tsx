'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface MarketSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function MarketSearch({ searchTerm, onSearchChange }: MarketSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-amber-500/70">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="جستجوی نام ارز، طلا، سکه یا نماد..."
        className="w-full pr-10 pl-10 py-2.5 rounded-xl bg-stone-900/80 border border-stone-800 focus:border-amber-500/60 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
      />

      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400 hover:text-stone-200"
          aria-label="پاک کردن جستجو"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
