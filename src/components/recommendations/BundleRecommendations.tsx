'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Percent, ArrowRight } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import type { BundleRecommendation, RecommendationContext } from '@/lib/recommendations';
import { useUserBehavior } from '@/hooks/useUserBehavior';
import { createRecommendationEngine } from '@/lib/recommendations';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';
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
  const { getRecommendationContext, trackProductView } = useUserBehavior();
  const { currency } = useCurrencySafe();

  useEffect(() => {
    const generateBundles = async () => {
      setLoading(true);
      
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
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (bundles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl font-semibold text-white">Bundle Deals</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map((bundle, index) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-xl p-6 hover:border-amber-300/40 transition-all duration-300"
          >
            {/* Bundle Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{bundle.name}</h4>
                <p className="text-sm text-gray-300">{bundle.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-200">
                  {formatPrice(convertCurrency(bundle.totalPrice, 'EUR', currency), currency)}
                </div>
                <div className="text-sm text-green-400">
                  Save {formatPrice(convertCurrency(bundle.savings, 'EUR', currency), currency)}
                </div>
              </div>
            </div>

            {/* Discount Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                <div className="flex items-center gap-1">
                  <Percent className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    {bundle.discountPercentage}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Products in Bundle */}
            <div className="space-y-3 mb-6">
              {bundle.products.map((product, productIndex) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-amber-200/10"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onClick={() => trackProductView(product.id, product.category)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-white">{product.name}</h5>
                    <div className="text-xs text-gray-400">
                      {formatPrice(convertCurrency(product.basePrice, 'EUR', currency), currency)}
                    </div>
                  </div>
                  
                  {productIndex < bundle.products.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>

            {/* Bundle Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {bundle.products.length} products included
              </div>
              
              <Button
                onClick={() => handleAddToCart(bundle)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add Bundle to Cart
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

