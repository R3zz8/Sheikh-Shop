'use client';

import React, { useState, useEffect } from 'react';
import type { ProductsWithImages, Unit } from '@/types';
import ProductItemResponsive from './ProductItemResponsive';
import ProductCarouselMobile from '@/components/product/ProductCarouselMobile';
import { ProductListSkeleton } from '@/components/ui';
import { Search, Filter, Grid, Smartphone } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LuxuryPagination from '@/components/ui/LuxuryPagination';

const SpeakerDecoration = dynamic(
  () => import('@/components/sheikhDigital/SpeakerDecoration'),
  { ssr: false }
);

const HeadphoneDecoration = dynamic(
  () => import('@/components/sheikhDigital/HeadphoneDecoration'),
  { ssr: false }
);

const RefrigeratorDecoration = dynamic(
  () => import('@/components/sheikhHome/RefrigeratorDecoration'),
  { ssr: false }
);

const WashingMachineDecoration = dynamic(
  () => import('@/components/sheikhHome/WashingMachineDecoration'),
  { ssr: false }
);

interface ProductListProps {
  products: ProductsWithImages[];
  units?: Unit[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  mobileLayout?: 'grid' | 'carousel' | 'auto';
  variant?: 'default' | 'digital' | 'home';
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

  // Pagination-specific states
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isPageChanging, setIsPageChanging] = useState(false);

  // Next.js Navigation Hooks
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Parse current page from URL
  const urlPage = searchParams ? parseInt(searchParams.get('page') || '1', 10) : 1;
  const [currentPage, setCurrentPage] = useState(urlPage);

