'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { ShoppingCart, ArrowLeft, Star, Sparkles, Crown, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import type { ProductsWithImages } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

export default function ProductDetail(product: ProductsWithImages) {
  const { addToCartMutation } = useCart();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  // Determine premium badge based on price
  const isPremium = (product?.price || 0) > 50;
  const isLuxury = (product?.price || 0) > 100;

  // Generate random rating for demo
  const rating = Math.floor(Math.random() * 2) + 4;
  const reviewCount = Math.floor(Math.random() * 200) + 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

      <div className="container mx-auto py-10 relative z-10">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className={cn(
              'text-gray-200 hover:text-white hover:bg-white/8 backdrop-blur-sm border border-white/20',
              'transition-all duration-300 transform hover:-translate-x-1',
              'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
              'touch-feedback',
            )}
          >
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </Button>
        </div>

        {/* Main product card with refined glassmorphism */}
        <div className="max-w-6xl mx-auto">
          <div
            ref={ref}
            className={cn(
              'relative',
              inView ? 'animate-scale-in' : 'opacity-0 scale-95',
            )}
          >
            {/* Subtle elegant border */}
            <div className="absolute -inset-px bg-gradient-to-r from-amber-200/15 via-yellow-200/15 to-orange-200/15 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

            {/* Glassmorphism card */}
            <Card className="relative bg-white/8 backdrop-blur-xl border border-white/15 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="relative p-6 sm:p-8 pb-0 text-center lg:text-left">
                {isPremium && (
                  <div className="absolute top-6 right-6 z-20">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-amber-200/40">
                      {isLuxury ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      {isLuxury ? 'LUXURY' : 'PREMIUM'}
                    </div>
                  </div>
                )}
                {/* Action buttons */}
                <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'w-10 h-10 rounded-full bg-white/8 backdrop-blur-sm border border-white/20',
                      'hover:bg-white/12 hover:border-white/30 transition-all duration-300',
                      'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                      'touch-feedback',
                    )}
                    aria-label="Add to favorites"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'w-10 h-10 rounded-full bg-white/8 backdrop-blur-sm border border-white/20',
                      'hover:bg-white/12 hover:border-white/30 transition-all duration-300',
                      'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                      'touch-feedback',
                    )}
                    aria-label="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent tracking-tight text-center lg:text-left">
                  {product?.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Product Image */}
                  <div className="space-y-6">
                    <div className="relative bg-white/6 backdrop-blur-sm border border-white/15 rounded-2xl p-4 sm:p-6 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/5 via-yellow-50/3 to-orange-50/5" />
                      {product?.images.length > 0 ? (
                        <Image
                          src={product?.images[0]?.image || ''}
                          alt={product?.name}
                          width={600}
                          height={600}
                          quality={90}
                          className="relative z-10 rounded-xl w-full h-auto object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      ) : (
                        <div className="w-full h-64 sm:h-96 bg-white/6 flex items-center justify-center rounded-xl border border-white/15">
                          <div className="text-center">
                            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">No Image Available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col justify-between space-y-6">
                    <div className="space-y-6">
                      {/* Price */}
                      <div className="text-center lg:text-left">
                        <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent tracking-tight">
                          ${(product?.price || 0).toFixed(2)}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex justify-center lg:justify-start items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={`product-star-${star}`}
                              className={cn(
                                'w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300',
                                star <= rating
                                  ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.3)]'
                                  : 'text-gray-600',
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-gray-300 text-sm sm:text-lg font-medium ml-3">
                          ({reviewCount} reviews)
                        </span>
                      </div>

                      {/* Category */}
                      <div className="text-center lg:text-left">
                        <span className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-gray-200 font-medium">
                          <Sparkles className="w-4 h-4" />
                          {product?.category}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="text-center lg:text-left">
                        <p className="text-gray-200 text-lg">
                          <span className="font-semibold text-white">Available:</span> {product?.quantity || 0} units
                        </p>
                      </div>

                      {/* Description */}
                      <div className="text-center lg:text-left">
                        <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                        <p className="text-gray-200 leading-relaxed text-base sm:text-lg">
                          {product?.description || 'No description available.'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 pt-4">
                      <Button
                        className={cn(
                          'w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600',
                          'hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700',
                          'text-white font-semibold py-4 px-8 rounded-xl border border-amber-500/30',
                          'shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300',
                          'transform hover:-translate-y-0.5 backdrop-blur-sm text-lg',
                          'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                          'touch-feedback',
                        )}
                        onClick={() => addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
                        disabled={addToCartMutation.isPending}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                      </Button>

                      <Button
                        variant="outline"
                        asChild
                        className={cn(
                          'w-full bg-white/8 backdrop-blur-sm border border-white/20',
                          'text-white hover:bg-white/12 hover:text-white hover:border-white/30 font-medium',
                          'py-4 px-8 rounded-xl transition-all duration-300',
                          'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                          'touch-feedback',
                        )}
                      >
                        <Link href="/products" className="flex items-center justify-center gap-2">
                          <ArrowLeft className="w-5 h-5" />
                          Back to Products
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
