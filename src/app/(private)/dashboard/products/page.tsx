import { requireAdminOrSuperAdmin } from '@/lib/auth/server-auth';
import ProductsPageClient from './_components/ProductsPageClient';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function DashboardProductPage() {
  // Server-side authentication - redirects to login if not authenticated
  await requireAdminOrSuperAdmin();

  return (
    <div>
      <ProductsPageClient />
    </div>
  );
}
