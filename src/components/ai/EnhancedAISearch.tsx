'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, SortAsc, Sparkles, TrendingUp, Brain, Zap, Target, Lightbulb } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';
import ProductCard from '@/components/product/ProductCard';

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
}

export default function EnhancedAISearch({ 
  onResultClick, 
  placeholder = "Search with AI intelligence...",
  className = "",
  showAdvancedOptions = true
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
  const debounceRef = useRef<NodeJS.Timeout>();

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
    if (matchedFields.includes('semantic')) return 'AI Match';
    if (matchedFields.includes('typo_correction')) return 'Typo Fixed';
    if (matchedFields.includes('synonym')) return 'Synonym';
    return 'Exact Match';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Brain className="h-5 w-5 text-amber-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
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
              className="ml-2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            showFilters 
              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 focus:ring-2 focus:ring-amber-500"
        >
          <option value="relevance">Relevance</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="newest">Newest</option>
          <option value="popularity">Popularity</option>
        </select>

        {showAdvancedOptions && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              showAdvanced 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            AI Options
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
            className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">All Categories</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="CLOTHING">Clothing</option>
                  <option value="HOME">Home</option>
                  <option value="BOOKS">Books</option>
                  <option value="SPORTS">Sports</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  placeholder="Brand name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
            
            <div className="mt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
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
            className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeTypos}
                    onChange={(e) => setIncludeTypos(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Typo Tolerance</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Find results even with spelling mistakes</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semantic Weight: {Math.round(semanticWeight * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={semanticWeight}
                  onChange={(e) => setSemanticWeight(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">AI understanding vs keyword matching</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keyword Weight: {Math.round(keywordWeight * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={keywordWeight}
                  onChange={(e) => setKeywordWeight(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Exact keyword matching importance</p>
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
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Search Metadata */}
            {searchMetadata && (
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>AI Search powered by enhanced algorithms</span>
                  <span>Search time: {new Date(searchMetadata.searchTime).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && query && (
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI Suggestions</h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-2"
                    >
                      {suggestion.type === 'typo_correction' ? (
                        <Zap className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="flex-1">
                        {suggestion.text}
                        {suggestion.originalText && (
                          <span className="text-gray-400"> (from "{suggestion.originalText}")</span>
                        )}
                      </span>
                      {suggestion.confidence && (
                        <span className="text-xs text-gray-400">
                          {Math.round(suggestion.confidence * 100)}%
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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    {total} result{total !== 1 ? 's' : ''} found
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {getSortIcon()}
                    <span className="capitalize">{sortBy}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {results.slice(0, 5).map((result, index) => (
                    <motion.div
                      key={result.product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleResultClick(result.product)}
                      className="cursor-pointer p-3 border border-gray-100 rounded-lg hover:border-amber-200 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {result.product.images && result.product.images.length > 0 ? (
                            <img
                              src={result.product.images[0].image}
                              alt={result.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {result.product.name}
                            </h5>
                            {getMatchTypeIcon(result.matchedFields)}
                            <span className="text-xs text-gray-500">
                              {getMatchTypeLabel(result.matchedFields)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {result.product.category}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-amber-600">
                              {formatPrice(
                                convertCurrency(result.product.basePrice, 'EUR', currency),
                                currency
                              )}
                            </span>
                            {result.highlights.length > 0 && (
                              <span className="text-xs text-gray-400">
                                Matches: {result.highlights.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                          {result.explanation && (
                            <p className="text-xs text-blue-600 mt-1">
                              {result.explanation}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-gray-400">
                            {Math.round(result.score * 100)}% match
                          </div>
                          <div className="text-xs text-blue-500">
                            AI: {Math.round(result.confidence * 100)}%
                          </div>
                          {result.typoTolerance < 1 && (
                            <div className="text-xs text-yellow-500">
                              Typo: {Math.round(result.typoTolerance * 100)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {results.length > 5 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button className="w-full text-center text-sm text-amber-600 hover:text-amber-700">
                      View all {total} results
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {results.length === 0 && suggestions.length === 0 && query && !loading && (
              <div className="p-6 text-center">
                <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No results found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try different keywords, check spelling, or adjust AI settings</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
