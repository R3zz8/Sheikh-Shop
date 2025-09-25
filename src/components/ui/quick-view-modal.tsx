'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart, Star, Sparkles, Crown, Eye } from 'lucide-react';
import Image from 'next/image';
import type { ProductsWithImages } from '@/types';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';

interface QuickViewModalProps {
  product: ProductsWithImages;
  children: React.ReactNode;
}

export const QuickViewModal = ({ product, children }: QuickViewModalProps) => {
  const [open, setOpen] = useState(false);
  const { currency } = useCurrencySafe();
  const [mounted, setMounted] = useState(false);
  const { addToCartMutation } = useCart();

  const isPremium = (product?.basePrice || 0) > 50;
  const isLuxury = (product?.basePrice || 0) > 100;
  const rating = Math.floor(Math.random() * 2) + 4;
  const reviewCount = Math.floor(Math.random() * 200) + 50;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-md',
        'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
      )}>
        <div className={cn(
          'relative w-full max-w-4xl max-h-[90vh] overflow-hidden',
          'bg-white/12 backdrop-blur-2xl border border-white/20 rounded-3xl',
          'shadow-2xl shadow-amber-900/30',
          'data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out',
        )}>
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className={cn(
              'absolute top-4 right-4 z-30 w-10 h-10 rounded-full',
              'bg-white/12 backdrop-blur-sm border border-white/25',
              'hover:bg-white/20 hover:border-white/35 transition-all duration-300',
              'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
              'touch-feedback',
            )}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Premium badge */}
          {isPremium && (
            <div className="absolute top-4 left-4 z-30">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-amber-200/40">
                {isLuxury ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {isLuxury ? 'LUXURY' : 'PREMIUM'}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="relative h-96 lg:h-full bg-gradient-to-br from-amber-50/8 via-yellow-50/6 to-orange-50/8 p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/8 via-yellow-50/6 to-orange-50/8" />
              {product?.images.length > 0 ? (
                <Image
                  src={product?.images[0]?.image || ''}
                  alt={product?.name}
                  width={400}
                  height={400}
                  quality={90}
                  className="relative z-10 rounded-xl w-full h-full object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-white/8 flex items-center justify-center rounded-xl border border-white/15">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No Image Available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent tracking-tight">
                  {product?.name}
                </h2>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent tracking-tight">
                  {formatPrice(convertCurrency(product?.basePrice || 0, 'EUR', currency), currency)}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={`quick-view-star-${star}`}
                        className={cn(
                          'w-5 h-5 transition-all duration-300',
                          star <= rating
                            ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.3)]'
                            : 'text-gray-600',
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-gray-300 text-lg font-medium">
                    ({reviewCount} reviews)
                  </span>
                </div>

                {/* Category */}
                <div>
                  <span className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 text-gray-200 font-medium">
                    <Sparkles className="w-4 h-4" />
                    {product?.category}
                  </span>
                </div>

                {/* Quantity */}
                <div>
                  <p className="text-gray-200 text-lg">
                    <span className="font-semibold text-white">Available:</span> {product?.quantity || 0} units
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-200 leading-relaxed text-base">
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
                  onClick={() => {
                    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
                    setOpen(false);
                  }}
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className={cn(
                    'w-full bg-white/12 backdrop-blur-sm border border-white/25',
                    'text-white hover:bg-white/18 hover:text-white hover:border-white/35 font-medium',
                    'py-4 px-8 rounded-xl transition-all duration-300',
                    'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                    'touch-feedback',
                  )}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Eye className="w-5 h-5" />
                    View Full Details
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
