import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductsWithImages, ProductUnit } from '@/types';
import { calculateFinalPricing } from '@/lib/pricing';
import { formatPrice } from '@/lib/currency';
import DiscountBadge from '@/components/ui/DiscountBadge';
import CompactProductUnitSelector from '@/components/ui/CompactProductUnitSelector';

interface ProductCardProps {
  product: ProductsWithImages;
  className?: string;
  onClick?: () => void;
}

export default function ProductCard({ product, className = '', onClick }: ProductCardProps) {
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0]?.image || '/noImage.jpg'
    : '/noImage.jpg';

  // Get available product units (filtered by active status)
  const availableProductUnits = useMemo(() => {
    const units = product.units?.filter(unit => unit.isActive) || [];
    // Sort by featured first, then by price
    return units.sort((a, b) => {
      if ((a as any).isFeatured && !(b as any).isFeatured) return -1;
      if (!(a as any).isFeatured && (b as any).isFeatured) return 1;
      return Number(a.price) - Number(b.price);
    });
  }, [product.units]);

  // State for selected ProductUnit
  const [selectedProductUnit, setSelectedProductUnit] = useState<ProductUnit | null>(null);

  // Update selected unit when available units change
  React.useEffect(() => {
    if (availableProductUnits.length > 0 && !selectedProductUnit) {
      setSelectedProductUnit(availableProductUnits[0] || null);
    }
  }, [availableProductUnits, selectedProductUnit]);

  // Determine if we should use ProductUnit system or legacy system
  const useProductUnits = availableProductUnits.length > 0;

  // Calculate pricing with discounts
  const pricing = calculateFinalPricing(
    useProductUnits && selectedProductUnit ? Number(selectedProductUnit.price) : product.basePrice,
    product.baseUnit,
    1, // Default quantity
    product.discounts
  );

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow h-[420px] lg:h-[440px] flex flex-col overflow-hidden ${className}`}
      onClick={onClick}
    >
      <Link href={`/products/${product.slug || product.id}`}>
        <div className="relative overflow-hidden rounded-t-lg h-40 lg:h-44">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain mx-auto"
          />
          
          {/* Discount Badge */}
          {pricing.hasDiscount && (
            <div className="absolute top-2 right-2 z-10">
              <DiscountBadge 
                discount={{
                  type: product.discounts[0]?.discountType || 'PERCENTAGE',
                  value: product.discounts[0]?.value || 0,
                  amount: pricing.discountAmount,
                  percentage: pricing.discountPercentage,
                  endDate: product.discounts[0]?.endDate || new Date(),
                  isActive: true,
                }}
                showCountdown={false}
                className="scale-75"
              />
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow min-h-0">
          <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base leading-tight">
            {product.name}
          </h2>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
            {(product as any).excerpt || product.description || 'Premium quality product'}
          </p>
          <div className="space-y-2">
            {/* Price and Unit Selector Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col flex-1">
                {pricing.hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(pricing.originalPrice)}
                  </span>
                )}
                <span className="text-xl font-bold text-amber-600">
                  {formatPrice(pricing.finalPrice)}
                </span>
              </div>
              
              {/* Compact Unit Selector */}
              {useProductUnits ? (
                <CompactProductUnitSelector
                  productUnits={availableProductUnits}
                  selectedProductUnit={selectedProductUnit}
                  onProductUnitChange={setSelectedProductUnit}
                  variant="card"
                  className="flex-shrink-0"
                />
              ) : (
                <span className="text-sm text-gray-500 flex-shrink-0">
                  {product.baseUnit?.name || 'unit'}
                </span>
              )}
            </div>
            
            {/* Stock Status for Selected Unit */}
            {useProductUnits && selectedProductUnit && (
              <div className="text-xs text-gray-500">
                {selectedProductUnit.stock === 0 ? (
                  <span className="text-red-500">Out of stock</span>
                ) : selectedProductUnit.stock <= 5 ? (
                  <span className="text-yellow-600">Low stock ({selectedProductUnit.stock} left)</span>
                ) : (
                  <span>{selectedProductUnit.stock} units available</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

