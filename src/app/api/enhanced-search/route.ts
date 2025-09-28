import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEnhancedAISearchEngine, type EnhancedSearchQuery } from '@/lib/ai/enhanced-search';
import { withRateLimit } from '@/lib/rateLimiter';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { withCache } from '@/lib/cache';

// Cache search results for 5 minutes
const searchWithCache = withCache({
  maxAge: 300,
  staleWhileRevalidate: 600,
  tags: ['search', 'products', 'ai'],
});

// Rate limit search requests
const rateLimitedSearch = withRateLimit(apiRateLimiter);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const inStock = searchParams.get('inStock') === 'true' ? true : undefined;
    const brand = searchParams.get('brand') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'relevance';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeTypos = searchParams.get('includeTypos') !== 'false';
    const semanticWeight = parseFloat(searchParams.get('semanticWeight') || '0.6');
    const keywordWeight = parseFloat(searchParams.get('keywordWeight') || '0.4');

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse && rateLimitResponse.status === 429) {
      return rateLimitResponse;
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
      take: 1000, // Limit for performance
    });

    // Create enhanced search engine
    const searchEngine = createEnhancedAISearchEngine(products);

    // Build search query
    const searchQuery: EnhancedSearchQuery = {
      query: query.trim(),
      filters: {
        ...(category && { category }),
        ...(minPrice !== undefined || maxPrice !== undefined) && {
          priceRange: {
            min: minPrice || 0,
            max: maxPrice || 10000,
          },
        },
        ...(inStock !== undefined && { inStock }),
        ...(brand && { brand }),
      },
      sortBy,
      limit,
      offset,
      includeTypos,
      semanticWeight,
      keywordWeight,
    };

    // Perform enhanced search
    const results = searchEngine.search(searchQuery);

    // Get suggestions
    const suggestions = searchEngine.getSuggestions(query, 5);

    return NextResponse.json({
      query: query.trim(),
      results: results.map(result => ({
        product: result.product,
        score: result.score,
        highlights: result.highlights,
        matchedFields: result.matchedFields,
        semanticScore: result.semanticScore,
        keywordScore: result.keywordScore,
        typoTolerance: result.typoTolerance,
        confidence: result.confidence,
        explanation: result.explanation,
      })),
      suggestions,
      total: results.length,
      limit,
      offset,
      searchMetadata: {
        includeTypos,
        semanticWeight,
        keywordWeight,
        searchTime: Date.now(),
      },
    });

  } catch (error) {
    console.error('Enhanced search error:', error);
    return NextResponse.json(
      { error: 'Enhanced search failed' },
      { status: 500 }
    );
  }
}

// POST endpoint for advanced enhanced search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      filters, 
      sortBy, 
      limit, 
      offset,
      includeTypos = true,
      semanticWeight = 0.6,
      keywordWeight = 0.4
    } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse && rateLimitResponse.status === 429) {
      return rateLimitResponse;
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
      take: 1000, // Limit for performance
    });

    // Create enhanced search engine
    const searchEngine = createEnhancedAISearchEngine(products);

    // Build search query
    const searchQuery: EnhancedSearchQuery = {
      query: query.trim(),
      filters,
      sortBy: sortBy || 'relevance',
      limit: limit || 20,
      offset: offset || 0,
      includeTypos,
      semanticWeight,
      keywordWeight,
    };

    // Perform enhanced search
    const results = searchEngine.search(searchQuery);

    // Get suggestions
    const suggestions = searchEngine.getSuggestions(query, 5);

    return NextResponse.json({
      query: query.trim(),
      results: results.map(result => ({
        product: result.product,
        score: result.score,
        highlights: result.highlights,
        matchedFields: result.matchedFields,
        semanticScore: result.semanticScore,
        keywordScore: result.keywordScore,
        typoTolerance: result.typoTolerance,
        confidence: result.confidence,
        explanation: result.explanation,
      })),
      suggestions,
      total: results.length,
      limit: limit || 20,
      offset: offset || 0,
      searchMetadata: {
        includeTypos,
        semanticWeight,
        keywordWeight,
        searchTime: Date.now(),
      },
    });

  } catch (error) {
    console.error('Advanced enhanced search error:', error);
    return NextResponse.json(
      { error: 'Advanced enhanced search failed' },
      { status: 500 }
    );
  }
}
