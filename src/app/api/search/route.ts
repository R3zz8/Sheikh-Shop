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
    const results: Array<{
      id: string;
      title: string;
      type: 'product' | 'article' | 'category';
      url: string;
      description?: string;
      image?: string;
    }> = [];

    // Search products
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { status: 'ACTIVE' },
          {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
              { category: { equals: searchTerm.toUpperCase() as any } },
            ],
          },
        ],
      },
      include: {
        images: {
          take: 1,
          select: { image: true },
        },
      },
      take: 5,
    });

    // Add products to results
    products.forEach(product => {
      results.push({
        id: product.id,
        title: product.name,
        type: 'product',
        url: `/products/${product.id}`,
        description: product.description || `Premium ${product.category.toLowerCase()} from Sheikh Shop`,
        image: (product as any).images?.[0]?.image || '/noImage.jpg',
      });
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
              { tags: { has: searchTerm } },
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
      },
      take: 3,
    });

    // Add articles to results
    articles.forEach(article => {
      results.push({
        id: article.id,
        title: article.title,
        type: 'article',
        url: `/article/${article.slug}`,
        description: article.summary,
        image: article.imageUrl || '/og-image.jpg',
      });
    });

    // Add category suggestions
    const categories = ['HONEY', 'SAFFRON', 'DATES', 'OTHERS'];
    const matchingCategories = categories.filter(category => 
      category.toLowerCase().includes(searchTerm)
    );

    matchingCategories.forEach(category => {
      results.push({
        id: category,
        title: `${category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()} Collection`,
        type: 'category',
        url: `/categories/${category.toLowerCase()}`,
        description: `Browse our premium ${category.toLowerCase()} collection`,
        image: `/${category.toLowerCase()}.jpg`,
      });
    });

    // Sort results by relevance (products first, then articles, then categories)
    const sortedResults = results.sort((a, b) => {
      const typeOrder: Record<string, number> = { product: 0, article: 1, category: 2 };
      return (typeOrder[a.type] || 0) - (typeOrder[b.type] || 0);
    });

    return NextResponse.json({ 
      results: sortedResults.slice(0, 8), // Limit to 8 results
      total: sortedResults.length,
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
