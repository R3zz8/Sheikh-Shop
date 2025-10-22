import type { ProductsWithImages } from '@/types';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    productId?: string;
    category?: string;
    action?: 'search' | 'recommend' | 'add_to_cart' | 'help';
    confidence?: number;
  };
}

export interface ChatContext {
  userId?: string;
  sessionId: string;
  conversationHistory: ChatMessage[];
  userPreferences: {
    preferredCategories: string[];
    priceRange: { min: number; max: number };
    recentSearches: string[];
    cartItems: string[];
  };
  currentProducts: ProductsWithImages[];
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
  products?: ProductsWithImages[];
  actions?: {
    type: 'search' | 'recommend' | 'add_to_cart' | 'navigate';
    data: any;
  }[];
}

export class ShoppingAssistant {
  private products: ProductsWithImages[] = [];
  private intents: Map<string, (context: ChatContext, message: string) => Promise<ChatResponse>> = new Map();

  constructor(products: ProductsWithImages[]) {
    this.products = products;
    this.initializeIntents();
  }

  // Initialize conversation intents
  private initializeIntents() {
    this.intents.set('greeting', this.handleGreeting.bind(this));
    this.intents.set('search', this.handleSearch.bind(this));
    this.intents.set('recommend', this.handleRecommend.bind(this));
    this.intents.set('price', this.handlePrice.bind(this));
    this.intents.set('availability', this.handleAvailability.bind(this));
    this.intents.set('add_to_cart', this.handleAddToCart.bind(this));
    this.intents.set('help', this.handleHelp.bind(this));
    this.intents.set('goodbye', this.handleGoodbye.bind(this));
  }

  // Main chat processing function
  async processMessage(context: ChatContext, userMessage: string): Promise<ChatResponse> {
    const intent = this.detectIntent(userMessage);
    const handler = this.intents.get(intent);
    
    if (handler) {
      return await handler(context, userMessage);
    }
    
    // Default response for unrecognized intents
    return this.handleDefault(context, userMessage);
  }

  // Detect user intent from message
  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Greeting patterns
    if (this.matchesPattern(lowerMessage, ['hello', 'hi', 'hey', 'good morning', 'good afternoon'])) {
      return 'greeting';
    }
    
    // Search patterns
    if (this.matchesPattern(lowerMessage, ['find', 'search', 'look for', 'show me', 'i need', 'i want'])) {
      return 'search';
    }
    
    // Recommendation patterns
    if (this.matchesPattern(lowerMessage, ['recommend', 'suggest', 'what should i buy', 'best', 'popular'])) {
      return 'recommend';
    }
    
    // Price patterns
    if (this.matchesPattern(lowerMessage, ['price', 'cost', 'expensive', 'cheap', 'budget', 'affordable'])) {
      return 'price';
    }
    
    // Availability patterns
    if (this.matchesPattern(lowerMessage, ['available', 'in stock', 'out of stock', 'when will'])) {
      return 'availability';
    }
    
    // Add to cart patterns
    if (this.matchesPattern(lowerMessage, ['add to cart', 'buy', 'purchase', 'order'])) {
      return 'add_to_cart';
    }
    
    // Help patterns
    if (this.matchesPattern(lowerMessage, ['help', 'how to', 'what can you do', 'assist'])) {
      return 'help';
    }
    
    // Goodbye patterns
    if (this.matchesPattern(lowerMessage, ['bye', 'goodbye', 'see you', 'thanks', 'thank you'])) {
      return 'goodbye';
    }
    
