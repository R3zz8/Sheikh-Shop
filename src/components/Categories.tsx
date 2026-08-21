'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
    name: string;
    image: string;
    slug: string;
    url?: string;
}

const defaultCategories: Category[] = [
    {
        name: 'لوازم خانگی شیخ',
        image: '/sheikhhome.webp',
        slug: 'sheikh-home',
        url: '/sheikh-home'
    },
    {
        name: 'لوازم دیجیتال شیخ',
        image: '/sheikhdigital.webp',
        slug: 'sheikh-digital',
        url: '/sheikh-digital'
    },
    {
        name: 'شیخ نوا',
        image: '/sheikhgajet.webp',
        slug: 'tech-products',
        url: '/tech-products'
    },
    {
        name: 'مواد غذایی شیخ',
        image: '/food.webp',
        slug: 'products',
        url: '/products'
    }
];

interface CategoriesProps {
    initialCategories?: Category[];
}

const Categories = React.memo(function Categories({ initialCategories }: CategoriesProps) {
    const [categories, setCategories] = useState<Category[]>(
        initialCategories && initialCategories.length > 0 ? initialCategories : defaultCategories
    );

    useEffect(() => {
        // Fetch fresh category data from DB/API dynamically
        let isMounted = true;
        fetch('/api/categories')
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const mapped: Category[] = data.data.slice(0, 4).map((cat: any) => {
                        let url = `/categories/${cat.slug}`;
                        if (cat.slug === 'sheikh-home') url = '/sheikh-home';
                        else if (cat.slug === 'sheikh-digital') url = '/sheikh-digital';
                        else if (cat.slug === 'tech-products') url = '/tech-products';
                        else if (cat.slug === 'products') url = '/products';

                        let img = cat.image;
                        if (!img) {
                            if (cat.slug === 'sheikh-home') img = '/sheikhhome.webp';
                            else if (cat.slug === 'sheikh-digital') img = '/sheikhdigital.webp';
                            else if (cat.slug === 'tech-products') img = '/sheikhgajet.webp';
                            else img = '/food.webp';
                        }

                        return {
                            name: cat.name,
                            image: img,
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
    }, []);

    return (
        <section className="container-fluid section-padding relative">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2
                        style={{ opacity: 1, animation: 'none' }}
                        className="text-[42px] font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4 leading-tight font-vazirmatn select-none"
                    >
                        دسته‌بندی‌های اصلی
                    </h2>
                    <p
                        style={{ opacity: 1, animation: 'none' }}
                        className="text-gray-300 text-[18px] max-w-2xl mx-auto font-vazirmatn leading-relaxed select-none"
                    >
                        مجموعه‌ای از برترین محصولات منتخب را در دسته‌بندی‌های اختصاصی شیخ کشف کنید.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {categories.map((category, index) => (
                        <Link
                            key={category.slug}
                            href={category.url || `/categories/${category.slug}`}
                            className="group flex flex-col items-center space-y-4 cursor-pointer transition-all duration-500 hover:scale-[1.03]"
                        >
                            {/* Outer Relative Wrapper preserving the exact layout sizes */}
                            <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
                                {/* 1. Soft Bloom Effect (Deep Ambient Glow behind) */}
                                <div
                                    className="absolute -inset-4 rounded-full bg-radial from-amber-500/15 via-orange-500/2 to-transparent blur-2xl opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500 animate-luxury-bloom pointer-events-none z-0"
                                    style={{ willChange: 'transform, opacity' }}
                                />

                                {/* 2. Premium Amber Light / Secondary Outer Glow Ring behind */}
                                <div
                                    className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-500/10 to-orange-500/25 blur-md opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 animate-luxury-glow pointer-events-none z-0"
                                    style={{ willChange: 'transform, opacity' }}
                                />

                                {/* 3. Circular Image Container (Strictly exact same sizing, layout-preserving) */}
                                <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border border-amber-500/15 group-hover:border-amber-400/40 transition-all duration-500 z-10">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                                        priority={index < 2}
                                        loading={index < 2 ? 'eager' : 'lazy'}
                                        quality={80}
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwPLOAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                    />
                                    {/* Overlay for optimal text readability and contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

                                    {/* 4. Luxury Permanent Glass Reflection Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none z-20" />

                                    {/* 5. Animated Light Sweep / Shimmer Glass Reflection on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />
                                </div>

                                {/* 6. Laser-thin Glowing Golden Emissive Rim/Border on top (Apple Vision Pro & B&O inspired) */}
                                <div
                                    className="absolute inset-0 rounded-full border border-amber-500/35 group-hover:border-amber-400/65 shadow-[inset_0_0_12px_rgba(245,158,11,0.2)] group-hover:shadow-[inset_0_0_18px_rgba(245,158,11,0.35)] transition-all duration-500 pointer-events-none z-20"
                                    style={{ willChange: 'border-color, box-shadow' }}
                                />
                            </div>

                            {/* Category Name */}
                            <div className="text-center">
                                <h3
                                    style={{ opacity: 1, animation: 'none' }}
                                    className="text-[18px] font-semibold text-white group-hover:text-amber-200 transition-colors duration-300 font-vazirmatn"
                                >
                                    {category.name}
                                </h3>
                                <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto transition-all duration-300 mt-2" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-full blur-2xl" />
                </div>
            </div>
        </section>
    );
});

export default Categories;
