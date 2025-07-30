'use client';

import { motion } from 'framer-motion';
import type { ProductsWithImages } from '@/types';
import ImageGallery from './ImageGallery';
import ProductInfo from './ProductInfo';
import AddToCartButton from './AddToCartButton';

interface ProductDetailPageProps {
    product: ProductsWithImages;
}

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-orange-500/3 to-yellow-500/5 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/3 via-transparent to-orange-500/3" />
                <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto"
                >
                    {/* Main product card with glowing border */}
                    <div className="relative group">
                        {/* Glowing border effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse" />

                        {/* Main card */}
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="grid lg:grid-cols-2 gap-12 items-start">
                                {/* Left side - Image Gallery */}
                                <ImageGallery images={product.images} productName={product.name} />

                                {/* Right side - Product Info */}
                                <ProductInfo product={product} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
} 