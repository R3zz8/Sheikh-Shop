import React from 'react';
import ProductItem from './ProductItem';
import { ProductsWithImages } from '@/types';
import { Sparkles, Star, Filter, Search, Grid, List } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function productList(props: { products: ProductsWithImages[] }) {
  const { products } = props;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative -mx-4 -mt-28 md:-mx-20">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

      {/* Refined floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-full animate-particle-float",
              i % 3 === 0 && "bg-amber-300/20",
              i % 3 === 1 && "bg-yellow-300/15",
              i % 3 === 2 && "bg-orange-300/18",
              i % 4 === 0 && "w-1.5 h-1.5",
              i % 4 === 1 && "w-1 h-1",
              i % 4 === 2 && "w-0.5 h-0.5",
              i % 4 === 3 && "w-2 h-2"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
              opacity: 0.2 + Math.random() * 0.3
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-16 pt-40">
        {/* Header with theme switcher and controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="hidden sm:flex items-center gap-2 text-gray-200 text-sm">
              <span>Premium Collection</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 bg-white/8 backdrop-blur-sm border border-white/20"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 bg-white/8 backdrop-blur-sm border border-white/20"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced page title with refined typography */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent tracking-tight">
              Premium Products
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
          </div>
          <p className="text-gray-200 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-light px-4">
            Discover our exclusive collection of premium products with exceptional quality and craftsmanship
          </p>

          {/* Product count badge */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
            <Star className="w-4 h-4 text-amber-300" />
            <span className="text-gray-200 text-sm font-medium">
              {products.length} Premium Items Available
            </span>
          </div>
        </div>

        {/* Desktop controls */}
        <div className="hidden sm:flex items-center justify-between mb-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="bg-white/8 backdrop-blur-sm border border-white/20 text-white hover:bg-white/12"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Products
            </Button>
            <Button
              variant="ghost"
              className="bg-white/8 backdrop-blur-sm border border-white/20 text-white hover:bg-white/12"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 bg-white/8 backdrop-blur-sm border border-white/20 text-white hover:bg-white/12"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 bg-white/8 backdrop-blur-sm border border-white/20 text-white hover:bg-white/12"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products grid - enhanced spacing and responsive design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {products.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "animate-slide-in-up",
                index % 4 === 0 && "stagger-1",
                index % 4 === 1 && "stagger-2",
                index % 4 === 2 && "stagger-3",
                index % 4 === 3 && "stagger-4"
              )}
            >
              <ProductItem product={item} />
            </div>
          ))}
        </div>

        {/* Enhanced empty state */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl p-12 max-w-md mx-auto animate-fade-in">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-xl font-medium mb-2">No products available</p>
              <p className="text-gray-500 text-sm">Check back soon for our latest premium collection.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-gray-200 text-sm">
              Premium quality guaranteed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default productList;
