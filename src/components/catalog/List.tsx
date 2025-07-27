'use client';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { ZoomIn, Sparkles, Download } from 'lucide-react';
import { DATA } from '@/modules/products/mock/products';
import { cn } from '@/lib/utils';

function CatalogList() {
  const images = DATA[0].images;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-orange-500/3 to-yellow-500/5 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/3 via-transparent to-orange-500/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tight mb-4">
            Product Gallery
          </h2>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto px-4">
            Explore our premium product collection in stunning detail
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {images?.map((_image: any, index) => {
            return (
              <CatalogItem
                key={index}
                image={_image}
                index={index}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-gray-200 text-sm">
              {images?.length || 0} high-quality images available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component to use hooks properly
function CatalogItem({ image, index }: { image: any; index: number }) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px'
  });

  return (
    <div
      ref={ref}
      className={cn(
        "group relative gpu-accelerated",
        inView ? "animate-slide-in-up" : "opacity-0 translate-y-8",
        `stagger-${(index % 4) + 1}`
      )}
    >
      {/* Animated neon border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

      {/* Glassmorphism card */}
      <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-amber-500/25 transition-all duration-500 hover:scale-105 group-hover:bg-white/15 overflow-hidden touch-feedback">
        <CardContent className="flex w-full h-64 sm:h-80 items-center justify-center p-4 sm:p-6 relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5 rounded-xl" />

          <Image
            src={image?.image}
            alt="gallery"
            fill
            className="relative z-10 hover:scale-110 transform transition-all duration-300 rounded-lg group-hover:shadow-2xl object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-yellow-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Image number badge */}
          <div className="absolute top-4 right-4 z-20">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-sm font-bold">
              <Sparkles className="w-3 h-3" />
              #{index + 1}
            </div>
          </div>

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-30">
            <button className="p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300 touch-feedback">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300 touch-feedback">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CatalogList;
