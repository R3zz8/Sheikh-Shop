import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/index';
import { prisma } from '@/lib/prisma';
import { createShoppingAssistant, type ChatContext, type ChatMessage } from '@/lib/ai/chatbot';
import { withRateLimit } from '@/lib/rateLimiter';
import { apiRateLimiter } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse && rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { message, sessionId, conversationHistory = [] } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Fetch products from database
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: true,
        baseUnit: true,
        units: true,
        discounts: true,
      },
      take: 100, // Limit for performance
    });

    // Create shopping assistant
    const assistant = createShoppingAssistant(products);

    // Build chat context
    const context: ChatContext = {
      userId: session?.user?.id,
      sessionId: sessionId || `session_${Date.now()}`,
      conversationHistory: conversationHistory.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
      userPreferences: {
        preferredCategories: [], // Could be enhanced with user analytics
        priceRange: { min: 0, max: 1000 },
        recentSearches: [],
        cartItems: [],
      },
      currentProducts: products,
    };

    // Process message
    const response = await assistant.processMessage(context, message);

    // Store conversation in database (optional)
    if (session?.user?.id) {
      try {
        await prisma.chatMessage.createMany({
          data: [
            {
              id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: session.user.id,
              sessionId: context.sessionId,
              type: 'user',
              content: message,
              timestamp: new Date(),
            },
            {
              id: response.message.id,
              userId: session.user.id,
              sessionId: context.sessionId,
              type: 'assistant',
              content: response.message.content,
              timestamp: response.message.timestamp,
              metadata: response.message.metadata || {},
            },
          ],
        });
      } catch (error) {
        console.warn('Failed to store chat messages:', error);
        // Continue without storing - not critical
      }
    }

    return NextResponse.json({
      response,
      sessionId: context.sessionId,
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Chat processing failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve chat history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const messages = await prisma.chatMessage.findMany({
      where: {
        userId: session.user.id,
        ...(sessionId && { sessionId }),
      },
      orderBy: { timestamp: 'asc' },
      take: limit,
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
}

