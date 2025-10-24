import OpenAI from 'openai';
import { z } from 'zod';
import { cacheSession } from '@/lib/redis';

// Initialize OpenAI client conditionally
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// AI Content Assistant Request Schema
export const contentAssistantRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic too long'),
  tone: z.enum(['formal', 'casual', 'educational']).optional().default('educational'),
  language: z.string().optional().default('en'),
  category: z.string().optional(),
  targetAudience: z.string().optional(),
  wordCount: z.number().min(500).max(5000).optional().default(1500),
});

// AI Content Assistant Response Schema
export const contentAssistantResponseSchema = z.object({
  title: z.string().min(1).max(255),
  metaTitle: z.string().min(1).max(60),
  metaDescription: z.string().min(1).max(155),
  outline: z.array(z.object({
    heading: z.string(),
    subpoints: z.array(z.string()),
  })).min(3).max(10),
  keywords: z.array(z.string()).min(3).max(15),
  internalLinks: z.array(z.string()).min(2).max(8),
  externalLinks: z.array(z.object({
    url: z.string().url(),
    title: z.string(),
    description: z.string(),
  })).min(2).max(6),
  estimatedReadTime: z.number().min(1).max(30),
  summary: z.string().min(50).max(500),
  excerpt: z.string().min(30).max(300),
  confidence: z.number().min(0).max(100),
  suggestions: z.array(z.string()).optional(),
});

export type ContentAssistantRequest = z.infer<typeof contentAssistantRequestSchema>;
export type ContentAssistantResponse = z.infer<typeof contentAssistantResponseSchema>;

// Title Optimization Schema
export const titleOptimizationSchema = z.object({
  currentTitle: z.string().min(1).max(255),
  content: z.string().min(100),
  language: z.string().optional().default('en'),
  targetLength: z.number().min(30).max(60).optional().default(60),
  keywords: z.array(z.string()).optional(),
});

export type TitleOptimizationRequest = z.infer<typeof titleOptimizationSchema>;

export interface TitleOptimizationResponse {
  optimizedTitle: string;
  alternatives: string[];
  seoScore: number;
  characterCount: number;
  improvements: string[];
  confidence: number;
}

// Trusted external domains for reference links
const TRUSTED_DOMAINS = [
  'wikipedia.org',
  'fao.org',
  'who.int',
  'pubmed.ncbi.nlm.nih.gov',
  'ncbi.nlm.nih.gov',
  'mayoclinic.org',
  'webmd.com',
  'healthline.com',
  'medicalnewstoday.com',
  'nutrition.gov',
  'usda.gov',
  'cdc.gov',
  'nih.gov',
  'sciencedirect.com',
  'nature.com',
  'nejm.org',
  'bmj.com',
];

// Generate content with OpenAI
export async function generateContentWithAI(request: ContentAssistantRequest): Promise<ContentAssistantResponse> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const systemPrompt = `You are an expert SEO content writer and digital marketing specialist. Your task is to create comprehensive, SEO-optimized article content for Sheikh Shop, a premium e-commerce platform specializing in luxury food products like honey, saffron, dates, and other Middle Eastern delicacies.

CRITICAL REQUIREMENTS:
1. Generate content in ${request.language === 'en' ? 'English' : 'Arabic'}
2. Use a ${request.tone} tone throughout
3. Focus on the topic: "${request.topic}"
4. Target word count: approximately ${request.wordCount} words
5. Category: ${request.category || 'general'}
6. Target audience: ${request.targetAudience || 'health-conscious consumers'}

You must return a JSON object with the following structure:
{
  "title": "Compelling article title (max 255 chars)",
  "metaTitle": "SEO meta title (max 60 chars)",
  "metaDescription": "SEO meta description (max 155 chars)",
  "outline": [
    {
      "heading": "Main section heading",
      "subpoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "keywords": ["primary keyword", "secondary keyword", "long-tail keyword"],
  "internalLinks": ["/products/honey", "/products/saffron", "/about-us"],
  "externalLinks": [
    {
      "url": "https://trusted-domain.com/relevant-article",
      "title": "Link title",
      "description": "Why this link is relevant"
    }
  ],
  "estimatedReadTime": 8,
  "summary": "Comprehensive article summary (50-500 chars)",
  "excerpt": "Short excerpt for previews (30-300 chars)",
  "confidence": 95,
  "suggestions": ["Additional optimization tip 1", "Tip 2"]
}

SEO GUIDELINES:
- Meta title: 50-60 characters, include primary keyword
- Meta description: 150-155 characters, compelling call-to-action
- Keywords: Mix of primary, secondary, and long-tail keywords
- Internal links: Link to relevant Sheikh Shop products and pages
- External links: Only use trusted domains (Wikipedia, WHO, FAO, PubMed, etc.)
- Outline: Create 3-10 comprehensive sections with 2-5 subpoints each

CONTENT FOCUS:
- Emphasize health benefits, nutritional value, and quality
- Include product recommendations from Sheikh Shop
- Provide educational content about Middle Eastern foods
- Use data-driven insights and scientific references
- Maintain premium brand positioning

Generate content that would rank well on Google and provide genuine value to readers interested in premium food products and healthy living.`;

    const userPrompt = `Create a comprehensive, SEO-optimized article about: ${request.topic}

Additional context:
- Tone: ${request.tone}
- Language: ${request.language}
- Category: ${request.category || 'general'}
- Target audience: ${request.targetAudience || 'health-conscious consumers'}
- Word count target: ${request.wordCount}

Please generate the complete JSON response following the exact structure specified in the system prompt.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (error) {
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate with Zod schema
    const validatedResponse = contentAssistantResponseSchema.parse(parsedResponse);

    // Enhance the response with additional processing
    const enhancedResponse: ContentAssistantResponse = {
      ...validatedResponse,
      confidence: Math.min(validatedResponse.confidence, 95), // Cap at 95% for realistic expectations
      suggestions: validatedResponse.suggestions || [
        'Consider adding more specific product examples',
        'Include seasonal or trending keywords',
        'Add more internal links to related articles',
      ],
    };

    return enhancedResponse;

  } catch (error) {
    console.error('Error generating content with AI:', error);
    
    // Return a fallback response structure
    const fallbackResponse: ContentAssistantResponse = {
      title: `Complete Guide to ${request.topic}`,
      metaTitle: `${request.topic} - Expert Guide | Sheikh Shop`,
      metaDescription: `Discover everything about ${request.topic}. Expert insights, health benefits, and premium product recommendations from Sheikh Shop.`,
      outline: [
        {
          heading: 'Introduction',
          subpoints: ['What is this topic?', 'Why is it important?', 'What will you learn?']
        },
        {
          heading: 'Benefits and Features',
          subpoints: ['Key benefits', 'Important features', 'Why choose this?']
        },
        {
          heading: 'How to Use',
          subpoints: ['Step-by-step guide', 'Best practices', 'Common mistakes']
        },
        {
          heading: 'Conclusion',
          subpoints: ['Summary', 'Final thoughts', 'Next steps']
        }
      ],
      keywords: [request.topic.toLowerCase(), `${request.topic} benefits`, `${request.topic} guide`],
      internalLinks: ['/products/honey', '/products/saffron', '/about-us'],
      externalLinks: [
        {
          url: `https://en.wikipedia.org/wiki/${  encodeURIComponent(request.topic)}`,
          title: `Wikipedia: ${request.topic}`,
          description: 'Comprehensive information from Wikipedia'
        }
      ],
      estimatedReadTime: Math.ceil(request.wordCount / 200),
      summary: `A comprehensive guide covering all aspects of ${request.topic}, including benefits, usage, and expert recommendations.`,
      excerpt: `Learn everything you need to know about ${request.topic} in this expert guide.`,
      confidence: 75,
      suggestions: ['AI generation failed, please review and edit manually', 'Consider adding more specific examples', 'Verify all links and references']
    };

    return fallbackResponse;
  }
}

