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
          autoplayInterval: 6000, // Update to 6 seconds per prompt requirement
          animationSpeed: 1000,
          backgroundGlow: '#fbbf24',
          maxProducts: 10, // increased for a larger pool of luxury items
        },
      });
    }

    // Update interval to 6000 if it's not already
    if (config && config.autoplayInterval !== 6000) {
      config = await prisma.showcaseConfig.update({
        where: { id: config.id },
        data: { autoplayInterval: 6000 }
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
        slug: true,
        description: true,
        isBestSeller: true,
        isNew: true,
        isAmazing: true,
        createdAt: true,
        images: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: {
            secureUrl: true,
            image: true,
          },
        },
        discounts: {
          where: { isActive: true },
          take: 1,
          select: {
            id: true,
            value: true,
            discountType: true,
          }
        }
      },
    });

    // 1. Map featured products first
    const list: any[] = [];
    const addedIds = new Set<string>();

    featuredProducts.forEach((fp: any) => {
      const prod = allProducts.find((p: any) => p.id === fp.productId);
      if (prod) {
        list.push({
          ...prod,
          badgeType: fp.badgeType,
          categoryEffect: fp.categoryEffect,
          ctaText: fp.ctaText,
          ctaLink: fp.ctaLink || `/products/${prod.slug || prod.id}`,
          priorityGroup: 'featured',
        });
        addedIds.add(prod.id);
      }
    });

    // Helper to add non-duplicated products with fallback metadata
    const addWithFallbackMeta = (prod: any, priorityGroup: string) => {
      if (!addedIds.has(prod.id)) {
        // Compute elegant default badge type and effect
        let badgeType = 'BEST_SELLER';
        if (prod.isNew) badgeType = 'NEW';
        else if (prod.discounts && prod.discounts.length > 0) badgeType = 'DISCOUNT';
        else if (prod.isAmazing) badgeType = 'FEATURED';

        let categoryEffect = 'LIGHTING';
        if (prod.category === 'HONEY') categoryEffect = 'HONEY';
        else if (prod.category === 'SAFFRON') categoryEffect = 'SAFFRON';
        else if (prod.category === 'DATES') categoryEffect = 'DATES';
        else if (prod.categoryType === 'SheikhTech' || prod.categoryType === 'SheikhDigital') {
          categoryEffect = prod.name.includes('هدفون') || prod.name.includes('Headphone') ? 'HEADPHONES' : 'SPEAKER';
        }

        list.push({
          ...prod,
          badgeType,
          categoryEffect,
          ctaText: 'مشاهده جزئیات',
          ctaLink: `/products/${prod.slug || prod.id}`,
          priorityGroup,
        });
        addedIds.add(prod.id);
      }
    };

    // 2. Best Sellers
    const bestSellers = allProducts.filter((p: any) => p.isBestSeller);
    bestSellers.forEach((p: any) => addWithFallbackMeta(p, 'bestseller'));

    // 3. Newest products (sorted by createdAt desc)
    const newest = [...allProducts].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    newest.forEach((p: any) => addWithFallbackMeta(p, 'newest'));

    // 4. Discounted products
    const discounted = allProducts.filter((p: any) => p.discounts && p.discounts.length > 0);
    discounted.forEach((p: any) => addWithFallbackMeta(p, 'discounted'));

    // 5. Remaining active products (shuffled/randomized for surprise factor)
    const remaining = allProducts.filter((p: any) => !addedIds.has(p.id));
    const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
    shuffledRemaining.forEach((p: any) => addWithFallbackMeta(p, 'remaining'));

    // Slice to the configured maxProducts limit (if specified) or a safe luxury size
    const limit = config.maxProducts || 10;
    const finalProductsList = list.slice(0, limit);

    return NextResponse.json({
      config,
      featuredProducts,
      allProducts: finalProductsList, // Overwrite with prioritized active products list
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
          autoplayInterval: Number(configData.autoplayInterval) || 6000,
          animationSpeed: Number(configData.animationSpeed) || 1000,
          backgroundGlow: configData.backgroundGlow || '#fbbf24',
          maxProducts: Number(configData.maxProducts) || 10,
        },
      });
    } else {
      config = await prisma.showcaseConfig.create({
        data: {
          isEnabled: configData.isEnabled ?? true,
          loopMode: configData.loopMode ?? true,
          autoplayInterval: Number(configData.autoplayInterval) || 6000,
          animationSpeed: Number(configData.animationSpeed) || 1000,
          backgroundGlow: configData.backgroundGlow || '#fbbf24',
          maxProducts: Number(configData.maxProducts) || 10,
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
            ctaLink: item.ctaLink || `/products/${item.productId}`,
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
