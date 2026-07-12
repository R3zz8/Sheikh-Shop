'use client';

import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbsProps {
  title: string;
  category?: string | null;
}

export default function Breadcrumbs({ title, category }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-vazirmatn" dir="rtl">
      <Link 
        href="/" 
        className="flex items-center gap-1 hover:text-amber-300 transition-colors duration-300"
      >
        <Home className="w-4 h-4" />
        <span>خانه</span>
      </Link>
      
      <ChevronLeft className="w-4 h-4" />
      
      <Link 
        href="/article" 
        className="hover:text-amber-300 transition-colors duration-300"
      >
        مقالات
      </Link>
      
      {category && (
        <>
          <ChevronLeft className="w-4 h-4" />
          <Link 
            href={`/article?category=${encodeURIComponent(category)}`}
            className="hover:text-amber-300 transition-colors duration-300"
          >
            {category}
          </Link>
        </>
      )}
      
      <ChevronLeft className="w-4 h-4" />
      
      <span className="text-amber-300 font-medium truncate max-w-xs">
        {title}
      </span>
    </nav>
  );
}
