'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { useCart } from '@/hooks/useCart';
import { cn, formatPrice } from '@/lib/utils';

export default function ProductItem({ product, index = 0 }: { product: ProductsWithImages; index?: number }) {
  const { addToCartMutation } = useCart();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Determine premium badge based on price
  const isPremium = (product?.price || 0) > 50;

  // Generate deterministic rating and review count based on product ID hash
  const idHash = product.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const rating = 4 + (idHash % 2); // Either 4 or 5
  const reviewCount = 50 + (idHash % 200); // Between 50 and 249

  const handleAddToCart = () => {
    addToCartMutation.mutate(product.id);
  };

  return (
    <div className="relative bg-white/8 backdrop-blur-sm border border-amber-200/20 rounded-2xl overflow-hidden hover:border-amber-300/40 hover:bg-white/12 transition-all duration-300 group">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/3 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Price and Premium Badge */}
      <div className="relative z-10 p-4 pb-2 flex justify-between items-start">
        <p className="text-2xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
          {formatPrice(product?.price)}
        </p>
        {isPremium && (
          <span className="text-xs bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 text-white px-3 py-1 rounded-xl font-semibold border border-amber-500/30">
            PREMIUM
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative w-full h-48 bg-gradient-to-br from-amber-950/20 via-stone-900/20 to-amber-950/20 backdrop-blur-sm flex items-center justify-center p-4 border-t border-b border-amber-200/10 cursor-pointer hover:bg-gradient-to-br hover:from-amber-950/30 hover:via-stone-900/30 hover:to-amber-950/30 transition-all duration-300">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 animate-pulse rounded-lg" />
          )}
          <Image
            src={product?.images[0]?.image || '/assets/noImage.jpg'}
            alt={product?.name || 'Product image'}
            width={200}
            height={200}
            className={cn(
              'object-contain max-h-full max-w-full transition-all duration-300',
              isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            )}
            loading={index < 4 ? 'eager' : 'lazy'}
            priority={index < 4}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)}
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="relative z-10 p-4 pt-2">
        {/* Product Name */}
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-200 transition-colors duration-300 cursor-pointer hover:underline">
            {product?.name}
          </h3>
        </Link>

        {/* Product Description */}
        <p className="text-amber-200/80 text-sm mb-3">
          {product?.description || 'Premium quality product with exceptional features.'}
        </p>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'w-4 h-4',
                star <= rating
                  ? 'fill-amber-300 text-amber-300'
                  : 'text-amber-200/40',
              )}
            />
          ))}
          <span className="text-amber-200/60 text-sm ml-2">
            ({reviewCount})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="flex-1 bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white font-semibold border border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>

          {/* View Details Button */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 bg-white/8 backdrop-blur-sm border border-amber-200/20 text-white hover:bg-white/12 hover:border-amber-300/40 transition-all duration-300"
          >
            <Link href={`/product/${product.id}`}>
              <Zap className="w-4 h-4 mr-1" />
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

