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

    // To satisfy "The Hero must ONLY display products from Prisma" and:
    // Priority: Featured -> Best Seller -> Newest -> Discounted -> Random Active Product
    // We fetch ALL active products from database along with relevant fields and discounts
    const allProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        category: true,
        categoryType: true,
        basePrice: true,
        isBestSeller: true,
        isNew: true,
        isAmazing: true,
        slug: true,
        description: true,
        createdAt: true,
        images: {
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
            value: true,
            discountType: true,
          }
        }
      },
    });

    const featuredProductsRaw = await prisma.featuredProduct.findMany({
      orderBy: { order: 'asc' },
    });

    // Clean up featured products that might reference deleted or inactive products
    const featuredProducts = featuredProductsRaw.filter((fp: any) =>
      allProducts.some((p: any) => p.id === fp.productId)
    );

    // Build the final ordered showcase products list according to the requested priority chain
    const finalShowcaseProducts: any[] = [];
    const maxLimit = config.maxProducts || 8;

    // Helper: add to showcase list without duplicates
    const addToShowcase = (product: any, badgeType: string, categoryEffect?: string, ctaText?: string) => {
      if (finalShowcaseProducts.length >= maxLimit) return;
      if (finalShowcaseProducts.some((item: any) => item.id === product.id)) return;

      finalShowcaseProducts.push({
        id: product.id,
        name: product.name,
        category: product.category,
        categoryType: product.categoryType,
        basePrice: product.basePrice,
        images: product.images || [],
        slug: product.slug,
        description: product.description,
        badgeType: badgeType,
        categoryEffect: categoryEffect || (product.category === 'HONEY' ? 'HONEY' : product.category === 'SAFFRON' ? 'SAFFRON' : product.category === 'DATES' ? 'DATES' : 'LIGHTING'),
        ctaText: ctaText || 'مشاهده محصول ویژه',
        ctaLink: `/products/${product.slug || product.id}`,
      });
    };

    // 1. Featured priority
    for (const fp of featuredProducts) {
      const p = allProducts.find((item: any) => item.id === fp.productId);
      if (p) {
        addToShowcase(p, fp.badgeType || 'FEATURED', fp.categoryEffect, fp.ctaText);
      }
    }

    // 2. Best Seller priority
    const bestSellers = allProducts.filter((p: any) => p.isBestSeller);
    for (const p of bestSellers) {
      addToShowcase(p, 'BEST_SELLER', undefined, 'مشاهده پرفروش‌ترین');
    }

    // 3. Newest priority
    const newestProducts = [...allProducts].sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    for (const p of newestProducts) {
      addToShowcase(p, 'NEW', undefined, 'خرید جدیدترین');
    }

    // 4. Discounted priority
    const discountedProducts = allProducts.filter((p: any) => p.discounts && p.discounts.length > 0);
    for (const p of discountedProducts) {
      addToShowcase(p, 'DISCOUNT', undefined, 'مشاهده تخفیف ویژه');
    }

    // 5. Random/Remaining Active Products (Shuffle remaining active products)
    const remainingProducts = allProducts.filter((p: any) => !finalShowcaseProducts.some((f: any) => f.id === p.id));
    const shuffledRemaining = remainingProducts.sort(() => Math.random() - 0.5);
    for (const p of shuffledRemaining) {
      addToShowcase(p, 'FEATURED', undefined, 'مشاهده پیشنهاد لوکس');
    }

    return NextResponse.json({
      config,
      featuredProducts,
      allProducts,
      showcaseProducts: finalShowcaseProducts, // Client can directly consume this perfectly sorted list of real database products!
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
