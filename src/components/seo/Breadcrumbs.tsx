'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbJsonLd } from './JsonLd';

interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Always include home as the first item
  const allItems = [
    { name: 'Home', url: '/', current: false },
    ...items.map((item, index) => ({
      ...item,
      current: index === items.length - 1,
    })),
  ];

  return (
    <>
      <BreadcrumbJsonLd breadcrumbs={allItems} />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      >
        <ol className="flex items-center space-x-1">
          {allItems.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              )}
              {item.current ? (
                <span
                  className="font-medium text-gray-900"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-amber-600 transition-colors duration-200 flex items-center"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Helper function to generate breadcrumbs for different page types
export function generateProductBreadcrumbs(product: { name: string; category: string; id: string }) {
  return [
    { name: 'Products', url: '/products' },
    { name: product.category, url: `/categories/${product.category.toLowerCase()}` },
    { name: product.name, url: `/products/${product.id}` },
  ];
}

export function generateCategoryBreadcrumbs(category: string) {
  return [
    { name: 'Categories', url: '/categories' },
    { name: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(), url: `/categories/${category.toLowerCase()}` },
  ];
}

export function generateArticleBreadcrumbs(article: { title: string; slug: string; category?: string }) {
  const breadcrumbs = [
    { name: 'Articles', url: '/article' },
  ];
  
  if (article.category) {
    breadcrumbs.push({ name: article.category, url: `/article?category=${article.category}` });
  }
  
  breadcrumbs.push({ name: article.title, url: `/article/${article.slug}` });
  
  return breadcrumbs;
}


