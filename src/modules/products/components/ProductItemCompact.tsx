'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ShoppingCart, Star } from 'lucide-react';
import type { ProductsWithImages, Unit } from '@/types';
import { useCart } from '@/hooks/useCart';
import { cn, formatPrice } from '@/lib/utils';
import FlyToCartAnimation from '@/components/cart/FlyToCartAnimation';
import DiscountBadge from '@/components/ui/DiscountBadge';
import ProductBadge from '@/components/ui/ProductBadge';
import { calculateFinalPricing, formatPrice as formatPriceUtil } from '@/lib/pricing';

export default function ProductItemCompact({ 
  product, 
  index = 0, 
  units: availableUnits = [] 
}: { 
  product: ProductsWithImages; 
  index?: number;
  units?: Unit[];
}) {
  const { addToCartMutation } = useCart();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showFlyAnimation, setShowFlyAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);

  // Set default unit when availableUnits are loaded
  useEffect(() => {
    if (availableUnits.length > 0 && !selectedUnit) {
      setSelectedUnit(availableUnits[0] || null);
    }
  }, [availableUnits]);

  // Fallback if no units are available
  if (!selectedUnit || availableUnits.length === 0) {
    return (
      <div className="relative bg-white/8 backdrop-blur-sm border border-amber-200/20 rounded-xl overflow-hidden aspect-square">
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <h2 className="text-white font-bold text-sm mb-2 line-clamp-2">{product.name}</h2>
          <p className="text-amber-300 font-semibold text-lg">${product.basePrice}</p>
        </div>
      </div>
    );
  }

  // Calculate pricing with discounts
  const pricing = calculateFinalPricing(
    product.basePrice,
    selectedUnit,
    1, // Default quantity for compact view
    product.discounts
  );

  // Generate deterministic rating based on product ID hash
  const idHash = product.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const rating = 4 + (idHash % 2); // Either 4 or 5

  const handleAddToCart = async () => {
    if (!productRef.current || !cartButtonRef.current) return;

    // Get positions for animation
    const productRect = productRef.current.getBoundingClientRect();
    const cartRect = cartButtonRef.current.getBoundingClientRect();

    // Calculate animation start position (center of product image)
    const startX = productRect.left + productRect.width / 2;
    const startY = productRect.top + productRect.height / 2;

    // Calculate animation end position (center of cart button)
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    setAnimationPosition({ x: startX, y: startY });
    setShowFlyAnimation(true);

    try {
      await addToCartMutation.mutateAsync({ 
        productId: product.id,
        quantity: 1
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleAnimationComplete = () => {
    setShowFlyAnimation(false);
  };

  return (
    <>
      <div ref={productRef} className="relative bg-white/8 backdrop-blur-sm border border-amber-200/20 rounded-xl overflow-hidden hover:border-amber-300/40 hover:bg-white/12 transition-all duration-300 group flex flex-col h-full">
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/3 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Product Image - Circular, centered at top */}
        <Link href={`/products/${product.slug || product.id}`} className="block">
          <div className="relative w-full h-32 bg-gradient-to-br from-amber-950/20 via-stone-900/20 to-amber-950/20 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer hover:bg-gradient-to-br hover:from-amber-950/30 hover:via-stone-900/30 hover:to-amber-950/30 transition-all duration-300">
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 animate-pulse rounded-full" />
            )}
            <div className="relative w-20 h-20 rounded-full overflow-hidden">
            <Image
              src={product?.images[0]?.image || '/assets/noImage.jpg'}
              alt={`${product?.name || 'Product'} - Premium ${product?.category || 'product'} from Sheikh Shop`}
                fill
              className={cn(
                  'object-cover transition-all duration-300',
                isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              )}
              loading={index < 4 ? 'eager' : 'lazy'}
              priority={index < 4}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              quality={80}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)}
            />
            </div>
          </div>
        </Link>

        {/* Product Content - Flexible content area */}
        <div className="relative z-10 p-3 flex flex-col flex-grow">
          {/* Product Name */}
          <Link href={`/products/${product.slug || product.id}`} className="block mb-2">
            <h2 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors duration-300 cursor-pointer line-clamp-2 leading-tight text-center">
                {product?.name}
              </h2>
            </Link>
            
          {/* Star Rating with Review Count */}
          <div className="flex items-center justify-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-3 h-3",
                    i < rating ? "fill-amber-300 text-amber-300" : "text-gray-500"
                  )} 
                />
              ))}
            </div>
            <span className="text-xs text-amber-200/60">({Math.floor(Math.random() * 10) + 1})</span>
          </div>

            {/* Price */}
          <div className="text-center mb-3">
                <p className="text-lg font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                  {formatPriceUtil(pricing.finalPrice)}
                </p>
                {pricing.hasDiscount && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatPriceUtil(pricing.originalPrice)}
                  </p>
                )}
              </div>

          {/* Product Badges - Below price */}
          <div className="flex justify-center gap-1 mb-3">
            <ProductBadge 
              isNew={product.isNew}
              isBestSeller={product.isBestSeller}
              size="sm"
            />
            {pricing.hasDiscount && (
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
              />
            )}
            </div>
        </div>

        {/* Button Container - Fixed at bottom */}
        <div className="p-3 pt-0 mt-auto">
          <Button
            ref={cartButtonRef}
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            size="sm"
            className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white font-semibold border border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300 transform hover:-translate-y-0.5 text-xs py-2"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Fly to Cart Animation */}
      <FlyToCartAnimation
        isVisible={showFlyAnimation}
        productImage={product?.images[0]?.image || '/assets/noImage.jpg'}
        productName={product?.name || 'Product'}
        onAnimationComplete={handleAnimationComplete}
      />
    </>
  );
}
