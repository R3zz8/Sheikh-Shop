'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
    images: Array<{ 
        id: string; 
        image: string | null; 
        secureUrl?: string | null;
        publicId?: string | null;
        productId: string | null | undefined 
    }>;
    productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right

    if (!images || images.length === 0) {
        return (
            <div className="relative bg-neutral-950/40 backdrop-blur-md rounded-3xl p-8 border border-amber-500/10 shadow-2xl">
                <div className="aspect-square bg-neutral-900/50 rounded-2xl flex items-center justify-center border border-dashed border-amber-500/10">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-800/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                            <span className="text-2xl">📷</span>
                        </div>
                        <p className="text-base font-bold text-amber-200/90">فاقد تصویر محصول</p>
                        <p className="text-xs text-stone-400 mt-1">تصاویر این محصول به زودی اضافه خواهند شد</p>
                    </div>
                </div>
            </div>
        );
    }

    const handlePrevious = () => {
        setDirection(-1);
        setSelectedImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setDirection(1);
        setSelectedImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const handleThumbnailClick = (index: number) => {
        setDirection(index > selectedImageIndex ? 1 : -1);
        setSelectedImageIndex(index);
    };

    // Framer motion animation variants with precise const literals to satisfy stricter TypeScript rules
    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 80 : -80,
            opacity: 0,
            scale: 0.98,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: 'spring' as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.35, ease: 'easeOut' as const },
                scale: { duration: 0.45, ease: 'easeOut' as const },
            },
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -80 : 80,
            opacity: 0,
            scale: 0.98,
            transition: {
                x: { type: 'spring' as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.25, ease: 'easeIn' as const },
            },
        }),
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Main Stage Image Box */}
            <div className="relative bg-neutral-900/60 backdrop-blur-xl rounded-3xl p-4 md:p-6 border border-white/5 shadow-2xl overflow-hidden group/stage">
                {/* Subtle soft gold ambient back glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />

                {/* Navigation Arrows (rendered if there is more than 1 image) */}
                {images.length > 1 && (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-neutral-950/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-stone-300 hover:text-white transition-all duration-300 opacity-0 group-hover/stage:opacity-100 shadow-xl"
                            aria-label="تصویر قبلی"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-neutral-950/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-stone-300 hover:text-white transition-all duration-300 opacity-0 group-hover/stage:opacity-100 shadow-xl"
                            aria-label="تصویر بعدی"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </>
                )}

                {/* Main Interactive Stage Container */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-950/20">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={selectedImageIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0 w-full h-full flex items-center justify-center p-2"
                        >
                            <Image
                                src={images[selectedImageIndex]?.secureUrl || images[selectedImageIndex]?.image || '/noImage.jpg'}
                                alt={`${productName} - تصویر ${selectedImageIndex + 1}`}
                                fill
                                className="object-contain rounded-2xl selection:bg-transparent"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={selectedImageIndex === 0}
                                quality={90}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Minimal Luxury Image Badge Count Indicator */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-neutral-950/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-[11px] font-bold text-amber-200/90 tracking-wider shadow-lg">
                        {selectedImageIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Elegant Horizontal Thumbnails Gallery list */}
            {images.length > 1 && (
                <div className="flex gap-2.5 md:gap-3 justify-center overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
                    {images.map((image, index) => {
                        const isSelected = index === selectedImageIndex;
                        return (
                            <motion.button
                                key={image.id || index}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleThumbnailClick(index)}
                                className={`relative w-[68px] h-[68px] md:w-20 md:h-20 rounded-2xl overflow-hidden border transition-all duration-300 flex-shrink-0 bg-neutral-900/60 backdrop-blur-md ${
                                    isSelected
                                        ? 'border-amber-500 shadow-xl shadow-amber-500/10'
                                        : 'border-white/5 hover:border-white/15'
                                }`}
                                aria-label={`مشاهده تصویر ${index + 1}`}
                            >
                                <div className="absolute inset-0 p-1">
                                    <Image
                                        src={image.secureUrl || image.image || '/noImage.jpg'}
                                        alt={`${productName} تصویر بندانگشتی ${index + 1}`}
                                        fill
                                        className="object-cover rounded-xl"
                                        sizes="80px"
                                        quality={60}
                                    />
                                </div>
                                {/* Selected subtle dark amber overlay */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
