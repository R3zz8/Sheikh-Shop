import type { ProductsWithImages } from '@/types';

export interface SalesPrediction {
  productId: string;
  productName: string;
  predictedSales: number;
  confidence: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
  factors: {
    historicalTrend: number;
    seasonality: number;
    priceImpact: number;
    competition: number;
  };
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  characteristics: {
    avgOrderValue: number;
    purchaseFrequency: number;
    preferredCategories: string[];
    priceSensitivity: 'low' | 'medium' | 'high';
    loyalty: 'new' | 'regular' | 'vip';
  };
  recommendations: {
    marketingStrategy: string;
    productSuggestions: string[];
    pricingStrategy: string;
  };
}

export interface MarketInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'warning' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  actions?: string[];
  data: {
    metric: string;
    currentValue: number;
    previousValue: number;
    change: number;
    changePercentage: number;
  };
}

export interface PerformanceMetrics {
  revenue: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  customers: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  conversion: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export class SmartAnalytics {
  private products: ProductsWithImages[] = [];
  private salesData: any[] = [];
  private customerData: any[] = [];

  constructor(products: ProductsWithImages[], salesData: any[] = [], customerData: any[] = []) {
    this.products = products;
    this.salesData = salesData;
    this.customerData = customerData;
  }

  // Generate sales predictions using simple ML algorithms
  generateSalesPredictions(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): SalesPrediction[] {
    const predictions: SalesPrediction[] = [];

    this.products.forEach(product => {
      // Simulate historical data analysis
      const historicalTrend = this.calculateHistoricalTrend(product);
      const seasonality = this.calculateSeasonality(product);
      const priceImpact = this.calculatePriceImpact(product);
      const competition = this.calculateCompetition(product);

      // Simple prediction model
      const baseSales = this.getBaseSales(product);
      const predictedSales = Math.round(
        baseSales * 
        (1 + historicalTrend) * 
        (1 + seasonality) * 
        (1 + priceImpact) * 
        (1 - competition)
      );

      const confidence = this.calculateConfidence(historicalTrend, seasonality, priceImpact, competition);

      predictions.push({
        productId: product.id,
        productName: product.name,
        predictedSales: Math.max(0, predictedSales),
        confidence,
        timeframe,
        factors: {
          historicalTrend,
          seasonality,
          priceImpact,
          competition,
        },
      });
    });

    return predictions.sort((a, b) => b.predictedSales - a.predictedSales);
  }

  // Generate customer segments using clustering-like approach
  generateCustomerSegments(): CustomerSegment[] {
    const segments: CustomerSegment[] = [
      {
        id: 'high_value',
        name: 'High-Value Customers',
        description: 'Customers with high average order value and frequent purchases',
        size: Math.floor(this.customerData.length * 0.15),
        characteristics: {
          avgOrderValue: 250,
          purchaseFrequency: 4.2,
          preferredCategories: ['ELECTRONICS', 'CLOTHING'],
          priceSensitivity: 'low',
          loyalty: 'vip',
        },
        recommendations: {
          marketingStrategy: 'Premium product recommendations and exclusive offers',
          productSuggestions: ['High-end electronics', 'Premium clothing', 'Luxury items'],
          pricingStrategy: 'Premium pricing with exclusive discounts',
        },
      },
      {
        id: 'frequent_buyers',
        name: 'Frequent Buyers',
        description: 'Regular customers who purchase frequently but with moderate values',
        size: Math.floor(this.customerData.length * 0.35),
        characteristics: {
          avgOrderValue: 85,
          purchaseFrequency: 6.8,
          preferredCategories: ['HOME', 'BOOKS', 'SPORTS'],
          priceSensitivity: 'medium',
          loyalty: 'regular',
        },
        recommendations: {
          marketingStrategy: 'Loyalty programs and bundle offers',
          productSuggestions: ['Home essentials', 'Books', 'Sports equipment'],
          pricingStrategy: 'Competitive pricing with loyalty rewards',
        },
      },
      {
        id: 'price_conscious',
        name: 'Price-Conscious Shoppers',
        description: 'Customers who prioritize value and look for deals',
        size: Math.floor(this.customerData.length * 0.30),
        characteristics: {
          avgOrderValue: 45,
          purchaseFrequency: 2.1,
          preferredCategories: ['CLOTHING', 'HOME'],
          priceSensitivity: 'high',
          loyalty: 'new',
        },
        recommendations: {
          marketingStrategy: 'Deal alerts and discount campaigns',
          productSuggestions: ['Sale items', 'Bundle deals', 'Clearance products'],
          pricingStrategy: 'Aggressive discounting and value propositions',
        },
      },
      {
        id: 'occasional_buyers',
        name: 'Occasional Buyers',
        description: 'Customers who make infrequent purchases',
        size: Math.floor(this.customerData.length * 0.20),
        characteristics: {
          avgOrderValue: 120,
          purchaseFrequency: 0.8,
          preferredCategories: ['ELECTRONICS', 'SPORTS'],
          priceSensitivity: 'medium',
          loyalty: 'new',
        },
        recommendations: {
          marketingStrategy: 'Re-engagement campaigns and seasonal promotions',
          productSuggestions: ['Seasonal items', 'Gift products', 'Special occasions'],
          pricingStrategy: 'Incentive-based pricing for re-engagement',
        },
      },
    ];

    return segments;
  }

  // Generate market insights and recommendations
  generateMarketInsights(): MarketInsight[] {
    const insights: MarketInsight[] = [];

    // Revenue trend analysis
    const revenueInsight = this.analyzeRevenueTrend();
    if (revenueInsight) insights.push(revenueInsight);

    // Product performance analysis
    const productInsight = this.analyzeProductPerformance();
    if (productInsight) insights.push(productInsight);

    // Seasonal opportunity analysis
    const seasonalInsight = this.analyzeSeasonalOpportunities();
    if (seasonalInsight) insights.push(seasonalInsight);

    // Price optimization insights
    const priceInsight = this.analyzePriceOptimization();
    if (priceInsight) insights.push(priceInsight);

    // Customer behavior insights
    const customerInsight = this.analyzeCustomerBehavior();
    if (customerInsight) insights.push(customerInsight);

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  // Calculate performance metrics
  calculatePerformanceMetrics(): PerformanceMetrics {
    const currentPeriod = this.getCurrentPeriodData();
    const previousPeriod = this.getPreviousPeriodData();

    return {
      revenue: this.calculateMetricChange(currentPeriod.revenue, previousPeriod.revenue),
      orders: this.calculateMetricChange(currentPeriod.orders, previousPeriod.orders),
      customers: this.calculateMetricChange(currentPeriod.customers, previousPeriod.customers),
      conversion: this.calculateMetricChange(currentPeriod.conversion, previousPeriod.conversion),
    };
  }

  // Get best time to launch deals
  getOptimalDealTiming(): {
    bestDays: string[];
    bestHours: string[];
    seasonalTrends: { month: string; impact: number }[];
    recommendations: string[];
  } {
    return {
      bestDays: ['Friday', 'Saturday', 'Sunday'],
      bestHours: ['10:00-12:00', '14:00-16:00', '19:00-21:00'],
      seasonalTrends: [
        { month: 'January', impact: 0.8 },
        { month: 'February', impact: 0.6 },
        { month: 'March', impact: 0.7 },
        { month: 'April', impact: 0.9 },
        { month: 'May', impact: 1.0 },
        { month: 'June', impact: 1.1 },
        { month: 'July', impact: 1.2 },
        { month: 'August', impact: 1.0 },
        { month: 'September', impact: 0.9 },
        { month: 'October', impact: 1.3 },
        { month: 'November', impact: 1.5 },
        { month: 'December', impact: 1.4 },
      ],
      recommendations: [
        'Launch major deals on Fridays for weekend shopping',
        'Schedule flash sales during peak hours (2-4 PM)',
        'Plan seasonal campaigns for October-December',
        'Use email marketing for deal announcements',
        'Create urgency with limited-time offers',
      ],
    };
  }

  // Private helper methods
  private calculateHistoricalTrend(product: ProductsWithImages): number {
    // Simulate historical trend calculation
    const baseTrend = (Math.random() - 0.5) * 0.3; // -15% to +15%
    const categoryMultiplier = this.getCategoryMultiplier(product.category?.name || '');
    return baseTrend * categoryMultiplier;
  }

  private calculateSeasonality(product: ProductsWithImages): number {
    const month = new Date().getMonth();
    const seasonalFactors = {
      ELECTRONICS: [1.2, 1.0, 1.1, 1.3, 1.4, 1.2, 1.1, 1.0, 1.2, 1.3, 1.5, 1.4],
      CLOTHING: [0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.2, 1.1, 1.3, 1.2, 1.1, 1.0],
      HOME: [1.1, 1.0, 1.2, 1.3, 1.4, 1.2, 1.1, 1.0, 1.2, 1.3, 1.4, 1.3],
      BOOKS: [1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.1, 1.2, 1.1, 1.0],
      SPORTS: [0.8, 0.9, 1.2, 1.4, 1.5, 1.3, 1.2, 1.1, 1.3, 1.2, 1.0, 0.9],
    };
    
    const factor = seasonalFactors[product.category?.name as keyof typeof seasonalFactors]?.[month] || 1.0;
    return (factor - 1) * 0.5; // Convert to percentage change
  }

  private calculatePriceImpact(product: ProductsWithImages): number {
    // Simulate price elasticity analysis
    const avgPrice = product.basePrice;
    const marketAvg = 100; // Simulated market average
    
    if (avgPrice < marketAvg * 0.8) return 0.1; // 10% boost for low prices
    if (avgPrice > marketAvg * 1.2) return -0.1; // 10% reduction for high prices
    return 0; // Neutral impact
  }

  private calculateCompetition(product: ProductsWithImages): number {
    // Simulate competition analysis
    const categoryProducts = this.products.filter(p => p.category?.name === product.category?.name);
    const competitionLevel = categoryProducts.length / 10; // Normalize by category size
    return Math.min(competitionLevel * 0.1, 0.3); // Max 30% impact
  }

  private getBaseSales(product: ProductsWithImages): number {
    // Simulate base sales calculation
    const categoryBase = {
      ELECTRONICS: 50,
      CLOTHING: 80,
      HOME: 60,
      BOOKS: 100,
      SPORTS: 40,
    };
    
    return categoryBase[product.category?.name as keyof typeof categoryBase] || 50;
  }

  private calculateConfidence(historicalTrend: number, seasonality: number, priceImpact: number, competition: number): number {
    // Calculate confidence based on data quality and consistency
    const dataQuality = 0.8; // Simulated data quality score
    const factorConsistency = 1 - Math.abs(historicalTrend - seasonality - priceImpact + competition) / 4;
    return Math.min(dataQuality * factorConsistency, 0.95);
  }

  private getCategoryMultiplier(category: string): number {
    const multipliers = {
      ELECTRONICS: 1.2,
      CLOTHING: 1.0,
      HOME: 1.1,
      BOOKS: 0.9,
      SPORTS: 1.3,
    };
    return multipliers[category as keyof typeof multipliers] || 1.0;
  }

  private analyzeRevenueTrend(): MarketInsight | null {
    const currentRevenue = 125000; // Simulated data
    const previousRevenue = 110000;
    const change = currentRevenue - previousRevenue;
    const changePercentage = (change / previousRevenue) * 100;

    return {
      id: 'revenue_trend',
      type: 'trend',
      title: 'Revenue Growth Trend',
      description: `Revenue has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercentage).toFixed(1)}% compared to last period`,
      impact: Math.abs(changePercentage) > 10 ? 'high' : Math.abs(changePercentage) > 5 ? 'medium' : 'low',
      confidence: 0.85,
      actionable: true,
      actions: change > 0 ? 
        ['Continue current strategy', 'Scale successful campaigns', 'Invest in growth areas'] :
        ['Review pricing strategy', 'Analyze customer acquisition', 'Optimize conversion funnel'],
      data: {
        metric: 'Revenue',
        currentValue: currentRevenue,
        previousValue: previousRevenue,
        change,
        changePercentage,
      },
    };
  }

  private analyzeProductPerformance(): MarketInsight | null {
    const topProduct = this.products[0]; // Simulated top product
    const avgPerformance = 50; // Simulated average
    const topPerformance = 85; // Simulated top performance

    return {
      id: 'product_performance',
      type: 'opportunity',
      title: 'Product Performance Opportunity',
      description: `${topProduct?.name || 'Product'} is performing ${((topPerformance - avgPerformance) / avgPerformance * 100).toFixed(0)}% above average`,
      impact: 'medium',
      confidence: 0.75,
      actionable: true,
      actions: [
        'Promote top-performing products',
        'Analyze success factors',
        'Apply learnings to other products',
      ],
      data: {
        metric: 'Product Performance',
        currentValue: topPerformance,
        previousValue: avgPerformance,
        change: topPerformance - avgPerformance,
        changePercentage: ((topPerformance - avgPerformance) / avgPerformance) * 100,
      },
    };
  }

  private analyzeSeasonalOpportunities(): MarketInsight | null {
    const currentMonth = new Date().getMonth();
    const seasonalImpact = [0.8, 0.9, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.2, 1.3, 1.4, 1.3][currentMonth] || 1.0;

    return {
      id: 'seasonal_opportunity',
      type: 'opportunity',
      title: 'Seasonal Sales Opportunity',
      description: `Current month shows ${((seasonalImpact - 1) * 100).toFixed(0)}% seasonal advantage`,
      impact: seasonalImpact > 1.2 ? 'high' : seasonalImpact > 1.1 ? 'medium' : 'low',
      confidence: 0.8,
      actionable: true,
      actions: [
        'Launch seasonal marketing campaigns',
        'Adjust inventory for seasonal demand',
        'Create seasonal product bundles',
      ],
      data: {
        metric: 'Seasonal Impact',
        currentValue: seasonalImpact,
        previousValue: 1.0,
        change: seasonalImpact - 1.0,
        changePercentage: (seasonalImpact - 1.0) * 100,
      },
    };
  }

  private analyzePriceOptimization(): MarketInsight | null {
    const avgPrice = this.products.reduce((sum, p) => sum + p.basePrice, 0) / this.products.length;
    const optimalPrice = avgPrice * 1.1; // 10% higher optimal price

    return {
      id: 'price_optimization',
      type: 'recommendation',
      title: 'Price Optimization Opportunity',
      description: `Average price could be increased by ${((optimalPrice - avgPrice) / avgPrice * 100).toFixed(0)}% for better margins`,
      impact: 'medium',
      confidence: 0.7,
      actionable: true,
      actions: [
        'Test price increases on select products',
        'Monitor conversion rate impact',
        'Implement dynamic pricing',
      ],
      data: {
        metric: 'Average Price',
        currentValue: avgPrice,
        previousValue: optimalPrice,
        change: optimalPrice - avgPrice,
        changePercentage: ((optimalPrice - avgPrice) / avgPrice) * 100,
      },
    };
  }

  private analyzeCustomerBehavior(): MarketInsight | null {
    const avgOrderValue = 85; // Simulated data
    const targetOrderValue = 100;
    const gap = targetOrderValue - avgOrderValue;

    return {
      id: 'customer_behavior',
      type: 'recommendation',
      title: 'Customer Value Optimization',
      description: `Average order value is $${gap} below target. Upselling opportunities exist.`,
      impact: 'medium',
      confidence: 0.8,
      actionable: true,
      actions: [
        'Implement upselling strategies',
        'Create product bundles',
        'Optimize checkout flow',
      ],
      data: {
        metric: 'Average Order Value',
        currentValue: avgOrderValue,
        previousValue: targetOrderValue,
        change: gap,
        changePercentage: (gap / targetOrderValue) * 100,
      },
    };
  }

  private getCurrentPeriodData() {
    return {
      revenue: 125000,
      orders: 1250,
      customers: 850,
      conversion: 3.2,
    };
  }

  private getPreviousPeriodData() {
    return {
      revenue: 110000,
      orders: 1100,
      customers: 750,
      conversion: 2.8,
    };
  }

  private calculateMetricChange(current: number, previous: number) {
    const change = current - previous;
    const changePercentage = (change / previous) * 100;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

    return {
      current,
      previous,
      change,
      changePercentage,
      trend: trend as 'up' | 'down' | 'stable',
    };
  }
}

// Factory function to create smart analytics
export function createSmartAnalytics(products: ProductsWithImages[], salesData?: any[], customerData?: any[]): SmartAnalytics {
  return new SmartAnalytics(products, salesData, customerData);
}

