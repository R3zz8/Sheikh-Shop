'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Percent, ArrowRight, Sparkles } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import type { BundleRecommendation, RecommendationContext } from '@/lib/recommendations';
import { useUserBehavior } from '@/hooks/useUserBehavior';
import { createRecommendationEngine } from '@/lib/recommendations';
import { formatToToman } from '@/lib/currency';
import { Button } from '@/components/ui';

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
      } catch (error) {
        console.error('Failed to generate bundles:', error);
        setError(error instanceof Error ? error.message : 'Failed to load bundle recommendations');
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    generateBundles();
  }, [currentProduct, products, limit, getRecommendationContext]);

  const handleAddToCart = (bundle: BundleRecommendation) => {
    if (onAddBundleToCart) {
      onAddBundleToCart(bundle);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="h-6 bg-white/5 animate-pulse rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 text-right" dir="rtl">
        <p className="text-rose-400 text-xs">امکان بارگذاری پکیج‌های پیشنهادی میسر نشد.</p>
      </div>
    );
  }

  if (bundles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 font-vazirmatn text-right" dir="rtl">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
          <Package className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-black bg-gradient-to-l from-amber-200 via-white to-amber-100 bg-clip-text text-transparent">
            پکیج‌های خرید شگفت‌انگیز (باندل مچ)
          </h3>
          <p className="text-xs text-stone-400 mt-1">با خرید همزمان این محصولات، تخفیف مضاعف روی سبد خرید خود دریافت کنید.</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-amber-500/10 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map((bundle, index) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-neutral-900/80 border border-amber-500/25 backdrop-blur-md rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden group/card"
          >
            {/* Ambient luxury glow inside the card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover/card:bg-amber-500/10 transition-colors duration-500" />

            {/* Bundle Header info */}
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{bundle.name === `${currentProduct?.category} Bundle` ? 'بسته ترکیبی طلایی' : bundle.name}</span>
                </h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  خرید مکمل محصولات با تخفیف ویژه اختصاصی سبد خرید.
                </p>
              </div>

              <div className="text-left shrink-0">
                <div className="text-xl font-black text-amber-300">
                  {formatToToman(bundle.totalPrice)}
                </div>
                <div className="text-xs text-emerald-400 font-bold mt-1">
                  میزان سود شما: {formatToToman(bundle.savings)}
                </div>
              </div>
            </div>

            {/* Discount Percentage Badge */}
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                <span>{bundle.discountPercentage}٪ تخفیف کل پکیج</span>
              </span>
            </div>

            {/* Products inside this Bundle list */}
            <div className="space-y-3">
              {bundle.products.map((product, productIndex) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-neutral-950/40 rounded-2xl border border-white/5 hover:border-amber-500/15 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shrink-0 relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]?.image || ''}
                        alt={product.name || 'محصول'}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        onClick={() => trackProductView(product.id, product.category)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-stone-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-stone-200 truncate">{product.name}</h5>
                    <div className="text-xs text-stone-400 mt-1 font-semibold">
                      قیمت تک: {formatToToman(product.basePrice)}
                    </div>
                  </div>
                  
                  {productIndex < bundle.products.length - 1 && (
                    <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5 shrink-0 text-stone-400">
                      +
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-5 mt-2">
              <div className="text-xs text-stone-400 font-medium">
                شامل {bundle.products.length} محصول درجه یک
              </div>
              
              <Button
                onClick={() => handleAddToCart(bundle)}
                className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-stone-950 px-6 py-2.5 rounded-2xl font-black text-xs transition-all duration-300 flex items-center gap-2 shadow-lg shadow-amber-500/5 border border-amber-400/20 group/btn"
              >
                <ShoppingCart className="w-4 h-4 text-stone-950" />
                <span>افزودن کل پکیج به سبد خرید</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
