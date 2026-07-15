'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Search, X, Filter, SortAsc, Sparkles, TrendingUp, Brain, Zap, Target, Lightbulb } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';

interface EnhancedSearchResult {
  product: ProductsWithImages;
  score: number;
  highlights: string[];
  matchedFields: string[];
  semanticScore: number;
  keywordScore: number;
  typoTolerance: number;
  confidence: number;
  explanation?: string;
}

interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand' | 'query' | 'typo_correction';
  count?: number;
  confidence?: number;
  originalText?: string;
}

interface EnhancedAISearchProps {
  onResultClick?: (product: ProductsWithImages) => void;
  placeholder?: string;
  className?: string;
  showAdvancedOptions?: boolean;
  showVRStoreButton?: boolean;
}

export default function EnhancedAISearch({ 
  onResultClick, 
  placeholder = "جستجو با هوش مصنوعی...",
  className = "",
  showAdvancedOptions = true,
  showVRStoreButton = false
}: EnhancedAISearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EnhancedSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    brand: '',
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'rating' | 'newest' | 'popularity'>('relevance');
  const [total, setTotal] = useState(0);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  const [includeTypos, setIncludeTypos] = useState(true);
  const [semanticWeight, setSemanticWeight] = useState(0.6);
  const [keywordWeight, setKeywordWeight] = useState(0.4);
  
  const { currency } = useCurrencySafe();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setTotal(0);
      setSearchMetadata(null);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        sortBy,
        limit: '20',
        includeTypos: includeTypos.toString(),
        semanticWeight: semanticWeight.toString(),
        keywordWeight: keywordWeight.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.inStock && { inStock: 'true' }),
        ...(filters.brand && { brand: filters.brand }),
      });

      const response = await fetch(`/api/enhanced-search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setSuggestions(data.suggestions || []);
        setTotal(data.total || 0);
        setSearchMetadata(data.searchMetadata || null);
      }
    } catch (error) {
      console.error('Enhanced search error:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, filters, includeTypos, semanticWeight, keywordWeight]);

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    performSearch(suggestion.text);
    setShowResults(true);
  };

  // Handle result click
  const handleResultClick = (product: ProductsWithImages) => {
    if (onResultClick) {
      onResultClick(product);
    }
    setShowResults(false);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [filters, sortBy, performSearch, query, includeTypos, semanticWeight, keywordWeight]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const getSortIcon = () => {
    switch (sortBy) {
      case 'price':
        return <TrendingUp className="w-4 h-4" />;
      case 'rating':
        return <Sparkles className="w-4 h-4" />;
      case 'popularity':
        return <Target className="w-4 h-4" />;
      default:
        return <SortAsc className="w-4 h-4" />;
    }
  };

  const getMatchTypeIcon = (matchedFields: string[]) => {
    if (matchedFields.includes('semantic')) return <Brain className="w-3 h-3 text-blue-500" />;
    if (matchedFields.includes('typo_correction')) return <Zap className="w-3 h-3 text-yellow-500" />;
    if (matchedFields.includes('synonym')) return <Lightbulb className="w-3 h-3 text-green-500" />;
    return <Search className="w-3 h-3 text-gray-500" />;
  };

  const getMatchTypeLabel = (matchedFields: string[]) => {
    if (matchedFields.includes('semantic')) return 'انطباق هوش مصنوعی';
    if (matchedFields.includes('typo_correction')) return 'تصحیح تایپ';
    if (matchedFields.includes('synonym')) return 'مترادف';
    return 'انطباق دقیق';
  };

  return (
    <div ref={searchRef} className={`relative ${className} dir-rtl text-right`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Brain className="h-5 w-5 text-amber-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pr-10 pl-20 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-right font-vazirmatn text-[16px] text-gray-900"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
          )}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
                setShowResults(false);
                setSearchMetadata(null);
              }}
              className="mr-2 p-1 rounded-full hover:bg-gray-100"
              aria-label="پاک کردن"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={`grid ${showVRStoreButton ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 md:flex md:flex-wrap md:items-center md:gap-2 mt-2 font-vazirmatn w-full`}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-1 md:gap-2 px-1 sm:px-3 md:px-4 py-2 rounded-full text-[11px] xs:text-[12px] sm:text-[14px] md:text-[16px] font-medium transition-all duration-300
            border border-solid w-full h-10 md:w-auto md:h-auto
            ${ showFilters
              ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md border-amber-500 ring-2 ring-amber-300/50'
              : 'bg-transparent text-amber-200 border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500/80'
            }`}
        >
          <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
          <span className="truncate">فیلترها</span>
        </button>
        
        <div className="relative w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none flex items-center justify-center gap-1 pl-6 pr-2 py-2 rounded-full text-[11px] xs:text-[12px] sm:text-[14px] md:text-[16px] font-medium transition-all duration-300
              border border-solid border-amber-500/50 bg-transparent text-amber-200 w-full h-10 md:w-auto md:h-auto
              hover:bg-amber-500/10 hover:border-amber-500/80
              focus:outline-none focus:ring-2 focus:ring-amber-300/50 text-center font-vazirmatn cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D4AF37' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'left 0.4rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em 1.2em'
            }}
            aria-label="مرتب‌سازی بر اساس"
          >
            <option className="bg-stone-800 text-white font-vazirmatn text-xs sm:text-sm" value="relevance">مرتب‌سازی</option>
            <option className="bg-stone-800 text-white font-vazirmatn text-xs sm:text-sm" value="price">قیمت</option>
            <option className="bg-stone-800 text-white font-vazirmatn text-xs sm:text-sm" value="rating">امتیاز</option>
            <option className="bg-stone-800 text-white font-vazirmatn text-xs sm:text-sm" value="newest">جدیدترین</option>
            <option className="bg-stone-800 text-white font-vazirmatn text-xs sm:text-sm" value="popularity">محبوب‌ترین</option>
          </select>
        </div>

        {showVRStoreButton && (
          <Link
            href="/vr-store"
            className="flex items-center justify-center gap-1 md:gap-2 px-1 sm:px-3 md:px-4 py-2 rounded-full text-[11px] xs:text-[12px] sm:text-[14px] md:text-[16px] font-medium transition-all duration-300
              border border-solid border-amber-500/50 bg-transparent text-amber-200 w-full h-10 md:w-auto md:h-auto font-vazirmatn text-center hover:bg-amber-500/10 hover:border-amber-500/80"
          >
            <span className="truncate">فروشگاه مجازی</span>
          </Link>
        )}

        {showAdvancedOptions && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center justify-center gap-1 md:gap-2 px-1 sm:px-3 md:px-4 py-2 rounded-full text-[11px] xs:text-[12px] sm:text-[14px] md:text-[16px] font-medium transition-colors w-full h-10 md:w-auto md:h-auto col-span-3 mt-1 md:mt-0 ${
              showAdvanced 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-stone-900/40 text-gray-300 border border-amber-500/20 hover:bg-amber-500/10'
            }`}
          >
            <Brain className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            <span className="truncate">تنظیمات هوش مصنوعی</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-4 bg-stone-900/95 rounded-lg border border-amber-500/30 text-right font-vazirmatn z-50 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-1">
                  دسته‌بندی
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 text-white focus:outline-none"
                  aria-label="فیلتر دسته‌بندی"
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  <option value="DATES">خرما</option>
                  <option value="HONEY">عسل طبیعی</option>
                  <option value="SAFFRON">زعفران</option>
                  <option value="OTHERS">محصولات دیگر</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-1">
                  حداقل قیمت (تومان)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="۰"
                  className="w-full px-3 py-2 bg-stone-800 border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 text-white focus:outline-none placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-1">
                  حداکثر قیمت (تومان)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="۵,۰۰۰,۰۰۰"
                  className="w-full px-3 py-2 bg-stone-800 border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 text-white focus:outline-none placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200 mb-1">
                  برند
                </label>
                <input
                  type="text"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  placeholder="نام برند"
                  className="w-full px-3 py-2 bg-stone-800 border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 text-white focus:outline-none placeholder-gray-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="rounded border-amber-500/30 text-amber-600 focus:ring-amber-500 bg-stone-800"
                />
                <span className="text-sm text-amber-100">فقط کالاهای موجود</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced AI Options */}
      <AnimatePresence>
        {showAdvanced && showAdvancedOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-4 bg-stone-900/95 rounded-lg border border-blue-500/30 text-right font-vazirmatn z-50 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeTypos}
                    onChange={(e) => setIncludeTypos(e.target.checked)}
                    className="rounded border-blue-500/30 text-blue-600 focus:ring-blue-500 bg-stone-800"
                  />
                  <span className="text-sm font-medium text-blue-200">تحمل خطای تایپی</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">یافتن نتایج حتی با وجود غلط‌های املایی</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  وزن معنایی: {Math.round(semanticWeight * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={semanticWeight}
                  onChange={(e) => setSemanticWeight(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <p className="text-xs text-gray-400">درک معنایی هوش مصنوعی در برابر انطباق کلمات کلیدی</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  وزن کلمات کلیدی: {Math.round(keywordWeight * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={keywordWeight}
                  onChange={(e) => setKeywordWeight(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <p className="text-xs text-gray-400">اهمیت انطباق دقیق کلمات کلیدی</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (results.length > 0 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-stone-900 border border-amber-500/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto text-right font-vazirmatn text-white"
          >
            {/* Search Metadata */}
            {searchMetadata && (
              <div className="p-3 border-b border-amber-500/10 bg-stone-950/80">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>جستجوی هوشمند مجهز به الگوریتم‌های پیشرفته شیخ</span>
                  <span>زمان جستجو: {new Date(searchMetadata.searchTime).toLocaleTimeString('fa-IR')}</span>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && query && (
              <div className="p-3 border-b border-amber-500/10">
                <h4 className="text-sm font-medium text-amber-200 mb-2">پیشنهادهای هوش مصنوعی</h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-right px-3 py-2 text-sm text-gray-300 hover:bg-amber-500/10 rounded-md flex items-center gap-2 transition-colors"
                    >
                      {suggestion.type === 'typo_correction' ? (
                        <Zap className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="flex-1">
                        {suggestion.text}
                        {suggestion.originalText && (
                          <span className="text-gray-500"> (از "{suggestion.originalText}")</span>
                        )}
                      </span>
                      {suggestion.confidence && (
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence * 100)}% انطباق
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 border-b border-amber-500/10 pb-2">
                  <h4 className="text-sm font-medium text-amber-200">
                    {total} نتیجه یافت شد
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {getSortIcon()}
                    <span className="mr-1">
                      {sortBy === 'relevance' && 'مرتب‌سازی'}
                      {sortBy === 'price' && 'قیمت'}
                      {sortBy === 'rating' && 'امتیاز'}
                      {sortBy === 'newest' && 'جدیدترین'}
                      {sortBy === 'popularity' && 'محبوب‌ترین'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {results.slice(0, 5).map((result, index) => (
                    <motion.div
                      key={result.product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultClick(result.product)}
                      className="cursor-pointer p-3 border border-amber-500/10 rounded-lg hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                          {result.product.images && result.product.images.length > 0 ? (
                            <Image
                              src={result.product.images[0]?.image || '/noImage.jpg'}
                              alt={result.product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-800">
                              <span className="text-gray-500 text-[10px]">بدون تصویر</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-semibold text-white truncate">
                              {result.product.name}
                            </h5>
                            {getMatchTypeIcon(result.matchedFields)}
                            <span className="text-xs text-amber-400/80">
                              {getMatchTypeLabel(result.matchedFields)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">
                            {result.product.category === 'DATES' && 'خرما'}
                            {result.product.category === 'HONEY' && 'عسل طبیعی'}
                            {result.product.category === 'SAFFRON' && 'زعفران'}
                            {result.product.category === 'OTHERS' && 'محصولات دیگر'}
                            {result.product.category !== 'DATES' && result.product.category !== 'HONEY' && result.product.category !== 'SAFFRON' && result.product.category !== 'OTHERS' && result.product.category}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-semibold text-amber-500">
                              {formatPrice(
                                convertCurrency(result.product.basePrice, 'EUR', currency),
                                currency
                              )}
                            </span>
                            {result.highlights.length > 0 && (
                              <span className="text-xs text-gray-500">
                                منطبق با: {result.highlights.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                          {result.explanation && (
                            <p className="text-xs text-blue-400 mt-1">
                              {result.explanation}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="text-xs text-gray-500">
                            {Math.round(result.score * 100)}٪ تطابق
                          </div>
                          <div className="text-xs text-blue-400">
                            هوش مصنوعی: {Math.round(result.confidence * 100)}٪
                          </div>
                          {result.typoTolerance < 1 && (
                            <div className="text-xs text-yellow-500">
                              خطای تایپ: {Math.round(result.typoTolerance * 100)}٪
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {results.length > 5 && (
                  <div className="mt-3 pt-3 border-t border-amber-500/10">
                    <button className="w-full text-center text-sm text-amber-500 hover:text-amber-400 transition-colors">
                      مشاهده همه {total} نتیجه
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {results.length === 0 && suggestions.length === 0 && query && !loading && (
              <div className="p-6 text-center">
                <Brain className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-amber-200">هیچ نتیجه‌ای برای "{query}" یافت نشد</p>
                <p className="text-xs text-gray-400 mt-1">کلمات کلیدی دیگری را امتحان کنید، املا را بررسی کنید یا تنظیمات هوش مصنوعی را تغییر دهید</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
