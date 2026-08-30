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
import { Gift, Sparkles, ArrowLeft } from 'lucide-react';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-url';

interface ProductCardProps {
  product: ProductsWithImages;
  className?: string;
  variant?: 'light' | 'luxury';
  onClick?: () => void;
}

export default function ProductCard({
  product,
  className = '',
  variant = 'light',
  onClick,
}: ProductCardProps) {
  const { triggerUnboxing, config: unboxingConfig } = useLuxuryUnboxing();

  const rawImageUrl =
    product.images && product.images.length > 0
      ? product.images[0]?.secureUrl || product.images[0]?.image || '/noImage.jpg'
      : '/noImage.jpg';

  const imageUrl = getOptimizedCloudinaryUrl(rawImageUrl, { width: 500, quality: 75 });

  const availableProductUnits = useMemo(() => {
    const units = (product.units || []).filter((unit) => unit.isActive);
    return units.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
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
      (product as Record<string, unknown>).excerpt as string | null
    );
    return stripHtmlTags(rawExcerpt || 'محصول ممتاز و اصیل شیخ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [product.description, (product as Record<string, unknown>).excerpt]);

  const isLuxury = variant === 'luxury';

  return (
    <div
      className={`rounded-2xl shadow-sm border transition-all duration-300 h-[420px] lg:h-[440px] flex flex-col overflow-hidden relative group/card ${
        isLuxury
          ? 'bg-gradient-to-b from-[#2A1A12]/90 via-[#1C120C]/95 to-[#150D08] border-amber-500/20 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/10'
          : 'bg-white border-stone-200/80 hover:border-amber-500/30 hover:shadow-xl'
      } ${className}`}
      onClick={onClick}
      dir="rtl"
    >
      <Link href={`/products/${product.slug || product.id}`} className="flex flex-col flex-grow">
        {/* Image Container */}
        <div
          className={`relative overflow-hidden h-44 lg:h-48 group/image flex items-center justify-center p-3 ${
            isLuxury ? 'bg-[#120B07]' : 'bg-stone-50'
          }`}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-2 transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
            quality={75}
          />

          {/* New Badge */}
          {product.isNew && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black text-[11px] px-2.5 py-1 rounded-full shadow-lg border border-amber-200/30 font-vazirmatn">
              <Sparkles className="w-3 h-3" />
              <span>جدید</span>
            </div>
          )}

          {/* Discount Badge */}
          {pricing.hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <DiscountBadge
                discountPercentage={pricing.discountPercentage}
                showCountdown={false}
                className="scale-90"
              />
            </div>
          )}

          {/* Luxury 3D Unboxing Trigger */}
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
              <span>۳بعدی</span>
            </button>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-grow text-right justify-between min-h-0 relative z-10">
          <div>
            <h2
              className={`font-bold mb-2 line-clamp-2 text-sm sm:text-base leading-snug transition-colors duration-200 font-vazirmatn ${
                isLuxury
                  ? 'text-stone-100 group-hover/card:text-amber-200'
                  : 'text-stone-900 group-hover/card:text-amber-700'
              }`}
            >
              {product.name}
            </h2>
            <p
              className={`text-xs line-clamp-2 leading-relaxed font-vazirmatn ${
                isLuxury ? 'text-stone-400' : 'text-stone-600'
              }`}
            >
              {cleanExcerpt}
            </p>
          </div>

          <div className="mt-auto space-y-2 pt-3 border-t border-amber-500/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col text-right">
                {pricing.hasDiscount && pricing.oldPrice && (
                  <span
                    className={`text-xs line-through font-vazirmatn ${
                      isLuxury ? 'text-stone-500' : 'text-stone-400'
                    }`}
                  >
                    {formatPrice(pricing.oldPrice)}
                  </span>
                )}
                <span
                  className={`text-base sm:text-lg font-black font-vazirmatn ${
                    isLuxury ? 'text-amber-400' : 'text-amber-600'
                  }`}
                >
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
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 ${
                    isLuxury
                      ? 'bg-amber-500/10 group-hover/card:bg-amber-500 text-amber-300 group-hover/card:text-stone-950 border-amber-500/20'
                      : 'bg-amber-50 group-hover/card:bg-amber-600 text-amber-700 group-hover/card:text-white border-amber-200'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 group-hover/card:-translate-x-0.5 transition-transform" />
                </div>
              )}
            </div>

            {useProductUnits && selectedProductUnit && (
              <div className="text-xs text-stone-400 font-vazirmatn">
                {selectedProductUnit.stock === 0 ? (
                  <span className="text-rose-500">ناموجود</span>
                ) : selectedProductUnit.stock <= 5 ? (
                  <span className="text-amber-400">موجودی محدود ({selectedProductUnit.stock} عدد)</span>
                ) : (
                  <span>{selectedProductUnit.stock} عدد موجود در انبار</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
