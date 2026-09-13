'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-url';

interface Category {
    name: string;
    image: string;
    slug: string;
    url?: string;
}

const defaultCategories: Category[] = [
    {
        name: 'شیخ نوا',
        image: '/sheikhgajet.webp',
        slug: 'tech-products',
        url: '/tech-products'
    },
    {
        name: 'لوازم دیجیتال شیخ',
        image: '/sheikhdigital.webp',
        slug: 'sheikh-digital',
        url: '/sheikh-digital'
    },
    {
        name: 'لوازم خانگی شیخ',
        image: '/sheikhhome.webp',
        slug: 'sheikh-home',
        url: '/sheikh-home'
    },
    {
        name: 'مواد غذایی شیخ',
        image: '/food.webp',
        slug: 'products',
        url: '/products'
    },
    {
        name: 'شیخ نیکوتین',
        image: '/nicotine.webp',
        slug: 'sheikh-nicotine',
        url: '/sheikh-nicotine'
    },
    {
        name: 'شیخ گرومینگ',
        image: '/grooming.webp',
        slug: 'sheikh-grooming',
        url: '/sheikh-grooming'
    }
];

interface CategoriesProps {
    initialCategories?: Category[];
}

/**
 * Presentation Formatter Helper for Category Titles
 * Intentionally structures multi-word category names into controlled Persian lines
 * for uniform vertical rhythm without altering canonical DB strings or URLs.
 * Also renders a visually-hidden span containing the full canonical name to preserve screen-reader & test accessibility.
 */
function renderCategoryTitle(name: string) {
    let formattedJsx: React.ReactNode;

    if (name === 'لوازم دیجیتال شیخ') {
        formattedJsx = (
            <>
                <span aria-hidden="true">
                    <span>لوازم دیجیتال</span>
                    <br />
                    <span>شیخ</span>
                </span>
                <span className="sr-only">{name}</span>
            </>
        );
    } else if (name === 'لوازم خانگی شیخ') {
        formattedJsx = (
            <>
                <span aria-hidden="true">
                    <span>لوازم خانگی</span>
                    <br />
                    <span>شیخ</span>
                </span>
                <span className="sr-only">{name}</span>
            </>
        );
    } else if (name === 'مواد غذایی شیخ') {
        formattedJsx = (
            <>
                <span aria-hidden="true">
                    <span>مواد غذایی</span>
                    <br />
                    <span>شیخ</span>
                </span>
                <span className="sr-only">{name}</span>
            </>
        );
    } else {
        formattedJsx = <span>{name}</span>;
    }

    return formattedJsx;
}

