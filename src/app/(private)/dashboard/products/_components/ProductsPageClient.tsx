'use client';

import React from 'react';
import { useRequireRole } from '@/hooks/useRBAC';
import ProductDashboardView from '@/modules/products/views/ProductDashboardView';

export default function ProductsPageClient() {
  const hasAccess = useRequireRole(['ADMIN', 'SUPERADMIN']);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">
                        You don&apos;t have permission to access this page. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ProductDashboardView />
    </div>
  );
}
