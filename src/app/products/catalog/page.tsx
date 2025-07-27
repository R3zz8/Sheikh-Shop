import CatalogList from '@/components/catalog/List';
import { Button } from '@/components/ui';
import Link from 'next/link';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
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

        {/* Back button */}
        <div className="container mx-auto pb-16 text-center">
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 text-white font-bold py-3 px-8 rounded-xl border border-white/20 shadow-lg hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm"
          >
            <Link href="/products" className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back To Product List
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Catalog;
