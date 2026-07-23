'use client';

import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FilterOptions {
  category?: string;
  priceRange?: [number, number];
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
  inStock?: boolean;
  onSale?: boolean;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const categories = [
  { value: 'HONEY', label: 'Honey' },
  { value: 'SAFFRON', label: 'Saffron' },
  { value: 'DATES', label: 'Dates' },
  { value: 'SheikhHome', label: 'Sheikh Home' },
  { value: 'OTHERS', label: 'Others' },
];

const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

const priceRanges = [
  { value: [0, 25], label: 'Under $25' },
  { value: [25, 50], label: '$25 - $50' },
  { value: [50, 100], label: '$50 - $100' },
  { value: [100, 200], label: '$100 - $200' },
  { value: [200, 1000], label: 'Over $200' },
];

export default function ProductFilters({ onFiltersChange, className = '' }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'name',
  });

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = { sortBy: 'name' };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    if (key === 'sortBy') return filters[key] !== 'name';
    return filters[key as keyof FilterOptions] !== undefined;
  });

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-6">
          {/* Sort By */}
          <div>
            <h3 id="sort-by-label" className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
            <select
              value={filters.sortBy || 'name'}
              onChange={(e) => updateFilters({ sortBy: e.target.value as 'name' | 'price_asc' | 'price_desc' | 'newest' | 'popular' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              aria-labelledby="sort-by-label"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.value} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={filters.category === category.value}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={!filters.category}
                  onChange={() => updateFilters({ category: undefined })}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">All Categories</span>
              </label>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    value={range.value.join(',')}
                    checked={filters.priceRange?.[0] === range.value[0] && filters.priceRange?.[1] === range.value[1]}
                    onChange={() => updateFilters({ priceRange: range.value as [number, number] })}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  value=""
                  checked={!filters.priceRange}
                  onChange={() => updateFilters({ priceRange: undefined })}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">All Prices</span>
              </label>
            </div>
          </div>

          {/* Availability Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => updateFilters({ inStock: e.target.checked || undefined })}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.onSale || false}
                  onChange={(e) => updateFilters({ onSale: e.target.checked || undefined })}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">On Sale</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
