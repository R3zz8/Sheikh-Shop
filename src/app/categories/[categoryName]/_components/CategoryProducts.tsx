'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { getOrGenerateExcerpt, stripHtmlTags } from '@/lib/seo/sanitize';
import { formatEUR } from '@/lib/currency';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductListSkeleton } from '@/components/ui/skeleton';
import LuxuryPagination from '@/components/ui/LuxuryPagination';

interface Product {
    id: string;
    name: string;
    basePrice: number;
    description?: string;
    images: Array<{
        id: string;
        image: string;
    }>;
}

interface CategoryProductsProps {
    products: Product[];
    categoryName: string;
    categorySlug: string;
}

export default function CategoryProducts({ products, categoryName, categorySlug }: CategoryProductsProps) {
    // Pagination-specific states
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [isPageChanging, setIsPageChanging] = useState(false);

    // Next.js Navigation Hooks
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Parse current page from URL
    const urlPage = searchParams ? parseInt(searchParams.get('page') || '1', 10) : 1;
    const [currentPage, setCurrentPage] = useState(urlPage);

    // Sync state with URL parameter (for back/forward browser navigation)
    useEffect(() => {
        if (urlPage !== currentPage) {
            setCurrentPage(urlPage);
        }
    }, [urlPage]);

    // Responsive Items Per Page handler
    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;
            if (width >= 1280) {
                setItemsPerPage(12);
            } else if (width >= 768) {
                setItemsPerPage(9);
            } else {
                setItemsPerPage(10);
            }
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    // Pagination calculations
    const totalPages = Math.ceil(products.length / itemsPerPage);

    // Clamping page if it gets out of bounds due to changes in category products list
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            const params = new URLSearchParams(window.location.search);
            params.set('page', '1');
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
            setCurrentPage(1);
        }
    }, [products.length, itemsPerPage, totalPages, currentPage, pathname, router]);

    // Page changing handler
    const handlePageChange = (newPage: number) => {
        setIsPageChanging(true);

        // Smooth scroll to product list section
        const container = document.getElementById('category-products-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Delay update slightly to let the smooth scroll trigger and show the premium skeleton
        setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.set('page', newPage.toString());
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
            setCurrentPage(newPage);

            setTimeout(() => {
                setIsPageChanging(false);
            }, 250);
        }, 200);
    };

    // Get active products slice
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return (
        <div id="category-products-container" className="container-fluid section-padding scroll-mt-24">
            <div className="max-w-6xl mx-auto">
                {/* Category Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <Link
                            href="/"
                            className="text-amber-400 hover:text-amber-300 transition-colors duration-300 mr-2"
                        >
                            Home
                        </Link>
                        <span className="text-gray-400 mx-2">/</span>
                        <Link
                            href="/categories"
                            className="text-amber-400 hover:text-amber-300 transition-colors duration-300 mr-2"
                        >
                            Categories
                        </Link>
                        <span className="text-gray-400 mx-2">/</span>
                        <span className="text-white">{categoryName}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4">
                        {categoryName} Collection
                    </h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Discover our premium selection of authentic {categoryName.toLowerCase()} products
                    </p>
                </div>

                {/* Products Grid & Loading with AnimatePresence */}
                {products.length > 0 ? (
                    <AnimatePresence mode="wait">
                        {isPageChanging ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="w-full"
                            >
                                <ProductListSkeleton count={itemsPerPage} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="products-grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 lg:gap-8"
                            >
                                {paginatedProducts.map((product, index) => (
                                    <motion.div
                                        key={`${product.id}-${currentPage}`}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.02 }}
                                        className="h-full"
                                    >
                                        <Link
                                            href={`/product/${product.id}`}
                                            className="group card p-3 sm:p-4 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col justify-between"
                                        >
                                            <div>
                                                {/* Product Image */}
                                                <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 sm:mb-4 max-w-[150px] mx-auto">
                                                    <Image
                                                        src={product.images[0]?.image || '/noImage.jpg'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                    />
                                                    {/* Overlay for better text readability */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>

                                                {/* Product Info */}
                                                <div className="text-center">
                                                    <h3 className="text-lg font-semibold text-white group-hover:text-amber-200 transition-colors duration-300 mb-2 line-clamp-2">
                                                        {product.name}
                                                    </h3>

                                                    {(() => {
                                                        // Get excerpt or generate from description, then sanitize HTML
                                                        const rawExcerpt = getOrGenerateExcerpt(
                                                            product.description || null,
                                                            null
                                                        );

                                                        // Always strip HTML tags and collapse whitespace for plain text display
                                                        const cleanText = stripHtmlTags(rawExcerpt || product.description || '')
                                                            .replace(/\s+/g, ' ') // Collapse multiple spaces into single space
                                                            .trim();

                                                        return cleanText ? (
                                                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                                                {cleanText}
                                                            </p>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-center space-x-2 mt-auto">
                                                    <span className="text-xl sm:text-2xl font-bold text-amber-400">
                                                        {formatEUR(product.basePrice)}
                                                    </span>
                                                </div>

                                                {/* Hover Effect Line */}
                                                <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto transition-all duration-300 mt-4" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-4">
                            No {categoryName} Products Available
                        </h3>
                        <p className="text-gray-300 mb-8 max-w-md mx-auto">
                            We're currently updating our {categoryName.toLowerCase()} collection. Please check back soon for new arrivals.
                        </p>
                        <Link href="/categories">
                            <Button className="btn-primary">
                                Browse All Categories
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Luxury Pagination Controls */}
                {products.length > 0 && (
                    <LuxuryPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Back to Categories */}
                <div className="text-center mt-12">
                    <Link href="/categories">
                        <Button className="btn-secondary">
                            ← Back to All Categories
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
