'use client';

import React, { useState, useEffect } from 'react';
import type { ProductsWithImages, Unit } from '@/types';
import ProductItem from './ProductItem';
import ProductItemResponsive from './ProductItemResponsive';
import ProductCarouselMobile from '@/components/product/ProductCarouselMobile';
import { ProductListSkeleton } from '@/components/ui';
import { Search, Filter, Grid, Smartphone } from 'lucide-react';

interface ProductListProps {
  products: ProductsWithImages[];
  units?: Unit[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  mobileLayout?: 'grid' | 'carousel' | 'auto';
}

export default function ProductList({
  products,
  units,
  isLoading = false,
  title = 'Premium Products',
  subtitle = 'Discover our curated collection of luxury items',
  mobileLayout = 'auto',
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
      <div className="min-h-screen bg-gray-900">
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
    <div className="min-h-screen relative bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95">
      <div className="absolute inset-0 bg-[url('/public/assets/pattern.png')] opacity-5"></div>
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400">{subtitle}</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter
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

          {/* Debug Info */}
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              Debug: Products count: {products?.length || 0}, Filtered: {filteredProducts?.length || 0}
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
                  <div className="grid grid-cols-2 gap-4">
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

              {/* Desktop: Responsive Grid */}
              <div className="hidden md:block">
                <div className="responsive-grid gap-6">
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
                  ? 'No products match your search criteria.' 
                  : 'No products available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
