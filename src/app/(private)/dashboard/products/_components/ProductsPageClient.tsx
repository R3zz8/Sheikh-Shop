'use client';

import React from 'react';
import ProductDashboardView from '@/modules/products/views/ProductDashboardView';

export default function ProductsPageClient() {
  // Authentication handled server-side - no need for client-side role check
  return (
    <div>
      <ProductDashboardView />
    </div>
  );
}
