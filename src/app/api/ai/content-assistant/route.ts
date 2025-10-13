import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { logAudit } from '@/lib/actions/auth/audit';
import { 
  generateContentWithAI, 
  getCachedAISuggestions, 
  cacheAISuggestions, 
  generateCacheKey,
  contentAssistantRequestSchema,
  validateExternalLinks 
} from '@/lib/ai/content-assistant';
import { rateLimit } from '@/lib/rateLimit';

// Rate limiting: 3 requests per minute per user
const aiContentRateLimit = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 3;

  const record = aiContentRateLimit.get(userId);
  if (!record || now > record.resetTime) {
    aiContentRateLimit.set(userId, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Get current user ID for authentication and rate limiting
    const userId = await getCurrentUserId();
    
    // Rate limiting check
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please wait 1 minute before making another request.' 
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedRequest = contentAssistantRequestSchema.parse(body);

    // Generate cache key for this request
    const cacheKey = generateCacheKey(
      validatedRequest.topic,
      validatedRequest.tone,
      validatedRequest.language
    );

    // Check cache first
    const cachedResponse = await getCachedAISuggestions(cacheKey);
    if (cachedResponse) {
      // Log cache hit
      await logAudit(userId, 'ai_content_cache_hit', {
        topic: validatedRequest.topic,
        tone: validatedRequest.tone,
        language: validatedRequest.language,
      });

      return NextResponse.json({
        success: true,
        data: cachedResponse,
        cached: true,
      });
    }

    // Generate new content with AI
    const aiResponse = await generateContentWithAI(validatedRequest);

    // Validate and clean external links
    const validatedExternalLinks = validateExternalLinks(aiResponse.externalLinks);
    
    // Update response with validated links
    const finalResponse = {
      ...aiResponse,
      externalLinks: validatedExternalLinks,
    };

    // Cache the response for 30 minutes
    await cacheAISuggestions(cacheKey, finalResponse, 1800);

    // Log successful AI generation
    await logAudit(userId, 'ai_content_generated', {
      topic: validatedRequest.topic,
      tone: validatedRequest.tone,
      language: validatedRequest.language,
      confidence: aiResponse.confidence,
      wordCount: validatedRequest.wordCount,
      keywordsCount: aiResponse.keywords.length,
      outlineSections: aiResponse.outline.length,
    });

    return NextResponse.json({
      success: true,
      data: finalResponse,
      cached: false,
    });

  } catch (error) {
    console.error('AI Content Assistant API Error:', error);

    // Log the error
    try {
      const userId = await getCurrentUserId();
      await logAudit(userId, 'ai_content_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } catch (auditError) {
      console.error('Failed to log audit error:', auditError);
    }

    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required. Please log in.' 
        },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 429 }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI service temporarily unavailable. Please try again later.' 
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate content. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'AI Content Assistant API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}