// Cache AI suggestions
export async function cacheAISuggestions(cacheKey: string, response: ContentAssistantResponse, ttlSeconds: number = 1800) {
  try {
    const { redis } = await import('@/lib/redis');
    await redis.set(cacheKey, JSON.stringify(response), { ex: ttlSeconds });
  } catch (error) {
    console.warn('Failed to cache AI suggestions:', error);
  }
}

// Get cached AI suggestions
export async function getCachedAISuggestions(cacheKey: string): Promise<ContentAssistantResponse | null> {
  try {
    const { redis } = await import('@/lib/redis');
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to get cached AI suggestions:', error);
    return null;
  }
}

// Title Optimization Function
export async function optimizeTitleWithAI(request: TitleOptimizationRequest): Promise<{
  success: boolean;
  data?: TitleOptimizationResponse;
  error?: string;
}> {
  if (!openai) {
    return { success: false, error: 'OpenAI API key not configured' };
  }

  try {
    const { currentTitle, content, language, targetLength, keywords } = request;
    
    const systemPrompt = `You are an expert SEO content optimizer specializing in creating compelling, search-engine-friendly titles. Your task is to optimize the given title for better SEO performance while maintaining its core message and appeal.

Guidelines:
1. Keep the title under ${targetLength} characters for optimal SEO
2. Include primary keywords naturally
3. Make it compelling and click-worthy
4. Maintain the original meaning and tone
5. Use power words that drive engagement
6. Consider the target language: ${language}
7. Ensure it's grammatically correct and readable

Current title: "${currentTitle}"
Content preview: "${content.substring(0, 500)}..."
${keywords ? `Target keywords: ${keywords.join(', ')}` : ''}

Provide your response in this exact JSON format:
{
  "optimizedTitle": "Your optimized title here",
  "alternatives": ["Alternative title 1", "Alternative title 2", "Alternative title 3"],
  "seoScore": 85,
  "characterCount": 58,
  "improvements": ["Improvement 1", "Improvement 2"],
  "confidence": 92
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Optimize this title: "${currentTitle}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(response);
    
    // Validate the response structure
    const validationResult = z.object({
      optimizedTitle: z.string(),
      alternatives: z.array(z.string()),
      seoScore: z.number().min(0).max(100),
      characterCount: z.number(),
      improvements: z.array(z.string()),
      confidence: z.number().min(0).max(100),
    }).safeParse(parsedResponse);

    if (!validationResult.success) {
      throw new Error('Invalid response format from AI');
    }

    return {
      success: true,
      data: validationResult.data,
    };

  } catch (error) {
    console.error('Error optimizing title with AI:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to optimize title',
    };
  }
}

// Generate cache key for AI suggestions
export function generateCacheKey(topic: string, tone: string, language: string): string {
  return `ai-content:${Buffer.from(`${topic}-${tone}-${language}`).toString('base64')}`;
}

// Validate external links
export function validateExternalLinks(links: Array<{url: string, title: string, description: string}>): Array<{url: string, title: string, description: string}> {
  return links.filter(link => {
    try {
      const url = new URL(link.url);
      return TRUSTED_DOMAINS.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  });
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Generate slug from title
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
