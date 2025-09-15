'use client';

import React, { useState, useEffect } from 'react';
import type { ProductsWithImages } from '@/types';
import ProductItem from './ProductItem';
import { ProductListSkeleton } from '@/components/ui';
import { Search, Filter } from 'lucide-react';
import ProductFilters, { type FilterOptions } from '@/components/products/ProductFilters';


interface ProductListProps {
  products: ProductsWithImages[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

export default function ProductList({
  products,
  isLoading = false,
  title = 'Premium Products',
  subtitle = 'Discover our curated collection of luxury items',
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<ProductsWithImages[]>(products);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    let result = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Apply filters
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.priceRange) {
      result = result.filter(p => {
        const price = (p as any).basePrice ?? (p as any).price ?? 0;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    if (filters.isNew) {
      result = result.filter(p => (p as any).isNew);
    }

    if (filters.isBestSeller) {
      result = result.filter(p => (p as any).isBestSeller);
    }

    if (filters.isAmazing) {
      result = result.filter(p => (p as any).isAmazing);
    }

    if (filters.inStock) {
      result = result.filter(p => (p as any).status === 'ACTIVE' && ((p as any).quantity ?? 0) > 0);
    }

    // Sorting
    if (filters.sortBy) {
      result = [...result].sort((a, b) => {
        const priceA = (a as any).basePrice ?? (a as any).price ?? 0;
        const priceB = (b as any).basePrice ?? (b as any).price ?? 0;
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return priceA - priceB;
          case 'newest':
            return new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime();
          case 'popular':
            return ((b as any).isBestSeller ? 1 : 0) - ((a as any).isBestSeller ? 1 : 0);
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(result);
  }, [searchTerm, products, filters]);

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

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/8 backdrop-blur-sm border border-amber-200/20 rounded-2xl text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-300/40 transition-all duration-300"
              />
            </div>
          </div>
          <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="flex items-center gap-2 px-6 py-3 bg-white/8 backdrop-blur-sm border border-amber-200/20 rounded-2xl text-white hover:bg-white/12 hover:border-amber-300/40 transition-all duration-300">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {isFiltersOpen && (
          <div className="mb-8">
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/8 backdrop-blur-sm border border-amber-200/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
            <p className="text-amber-200/80 max-w-md mx-auto">
              No products match your search criteria. Try adjusting your search terms.
            </p>
          </div>
        )}

        {/* Premium Quality Banner */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/8 backdrop-blur-sm border border-amber-200/20 rounded-2xl">
            <span className="text-amber-300">★</span>
            <span className="text-white font-medium">Premium quality guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
