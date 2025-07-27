import CatalogList from '@/components/catalog/List';
import CatalogSelector from '@/components/catalog/Selector';
import React from 'react';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

function Catalog() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-orange-500/3 to-yellow-500/5 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/3 via-transparent to-orange-500/3 pointer-events-none" />

      <div className="relative z-10">
        {/* Header with theme switcher */}
        <div className="container mx-auto px-6 pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <span className="text-gray-200 text-sm hidden sm:block">Product Gallery</span>
            </div>
          </div>
        </div>

        <CatalogList />
        <CatalogSelector />
      </div>
    </div>
  );
}

export default Catalog;
