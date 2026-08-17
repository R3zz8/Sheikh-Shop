import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cacheService, CACHE_TTL } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

const SHOWCASE_CACHE_KEY = 'showcase_config_data';

export async function GET() {
  try {
    // 1. Try cache first
    const cached = await cacheService.get<any>(SHOWCASE_CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. Fetch or create config
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

    // 3. Fetch all active products
    const allActiveProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        category: true,
        categoryType: true,
        basePrice: true,
        slug: true,
        isBestSeller: true,
        isNew: true,
        isAmazing: true,
        images: {
          take: 1,
          select: {
            secureUrl: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeProductMap = new Map(allActiveProducts.map((p: any) => [p.id, p]));

    // 4. Fetch explicit featured product links
    const rawFeaturedProducts = await prisma.featuredProduct.findMany({
      orderBy: { order: 'asc' },
    });

    // Filter featured products to only include those referencing real, ACTIVE products
    let validFeaturedProducts = rawFeaturedProducts.filter((fp: any) =>
      activeProductMap.has(fp.productId)
    );

    // 5. If no explicit FeaturedProduct records point to active products, populate from active products marked as isBestSeller (or active catalog fallback)
    if (validFeaturedProducts.length === 0) {
      // Find active products where isBestSeller is true (or fall back to active products)
      let bestSellers = allActiveProducts.filter((p: any) => p.isBestSeller);
      if (bestSellers.length === 0) {
        bestSellers = allActiveProducts.slice(0, config.maxProducts);
      } else {
        bestSellers = bestSellers.slice(0, config.maxProducts);
      }

      validFeaturedProducts = bestSellers.map((prod: any, index: number) => {
        let effect = 'SPEAKER';
        if (prod.categoryType === 'SheikhFood') {
          if (prod.category === 'HONEY') effect = 'HONEY';
          else if (prod.category === 'SAFFRON') effect = 'SAFFRON';
          else if (prod.category === 'DATES') effect = 'DATES';
        } else if (prod.categoryType === 'SheikhDigital' || prod.categoryType === 'SheikhTech') {
          effect = 'SPEAKER';
        }

        return {
          id: `auto_${prod.id}`,
          productId: prod.id,
          order: index,
          badgeType: prod.isBestSeller ? 'BEST_SELLER' : prod.isNew ? 'NEW' : 'FEATURED',
          categoryEffect: effect,
          ctaText: 'مشاهده محصول',
          ctaLink: `/products/${prod.slug || prod.id}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
    }

    const payload = {
      config,
      featuredProducts: validFeaturedProducts,
      allProducts: allActiveProducts,
    };

    // Store in cache
    await cacheService.set(SHOWCASE_CACHE_KEY, payload, CACHE_TTL.PRODUCTS || 300);

    return NextResponse.json(payload);
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
        // Ensure product exists and is active before adding
        const targetProduct = await prisma.product.findFirst({
          where: { id: item.productId, status: 'ACTIVE' },
        });

        if (targetProduct) {
          const fp = await prisma.featuredProduct.create({
            data: {
              productId: item.productId,
              order: i,
              badgeType: item.badgeType || 'BEST_SELLER',
              categoryEffect: item.categoryEffect || 'SPEAKER',
              ctaText: item.ctaText || 'مشاهده محصول',
              ctaLink: item.ctaLink || `/products/${targetProduct.slug || item.productId}`,
            },
          });
          createdFeatured.push(fp);
        }
      }
    }

    // Invalidate caches
    await cacheService.del(SHOWCASE_CACHE_KEY);
    await cacheService.invalidateProductCache();
    try {
      revalidatePath('/');
    } catch (e) {
      // Ignored if revalidatePath is run outside Next request lifecycle in tests
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
