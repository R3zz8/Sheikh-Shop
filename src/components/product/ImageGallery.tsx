'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
    images: Array<{ id: string; image: string; productId: string | null | undefined }>;
    productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="relative bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15">
                <div className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📷</span>
                        </div>
                        <p className="text-lg font-medium">No Images Available</p>
                        <p className="text-sm text-gray-500 mt-2">Product images will appear here</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleImageChange = (index: number) => {
        setSelectedImageIndex(index);
    };

    const handlePrevious = () => {
        setSelectedImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setSelectedImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Main Image */}
            <div className="relative bg-white/8 backdrop-blur-sm rounded-2xl p-3 md:p-6 border border-white/15 overflow-hidden">
                {/* Navigation arrows for multiple images */}
                {images.length > 1 && (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/8 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/12 transition-all duration-300"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/8 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/12 transition-all duration-300"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </>
                )}

                {/* Main image with smooth transitions */}
                <div className="relative aspect-square">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedImageIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                        >
                            <Image
                                src={images[selectedImageIndex]?.image || ''}
                                alt={`${productName} - Image ${selectedImageIndex + 1}`}
                                fill
                                className="object-contain rounded-xl"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={selectedImageIndex === 0}
                                quality={85}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Image counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-white/8 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white text-sm font-medium">
                        {selectedImageIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 md:gap-3 justify-start overflow-x-auto pb-2 md:pb-0 md:justify-center lg:justify-start scrollbar-hide">
                    {images.map((image, index) => (
                        <motion.button
                            key={image.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleImageChange(index)}
                            className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${index === selectedImageIndex
                                ? 'border-amber-300 shadow-lg shadow-amber-300/25'
                                : 'border-white/20 hover:border-white/40'
                                }`}
                        >
                            <Image
                                src={image.image}
                                alt={`${productName} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                            {/* Selected indicator */}
                            {index === selectedImageIndex && (
                                <div className="absolute inset-0 bg-amber-300/20 backdrop-blur-sm" />
                            )}
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
} 