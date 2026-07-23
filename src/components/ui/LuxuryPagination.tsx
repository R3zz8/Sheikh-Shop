'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LuxuryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function LuxuryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: LuxuryPaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers using sliding window helper
  const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) {
      pages.push('...');
    }

    pages.push(total);
    return pages;
  };

  const pages = getPageNumbers(currentPage, totalPages);

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, page: number | string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePageClick(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="صفحه‌بندی محصولات"
      className="flex items-center justify-center gap-2 mt-12 mb-6 select-none font-vazirmatn"
      dir="rtl"
    >
      {/* Right side (Previous in RTL: going towards page 1) */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="صفحه قبلی"
        aria-disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
          currentPage === 1
            ? 'opacity-40 cursor-not-allowed bg-stone-900/20 border border-white/5 text-stone-500'
            : 'bg-stone-900/40 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white cursor-pointer hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:border-amber-500/40 hover:bg-stone-800/50'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Page Numbers Container */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-stone-950/30 backdrop-blur-md border border-white/5 shadow-inner">
        {pages.map((page, index) => {
          const isEllipsis = typeof page === 'string';
          const isActive = page === currentPage;

          if (isEllipsis) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-10 h-10 text-stone-500 text-sm"
                aria-hidden="true"
              >
                {page}
              </span>
            );
          }

          return (
            <button
              key={`page-${page}`}
              onClick={() => handlePageClick(page)}
              onKeyDown={(e) => handleKeyDown(e, page)}
              tabIndex={0}
              aria-label={`صفحه ${page}`}
              aria-current={isActive ? 'page' : undefined}
              className="relative focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-full"
            >
              {isActive ? (
                <motion.div
                  layoutId="activePageIndicator"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-400/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors duration-300 ${
                  isActive
                    ? 'text-stone-950 font-bold'
                    : 'text-slate-300 hover:text-white bg-stone-900/40 backdrop-blur-md border border-white/10 hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:border-amber-500/40 hover:bg-stone-800/50'
                }`}
              >
                {page}
              </span>
            </button>
          );
        })}
      </div>

      {/* Left side (Next in RTL: going towards higher pages) */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="صفحه بعدی"
        aria-disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
          currentPage === totalPages
            ? 'opacity-40 cursor-not-allowed bg-stone-900/20 border border-white/5 text-stone-500'
            : 'bg-stone-900/40 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white cursor-pointer hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:border-amber-500/40 hover:bg-stone-800/50'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </nav>
  );
}
