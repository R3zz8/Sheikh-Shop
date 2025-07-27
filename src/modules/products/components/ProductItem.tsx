'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ShoppingCart, Star, Sparkles, Crown, Zap, Eye } from 'lucide-react';
import { ProductsWithImages } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useInView } from '@/hooks/useInView';
import { QuickViewModal } from '@/components/ui/quick-view-modal';
import { cn } from '@/lib/utils';

export default function ProductItem({ product }: { product: ProductsWithImages }) {
  const { addToCartMutation } = useCart();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  // Determine premium badge based on price
  const isPremium = (product?.price || 0) > 50;
  const isLuxury = (product?.price || 0) > 100;

  // Generate random rating for demo
  const rating = Math.floor(Math.random() * 2) + 4;
  const reviewCount = Math.floor(Math.random() * 200) + 50;

  return (
    <div
      ref={ref}
      className={cn(
        "group relative gpu-accelerated",
        inView ? "animate-slide-in-up" : "opacity-0 translate-y-8"
      )}
    >
      {/* Subtle elegant border */}
      <div className="absolute -inset-px bg-gradient-to-r from-amber-200/20 via-yellow-200/20 to-orange-200/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:duration-300" />

      {/* Glassmorphism card */}
      <div className={cn(
        "relative bg-white/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15",
        "shadow-xl hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-500",
        "hover:scale-[1.02] group-hover:bg-white/12 overflow-hidden",
        "transform-style-preserve-3d perspective-1000",
        "group-hover:rotate-x-1 group-hover:rotate-y-1",
        "touch-feedback"
      )}>
        {/* Premium badge */}
        {isPremium && (
          <div className="absolute top-4 right-4 z-20">
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-amber-200/30">
              {isLuxury ? <Crown className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              {isLuxury ? 'LUXURY' : 'PREMIUM'}
            </div>
          </div>
        )}

        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/3 via-yellow-50/2 to-orange-50/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Elegant top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Price */}
        <div className="text-center mb-4">
          <p className="text-2xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent tracking-tight">
            ${(product?.price || 0).toFixed(2)}
          </p>
        </div>

        {/* Product Image - elegant container */}
        <div className="relative w-full h-56 mb-6 flex items-center justify-center bg-white/6 backdrop-blur-sm rounded-xl p-4 border border-white/10 group-hover:bg-white/8 group-hover:border-white/15 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/5 via-yellow-50/3 to-orange-50/5 rounded-xl" />
          <Image
            src={product?.images[0]?.image || '/assets/noImage.jpg'}
            alt={product?.name}
            width={240}
            height={240}
            className="relative z-10 object-contain max-h-full max-w-full rounded-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {/* Subtle hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/10 via-yellow-100/8 to-orange-100/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Product Name */}
        <h3 className="text-xl font-semibold text-white mb-3 text-center group-hover:text-amber-50 transition-colors duration-300">
          {product?.name}
        </h3>

        {/* Product Description */}
        <p className="text-gray-300 text-sm text-center mb-4 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
          {product?.description || 'Premium quality product with exceptional features.'}
        </p>

        {/* Star Rating */}
        <div className="flex justify-center items-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4 transition-all duration-300",
                star <= rating
                  ? "fill-amber-300 text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.3)]"
                  : "text-gray-600"
              )}
            />
          ))}
          <span className="text-gray-400 text-sm ml-2">({reviewCount})</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 relative z-10">
          {/* Quick View Button */}
          <QuickViewModal product={product}>
            <Button
              className={cn(
                "w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600",
                "hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700",
                "text-white font-semibold py-3 px-6 rounded-xl border border-amber-500/30",
                "shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300",
                "transform hover:-translate-y-0.5 backdrop-blur-sm",
                "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
                "touch-feedback"
              )}
            >
              <Eye className="w-4 h-4 mr-2" />
              Quick View
            </Button>
          </QuickViewModal>

          {/* View Details Button - elegant style */}
          <Button
            variant="outline"
            asChild
            className={cn(
              "w-full bg-white/8 backdrop-blur-sm border border-white/20",
              "text-white hover:bg-white/12 hover:text-white hover:border-white/30 font-medium",
              "py-3 px-6 rounded-xl transition-all duration-300",
              "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
              "touch-feedback"
            )}
          >
            <Link href={`/products/${product.id}`} className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              View Details
            </Link>
          </Button>
        </div>

        {/* Elegant bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
}
