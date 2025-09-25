'use client';

import React from 'react';
import type { ProductsWithImages, Unit } from '@/types';
import ProductItem from './ProductItem';
import ProductItemCompact from './ProductItemCompact';

interface ProductItemResponsiveProps {
  product: ProductsWithImages;
  index?: number;
  units?: Unit[];
  variant?: 'auto' | 'compact' | 'detailed';
}

export default function ProductItemResponsive({ 
  product, 
  index = 0, 
  units = [],
  variant = 'auto'
}: ProductItemResponsiveProps) {
  // Auto variant: Use compact on mobile/tablet, detailed on desktop
  if (variant === 'auto') {
    return (
      <>
        {/* Mobile/Tablet: Compact Cards */}
        <div className="block md:hidden">
          <ProductItemCompact 
            product={product} 
            index={index} 
            units={units} 
          />
        </div>
        
        {/* Desktop: Detailed Cards */}
        <div className="hidden md:block">
          <ProductItem 
            product={product} 
            index={index} 
            units={units} 
          />
        </div>
      </>
    );
  }

  // Manual variant selection
  if (variant === 'compact') {
    return <ProductItemCompact product={product} index={index} units={units} />;
  }

  return <ProductItem product={product} index={index} units={units} />;
}


