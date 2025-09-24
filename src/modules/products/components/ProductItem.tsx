'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Star, ShoppingCart, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProductsWithImages, Unit } from '@/types';
import { useCart } from '@/hooks/useCart';
import { cn, formatPrice } from '@/lib/utils';
import FlyToCartAnimation from '@/components/cart/FlyToCartAnimation';
import UnitSelector from '@/components/ui/UnitSelector';
import DiscountBadge from '@/components/ui/DiscountBadge';
import ProductBadge from '@/components/ui/ProductBadge';
import { calculateFinalPricing, formatPrice as formatPriceUtil } from '@/lib/pricing';

// ProductDescription component for read more/less functionality
function ProductDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      // Check if text overflows 3 lines
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * 3;
      setShowToggle(textRef.current.scrollHeight > maxHeight);
    }
  }, [description]);

  return (
    <div>
      <p 
        ref={textRef}
        className={cn(
          'text-amber-200/80 text-sm transition-all duration-300',
          !isExpanded && 'line-clamp-3'
        )}
      >
        {description}
      </p>
      {showToggle && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs mt-1 transition-colors duration-200"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Read less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Read more
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function ProductItem({ 
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
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);

  // Set default unit when availableUnits are loaded
    useEffect(() => {
    if (availableUnits.length > 0 && !selectedUnit) {
      setSelectedUnit(availableUnits[0] || null);
    }
  }, [availableUnits]); // Removed selectedUnit from dependencies to prevent infinite loop

  // Fallback if no units are available - temporarily simplified to show products
  if (!selectedUnit || availableUnits.length === 0) {
    return (
      <div className="relative bg-white/8 backdrop-blur-sm border border-amber-200/20 rounded-2xl overflow-hidden p-6">
        <div className="text-center">
          <h3 className="text-white font-bold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-300 text-sm mb-3">{product.description}</p>
          <p className="text-amber-300 font-semibold">${product.basePrice}</p>
          <p className="text-gray-400 text-xs mt-2">Units: {availableUnits.length}</p>
        </div>
      </div>
    );
  }

  // Calculate pricing with discounts
  const pricing = calculateFinalPricing(
    product.basePrice,
    selectedUnit,
    selectedQuantity,
    product.discounts
  );

  // Determine premium badge based on price
  const isPremium = (pricing.finalPrice || 0) > 50;

  // Generate deterministic rating and review count based on product ID hash
  const idHash = product.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const rating = 4 + (idHash % 2); // Either 4 or 5
  const reviewCount = 50 + (idHash % 200); // Between 50 and 249

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
          quantity: selectedQuantity
        });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleAnimationComplete = () => {
    setShowFlyAnimation(false);
  };

  const toggleUnitSelector = () => {
    setShowUnitSelector(!showUnitSelector);
  };

  return (
    <>
      <div ref={productRef} className="relative bg-white/8 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-[1.01] border border-amber-200/20 hover:border-amber-300/40 hover:bg-white/12 flex flex-col h-full md:h-[460px] group">
        {/* Product Image Container with Badges */}
        <Link href={`/product/${product.id}`} className="block relative">
          <div className="relative w-full h-48 md:h-52 p-3 bg-gradient-to-br from-amber-950/20 via-stone-900/20 to-amber-950/20">
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 animate-pulse rounded-xl" />
            )}
            <Image
              src={product?.images[0]?.image || '/assets/noImage.jpg'}
              alt={product?.name || 'Product image'}
              width={200}
              height={200}
              className={cn(
                'object-contain max-h-full max-w-full transition-all duration-300 rounded-xl shadow',
                isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              )}
              loading={index < 4 ? 'eager' : 'lazy'}
              priority={index < 4}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)}
            />
            {/* Product Badges - Absolutely positioned inside image container */}
            <div className="absolute top-3 left-3 z-20">
              <ProductBadge 
                isNew={product.isNew}
                isBestSeller={product.isBestSeller}
                size="sm"
              />
            </div>

            {/* Discount Badge - Absolutely positioned inside image container */}
            {pricing.hasDiscount && (
              <div className="absolute top-3 right-3 z-20">
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
              </div>
            )}
          </div>
        </Link>

        {/* Product Content - Flexible content area */}
        <div className="relative z-10 p-4 flex flex-col flex-grow">
          {/* Product Name */}
          <Link href={`/product/${product.id}`} className="block mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-amber-200 transition-colors duration-300 cursor-pointer">
              {product?.name}
            </h3>
          </Link>

          {/* Description - clamp to 3 lines on desktop */}
          <p className="text-amber-200/80 text-sm mb-3 line-clamp-3">
            {product?.description || 'Premium quality product with exceptional features.'}
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={`product-item-star-${star}`}
                className={cn(
                  'w-4 h-4',
                  star <= rating ? 'fill-amber-300 text-amber-300' : 'text-amber-200/40',
                )}
              />
            ))}
            <span className="text-amber-200/60 text-sm ml-2">
              ({reviewCount})
            </span>
          </div>

          {/* Price Section */}
          <div className="mb-3">
            {pricing.hasDiscount && (
              <p className="text-sm text-gray-400 line-through">
                {formatPriceUtil(pricing.originalPrice)}
              </p>
            )}
            <p className="text-2xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
              {formatPriceUtil(pricing.finalPrice)}
            </p>
            <p className="text-xs text-amber-200/60">per {selectedUnit.symbol}</p>
          </div>
        </div>

        {/* Footer - Pinned to bottom with Price and CTA */}
        <div className="relative z-10 p-4 pt-0 mt-auto">
          <Button
            ref={cartButtonRef}
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white font-semibold border border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
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

