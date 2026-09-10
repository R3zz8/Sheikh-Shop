import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { verifyTorobToken, mapProductToTorobV3 } from '@/lib/torob';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Torob JWT authentication headers
    const token = req.headers.get('x-torob-token');
    const tokenVersion = req.headers.get('x-torob-token-version');
    const host = req.headers.get('host');

    const authResult = await verifyTorobToken(token, tokenVersion, host);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
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
        return NextResponse.json({
          api_version: 'torob_api_v3',
          current_page: 1,
          total: 0,
          max_pages: 1,
          next_cursor: null,
          products: [],
        });
      }

      // Extract product slugs or IDs from URL paths
      const slugsOrIds: string[] = page_urls.map((urlStr: string) => {
        try {
          const raw = typeof urlStr === 'string' ? urlStr.trim() : '';
          const parsed = raw.startsWith('http') ? new URL(raw).pathname : raw;
          const segments = parsed.split('/').filter(Boolean);
          return segments[segments.length - 1] || '';
        } catch {
          return '';
        }
      }).filter(Boolean);

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

      return NextResponse.json({
        api_version: 'torob_api_v3',
        current_page: 1,
        total: mappedProducts.length,
        max_pages: 1,
        next_cursor: null,
        products: mappedProducts,
      });
    }

    // Option 2: Fetch products by unique identifiers
    if (Array.isArray(page_uniques)) {
      if (page_uniques.length === 0) {
        return NextResponse.json({
          api_version: 'torob_api_v3',
          current_page: 1,
          total: 0,
          max_pages: 1,
          next_cursor: null,
          products: [],
        });
      }

      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          id: { in: page_uniques },
        },
        include: includeRelations,
      });

      const mappedProducts = products.map(mapProductToTorobV3);

      return NextResponse.json({
        api_version: 'torob_api_v3',
        current_page: 1,
        total: mappedProducts.length,
        max_pages: 1,
        next_cursor: null,
        products: mappedProducts,
      });
    }

    // Option 3: Cursor-based pagination
    if (cursor !== undefined || (sort === 'product_id_desc' && page === undefined)) {
      if (sort !== 'product_id_desc') {
        return NextResponse.json(
          { error: 'Cursor pagination requires sort: "product_id_desc"' },
          { status: 400 }
        );
      }

      const whereClause: any = { status: 'ACTIVE' };
      if (cursor && typeof cursor === 'string' && cursor.trim().length > 0) {
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
        const extraItem = products.pop();
        const lastItem = products[products.length - 1];
        next_cursor = lastItem ? lastItem.id : null;
      }

      const mappedProducts = products.map(mapProductToTorobV3);

      return NextResponse.json({
        api_version: 'torob_api_v3',
        current_page: 1,
        total: null,
        max_pages: null,
        next_cursor,
        products: mappedProducts,
      });
    }

    // Option 4: Page-based pagination
    if (page !== undefined) {
      const pageNum = Number(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return NextResponse.json(
          { error: 'page must be a positive integer starting from 1' },
          { status: 400 }
        );
      }

      const allowedSorts = ['date_added_desc', 'date_updated_desc', 'product_id_desc'];
      if (!sort || !allowedSorts.includes(sort)) {
        return NextResponse.json(
          { error: 'sort parameter is missing or invalid' },
          { status: 400 }
        );
      }

      let orderBy: any = [{ createdAt: 'desc' }, { id: 'desc' }];
      if (sort === 'date_updated_desc') {
        orderBy = [{ updatedAt: 'desc' }, { id: 'desc' }];
      } else if (sort === 'product_id_desc') {
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

      return NextResponse.json({
        api_version: 'torob_api_v3',
        current_page: pageNum,
        total,
        max_pages,
        next_cursor: null,
        products: mappedProducts,
      });
    }

    // If no valid request mode was matched
    return NextResponse.json(
      { error: 'Invalid or missing required request parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error handling Torob API v3 request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
