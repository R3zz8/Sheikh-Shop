import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { optimizeTitleWithAI, titleOptimizationSchema } from '@/lib/ai/content-assistant';
import { logAudit } from '@/lib/actions/auth/audit';
import { getCurrentUserId } from '@/lib/actions/auth/session';

// Rate limiting for title optimization
const titleOptimizationRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 300000; // 5 minutes
const MAX_OPTIMIZATIONS_PER_WINDOW = 15;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = titleOptimizationRateLimit.get(userId);
  
  if (!record || now > record.resetTime) {
    titleOptimizationRateLimit.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MAX_OPTIMIZATIONS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Authentication required for title optimization
    const userId = await getCurrentUserId();
    
    const body = await req.json();
    const validatedData = titleOptimizationSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validatedData.error.errors },
        { status: 400 }
      );
    }
    
    const { currentTitle, content, language, targetLength, keywords } = validatedData.data;
    
    // Rate limiting check
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Too many title optimization requests. Please wait before trying again.' },
        { status: 429 }
      );
    }
    
    // Call AI title optimization
    const result = await optimizeTitleWithAI({
      currentTitle,
      content,
      language,
      targetLength,
      keywords,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    // Log audit event
    await logAudit(
      userId,
      'AI_TITLE_OPTIMIZATION',
      {
        originalTitle: currentTitle,
        optimizedTitle: result.data!.optimizedTitle,
        language,
        targetLength,
        seoScore: result.data!.seoScore,
        confidence: result.data!.confidence,
        keywords: keywords || [],
      }
    );
    
    return NextResponse.json({
      success: true,
      data: result.data,
    });
    
  } catch (error) {
    console.error('Error in title optimization API:', error);
    
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to optimize title' },
      { status: 500 }
    );
  }
}
