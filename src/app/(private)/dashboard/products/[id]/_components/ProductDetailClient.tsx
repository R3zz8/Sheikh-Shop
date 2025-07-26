'use client';

import React from 'react';
import { useRequireRole } from '@/hooks/useRBAC';
import ProductDetailView from '@/modules/products/views/ProductDetailView';
import type { Product } from '@prisma/client';

interface ProductDetailClientProps {
    product: Product | null;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const hasAccess = useRequireRole(['admin', 'superadmin']);

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

    return <ProductDetailView product={product} />;
} 