import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.showcaseConfig.findFirst();
    if (!config) {
      config = await prisma.showcaseConfig.create({
        data: {
          isEnabled: true,
          loopMode: true,
          autoplayInterval: 5000,
          animationSpeed: 1000,
          backgroundGlow: '#fbbf24',
          maxProducts: 8,
        },
      });
    }

    const featuredProducts = await prisma.featuredProduct.findMany({
      orderBy: { order: 'asc' },
    });

    const allProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        category: true,
        categoryType: true,
        basePrice: true,
        images: {
          take: 1,
          select: {
            secureUrl: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      config,
      featuredProducts,
      allProducts,
    });
  } catch (error: any) {
    console.error('Error fetching showcase configuration:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات ویترین ویژه' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config: configData, featuredProducts: featuredData } = body;

    let config = await prisma.showcaseConfig.findFirst();
    if (config) {
      config = await prisma.showcaseConfig.update({
        where: { id: config.id },
        data: {
          isEnabled: configData.isEnabled ?? true,
          loopMode: configData.loopMode ?? true,
          autoplayInterval: Number(configData.autoplayInterval) || 5000,
          animationSpeed: Number(configData.animationSpeed) || 1000,
          backgroundGlow: configData.backgroundGlow || '#fbbf24',
          maxProducts: Number(configData.maxProducts) || 8,
        },
      });
    } else {
      config = await prisma.showcaseConfig.create({
        data: {
          isEnabled: configData.isEnabled ?? true,
          loopMode: configData.loopMode ?? true,
          autoplayInterval: Number(configData.autoplayInterval) || 5000,
          animationSpeed: Number(configData.animationSpeed) || 1000,
          backgroundGlow: configData.backgroundGlow || '#fbbf24',
          maxProducts: Number(configData.maxProducts) || 8,
        },
      });
    }

    await prisma.featuredProduct.deleteMany({});

    const createdFeatured: any[] = [];
    if (Array.isArray(featuredData)) {
      const limitedData = featuredData.slice(0, config.maxProducts);
      for (let i = 0; i < limitedData.length; i++) {
        const item = limitedData[i];
        const fp = await prisma.featuredProduct.create({
          data: {
            productId: item.productId,
            order: i,
            badgeType: item.badgeType || 'BEST_SELLER',
            categoryEffect: item.categoryEffect || 'SPEAKER',
            ctaText: item.ctaText || 'مشاهده محصول',
            ctaLink: item.ctaLink || `/product/${item.productId}`,
          },
        });
        createdFeatured.push(fp);
      }
    }

    return NextResponse.json({
      success: true,
      config,
      featuredProducts: createdFeatured,
    });
  } catch (error: any) {
    console.error('Error updating showcase configuration:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت تنظیمات ویترین ویژه' },
      { status: 500 }
    );
  }
}
