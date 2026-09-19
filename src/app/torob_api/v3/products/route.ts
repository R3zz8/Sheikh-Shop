import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { verifyTorobToken, mapProductToTorobV3 } from '@/lib/torob';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, x-torob-token, x-torob-token-version, authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-torob-token') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null;
  const tokenVersion = req.headers.get('x-torob-token-version') || '1';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');

  if (token) {
    const authResult = await verifyTorobToken(token, tokenVersion, host);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }
  }

  return NextResponse.json(
    {
      status: 'ok',
      message: 'Torob API v3 products endpoint operational',
      endpoint: '/torob_api/v3/products',
      methods: ['POST', 'GET', 'OPTIONS', 'HEAD'],
    },
    { status: 200, headers: corsHeaders }
  );
}

export async function HEAD(req: NextRequest) {
  const res = await GET(req);
  return new NextResponse(null, { status: res.status, headers: res.headers });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Torob JWT authentication headers or static API token
    const token = req.headers.get('x-torob-token') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null;
    const tokenVersion = req.headers.get('x-torob-token-version') || '1';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');

    const authResult = await verifyTorobToken(token, tokenVersion, host);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse request body
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { page_urls, page_uniques, page, sort, cursor } = body;

    const includeRelations = {
      images: { orderBy: { sortOrder: 'asc' as const } },
      Category: true,
      units: { where: { isActive: true } },
    };

    // Option 1: Fetch products by URLs
    if (Array.isArray(page_urls)) {
      if (page_urls.length === 0) {
        return NextResponse.json(
          {
            api_version: 'torob_api_v3',
            current_page: 1,
            total: 0,
            max_pages: 1,
            next_cursor: null,
            products: [],
          },
          { headers: corsHeaders }
        );
      }

      // Extract and decode product slugs or IDs from URL paths
      const slugsOrIds: string[] = page_urls
        .map((urlStr: string) => {
          try {
            const raw = typeof urlStr === 'string' ? urlStr.trim() : '';
            const parsed = raw.startsWith('http') ? new URL(raw).pathname : raw;
            const segments = parsed.split('/').filter(Boolean);
            const lastSegment = segments[segments.length - 1] || '';
            const decoded = decodeURIComponent(lastSegment);
            return [lastSegment, decoded];
          } catch {
            return [];
          }
        })
        .flat()
        .filter((val): val is string => Boolean(val) && val.trim().length > 0);

      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { slug: { in: slugsOrIds } },
            { id: { in: slugsOrIds } },
          ],
        },
        include: includeRelations,
      });

      const mappedProducts = products.map(mapProductToTorobV3);

      return NextResponse.json(
        {
          api_version: 'torob_api_v3',
          current_page: 1,
          total: mappedProducts.length,
          max_pages: 1,
          next_cursor: null,
          products: mappedProducts,
        },
        { headers: corsHeaders }
      );
    }

    // Option 2: Fetch products by unique identifiers (IDs or Slugs)
    if (Array.isArray(page_uniques)) {
      if (page_uniques.length === 0) {
        return NextResponse.json(
          {
            api_version: 'torob_api_v3',
            current_page: 1,
            total: 0,
            max_pages: 1,
            next_cursor: null,
            products: [],
          },
          { headers: corsHeaders }
        );
      }

      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { id: { in: page_uniques } },
            { slug: { in: page_uniques } },
          ],
        },
        include: includeRelations,
      });

      const mappedProducts = products.map(mapProductToTorobV3);

      return NextResponse.json(
        {
          api_version: 'torob_api_v3',
          current_page: 1,
          total: mappedProducts.length,
          max_pages: 1,
          next_cursor: null,
          products: mappedProducts,
        },
        { headers: corsHeaders }
      );
    }

    // Option 3: Cursor-based pagination (active when cursor is a valid string or sort is product_id_desc without page)
    const hasValidCursor = typeof cursor === 'string' && cursor.trim().length > 0;
    if (hasValidCursor || (sort === 'product_id_desc' && page === undefined)) {
      if (sort !== undefined && sort !== 'product_id_desc') {
        return NextResponse.json(
          { error: 'Cursor pagination requires sort: "product_id_desc"' },
          { status: 400, headers: corsHeaders }
        );
      }

      const whereClause: any = { status: 'ACTIVE' };
      if (hasValidCursor) {
        whereClause.id = { lt: cursor.trim() };
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        take: 101, // Fetch 1 extra to check for next page
        orderBy: { id: 'desc' },
        include: includeRelations,
      });

      let next_cursor: string | null = null;
      if (products.length > 100) {
        products.pop();
        const lastItem = products[products.length - 1];
        next_cursor = lastItem ? lastItem.id : null;
      }

      const mappedProducts = products.map(mapProductToTorobV3);

      return NextResponse.json(
        {
          api_version: 'torob_api_v3',
          current_page: 1,
          total: null,
          max_pages: null,
          next_cursor,
          products: mappedProducts,
        },
        { headers: corsHeaders }
      );
    }

    // Option 4: Page-based pagination
    if (page !== undefined || sort !== undefined) {
      const pageNum = page !== undefined ? Number(page) : 1;
      if (isNaN(pageNum) || pageNum < 1) {
        return NextResponse.json(
          { error: 'page must be a positive integer starting from 1' },
          { status: 400, headers: corsHeaders }
        );
      }

      const allowedSorts = ['date_added_desc', 'date_updated_desc', 'product_id_desc'];
      const activeSort = sort || 'date_added_desc';
      if (!allowedSorts.includes(activeSort)) {
        return NextResponse.json(
          { error: 'sort parameter is invalid' },
          { status: 400, headers: corsHeaders }
        );
      }

      let orderBy: any = [{ createdAt: 'desc' }, { id: 'desc' }];
      if (activeSort === 'date_updated_desc') {
        orderBy = [{ updatedAt: 'desc' }, { id: 'desc' }];
      } else if (activeSort === 'product_id_desc') {
        orderBy = { id: 'desc' };
      }

      const PAGE_SIZE = 100;
      const skip = (pageNum - 1) * PAGE_SIZE;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { status: 'ACTIVE' },
          skip,
          take: PAGE_SIZE,
          orderBy,
          include: includeRelations,
        }),
        prisma.product.count({
          where: { status: 'ACTIVE' },
        }),
      ]);

      const max_pages = Math.ceil(total / PAGE_SIZE) || 1;
      const mappedProducts = products.map(mapProductToTorobV3);

      return NextResponse.json(
        {
          api_version: 'torob_api_v3',
          current_page: pageNum,
          total,
          max_pages,
          next_cursor: null,
          products: mappedProducts,
        },
        { headers: corsHeaders }
      );
    }

    // Default fallback: return page 1 with date_added_desc
    const PAGE_SIZE = 100;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        take: PAGE_SIZE,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: includeRelations,
      }),
      prisma.product.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    const max_pages = Math.ceil(total / PAGE_SIZE) || 1;
    const mappedProducts = products.map(mapProductToTorobV3);

    return NextResponse.json(
      {
        api_version: 'torob_api_v3',
        current_page: 1,
        total,
        max_pages,
        next_cursor: null,
        products: mappedProducts,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error handling Torob API v3 request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
