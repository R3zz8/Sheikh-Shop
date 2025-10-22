import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSEOContentGenerator } from '@/lib/ai/seo-content';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, topic, category } = body;

    if (!productId && type !== 'blog') {
      return NextResponse.json(
        { error: 'Product ID is required for product SEO generation' },
        { status: 400 }
      );
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
    });

    const seoGenerator = createSEOContentGenerator(products);

    if (type === 'product' && productId) {
      const product = products.find(p => p.id === productId);
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      const seoContent = seoGenerator.generateProductSEO(product);
      return NextResponse.json({
        success: true,
        data: seoContent,
        product: {
          id: product.id,
          name: product.name,
          category: product.category
        }
      });
    }

    if (type === 'blog' && topic) {
      const blogPost = seoGenerator.generateBlogPost(topic, category || 'General');
      return NextResponse.json({
        success: true,
        data: blogPost
      });
    }

    if (type === 'sitemap') {
      const sitemapData = seoGenerator.generateSitemapData();
      return NextResponse.json({
        success: true,
        data: sitemapData
      });
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('SEO content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO content' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Fetch products from database
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: true,
        baseUnit: true,
        units: true,
        discounts: true,
      },
    });

    const seoGenerator = createSEOContentGenerator(products);

    if (type === 'sitemap') {
      const sitemapData = seoGenerator.generateSitemapData();
      return NextResponse.json({
        success: true,
        data: sitemapData
      });
    }

    if (type === 'keywords') {
      // Return popular keywords for the store
      const keywords = [
        'online shopping',
        'best deals',
        'premium products',
        'free shipping',
        'secure payment',
        'electronics',
        'clothing',
        'home goods',
        'fashion',
        'technology'
      ];
      
      return NextResponse.json({
        success: true,
        data: keywords
      });
    }

    return NextResponse.json({
      success: true,
      message: 'SEO Content API is running',
      endpoints: {
        'POST /api/seo-content': 'Generate SEO content for products or blog posts',
        'GET /api/seo-content?type=sitemap': 'Get sitemap data',
        'GET /api/seo-content?type=keywords': 'Get popular keywords'
      }
    });

  } catch (error) {
    console.error('SEO content API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