  // Sync state with URL parameter (for back/forward browser navigation)
  useEffect(() => {
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [urlPage]);

  // Responsive Items Per Page handler
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setItemsPerPage(12);
      } else if (width >= 768) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(10);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  console.log('ProductList render:', { products, units, filteredProducts, isLoading, itemsPerPage, currentPage });

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Clamping page if it gets out of bounds due to search/filters changing
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      const params = new URLSearchParams(window.location.search);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setCurrentPage(1);
    }
  }, [filteredProducts.length, itemsPerPage, totalPages, currentPage, pathname, router]);

  // Page changing handler
  const handlePageChange = (newPage: number) => {
    setIsPageChanging(true);

    // Smooth scroll to product section
    const container = document.getElementById('product-list-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Delay update slightly to let the smooth scroll trigger and show the premium skeleton
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      params.set('page', newPage.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setCurrentPage(newPage);

      setTimeout(() => {
        setIsPageChanging(false);
      }, 250);
    }, 200);
  };

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

  // Get active products slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Debug: Show products count
  console.log('About to render products:', { productsCount: products?.length, filteredCount: filteredProducts?.length, paginatedCount: paginatedProducts.length });

  return (
    <div id="product-list-container" className="min-h-screen relative bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 font-vazirmatn scroll-mt-24" dir="rtl">
      <div className="absolute inset-0 bg-[url('/public/assets/pattern.png')] opacity-5"></div>
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-gray-400">{subtitle}</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-row items-center justify-between w-full gap-2 sm:gap-4 mb-8">
            {/* Speaker or Washing Machine (Rightmost under RTL) - Hidden on extra small screens */}
            {variant === 'digital' && (
              <div className="hidden sm:flex shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] items-center justify-center">
                <SpeakerDecoration />
              </div>
            )}
            {variant === 'home' && (
              <div className="hidden sm:flex shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] items-center justify-center">
                <WashingMachineDecoration />
              </div>
            )}

            {/* Central Search Bar Box inside premium glass card with subtle animated gold glow */}
            <div className={`flex-1 w-full ${
              variant === 'digital' || variant === 'home'
                ? 'p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1c110a]/80 via-[#23150c]/85 to-[#1c110a]/80 border border-amber-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all duration-300 hover:border-amber-500/40'
                : 'mb-0'
            }`}>
              {/* Gold glow animation behind */}
              {(variant === 'digital' || variant === 'home') && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
                  <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes shimmer {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(100%); }
                    }
                  `}} />
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                <div className="relative w-full max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="جستجوی محصولات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pr-10 pl-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right transition-colors duration-300 ${
                      variant === 'digital' || variant === 'home'
                        ? 'border-amber-500/20 hover:border-amber-500/40'
                        : 'border-white/20'
                    }`}
                  />
                </div>
                <div className="flex gap-2 items-center flex-nowrap">
                  {/* Headphones or Washing Machine (Right on RTL) - Only visible on Mobile */}
                  {variant === 'digital' && (
                    <div className="md:hidden shrink-0 flex items-center justify-center w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 min-[412px]:w-11 min-[412px]:h-11">
                      <HeadphoneDecoration className="w-full h-full animate-[fade-in_0.5s_ease-out_forwards]" />
                    </div>
                  )}
                  {variant === 'home' && (
                    <div className="md:hidden shrink-0 flex items-center justify-center w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 min-[412px]:w-11 min-[412px]:h-11">
                      <WashingMachineDecoration className="w-full h-full animate-[fade-in_0.5s_ease-out_forwards]" />
                    </div>
                  )}

                  {/* Mobile Layout Toggle - Only visible on mobile */}
                  <div className="md:hidden flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden shrink-0">
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

                  <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 shrink-0">
                    <Filter className="w-5 h-5" />
                    فیلتر
                  </button>

                  {/* Speaker or Refrigerator (Left on RTL) - Only visible on Mobile */}
                  {variant === 'digital' && (
                    <div className="md:hidden shrink-0 flex items-center justify-center w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 min-[412px]:w-11 min-[412px]:h-11">
                      <SpeakerDecoration className="w-full h-full animate-[fade-in_0.5s_ease-out_forwards]" />
                    </div>
                  )}
                  {variant === 'home' && (
                    <div className="md:hidden shrink-0 flex items-center justify-center w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 min-[412px]:w-11 min-[412px]:h-11">
                      <RefrigeratorDecoration className="w-full h-full animate-[fade-in_0.5s_ease-out_forwards]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Headphone or Refrigerator (Leftmost under RTL) */}
            {variant === 'digital' && (
              <div className="hidden sm:flex shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] items-center justify-center">
                <HeadphoneDecoration />
              </div>
            )}
            {variant === 'home' && (
              <div className="hidden sm:flex shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] items-center justify-center">
                <RefrigeratorDecoration />
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-right">
            <p className="text-blue-300 text-sm">
              دیباگ: تعداد کل محصولات: {products?.length || 0}، فیلتر شده: {filteredProducts?.length || 0}، صفحه: {currentPage} از {totalPages || 1}
            </p>
          </div>

          {/* Products Display Container with AnimatePresence to prevent flashing */}
          <AnimatePresence mode="wait">
            {isPageChanging ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                <ProductListSkeleton count={itemsPerPage} />
              </motion.div>
            ) : paginatedProducts && paginatedProducts.length > 0 ? (
              <motion.div
                key="products-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                {/* Mobile: Carousel or Grid based on selection */}
                <div className="md:hidden">
                  {currentMobileLayout === 'carousel' ? (
                    <motion.div
                      key={`carousel-${currentPage}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <ProductCarouselMobile
                        products={paginatedProducts}
                        units={units}
                        title=""
                        subtitle=""
                        autoplay={true}
                        showPagination={true}
                        showNavigation={false}
                      />
                    </motion.div>
                  ) : (
                    <div id="mobile-product-grid" className="grid grid-cols-2 gap-3 sm:gap-4">
                      {paginatedProducts.map((product, index) => (
                        <motion.div
                          key={`${product.id}-${currentPage}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.02 }}
                        >
                          <ProductItemResponsive
                            product={product}
                            index={index}
                            units={units}
                            variant="compact"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop: Responsive Grid (min 3 cols) */}
                <div className="hidden md:block">
                  <div id="desktop-product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 auto-rows-fr">
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        key={`${product.id}-${currentPage}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.02 }}
                        className="h-full"
                      >
                        <ProductItemResponsive
                          product={product}
                          index={index}
                          units={units}
                          variant="auto"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 w-full"
              >
                <p className="text-gray-400 text-lg">
                  {products && products.length > 0
                    ? 'هیچ محصولی با معیارهای جستجوی شما مطابقت ندارد.'
                    : 'در حال حاضر هیچ محصولی موجود نیست.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Luxury Pagination Controls */}
          <LuxuryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
