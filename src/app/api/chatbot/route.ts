import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createShoppingAssistant, type ChatContext, type ChatMessage } from '@/lib/ai/chatbot';
import { toNumber } from '@/lib/currency';
import { withRateLimit } from '@/lib/rateLimiter';
import { apiRateLimiter } from '@/lib/rateLimiter';

// Rate limit chatbot requests
const rateLimitedChatbot = withRateLimit(apiRateLimiter);

function serializeProductForChatbot(product: any) {
  if (!product) return null;
  return {
    ...product,
    basePrice: toNumber(product.basePrice),
    oldPrice: product.oldPrice ? toNumber(product.oldPrice) : null,
    units: product.units.map((u: any) => ({
      ...u,
      price: toNumber(u.price),
      oldPrice: u.oldPrice ? toNumber(u.oldPrice) : null,
    })),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      sessionId, 
      userPreferences = {}, 
      conversationHistory = [] 
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = await apiRateLimiter(request);
    if (rateLimitResponse && rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    // Fetch products from database
    const rawProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: true,
        baseUnit: true,
        units: true,
        discounts: true,
      },
      take: 1000, // Limit for performance
    });

    const products = rawProducts.map(serializeProductForChatbot).filter(Boolean);

    // Create shopping assistant
    const assistant = createShoppingAssistant(products);

    // Build chat context
    const context: ChatContext = {
      sessionId: sessionId || `session_${Date.now()}`,
      conversationHistory: conversationHistory as ChatMessage[],
      userPreferences: {
        preferredCategories: userPreferences.preferredCategories || [],
        priceRange: userPreferences.priceRange || { min: 0, max: 10000 },
        recentSearches: userPreferences.recentSearches || [],
        cartItems: userPreferences.cartItems || [],
      },
      currentProducts: products,
    };

    // Process message
    const response = await assistant.processMessage(context, message);

    // Update user preferences based on the conversation
    const updatedPreferences = { ...userPreferences };
    
    // Extract preferences from the message
    if (message.toLowerCase().includes('electronics')) {
      if (!updatedPreferences.preferredCategories?.includes('ELECTRONICS')) {
        updatedPreferences.preferredCategories = [
          ...(updatedPreferences.preferredCategories || []),
          'ELECTRONICS'
        ];
      }
    }
    
    if (message.toLowerCase().includes('clothing')) {
      if (!updatedPreferences.preferredCategories?.includes('CLOTHING')) {
        updatedPreferences.preferredCategories = [
          ...(updatedPreferences.preferredCategories || []),
          'CLOTHING'
        ];
      }
    }

    // Extract price range from message
    const priceMatch = message.match(/\$?(\d+)/g);
    if (priceMatch) {
      const prices = priceMatch.map((p: string) => parseInt(p.replace('$', '')));
      if (prices.length === 1) {
        updatedPreferences.priceRange = { min: 0, max: prices[0] };
      } else if (prices.length >= 2) {
        updatedPreferences.priceRange = { 
          min: Math.min(...prices), 
          max: Math.max(...prices) 
        };
      }
    }

    // Add to recent searches
    if (message.length > 3) {
      updatedPreferences.recentSearches = [
        message,
        ...(updatedPreferences.recentSearches || []).slice(0, 9) // Keep last 10 searches
      ];
    }

    return NextResponse.json({
      message: response.message,
      suggestions: response.suggestions || [],
      products: response.products || [],
      actions: response.actions || [],
      userPreferences: updatedPreferences,
      sessionId: context.sessionId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { 
        error: 'Chatbot service temporarily unavailable',
        message: {
          id: `error_${Date.now()}`,
          type: 'assistant',
          content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
          timestamp: new Date(),
          metadata: { action: 'help' },
        },
        suggestions: [
          "Try again",
          "Ask something else",
          "Show me products",
          "Get help"
        ]
      },
      { status: 500 }
    );
  }
}

// GET endpoint for chatbot status and capabilities
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'active',
      capabilities: [
        'product_search',
        'recommendations',
        'price_inquiry',
        'availability_check',
        'cart_assistance',
        'general_help'
      ],
      supportedLanguages: ['en', 'ar'],
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chatbot status error:', error);
    return NextResponse.json(
      { error: 'Failed to get chatbot status' },
      { status: 500 }
    );
  }
}
