'use client';

import React, { useState, useEffect } from 'react';
import type { ProductsWithImages, Unit } from '@/types';
import ProductItemResponsive from './ProductItemResponsive';
import ProductCarouselMobile from '@/components/product/ProductCarouselMobile';
import { ProductListSkeleton } from '@/components/ui';
import { Search, Filter, Grid, Smartphone } from 'lucide-react';
import dynamic from 'next/dynamic';

const SpeakerDecoration = dynamic(
  () => import('@/components/sheikhDigital/SpeakerDecoration'),
  { ssr: false }
);

const HeadphoneDecoration = dynamic(
  () => import('@/components/sheikhDigital/HeadphoneDecoration'),
  { ssr: false }
);

interface ProductListProps {
  products: ProductsWithImages[];
  units?: Unit[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  mobileLayout?: 'grid' | 'carousel' | 'auto';
  variant?: 'default' | 'digital';
}

export default function ProductList({
  products,
  units,
  isLoading = false,
  title = 'محصولات ویژه',
  subtitle = 'مجموعه انحصاری محصولات لوکس و اصیل ما را کشف کنید',
  mobileLayout = 'auto',
  variant = 'default',
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<ProductsWithImages[]>(products);
  const [currentMobileLayout, setCurrentMobileLayout] = useState<'grid' | 'carousel'>(mobileLayout === 'auto' ? 'grid' : mobileLayout);

  console.log('ProductList render:', { products, units, filteredProducts, isLoading });

  // Update filteredProducts when products change
  useEffect(() => {
    console.log('ProductList useEffect - setting filteredProducts:', products);
    setFilteredProducts(products);
  }, [products]);

  // Filter products when search term changes
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 font-vazirmatn" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400">{subtitle}</p>
          </div>
          <ProductListSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Debug: Show products count
  console.log('About to render products:', { productsCount: products?.length, filteredCount: filteredProducts?.length });

  return (
    <div className={`min-h-screen relative font-vazirmatn ${
      variant === 'digital'
        ? 'bg-transparent'
        : 'bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95'
    }`} dir="rtl">
      <div className="absolute inset-0 bg-[url('/public/assets/pattern.png')] opacity-5"></div>
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">

          {/* Main Title & Subtitle */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent leading-none drop-shadow-md">
              {title}
            </h1>
            <p className="text-stone-400 mt-3 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Search and Filter / 3D Layout Section */}
          {variant === 'digital' ? (
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-8 mb-12">
              {/* 1. Headphones (Right/Top in RTL, physically right on Desktop, top on Mobile) */}
              <div className="w-full md:w-1/4 flex items-center justify-center min-h-[160px] md:min-h-[220px]">
                <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] relative transition-transform duration-500 hover:scale-105">
                  <HeadphoneDecoration />
                </div>
              </div>

              {/* 2. Central Search Bar with premium glass panel */}
              <div className="w-full md:w-2/4 flex-1">
                <div className="p-5 sm:p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-[#1c110a]/80 via-[#23150c]/85 to-[#1c110a]/80 border border-amber-500/20 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden group transition-all duration-300 hover:border-amber-500/30">
                  {/* Subtle animated shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full animate-[shimmer_4s_infinite] pointer-events-none" />

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                    <div className="relative w-full">
                      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-500/60 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="جستجو در محصولات دیجیتال..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-3.5 bg-[#0e0704]/95 backdrop-blur-md border border-amber-500/20 rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 text-right transition-all duration-300"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                      <button className="flex-1 sm:flex-initial px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.15)] active:scale-[0.98]">
                        <Filter className="w-5 h-5" />
                        فیلتر
                      </button>

                      {/* Mobile Layout Toggle - Only visible on mobile */}
                      <div className="md:hidden flex bg-white/5 backdrop-blur-md border border-amber-500/10 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setCurrentMobileLayout('grid')}
                          className={`px-4 py-3.5 flex items-center gap-1 transition-colors duration-200 ${
                            currentMobileLayout === 'grid'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentMobileLayout('carousel')}
                          className={`px-4 py-3.5 flex items-center gap-1 transition-colors duration-200 ${
                            currentMobileLayout === 'carousel'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Speaker (Left/Bottom in RTL, physically left on Desktop, bottom on Mobile) */}
              <div className="w-full md:w-1/4 flex items-center justify-center min-h-[160px] md:min-h-[220px]">
                <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] relative transition-transform duration-500 hover:scale-105">
                  <SpeakerDecoration />
                </div>
              </div>
            </div>
          ) : (
            /* Standard Search and Filter Bar */
            <div className="flex flex-row items-center justify-between w-full gap-2 sm:gap-4 mb-8">
              <div className="flex-1 w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="جستجوی محصولات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right transition-colors duration-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      فیلتر
                    </button>

                    {/* Mobile Layout Toggle - Only visible on mobile */}
                    <div className="md:hidden flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setCurrentMobileLayout('grid')}
                        className={`px-3 py-3 flex items-center gap-1 transition-colors duration-200 ${
                          currentMobileLayout === 'grid'
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentMobileLayout('carousel')}
                        className={`px-3 py-3 flex items-center gap-1 transition-colors duration-200 ${
                          currentMobileLayout === 'carousel'
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-right">
            <p className="text-blue-300 text-sm">
              دیباگ: تعداد کل محصولات: {products?.length || 0}، فیلتر شده: {filteredProducts?.length || 0}
            </p>
          </div>

          {/* Products Display */}
          {filteredProducts && filteredProducts.length > 0 ? (
            <>
              {/* Mobile: Carousel or Grid based on selection */}
              <div className="md:hidden">
                {currentMobileLayout === 'carousel' ? (
                  <ProductCarouselMobile
                    products={filteredProducts}
                    units={units}
                    title=""
                    subtitle=""
                    autoplay={true}
                    showPagination={true}
                    showNavigation={false}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {filteredProducts.map((product, index) => (
                      <ProductItemResponsive 
                        key={product.id} 
                        product={product} 
                        index={index} 
                        units={units}
                        variant="compact"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: Responsive Grid (min 3 cols) */}
              <div className="hidden md:block">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 auto-rows-fr">
                  {filteredProducts.map((product, index) => (
                    <ProductItemResponsive 
                      key={product.id} 
                      product={product} 
                      index={index} 
                      units={units}
                      variant="auto"
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {products && products.length > 0 
                  ? 'هیچ محصولی با معیارهای جستجوی شما مطابقت ندارد.'
                  : 'در حال حاضر هیچ محصولی موجود نیست.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
