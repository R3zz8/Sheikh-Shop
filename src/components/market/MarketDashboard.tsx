'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { MarketOverview } from '@/lib/market-data/types';
import { MarketHero } from './MarketHero';
import { FeaturedMarketCards } from './FeaturedMarketCards';
import { MarketTabs } from './MarketTabs';
import { MarketSearch } from './MarketSearch';
import { MarketTable } from './MarketTable';
import { MarketConverter } from './MarketConverter';

interface MarketDashboardProps {
  initialData: MarketOverview;
}

export function MarketDashboard({ initialData }: MarketDashboardProps) {
  const [data, setData] = useState<MarketOverview>(initialData);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sheikh_market_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // ignore local storage error
    }
  }, []);

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      try {
        localStorage.setItem('sheikh_market_favorites', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/market?refresh=true');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (error) {
      console.error('Failed to refresh market data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredQuotes = useMemo(() => {
    return data.quotes.filter((quote) => {
      // Category filter
      if (activeCategory === 'FAVORITES') {
        if (!favorites.includes(quote.symbol)) return false;
      } else if (activeCategory !== 'ALL' && quote.category !== activeCategory) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = quote.nameFa.toLowerCase().includes(query);
        const matchesSymbol = quote.symbol.toLowerCase().includes(query);
        const matchesSlug = quote.slug.toLowerCase().includes(query);
        return matchesName || matchesSymbol || matchesSlug;
      }

      return true;
    });
  }, [data.quotes, activeCategory, searchTerm, favorites]);

  const tabsWithFavorites = useMemo(() => {
    const list = [{ key: 'ALL', labelFa: 'همه بازارها', count: data.quotes.length }];
    if (favorites.length > 0) {
      list.push({ key: 'FAVORITES', labelFa: 'علاقه‌مندی‌ها', count: favorites.length });
    }

    data.categories.forEach((cat) => {
      list.push({
        key: cat.key,
        labelFa: cat.labelFa,
        count: cat.count,
      });
    });

    return list;
  }, [data.categories, data.quotes.length, favorites.length]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <MarketHero
        lastUpdated={data.lastUpdated}
        isStale={data.quotes.some((q) => q.isStale)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Featured Cards */}
      {data.featured && data.featured.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>شاخص‌های برتر بازار</span>
          </h2>
          <FeaturedMarketCards quotes={data.featured} />
        </section>
      )}

      {/* Main Table & Controls */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <MarketTabs
            categories={tabsWithFavorites}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
          <MarketSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>

        <MarketTable
          quotes={filteredQuotes}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      </section>

      {/* Market Converter */}
      <section>
        <MarketConverter quotes={data.quotes} />
      </section>
    </div>
  );
}
