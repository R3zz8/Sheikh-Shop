'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string | null;
}

interface ImageGalleryProps {
    images: Array<{ 
        id: string; 
        image: string | null; 
        secureUrl?: string | null;
        publicId?: string | null;
        productId?: string | null | undefined
    }>;
    videos?: Array<{
        id: string;
        url: string;
        thumbnailUrl?: string | null;
        productId?: string;
    }>;
    productName: string;
    layoutIdPrefix?: string; // To avoid duplicate Framer Motion keys across layouts
}

export default function ImageGallery({ images, videos = [], productName, layoutIdPrefix = 'gallery' }: ImageGalleryProps) {
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const shouldReduceMotion = useReducedMotion();

    // Construct unified media items array
    const mediaItems: MediaItem[] = [
        ...images.map((img) => ({
            id: img.id,
            type: 'image' as const,
            url: img.secureUrl || img.image || '/noImage.jpg',
        })),
        ...videos.map((vid) => ({
            id: vid.id,
            type: 'video' as const,
            url: vid.url,
            thumbnailUrl: vid.thumbnailUrl || null,
        })),
    ];

    // Reset selected index if media items change
    useEffect(() => {
        setSelectedMediaIndex(0);
    }, [images, videos]);

    // Keyboard navigation (Arrow keys)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (mediaItems.length <= 1) return;
            if (e.key === 'ArrowRight') {
                handlePrevious();
            } else if (e.key === 'ArrowLeft') {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mediaItems.length]);

    if (!mediaItems || mediaItems.length === 0) {
        return (
            <div className="relative bg-[#1C120C]/90 rounded-3xl p-8 border border-amber-500/10">
                <div className="aspect-square bg-stone-900/60 rounded-2xl flex items-center justify-center">
                    <div className="text-center text-stone-400">
                        <div className="w-16 h-16 bg-[#2A1A12] rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/15">
                            <span className="text-2xl">📷</span>
                        </div>
                        <p className="text-lg font-bold text-amber-200">رسانه‌ای یافت نشد</p>
                    </div>
                </div>
            </div>
        );
    }

    const handlePrevious = () => {
        setSelectedMediaIndex((prev) =>
            prev === 0 ? mediaItems.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setSelectedMediaIndex((prev) =>
            prev === mediaItems.length - 1 ? 0 : prev + 1
        );
    };

    const activeItem = mediaItems[selectedMediaIndex] || mediaItems[0] || { type: 'image', url: '/noImage.jpg' };

    return (
        <div className="space-y-4 md:space-y-6 w-full" dir="rtl">
            {/* Main Media Container */}
            <div className="relative bg-[#1C120C]/90 border border-amber-500/15 rounded-[2.5rem] p-4 md:p-6 shadow-[0_25px_60px_-15px_rgba(42,26,18,0.5)] overflow-hidden flex flex-col justify-between aspect-[1.1] min-h-[240px] xs:min-h-[280px] md:min-h-[450px] lg:min-h-[500px] h-auto group/gallery">

                {/* Gentle amber ambient glow behind the main media */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.06)_0%,transparent_65%)] rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />

                {/* Glass reflection sweep line */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/[0.02] to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-1000 pointer-events-none z-10" />

                {/* Floating Special VIP Tag Overlay */}
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-[#1C120C]/95 border border-amber-500/35 text-amber-400 text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                        {activeItem.type === 'video' ? 'ویدیو معرفی کالا' : 'سفارش اختصاصی شیخ'}
                    </span>
                </div>

                {/* Arrow Navigation (Left/Right) */}
                {mediaItems.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-4 md:inset-x-6 flex items-center justify-between pointer-events-none z-20">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePrevious}
                            className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1C120C]/90 hover:bg-amber-500 hover:text-[#1C120C] text-amber-400 border border-amber-500/30 hover:border-amber-500 flex items-center justify-center transition-all duration-300 shadow-xl"
                            aria-label="رسانه قبلی"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNext}
                            className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1C120C]/90 hover:bg-amber-500 hover:text-[#1C120C] text-amber-400 border border-amber-500/30 hover:border-amber-500 flex items-center justify-center transition-all duration-300 shadow-xl"
                            aria-label="رسانه بعدی"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                    </div>
                )}

                {/* Main Media Render */}
                <div className="relative flex-1 w-full flex items-center justify-center p-3 z-10 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${layoutIdPrefix}-${selectedMediaIndex}`}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: shouldReduceMotion || activeItem.type === 'video' ? 0 : [0, -6, 0]
                            }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{
                                duration: 0.3,
                                ease: [0.16, 1, 0.3, 1],
                                y: shouldReduceMotion || activeItem.type === 'video' ? undefined : {
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }
                            }}
                            drag={activeItem.type === 'image' ? 'x' : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.4}
                            onDragEnd={(event, info) => {
                                const swipeThreshold = 50;
                                if (info.offset.x < -swipeThreshold) {
                                    handleNext();
                                } else if (info.offset.x > swipeThreshold) {
                                    handlePrevious();
                                }
                            }}
                            className="w-full h-full relative gpu-accelerated flex items-center justify-center"
                        >
                            {activeItem.type === 'image' ? (
                                <Image
                                    src={activeItem.url}
                                    alt={`${productName} - تصویر ${selectedMediaIndex + 1}`}
                                    fill
                                    className="object-contain transition-transform duration-700 group-hover/gallery:scale-[1.025]"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                    quality={95}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/80 border border-amber-500/20">
                                    <video
                                        src={activeItem.url}
                                        controls
                                        playsInline
                                        preload="metadata"
                                        poster={activeItem.thumbnailUrl || undefined}
                                        className="w-full h-full max-h-[480px] object-contain rounded-2xl"
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Page dots indicators (Mobile only) */}
                {mediaItems.length > 1 && (
                    <div className="flex md:hidden justify-center gap-1.5 mt-2 z-10">
                        {mediaItems.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedMediaIndex(idx)}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-300",
                                    idx === selectedMediaIndex ? "w-5 bg-amber-400" : "w-1.5 bg-[#5D4037]/40"
                                )}
                                aria-label={`برو به اسلاید ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Desktop Media index counter overlay */}
                {mediaItems.length > 1 && (
                    <div className="absolute bottom-4 right-4 hidden md:block bg-[#1C120C]/90 border border-amber-500/20 rounded-full px-3.5 py-1.5 text-amber-400 text-xs font-black shadow-lg">
                        {selectedMediaIndex + 1} / {mediaItems.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Navigation Row */}
            {mediaItems.length > 1 && (
                <div className="flex gap-2.5 md:gap-4 justify-center overflow-x-auto py-2 px-1 scrollbar-none scroll-smooth">
                    {mediaItems.map((item, index) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedMediaIndex(index)}
                            className={cn(
                                "relative rounded-xl md:rounded-2xl overflow-hidden border transition-all duration-300 flex-shrink-0 flex items-center justify-center bg-[#1C120C]/65 backdrop-blur-md cursor-pointer",
                                "w-12 h-12 md:w-20 md:h-20",
                                index === selectedMediaIndex
                                    ? 'border-amber-400 shadow-xl shadow-amber-500/15 scale-105'
                                    : 'border-[#5D4037]/35 hover:border-amber-500/35 hover:scale-102'
                            )}
                            aria-label={`نمایش رسانه ${index + 1}`}
                        >
                            {item.type === 'image' ? (
                                <Image
                                    src={item.url}
                                    alt={`${productName} بند انگشتی ${index + 1}`}
                                    fill
                                    className="object-contain p-1.5 md:p-3"
                                    sizes="80px"
                                />
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center bg-stone-950">
                                    {item.thumbnailUrl ? (
                                        <Image
                                            src={item.thumbnailUrl}
                                            alt={`${productName} پیش‌نمایش ویدیو`}
                                            fill
                                            className="object-cover opacity-60"
                                            sizes="80px"
                                        />
                                    ) : (
                                        <Film className="w-5 h-5 text-amber-400 opacity-80" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    </div>
                                </div>
                            )}

                            {/* Luxury rotating gradient border on active thumbnail */}
                            {index === selectedMediaIndex && (
                                <div
                                    className="absolute inset-0 rounded-[inherit] pointer-events-none select-none overflow-hidden z-20"
                                    style={{
                                        padding: '1.2px',
                                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                        WebkitMaskComposite: 'xor',
                                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                        maskComposite: 'exclude',
                                    }}
                                >
                                    <motion.div
                                        className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] origin-center"
                                        style={{
                                            background: 'conic-gradient(from 0deg, #d97706 0%, #fb923c 25%, #f59e0b 50%, #fde68a 75%, #d97706 100%)',
                                        }}
                                        animate={shouldReduceMotion ? {} : { rotate: [0, 360] }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    />
                                </div>
                            )}

                            {/* Semi-transparent overlay to darken non-selected thumbnails */}
                            {index !== selectedMediaIndex && (
                                <div className="absolute inset-0 bg-[#1C120C]/10 hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                            )}
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}
