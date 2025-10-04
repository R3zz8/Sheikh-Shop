'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Star, Package } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import type { RecommendationResult, RecommendationContext } from '@/lib/recommendations';
import { useUserBehavior } from '@/hooks/useUserBehavior';
import { createRecommendationEngine } from '@/lib/recommendations';
import ProductCard from '@/components/product/ProductCard';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';

interface ProductRecommendationsProps {
  currentProduct?: ProductsWithImages;
  products: ProductsWithImages[];
  type?: 'personalized' | 'cross_sell' | 'upsell' | 'trending' | 'all';
  limit?: number;
  title?: string;
  showReason?: boolean;
}

export default function ProductRecommendations({
  currentProduct,
  products,
  type = 'all',
  limit = 6,
  title,
  showReason = true
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
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
  const { currency = 'EUR' } = useCurrencySafe() || {};

  useEffect(() => {
    const generateRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const context = getRecommendationContext(
          currentProduct?.id,
          currentProduct?.category
        );
        
        const engine = createRecommendationEngine(products);
        let results: RecommendationResult[] = [];

        switch (type) {
          case 'personalized':
            results = engine.getPersonalizedRecommendations(context, limit);
            break;
          case 'cross_sell':
            if (currentProduct) {
              results = engine.getCrossSellRecommendations(currentProduct, context, limit);
            }
            break;
          case 'upsell':
            if (currentProduct) {
              results = engine.getUpsellRecommendations(currentProduct, context, limit);
            }
            break;
          case 'trending':
            results = engine.getTrendingRecommendations(context, limit);
            break;
          case 'all':
          default:
            const personalized = engine.getPersonalizedRecommendations(context, Math.ceil(limit / 2));
            const trending = engine.getTrendingRecommendations(context, Math.ceil(limit / 2));
            results = [...personalized, ...trending]
              .sort((a, b) => b.score - a.score)
              .slice(0, limit);
            break;
        }

        setRecommendations(results);
      } catch (error) {
        console.error('Failed to generate recommendations:', error);
        setError(error instanceof Error ? error.message : 'Failed to load recommendations');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [currentProduct, products, type, limit, getRecommendationContext]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'personalized':
        return <Users className="w-4 h-4" />;
      case 'cross_sell':
        return <Package className="w-4 h-4" />;
      case 'upsell':
        return <TrendingUp className="w-4 h-4" />;
      case 'trending':
        return <Star className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personalized':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'cross_sell':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'upsell':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'trending':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const defaultTitle = type === 'all' ? 'Recommended for You' : 
                      type === 'personalized' ? 'Personalized Recommendations' :
                      type === 'cross_sell' ? 'You Might Also Like' :
                      type === 'upsell' ? 'Premium Options' :
                      'Trending Now';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          {getTypeIcon(type)}
          {title || defaultTitle}
        </h3>
        <span className="text-sm text-gray-400">
          {recommendations.length} products
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative"
          >
            <div
              className="cursor-pointer"
              onClick={() => trackProductView(rec.product.id, rec.product.category)}
            >
              <ProductCard product={rec.product} />
            </div>
            
            {showReason && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 + 0.2 }}
                className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getTypeColor(rec.type)}`}
              >
                {rec.reason}
              </motion.div>
            )}
            
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-xs text-gray-400">
                  {Math.round(rec.score * 100)}% match
                </span>
              </div>
              
              <div className="text-xs text-gray-400">
                {formatPrice(
                  convertCurrency(rec.product.basePrice, 'EUR', currency),
                  currency
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

