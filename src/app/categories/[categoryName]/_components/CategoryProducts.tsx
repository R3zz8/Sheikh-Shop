'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';

interface Product {
    id: string;
    name: string;
    price: number;
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
    return (
        <div className="container-fluid section-padding">
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

                {/* Products Grid */}
                {products.length > 0 ? (
                    <div className="responsive-grid gap-6 md:gap-8">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/product/${product.id}`}
                                className="group card p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                            >
                                {/* Product Image */}
                                <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4">
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

                                    {product.description && (
                                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="text-2xl font-bold text-amber-400">
                                            ${product.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Effect Line */}
                                <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto transition-all duration-300 mt-4" />
                            </Link>
                        ))}
                    </div>
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