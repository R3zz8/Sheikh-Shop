'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { getOrGenerateExcerpt, stripHtmlTags } from '@/lib/seo/sanitize';

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'article' | 'category';
  url: string;
  description?: string;
  image?: string;
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export default function GlobalSearch({ 
  className = '', 
  placeholder = 'جستجوی محصولات، مقالات...'
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, performSearch]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          // Navigate to search results page
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeLabel = (type: 'product' | 'article' | 'category') => {
    if (type === 'product') return 'محصول';
    if (type === 'article') return 'مقاله';
    return 'دسته‌بندی';
  };

  return (
    <div className={cn('relative w-full max-w-md font-vazirmatn', className)} ref={resultsRef} dir="rtl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pr-10 pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-right"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 left-0 pl-3 flex items-center"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto" dir="rtl">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    'w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3',
                    selectedIndex === index && 'bg-amber-50 border-r-2 border-amber-500'
                  )}
                >
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        result.type === 'product' && 'bg-blue-100 text-blue-800',
                        result.type === 'article' && 'bg-green-100 text-green-800',
                        result.type === 'category' && 'bg-purple-100 text-purple-800'
                      )}>
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    {(() => {
                      if (!result.description) return null;
                      const cleanText = stripHtmlTags(result.description)
                        .replace(/\s+/g, ' ')
                        .trim();
                      return cleanText ? (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 text-right">
                          {cleanText}
                        </p>
                      ) : null;
                    })()}
                  </div>
                </button>
              ))}
              
              {/* View all results */}
              <div className="border-t border-gray-100 px-4 py-2 text-center">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  مشاهده همه نتایج برای «{query}»
                </button>
              </div>
            </div>
          ) : query && !isLoading ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">نتیجه‌ای برای «{query}» یافت نشد</p>
              <p className="text-xs text-gray-400 mt-1">
                کلمات کلیدی دیگری را امتحان کنید یا املای کلمه را بررسی کنید
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
