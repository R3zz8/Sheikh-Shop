'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Category {
    name: string;
    image: string;
    slug: string;
    url?: string;
}

const categories: Category[] = [
    {
        name: 'خرما',
        image: '/dates.webp',
        slug: 'dates'
    },
    {
        name: 'عسل طبیعی',
        image: '/honey.webp',
        slug: 'honey'
    },
    {
        name: 'زعفران',
        image: '/saffron.webp',
        slug: 'saffron'
    },
    {
        name: 'لوازم خانگی شیخ',
        image: '/other.webp',
        slug: 'sheikh-home',
        url: '/sheikh-home'
    },
    {
        name: 'محصولات دیگر',
        image: '/other.webp',
        slug: 'other'
    }
];

export default function Categories() {
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
                        مجموعه‌ای از بهترین محصولات طبیعی و اصیل را در دسته‌بندی‌های متنوع ما کشف کنید.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={category.url || `/categories/${category.slug}`}
                            className="group flex flex-col items-center space-y-4 cursor-pointer transition-all duration-300 hover:scale-105"
                        >
                            {/* Circular Image Container */}
                            <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                                    priority
                                    quality={85}
                                    placeholder="blur"
                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                />
                                {/* Overlay for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
}
