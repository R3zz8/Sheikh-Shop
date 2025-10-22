import type { ProductsWithImages, ProductUnit } from '@/types';
import type { UserPreferences, RecommendationContext } from '@/hooks/useUserBehavior';

export type { RecommendationContext };

export interface RecommendationResult {
  product: ProductsWithImages;
  score: number;
  reason: string;
  type: 'similar' | 'cross_sell' | 'upsell' | 'trending' | 'personalized';
}

export interface BundleRecommendation {
  id: string;
  name: string;
  products: ProductsWithImages[];
  totalPrice: number;
  discountPercentage: number;
  savings: number;
  description: string;
}

export class RecommendationEngine {
  private products: ProductsWithImages[] = [];
  private categories: Map<string, ProductsWithImages[]> = new Map();

  constructor(products: ProductsWithImages[]) {
    this.products = products;
    this.buildCategoryIndex();
  }

  private buildCategoryIndex() {
    this.products.forEach(product => {
      if (product.category) {
        if (!this.categories.has(product.category)) {
          this.categories.set(product.category, []);
        }
        this.categories.get(product.category)!.push(product);
      }
    });
  }

  // Get personalized recommendations based on user behavior
  getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 6
  ): RecommendationResult[] {
    const { userPreferences, recentActivity, currentProductId } = context;
    const recommendations: RecommendationResult[] = [];

    // Filter out current product
    const availableProducts = this.products.filter(p => p.id !== currentProductId);

    // Category-based recommendations
    if (userPreferences.preferredCategories.length > 0) {
      const categoryProducts = availableProducts.filter(p => 
        userPreferences.preferredCategories.includes(p.category || '')
      );
      
      categoryProducts.forEach(product => {
        const score = this.calculateCategoryScore(product, userPreferences);
        if (score > 0.3) {
          recommendations.push({
            product,
            score,
            reason: 'Based on your preferred categories',
            type: 'personalized'
          });
        }
      });
    }

    // Price range recommendations
    const priceRangeProducts = availableProducts.filter(p => {
      const price = this.getProductPrice(p);
      return price >= userPreferences.priceRange.min && price <= userPreferences.priceRange.max;
    });

    priceRangeProducts.forEach(product => {
      const score = this.calculatePriceScore(product, userPreferences);
      if (score > 0.2) {
        recommendations.push({
          product,
          score,
          reason: 'Matches your price preferences',
          type: 'personalized'
        });
      }
    });

    // Browsing history recommendations
    if (userPreferences.browsingHistory.length > 0) {
      const similarProducts = this.getSimilarProducts(
        userPreferences.browsingHistory.slice(-5), // Last 5 viewed products
        availableProducts
      );
      
      similarProducts.forEach(product => {
        recommendations.push({
          product,
          score: 0.8,
          reason: 'Similar to products you viewed',
          type: 'similar'
        });
      });
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Get cross-sell recommendations for a specific product
  getCrossSellRecommendations(
    product: ProductsWithImages,
    context: RecommendationContext,
    limit: number = 4
  ): RecommendationResult[] {
    const recommendations: RecommendationResult[] = [];

    // Same category products
    if (product.category) {
      const categoryProducts = this.categories.get(product.category) || [];
      const otherCategoryProducts = categoryProducts.filter(p => p.id !== product.id);
      
      otherCategoryProducts.slice(0, 2).forEach(p => {
        recommendations.push({
          product: p,
          score: 0.7,
          reason: `Other ${product.category} products`,
          type: 'cross_sell'
        });
      });
    }

    // Complementary products (based on product name keywords)
    const keywords = this.extractKeywords(product.name);
    const complementaryProducts = this.products.filter(p => {
      if (p.id === product.id) return false;
      const pKeywords = this.extractKeywords(p.name);
      return keywords.some(keyword => pKeywords.includes(keyword));
    });

    complementaryProducts.slice(0, 2).forEach(p => {
      recommendations.push({
        product: p,
        score: 0.6,
        reason: 'Complements your selection',
        type: 'cross_sell'
      });
    });

    return recommendations.slice(0, limit);
  }

  // Get upsell recommendations (higher value products)
  getUpsellRecommendations(
    product: ProductsWithImages,
    context: RecommendationContext,
    limit: number = 3
  ): RecommendationResult[] {
    const currentPrice = this.getProductPrice(product);
    const recommendations: RecommendationResult[] = [];

    // Find products in same category with higher price
    if (product.category) {
      const categoryProducts = this.categories.get(product.category) || [];
      const upsellProducts = categoryProducts
        .filter(p => {
          const price = this.getProductPrice(p);
          return price > currentPrice && price <= currentPrice * 1.5; // Max 50% more expensive
        })
        .sort((a, b) => this.getProductPrice(a) - this.getProductPrice(b));

      upsellProducts.slice(0, limit).forEach(p => {
        const priceDiff = this.getProductPrice(p) - currentPrice;
        recommendations.push({
          product: p,
          score: 0.8,
          reason: `Premium option (+${priceDiff.toFixed(2)})`,
          type: 'upsell'
        });
      });
    }

    return recommendations;
  }

  // Get trending products (most viewed/purchased)
  getTrendingRecommendations(
    context: RecommendationContext,
    limit: number = 4
  ): RecommendationResult[] {
    // This would typically come from analytics data
    // For now, we'll use a simple heuristic based on product features
    const trendingProducts = this.products
      .filter(p => p.isAmazing || p.discounts?.length > 0)
      .sort((a, b) => {
        const aScore = (a.isAmazing ? 1 : 0) + (a.discounts?.length || 0);
        const bScore = (b.isAmazing ? 1 : 0) + (b.discounts?.length || 0);
        return bScore - aScore;
      })
      .slice(0, limit);

    return trendingProducts.map(product => ({
      product,
      score: 0.9,
      reason: 'Trending now',
      type: 'trending'
    }));
  }

  // Get bundle recommendations
  getBundleRecommendations(
    product: ProductsWithImages,
    context: RecommendationContext,
    limit: number = 2
  ): BundleRecommendation[] {
    const bundles: BundleRecommendation[] = [];

    // Create bundles based on product category and complementary items
    if (product.category) {
      const categoryProducts = this.categories.get(product.category) || [];
      const otherProducts = categoryProducts.filter(p => p.id !== product.id);

      if (otherProducts.length > 0) {
        // Create a bundle with the current product and 1-2 complementary products
        const bundleProducts = [product, ...otherProducts.slice(0, 2)];
        const totalPrice = bundleProducts.reduce((sum, p) => sum + this.getProductPrice(p), 0);
        const discountPercentage = 15; // 15% bundle discount
        const savings = totalPrice * (discountPercentage / 100);

        bundles.push({
          id: `bundle_${product.id}_${Date.now()}`,
          name: `${product.category} Bundle`,
          products: bundleProducts,
          totalPrice: totalPrice - savings,
          discountPercentage,
          savings,
          description: `Save ${discountPercentage}% when you buy these ${product.category} products together`
        });
      }
    }

    return bundles.slice(0, limit);
  }

  // Helper methods
  private calculateCategoryScore(product: ProductsWithImages, preferences: UserPreferences): number {
    if (!product.category) return 0;
    
    const categoryIndex = preferences.preferredCategories.indexOf(product.category);
    if (categoryIndex === -1) return 0;
    
    // Higher score for more recently preferred categories
    return 1 - (categoryIndex / preferences.preferredCategories.length);
  }

  private calculatePriceScore(product: ProductsWithImages, preferences: UserPreferences): number {
    const price = this.getProductPrice(product);
    const { min, max } = preferences.priceRange;
    
    if (price < min || price > max) return 0;
    
    // Higher score for prices closer to the middle of the range
    const range = max - min;
    const middle = min + range / 2;
    const distance = Math.abs(price - middle);
    
    return 1 - (distance / (range / 2));
  }

  private getSimilarProducts(
    viewedProductIds: string[],
    availableProducts: ProductsWithImages[]
  ): ProductsWithImages[] {
    // Simple similarity based on category and price range
    const viewedProducts = this.products.filter(p => viewedProductIds.includes(p.id));
    const avgPrice = viewedProducts.reduce((sum, p) => sum + this.getProductPrice(p), 0) / viewedProducts.length;
    const categories = new Set(viewedProducts.map(p => p.category).filter(Boolean));

    return availableProducts.filter(p => {
      const price = this.getProductPrice(p);
      const priceSimilar = Math.abs(price - avgPrice) / avgPrice < 0.3; // Within 30% price range
      const categorySimilar = p.category && categories.has(p.category);
      
      return priceSimilar || categorySimilar;
    });
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['with', 'and', 'the', 'for', 'from'].includes(word));
  }

  private getProductPrice(product: ProductsWithImages): number {
    // Get the lowest price from units or use base price
    if (product.units && product.units.length > 0) {
      const activeUnits = product.units.filter(u => u.isActive && u.stock > 0);
      if (activeUnits.length > 0) {
        return Math.min(...activeUnits.map(u => Number(u.price)));
      }
    }
    return product.basePrice;
  }
}

// Factory function to create recommendation engine
export function createRecommendationEngine(products: ProductsWithImages[]): RecommendationEngine {
  return new RecommendationEngine(products);
}

