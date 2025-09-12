'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FilterOptions {
  category?: string;
  priceRange?: { min: number; max: number };
  sortBy?: 'name' | 'price' | 'newest' | 'popular';
  inStock?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isAmazing?: boolean;
}

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const categories = [
  { value: 'HONEY', label: 'Honey' },
  { value: 'SAFFRON', label: 'Saffron' },
  { value: 'DATES', label: 'Dates' },
  { value: 'OTHERS', label: 'Others' },
];

const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'price', label: 'Price Low-High' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

const priceRanges = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: Infinity },
];

export default function ProductFilters({ 
  filters, 
  onFiltersChange, 
  className = '' 
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof FilterOptions];
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className={`${className}`}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <button
              onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full text-left font-medium"
            >
              <span>Category</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'category' ? 'rotate-180' : ''}`} />
            </button>
            {activeSection === 'category' && (
              <div className="mt-2 space-y-2">
                {categories.map((category) => (
                  <label key={category.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={filters.category === category.value}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm">{category.label}</span>
                  </label>
                ))}
                {filters.category && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('category')}
                    className="text-red-600 hover:text-red-700 p-0 h-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-left font-medium"
            >
              <span>Price Range</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'price' ? 'rotate-180' : ''}`} />
            </button>
            {activeSection === 'price' && (
              <div className="mt-2 space-y-2">
                {priceRanges.map((range, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={
                        filters.priceRange?.min === range.min && 
                        filters.priceRange?.max === range.max
                      }
                      onChange={() => updateFilter('priceRange', { min: range.min, max: range.max })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm">{range.label}</span>
                  </label>
                ))}
                {filters.priceRange && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('priceRange')}
                    className="text-red-600 hover:text-red-700 p-0 h-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Special Filters */}
          <div>
            <button
              onClick={() => toggleSection('special')}
              className="flex items-center justify-between w-full text-left font-medium"
            >
              <span>Special Offers</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'special' ? 'rotate-180' : ''}`} />
            </button>
            {activeSection === 'special' && (
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isNew || false}
                    onChange={(e) => updateFilter('isNew', e.target.checked || undefined)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm">New Products</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isBestSeller || false}
                    onChange={(e) => updateFilter('isBestSeller', e.target.checked || undefined)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm">Best Sellers</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isAmazing || false}
                    onChange={(e) => updateFilter('isAmazing', e.target.checked || undefined)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm">Amazing Deals</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.inStock || false}
                    onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div>
            <button
              onClick={() => toggleSection('sort')}
              className="flex items-center justify-between w-full text-left font-medium"
            >
              <span>Sort By</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'sort' ? 'rotate-180' : ''}`} />
            </button>
            {activeSection === 'sort' && (
              <div className="mt-2 space-y-2">
                {sortOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={filters.sortBy === option.value}
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
                {filters.sortBy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('sortBy')}
                    className="text-red-600 hover:text-red-700 p-0 h-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





