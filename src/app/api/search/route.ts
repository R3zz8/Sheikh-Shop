import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search products
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { status: 'ACTIVE' },
          {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { category: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        images: {
          select: {
            image: true,
          },
          take: 1,
        },
      },
      take: 5,
    });

    // Search articles
    const articles = await prisma.article.findMany({
      where: {
        AND: [
          { status: 'PUBLISHED' },
          {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { summary: { contains: searchTerm, mode: 'insensitive' } },
              { content: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        summary: true,
        slug: true,
        imageUrl: true,
        category: true,
      },
      take: 3,
    });

    // Format results
    const results = [
      ...products.map(product => ({
        id: product.id,
        type: 'product' as const,
        title: product.name,
        description: product.description,
        image: product.images[0]?.image,
        url: `/products/${product.id}`,
        category: product.category,
      })),
      ...articles.map(article => ({
        id: article.id,
        type: 'article' as const,
        title: article.title,
        description: article.summary,
        image: article.imageUrl,
        url: `/article/${article.slug}`,
        category: article.category,
      })),
    ];

    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      if (aTitle === searchTerm && bTitle !== searchTerm) return -1;
      if (aTitle !== searchTerm && bTitle === searchTerm) return 1;
      if (aTitle.startsWith(searchTerm) && !bTitle.startsWith(searchTerm)) return -1;
      if (!aTitle.startsWith(searchTerm) && bTitle.startsWith(searchTerm)) return 1;
      
      return 0;
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}