    return 'default';
  }

  // Check if message matches any patterns
  private matchesPattern(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => message.includes(pattern));
  }

  // Handle greeting intent
  private async handleGreeting(context: ChatContext, message: string): Promise<ChatResponse> {
    const greetings = [
      "Hello! I'm your shopping assistant. How can I help you find the perfect products today?",
      "Hi there! I'm here to help you discover amazing products. What are you looking for?",
      "Welcome! I can help you search for products, make recommendations, or answer questions. What would you like to do?",
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: randomGreeting || 'Hello! How can I help you today?',
        timestamp: new Date(),
        metadata: { action: 'help' },
      },
      suggestions: [
        "Show me popular products",
        "Find products under $50",
        "Recommend something for me",
        "What's new in electronics?",
      ],
    };
  }

  // Handle search intent
  private async handleSearch(context: ChatContext, message: string): Promise<ChatResponse> {
    const searchTerms = this.extractSearchTerms(message);
    const results = this.searchProducts(searchTerms, context.userPreferences);
    
    if (results.length === 0) {
      return {
        message: {
          id: this.generateMessageId(),
          type: 'assistant',
          content: `I couldn't find any products matching "${searchTerms.join(' ')}". Could you try different keywords or be more specific?`,
          timestamp: new Date(),
          metadata: { action: 'search' },
        },
        suggestions: [
          "Show me all products",
          "What categories do you have?",
          "Find popular items",
          "Search for electronics",
        ],
      };
    }
    
    const productList = results.slice(0, 3).map(product => 
      `• ${product.name} - $${product.basePrice}`
    ).join('\n');
    
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: `I found ${results.length} products matching your search:\n\n${productList}\n\nWould you like to see more details about any of these?`,
        timestamp: new Date(),
        metadata: { action: 'search', confidence: 0.8 },
      },
      products: results.slice(0, 3),
      suggestions: [
        "Show me more results",
        "Filter by price",
        "Show only in-stock items",
        "Sort by popularity",
      ],
    };
  }

  // Handle recommendation intent
  private async handleRecommend(context: ChatContext, message: string): Promise<ChatResponse> {
    const recommendations = this.getPersonalizedRecommendations(context);
    
    if (recommendations.length === 0) {
      return {
        message: {
          id: this.generateMessageId(),
          type: 'assistant',
          content: "I'd be happy to recommend products! Could you tell me what you're interested in? For example, electronics, clothing, or home goods?",
          timestamp: new Date(),
          metadata: { action: 'recommend' },
        },
        suggestions: [
          "Recommend electronics",
          "Show me bestsellers",
          "What's trending?",
          "Find deals and discounts",
        ],
      };
    }
    
    const productList = recommendations.slice(0, 3).map(product => 
      `• ${product.name} - $${product.basePrice}`
    ).join('\n');
    
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: `Based on your preferences, I recommend these products:\n\n${productList}\n\nThese are popular items that match your interests!`,
        timestamp: new Date(),
        metadata: { action: 'recommend', confidence: 0.9 },
      },
      products: recommendations.slice(0, 3),
      suggestions: [
        "Show me more recommendations",
        "Find similar products",
        "What's the best deal?",
        "Add to cart",
      ],
    };
  }

  // Handle price intent
  private async handlePrice(context: ChatContext, message: string): Promise<ChatResponse> {
    const priceRange = this.extractPriceRange(message);
    const products = this.getProductsInPriceRange(priceRange);
    
    if (products.length === 0) {
      return {
        message: {
          id: this.generateMessageId(),
          type: 'assistant',
          content: `I couldn't find products in that price range. Our products range from $${Math.min(...this.products.map(p => p.basePrice))} to $${Math.max(...this.products.map(p => p.basePrice))}. What's your budget?`,
          timestamp: new Date(),
          metadata: { action: 'search' },
        },
        suggestions: [
          "Show me products under $50",
          "Find items under $100",
          "What's the cheapest option?",
          "Show me premium products",
        ],
      };
    }
    
    const productList = products.slice(0, 3).map(product => 
      `• ${product.name} - $${product.basePrice}`
    ).join('\n');
    
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: `Here are products in your price range ($${priceRange.min} - $${priceRange.max}):\n\n${productList}\n\nWould you like to see more options?`,
        timestamp: new Date(),
        metadata: { action: 'search', confidence: 0.8 },
      },
      products: products.slice(0, 3),
      suggestions: [
        "Show me more products",
        "Sort by price",
        "Find the best value",
        "Add to cart",
      ],
    };
  }

  // Handle availability intent
  private async handleAvailability(context: ChatContext, message: string): Promise<ChatResponse> {
    const inStockProducts = this.products.filter(product => {
      if (product.units && product.units.length > 0) {
        return product.units.some(unit => unit.isActive && unit.stock > 0);
      }
      return product.quantity > 0;
    });
    
    const outOfStockProducts = this.products.filter(product => {
      if (product.units && product.units.length > 0) {
        return !product.units.some(unit => unit.isActive && unit.stock > 0);
      }
      return product.quantity === 0;
    });
    
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: `Here's our current stock status:\n\n✅ ${inStockProducts.length} products in stock\n❌ ${outOfStockProducts.length} products out of stock\n\nWould you like to see only in-stock items or get notified when out-of-stock items are back?`,
        timestamp: new Date(),
        metadata: { action: 'search' },
      },
      suggestions: [
        "Show me only in-stock items",
        "Notify me when back in stock",
        "Find similar available products",
        "Check specific product availability",
      ],
    };
  }

  // Handle add to cart intent
  private async handleAddToCart(context: ChatContext, message: string): Promise<ChatResponse> {
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: "I can help you add products to your cart! Which product would you like to add? You can tell me the product name or I can show you some options.",
        timestamp: new Date(),
        metadata: { action: 'add_to_cart' },
      },
      suggestions: [
        "Add the first product",
        "Show me my cart",
        "Find products to add",
        "Check out now",
      ],
      actions: [
        {
          type: 'navigate',
          data: { path: '/cart' },
        },
      ],
    };
  }

  // Handle help intent
  private async handleHelp(context: ChatContext, message: string): Promise<ChatResponse> {
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: "I'm here to help you shop! I can:\n\n🔍 Search for products\n💡 Make recommendations\n💰 Find products by price\n📦 Check availability\n🛒 Help with your cart\n\nWhat would you like to do?",
        timestamp: new Date(),
        metadata: { action: 'help' },
      },
      suggestions: [
        "Search for products",
        "Get recommendations",
        "Find deals",
        "Check my cart",
      ],
    };
  }

  // Handle goodbye intent
  private async handleGoodbye(context: ChatContext, message: string): Promise<ChatResponse> {
    const goodbyes = [
      "Thank you for shopping with us! Have a great day!",
      "Goodbye! Feel free to come back anytime for more shopping assistance.",
      "Thanks for visiting! I'm here whenever you need help finding products.",
    ];
    
    const randomGoodbye = goodbyes[Math.floor(Math.random() * goodbyes.length)];
    
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: randomGoodbye || 'Goodbye! Have a great day!',
        timestamp: new Date(),
        metadata: { action: 'help' },
      },
    };
  }

  // Handle default/unrecognized intent
  private async handleDefault(context: ChatContext, message: string): Promise<ChatResponse> {
    return {
      message: {
        id: this.generateMessageId(),
        type: 'assistant',
        content: "I'm not sure I understand. Could you try rephrasing that? I can help you search for products, make recommendations, or answer questions about our store.",
        timestamp: new Date(),
        metadata: { action: 'help' },
      },
      suggestions: [
        "Search for products",
        "Get recommendations",
        "What can you help me with?",
        "Show me popular items",
      ],
    };
  }

  // Extract search terms from message
  private extractSearchTerms(message: string): string[] {
    const stopWords = ['find', 'search', 'look for', 'show me', 'i need', 'i want', 'the', 'a', 'an', 'and', 'or', 'but'];
    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  // Search products based on terms and preferences
  private searchProducts(terms: string[], preferences: ChatContext['userPreferences']): ProductsWithImages[] {
    let results = this.products;
    
    // Filter by search terms
    if (terms.length > 0) {
      results = results.filter(product => {
        const searchText = `${product.name} ${product.description || ''} ${product.category?.name}`.toLowerCase();
        return terms.some(term => searchText.includes(term));
      });
    }
    
    // Filter by preferences
    if (preferences.preferredCategories.length > 0) {
      results = results.filter(product => 
        preferences.preferredCategories.includes(product.category?.name || '')
      );
    }
    
    if (preferences.priceRange.min > 0 || preferences.priceRange.max < 10000) {
      results = results.filter(product => 
        product.basePrice >= preferences.priceRange.min && 
        product.basePrice <= preferences.priceRange.max
      );
    }
    
    // Sort by relevance (bestsellers first, then by price)
    return results.sort((a, b) => {
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      return a.basePrice - b.basePrice;
    });
  }

  // Get personalized recommendations
  private getPersonalizedRecommendations(context: ChatContext): ProductsWithImages[] {
    let recommendations = this.products;
    
    // Filter by preferences
    if (context.userPreferences.preferredCategories.length > 0) {
      recommendations = recommendations.filter(product => 
        context.userPreferences.preferredCategories.includes(product.category?.name || '')
      );
    }
    
    // Filter by price range
    if (context.userPreferences.priceRange.min > 0 || context.userPreferences.priceRange.max < 10000) {
      recommendations = recommendations.filter(product => 
        product.basePrice >= context.userPreferences.priceRange.min && 
        product.basePrice <= context.userPreferences.priceRange.max
      );
    }
    
    // Sort by popularity and bestsellers
    return recommendations
      .sort((a, b) => {
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        if (a.isAmazing && !b.isAmazing) return -1;
        if (!a.isAmazing && b.isAmazing) return 1;
        return 0;
      })
      .slice(0, 5);
  }

  // Extract price range from message
  private extractPriceRange(message: string): { min: number; max: number } {
    const priceRegex = /\$?(\d+)/g;
    const prices = message.match(priceRegex)?.map(p => parseInt(p.replace('$', ''))) || [];
    
    if (prices.length === 0) {
      return { min: 0, max: 1000 };
    }
    
    if (prices.length === 1) {
      return { min: 0, max: prices[0] || 0 };
    }
    
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }

  // Get products in price range
  private getProductsInPriceRange(range: { min: number; max: number }): ProductsWithImages[] {
    return this.products
      .filter(product => product.basePrice >= range.min && product.basePrice <= range.max)
      .sort((a, b) => a.basePrice - b.basePrice);
  }

  // Generate unique message ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function to create shopping assistant
export function createShoppingAssistant(products: ProductsWithImages[]): ShoppingAssistant {
  return new ShoppingAssistant(products);
}

