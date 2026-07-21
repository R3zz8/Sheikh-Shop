import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductsWithImages, ProductUnit } from '@/types';
import { resolveProductPrice } from '@/lib/product-pricing';
import { formatPrice } from '@/lib/currency';
import DiscountBadge from '@/components/ui/DiscountBadge';
import CompactProductUnitSelector from '@/components/ui/CompactProductUnitSelector';
import { getOrGenerateExcerpt, stripHtmlTags } from '@/lib/seo/sanitize';
import { useLuxuryUnboxing } from '@/components/3d/LuxuryUnboxingProvider';
import { Gift } from 'lucide-react';

interface ProductCardProps {
  product: ProductsWithImages;
  className?: string;
  onClick?: () => void;
}

export default function ProductCard({ product, className = '', onClick }: ProductCardProps) {
  const { triggerUnboxing, config: unboxingConfig } = useLuxuryUnboxing();

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0]?.image || '/noImage.jpg'
    : '/noImage.jpg';

  const availableProductUnits = useMemo(() => {
    const units = product.units?.filter(unit => unit.isActive) || [];
    return units.sort((a, b) => {
      if ((a as any).isFeatured && !(b as any).isFeatured) return -1;
      if (!(a as any).isFeatured && (b as any).isFeatured) return 1;
      return Number(a.price) - Number(b.price);
    });
  }, [product.units]);

  const [selectedProductUnit, setSelectedProductUnit] = useState<ProductUnit | null>(
    availableProductUnits.length > 0 ? availableProductUnits[0] ?? null : null
  );

  React.useEffect(() => {
    if (availableProductUnits.length > 0 && !selectedProductUnit) {
      setSelectedProductUnit(availableProductUnits[0] ?? null);
    }
  }, [availableProductUnits, selectedProductUnit]);

  const useProductUnits = availableProductUnits.length > 0;
  const pricing = resolveProductPrice(product, selectedProductUnit);

  const cleanExcerpt = useMemo(() => {
    const rawExcerpt = getOrGenerateExcerpt(
      product.description || null,
      (product as any).excerpt || null
    );
    return stripHtmlTags(rawExcerpt || 'Premium quality product')
      .replace(/\s+/g, ' ')
      .trim();
  }, [product.description, (product as any).excerpt]);

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow h-[420px] lg:h-[440px] flex flex-col overflow-hidden ${className}`}
      onClick={onClick}
    >
      <Link href={`/products/${product.slug || product.id}`} className="flex flex-col flex-grow">
        <div className="relative overflow-hidden rounded-t-lg h-40 lg:h-44 group/image">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain mx-auto transition-transform duration-500 group-hover/image:scale-105"
          />
          
          {pricing.hasDiscount && (
            <div className="absolute top-2 right-2 z-10">
              <DiscountBadge 
                discountPercentage={pricing.discountPercentage}
                showCountdown={false}
                className="scale-75"
              />
            </div>
          )}

          {/* Luxury 3D Unboxing Quick Trigger Button */}
          {unboxingConfig?.isEnabled !== false && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerUnboxing(product);
              }}
              className="absolute bottom-2 left-2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black p-2 rounded-xl shadow-lg border border-amber-300/30 transition-all scale-90 md:scale-100 hover:scale-110 flex items-center gap-1 text-[10px] px-2.5 font-vazirmatn"
              title="مشاهده جعبه گشایی سه‌بعدی لوکس"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>جعبه‌گشایی ۳بعدی</span>
            </button>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow min-h-0">
          <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base leading-tight">
            {product.name}
          </h2>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
            {cleanExcerpt}
          </p>
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col flex-1">
                {pricing.hasDiscount && pricing.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(pricing.oldPrice)}
                  </span>
                )}
                <span className="text-xl font-bold text-amber-600">
                  {formatPrice(pricing.price)}
                </span>
              </div>
              
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

