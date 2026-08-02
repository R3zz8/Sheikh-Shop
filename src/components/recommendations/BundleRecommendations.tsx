'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Percent, Plus } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import type { BundleRecommendation } from '@/lib/recommendations';
import { useUserBehavior } from '@/hooks/useUserBehavior';
import { createRecommendationEngine } from '@/lib/recommendations';
import { formatToToman } from '@/lib/currency';
import { resolveProductPrice } from '@/lib/product-pricing';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface BundleRecommendationsProps {
  currentProduct?: ProductsWithImages;
  products: ProductsWithImages[];
  limit?: number;
  onAddBundleToCart?: (bundle: BundleRecommendation) => void;
}

export default function BundleRecommendations({
  currentProduct,
  products,
  limit = 2,
  onAddBundleToCart
}: BundleRecommendationsProps) {
  const [bundles, setBundles] = useState<BundleRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingMap, setIsAddingMap] = useState<Record<string, boolean>>({});

  const { addToCartMutation } = useCart();

  const { getRecommendationContext = () => ({
    currentProductId: currentProduct?.id,
    currentCategoryId: currentProduct?.category,
    userPreferences: {
      preferredCategories: [],
      priceRange: { min: 0, max: 1000 },
      preferredUnits: [],
      browsingHistory: [],
      cartHistory: [],
      purchaseHistory: []
    },
    recentActivity: []
  }), trackProductView = () => {} } = useUserBehavior() || {};

  useEffect(() => {
    const generateBundles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!currentProduct) {
          setBundles([]);
          return;
        }

        const context = getRecommendationContext(
          currentProduct.id,
          currentProduct.category
        );
        
        const engine = createRecommendationEngine(products);
        const bundleResults = engine.getBundleRecommendations(currentProduct, context, limit);
        
        setBundles(bundleResults);
      } catch (err) {
        console.error('Failed to generate bundles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bundle recommendations');
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    generateBundles();
  }, [currentProduct, products, limit, getRecommendationContext]);

  const handleAddToCart = async (bundle: BundleRecommendation) => {
    if (isAddingMap[bundle.id]) return;

    // Set loading state for this specific bundle
    setIsAddingMap(prev => ({ ...prev, [bundle.id]: true }));

    try {
      // Sequentially add each product in the bundle to the cart
      for (const prod of bundle.products) {
        const cheapestUnit = prod.units && prod.units.length > 0
          ? prod.units.reduce((lowest, unit) => Number(unit.price) < Number(lowest.price) ? unit : lowest)
          : undefined;

        await addToCartMutation.mutateAsync({
          productId: prod.id,
          unitId: cheapestUnit?.id,
          quantity: 1
        });
      }

      toast.success('بسته پیشنهادی با موفقیت به سبد خرید شما اضافه شد!');

      if (onAddBundleToCart) {
        onAddBundleToCart(bundle);
      }
    } catch (err) {
      console.error('Failed to add bundle to cart:', err);
      // Toast message will be shown by the mutation onError hook or fallback
      toast.error('افزودن بسته به سبد خرید با خطا مواجه شد. لطفا دوباره تلاش کنید.');
    } finally {
      setIsAddingMap(prev => ({ ...prev, [bundle.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="h-6 bg-neutral-800 animate-pulse rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-48 bg-neutral-800 animate-pulse rounded-lg border border-amber-500/10"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4" dir="rtl">
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (bundles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">پیشنهاد خرید ترکیبی</h3>
        <div className="flex-1 h-px bg-gradient-to-l from-amber-400/20 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map((bundle, index) => {
          // Dynamic pricing based on resolveProductPrice()
          const totalOriginal = bundle.products.reduce((sum, p) => {
            const priceInfo = resolveProductPrice(p);
            return sum + priceInfo.price;
          }, 0);

          const discountPercentage = bundle.discountPercentage || 15;
          const savings = Math.round(totalOriginal * (discountPercentage / 100));
          const finalTotalPrice = totalOriginal - savings;

          const isAdding = !!isAddingMap[bundle.id];

          return (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative overflow-hidden bg-[#2A1A12] border border-amber-500/25 rounded-3xl p-6 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Bundle Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="text-right">
                    <h4 className="text-lg font-bold text-stone-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      بسته پیشنهادی ویژه
                    </h4>
                    <p className="text-xs text-stone-300 mt-1">
                      با خرید همزمان این کالاها از {discountPercentage}٪ تخفیف ویژه بهره‌مند شوید.
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/35 rounded-full px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                      <Percent className="w-3 h-3" />
                      {discountPercentage}٪ تخفیف
                    </span>
                  </div>
                </div>

                {/* Products in Bundle */}
                <div className="space-y-3 mb-6">
                  {bundle.products.map((prod, productIndex) => {
                    const priceInfo = resolveProductPrice(prod);
                    const hasUnits = prod.units && prod.units.length > 0;

                    return (
                      <div key={prod.id} className="relative">
                        <div
                          className="flex items-center gap-4 p-3 bg-[#1C120C]/90 rounded-2xl border border-amber-500/10 hover:border-amber-500/25 transition-colors duration-200"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#2A1A12] border border-[#5D4037]/25 shrink-0 flex items-center justify-center">
                            {prod.images && prod.images.length > 0 ? (
                              <img
                                src={prod.images[0]?.image || ''}
                                alt={prod.name || 'محصول'}
                                className="w-full h-full object-cover"
                                onClick={() => trackProductView(prod.id, prod.category)}
                              />
                            ) : (
                              <Package className="w-6 h-6 text-stone-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 text-right">
                            <h5 className="text-sm font-bold text-stone-200 truncate">{prod.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-black text-amber-400/90">{formatToToman(priceInfo.price)}</span>
                              {hasUnits && prod.units && prod.units.length > 0 && (
                                <span className="text-[10px] text-stone-300 bg-[#2A1A12] border border-[#5D4037]/20 px-1.5 py-0.5 rounded-md">
                                  {prod.units?.[0]?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {productIndex < bundle.products.length - 1 && (
                          <div className="absolute -bottom-2.5 right-8 z-10 w-5 h-5 rounded-full bg-[#1C120C] border border-amber-500/15 flex items-center justify-center">
                            <Plus className="w-3 h-3 text-amber-500/80" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bundle Footer & CTA */}
              <div className="pt-4 border-t border-[#5D4037]/35 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-right">
                  <div className="flex items-baseline gap-1.5 justify-start">
                    <span className="text-xs text-stone-300">قیمت نهایی بسته:</span>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                      {formatToToman(finalTotalPrice)}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-400 font-bold mt-0.5">
                    تخفیف خرید گروهی: {formatToToman(savings)}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(bundle)}
                  disabled={isAdding}
                  className="w-full sm:w-auto min-h-[46px] bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  aria-label="افزودن بسته به سبد خرید"
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>در حال افزودن...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-stone-950" />
                      <span>افزودن بسته به سبد خرید</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