const Categories = React.memo(function Categories({ initialCategories }: CategoriesProps) {
    const [categories, setCategories] = useState<Category[]>(
        initialCategories && initialCategories.length > 0 ? initialCategories : defaultCategories
    );

    useEffect(() => {
        // Only fetch on client if initialCategories was not provided by SSR/Server Component
        if (initialCategories && initialCategories.length > 0) {
            return;
        }

        let isMounted = true;
        fetch('/api/categories')
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const mapped: Category[] = data.data.slice(0, 6).map((cat: any) => {
                        let url = `/categories/${cat.slug}`;
                        if (cat.slug === 'sheikh-home') url = '/sheikh-home';
                        else if (cat.slug === 'sheikh-digital') url = '/sheikh-digital';
                        else if (cat.slug === 'tech-products') url = '/tech-products';
                        else if (cat.slug === 'products') url = '/products';
                        else if (cat.slug === 'sheikh-nicotine') url = '/sheikh-nicotine';
                        else if (cat.slug === 'sheikh-grooming') url = '/sheikh-grooming';

                        let img = cat.image;
                        if (!img) {
                            if (cat.slug === 'sheikh-home') img = '/sheikhhome.webp';
                            else if (cat.slug === 'sheikh-digital') img = '/sheikhdigital.webp';
                            else if (cat.slug === 'tech-products') img = '/sheikhgajet.webp';
                            else if (cat.slug === 'sheikh-nicotine') img = '/nicotine.webp';
                            else if (cat.slug === 'sheikh-grooming') img = '/grooming.webp';
                            else img = '/food.webp';
                        }

                        return {
                            name: cat.name,
                            image: getOptimizedCloudinaryUrl(img, { width: 384, quality: 70 }),
                            slug: cat.slug,
                            url,
                        };
                    });
                    setCategories(mapped);
                }
            })
            .catch((err) => {
                console.error('[Categories Component] Error fetching categories:', err);
            });

        return () => {
            isMounted = false;
        };
    }, [initialCategories]);

    return (
        <section className="container-fluid section-padding relative">
            <div className="max-w-6xl mx-auto px-1 sm:px-4">
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h2
                        style={{ opacity: 1, animation: 'none' }}
                        className="text-[28px] sm:text-[36px] md:text-[42px] font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight font-vazirmatn select-none"
                    >
                        دسته‌بندی‌های اصلی
                    </h2>
                    <p
                        style={{ opacity: 1, animation: 'none' }}
                        className="text-gray-300 text-[14px] sm:text-[16px] md:text-[18px] max-w-2xl mx-auto font-vazirmatn leading-relaxed select-none px-2"
                    >
                        مجموعه‌ای از برترین محصولات منتخب را در <strong>دسته‌بندی‌های اختصاصی شیخ</strong> کشف کنید.
                    </p>
                </div>

                {/* Categories Grid (Mobile: 3x2, Desktop: 6x1) */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-1.5 sm:gap-x-4 md:gap-x-6 gap-y-6 sm:gap-y-8 items-start">
                    {categories.map((category, index) => (
                        <Link
                            key={category.slug}
                            href={category.url || `/categories/${category.slug}`}
                            className="group flex flex-col items-center cursor-pointer transition-all duration-500 hover:scale-[1.03]"
                        >
                            {/* Outer Relative Wrapper with fluid responsive circle sizing using CSS clamp() */}
                            <div className="relative w-[clamp(86px,25vw,116px)] h-[clamp(86px,25vw,116px)] sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-[clamp(130px,11vw,160px)] lg:h-[clamp(130px,11vw,160px)] flex items-center justify-center mb-2.5 sm:mb-3.5">
                                {/* 1. Soft Bloom Effect (Deep Ambient Glow behind) */}
                                <div
                                    className="absolute -inset-3 sm:-inset-4 rounded-full bg-radial from-amber-500/15 via-orange-500/2 to-transparent blur-xl sm:blur-2xl opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500 animate-luxury-bloom pointer-events-none z-0"
                                    style={{ willChange: 'transform, opacity' }}
                                />

                                {/* 2. Premium Amber Light / Secondary Outer Glow Ring behind */}
                                <div
                                    className="absolute -inset-1 sm:-inset-1.5 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-500/10 to-orange-500/25 blur-sm sm:blur-md opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 animate-luxury-glow pointer-events-none z-0"
                                    style={{ willChange: 'transform, opacity' }}
                                />

                                {/* 3. Circular Image Container (Strictly exact same sizing, layout-preserving) */}
                                <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border border-amber-500/20 group-hover:border-amber-400/50 transition-all duration-500 z-10">
                                    <Image
                                        src={getOptimizedCloudinaryUrl(category.image, { width: 384, quality: 70 })}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 640px) 116px, (max-width: 1024px) 160px, 192px"
                                        priority={index === 0}
                                        fetchPriority={index === 0 ? 'high' : 'low'}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        quality={70}
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                    />
                                    {/* Overlay for optimal text readability and contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

                                    {/* 4. Luxury Permanent Glass Reflection Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none z-20" />

                                    {/* 5. Animated Light Sweep / Shimmer Glass Reflection on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />
                                </div>

                                {/* 6. Laser-thin Glowing Golden Emissive Rim/Border on top */}
                                <div
                                    className="absolute inset-0 rounded-full border border-amber-500/35 group-hover:border-amber-400/65 shadow-[inset_0_0_12px_rgba(245,158,11,0.2)] group-hover:shadow-[inset_0_0_18px_rgba(245,158,11,0.35)] transition-all duration-500 pointer-events-none z-20"
                                    style={{ willChange: 'border-color, box-shadow' }}
                                />
                            </div>

                            {/* Category Name - Normalized Title Zone to enforce exact vertical alignment across rows */}
                            <div className="text-center w-full flex flex-col items-center justify-start min-h-[2.6rem] sm:min-h-[3rem] px-0.5">
                                <h3
                                    style={{ opacity: 1, animation: 'none' }}
                                    className="text-[13px] sm:text-[16px] md:text-[18px] font-bold text-white group-hover:text-amber-200 transition-colors duration-300 font-vazirmatn leading-[1.3] text-center"
                                >
                                    {renderCategoryTitle(category.name)}
                                </h3>
                                {/* Controlled Subtle Gold Accent Underline */}
                                <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto transition-all duration-300 mt-1.5" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Decorative Ambient Radial Lighting */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-full blur-2xl" />
                </div>
            </div>
        </section>
    );
});

export default Categories;
