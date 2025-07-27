'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Image imports from public folder
const carouselData = [
  {
    id: 1,
    image: "/a.jpg",
    title: "Premium Collection",
    category: "Luxury Items",
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    image: "/b.jpg",
    title: "Exclusive Series",
    category: "Limited Edition",
    rating: 4.9,
    reviews: 89
  },
  {
    id: 3,
    image: "/c.jpg",
    title: "Signature Line",
    category: "Best Seller",
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    image: "/d.jpg",
    title: "Elite Collection",
    category: "Premium Quality",
    rating: 4.8,
    reviews: 203
  },
  {
    id: 5,
    image: "/e.jpg",
    title: "Heritage Series",
    category: "Classic Design",
    rating: 4.9,
    reviews: 167
  },
  {
    id: 6,
    image: "/f.jpg",
    title: "Modern Elegance",
    category: "Contemporary",
    rating: 4.6,
    reviews: 98
  }
];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className={cn(
      "relative w-full min-h-[600px] overflow-hidden",
      "transition-opacity duration-1000",
      isLoaded ? "opacity-100" : "opacity-0"
    )}>
      {/* Soft blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-200/20 via-transparent to-transparent pointer-events-none" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Premium Collection
            </h1>
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our curated selection of luxury items, crafted with excellence and designed for those who appreciate the finest quality.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / 3)}%)`,
              }}
            >
              {carouselData.map((item, index) => (
                <div
                  key={item.id}
                  className="w-1/3 md:w-1/3 lg:w-1/3 px-4 flex-shrink-0"
                >
                  <div className="group relative">
                    {/* Card Container */}
                    <div className={cn(
                      "relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500",
                      "transform hover:scale-105 hover:-translate-y-2",
                      "border border-gray-100"
                    )}>
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <div
                          className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{
                            backgroundImage: `url(${item.image})`,
                          }}
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Premium badge */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            Premium
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.category}
                          </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i < Math.floor(item.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {item.rating} ({item.reviews} reviews)
                          </span>
                        </div>

                        {/* Action Button */}
                        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                          Explore Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-blue-600 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {carouselData.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner; 