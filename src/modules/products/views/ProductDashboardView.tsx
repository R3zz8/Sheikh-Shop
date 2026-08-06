'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProductTable from '../components/ProductTable';
import type { ProductsWithImages } from '@/types';

interface ProductDashboardViewProps {
  initialProducts?: ProductsWithImages[];
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterState {
  search: string;
  category: string;
  brand: string;
  status: string;
  stock: string;
  priceMin: string;
  priceMax: string;
  dateFilter: string;
}

function ProductDashboardView({ initialProducts }: ProductDashboardViewProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 50, // default limit is now 50 for enterprise standard
    total: 0,
    totalPages: 1,
  });

  // Advanced filters state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    brand: 'all',
    status: 'all',
    stock: 'all',
    priceMin: '',
    priceMax: '',
    dateFilter: 'all',
  });

  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load saved presets from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sheikh_products_filter_preset');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFilters((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to load filter preset', e);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.brand && filters.brand !== 'all') queryParams.append('brand', filters.brand);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.stock && filters.stock !== 'all') queryParams.append('stock', filters.stock);
      if (filters.dateFilter && filters.dateFilter !== 'all') queryParams.append('dateFilter', filters.dateFilter);
      if (filters.priceMin) queryParams.append('priceMin', filters.priceMin);
      if (filters.priceMax) queryParams.append('priceMax', filters.priceMax);

      const result = await fetch(`/api/dashboard/products?${queryParams.toString()}`);
      const response = await result.json();

      if (response?.success) {
        setProducts(response.data);
        setStats(response.stats);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        });
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters]);

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
  };

  // Debounced search / change filter handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // reset page to 1
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      brand: 'all',
      status: 'all',
      stock: 'all',
      priceMin: '',
      priceMax: '',
      dateFilter: 'all',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-[#070504] text-stone-300 font-vazirmatn p-4 md:p-8">
      <ProductTable
        products={products}
        stats={stats}
        loading={loading}
        pagination={pagination}
        filters={filters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onSortChange={handleSortChange}
        refreshProducts={fetchProducts}
      />
    </div>
  );
}

export default ProductDashboardView;
