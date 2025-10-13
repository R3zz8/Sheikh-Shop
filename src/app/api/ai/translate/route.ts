import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRedis } from '@/lib/redis';
import { logAudit } from '@/lib/actions/auth/audit';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { supportedLanguages } from '@/i18n.config';

// OpenAI import (assuming it's already configured)
let openai: any = null;
try {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn('OpenAI not configured:', error);
}

// Validation schema
const translateSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  targetLanguage: z.enum(['en', 'ar', 'fa', 'tr'], {
    errorMap: () => ({ message: 'Target language must be one of: en, ar, fa, tr' }),
  }),
  sourceLanguage: z.enum(['en', 'ar', 'fa', 'tr']).optional(),
  contentType: z.enum(['title', 'summary', 'content', 'metaTitle', 'metaDescription']).default('content'),
});

// Rate limiting for translation requests
const translationRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 300000; // 5 minutes
const MAX_TRANSLATIONS_PER_WINDOW = 10;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = translationRateLimit.get(userId);
  
  if (!record || now > record.resetTime) {
    translationRateLimit.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MAX_TRANSLATIONS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'Translation service not configured' },
        { status: 503 }
      );
    }

    // Authentication required for translation
    const userId = await getCurrentUserId();
    
    const body = await req.json();
    const validatedData = translateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validatedData.error.errors },
        { status: 400 }
      );
    }
    
    const { content, targetLanguage, sourceLanguage, contentType } = validatedData.data;
    
    // Rate limiting check
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Too many translation requests. Please wait before trying again.' },
        { status: 429 }
      );
    }
    
    // Generate cache key
    const cacheKey = `translation:${Buffer.from(content).toString('base64')}:${sourceLanguage || 'auto'}:${targetLanguage}:${contentType}`;
    
    // Check cache first
    const redis = await getRedis();
    const cachedTranslation = await redis.get(cacheKey);
    
    if (cachedTranslation) {
      const result = JSON.parse(cachedTranslation);
      
      // Log cached usage
      await logAudit(
        userId,
        'AI_TRANSLATION_CACHED',
        {
          targetLanguage,
          sourceLanguage: sourceLanguage || 'auto',
          contentType,
          contentLength: content.length,
          cached: true,
        }
      );
      
      return NextResponse.json({
        success: true,
        translation: result.translation,
        sourceLanguage: result.detectedLanguage || sourceLanguage,
        targetLanguage,
        contentType,
        cached: true,
      });
    }
    
    // Get language names for better prompts
    const targetLangInfo = supportedLanguages.find(lang => lang.code === targetLanguage);
    const sourceLangInfo = sourceLanguage ? supportedLanguages.find(lang => lang.code === sourceLanguage) : null;
    
    // Create translation prompt based on content type
    let systemPrompt = `You are a professional translator specializing in high-quality content translation. Your task is to translate the following ${contentType} while maintaining its original meaning, tone, and context.`;
    
    if (contentType === 'title') {
      systemPrompt += ` This is a title, so keep it concise and SEO-friendly.`;
    } else if (contentType === 'metaTitle') {
      systemPrompt += ` This is a meta title for SEO, so keep it under 60 characters and include relevant keywords.`;
    } else if (contentType === 'metaDescription') {
      systemPrompt += ` This is a meta description for SEO, so keep it under 155 characters and make it compelling for search results.`;
    } else if (contentType === 'summary') {
      systemPrompt += ` This is a summary, so maintain the key points and make it engaging.`;
    } else if (contentType === 'content') {
      systemPrompt += ` This is article content, so maintain proper structure, formatting, and readability.`;
    }
    
    systemPrompt += `\n\nTranslate from ${sourceLangInfo?.name || 'auto-detect'} to ${targetLangInfo?.name}.`;
    
    // Add specific instructions for different language pairs
    if (targetLanguage === 'ar' || targetLanguage === 'fa') {
      systemPrompt += `\n\nImportant: The target language uses right-to-left (RTL) script. Ensure proper RTL formatting and cultural adaptation.`;
    }
    
    systemPrompt += `\n\nReturn only the translated text without any explanations or additional formatting.`;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: Math.min(content.length * 2, 4000), // Limit tokens based on input length
    });
    
    const translation = completion.choices[0]?.message?.content?.trim();
    
    if (!translation) {
      throw new Error('No translation received from AI service');
    }
    
    // Detect source language if not provided
    let detectedLanguage = sourceLanguage;
    if (!sourceLanguage) {
      // Simple language detection based on content
      const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      const turkishRegex = /[çğıöşüÇĞIİÖŞÜ]/;
      
      if (arabicRegex.test(content)) {
        detectedLanguage = 'ar';
      } else if (persianRegex.test(content)) {
        detectedLanguage = 'fa';
      } else if (turkishRegex.test(content)) {
        detectedLanguage = 'tr';
      } else {
        detectedLanguage = 'en';
      }
    }
    
    const result = {
      translation,
      detectedLanguage,
      targetLanguage,
      contentType,
      confidence: 0.95, // High confidence for GPT-4 translations
    };
    
    // Cache the translation for 30 minutes
    await redis.set(cacheKey, JSON.stringify(result), { ex: 1800 });
    
    // Log translation usage
    await logAudit(
      userId,
      'AI_TRANSLATION',
      {
        targetLanguage,
        sourceLanguage: detectedLanguage,
        contentType,
        contentLength: content.length,
        translationLength: translation.length,
        cached: false,
      }
    );
    
    return NextResponse.json({
      success: true,
      translation,
      sourceLanguage: detectedLanguage,
      targetLanguage,
      contentType,
      confidence: 0.95,
      cached: false,
    });
    
  } catch (error) {
    console.error('Error translating content:', error);
    
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Too many translation requests')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to translate content' },
      { status: 500 }
    );
  }
}


