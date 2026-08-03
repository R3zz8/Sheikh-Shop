import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAISearchEngine, type SearchQuery } from '@/lib/ai/search';
import { toNumber } from '@/lib/currency';
import { withRateLimit } from '@/lib/rateLimiter';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { withCache } from '@/lib/cache';
import { cacheConfigs } from '@/lib/cache';

function serializeProductForSearch(product: any) {
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

// Cache search results for 5 minutes
const searchWithCache = withCache({
  maxAge: 300,
  staleWhileRevalidate: 600,
  tags: ['search', 'products'],
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
    const sortBy = (searchParams.get('sortBy') as any) || 'relevance';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
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

    const products = rawProducts.map(serializeProductForSearch).filter(Boolean);

    // Create search engine
    const searchEngine = createAISearchEngine(products);

    // Build search query
    const searchQuery: SearchQuery = {
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
      },
      sortBy,
      limit,
      offset,
    };

    // Perform search
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
      })),
      suggestions,
      total: results.length,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// POST endpoint for advanced search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, sortBy, limit, offset } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
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

    const products = rawProducts.map(serializeProductForSearch).filter(Boolean);

    // Create search engine
    const searchEngine = createAISearchEngine(products);

    // Build search query
    const searchQuery: SearchQuery = {
      query: query.trim(),
      filters,
      sortBy: sortBy || 'relevance',
      limit: limit || 20,
      offset: offset || 0,
    };

    // Perform search
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
      })),
      suggestions,
      total: results.length,
      limit: limit || 20,
      offset: offset || 0,
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json(
      { error: 'Advanced search failed' },
      { status: 500 }
    );
  }
}