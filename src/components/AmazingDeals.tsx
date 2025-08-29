'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, Zap, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import { useAmazingDeals } from '@/hooks/useAmazingDeals';


interface Product {
  id: string;
  name: string;
  basePrice: number;
  images: { id: string; image: string }[];
  baseUnit: { id: string; name: string; symbol: string };
  discounts: { id: string; value: number; discountType: string; endDate: string }[];
  isAmazing: boolean;
}

export default function AmazingDeals() {
  const [isClient, setIsClient] = useState(false);
  const { products, loading, error } = useAmazingDeals();
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 }; // Reset to 24 hours
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const cardVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <section className="container-fluid section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-96 mx-auto mb-8"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <section className="container-fluid section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4">
              Amazing Deals
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Loading amazing deals...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="container-fluid section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4">
              Amazing Deals
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Unable to load amazing deals
            </p>
            <div className="bg-gradient-to-br from-red-900/20 via-stone-800/20 to-red-800/20 rounded-2xl border border-red-500/20 p-12 max-w-md mx-auto">
              <div className="text-red-400/60 mb-4">
                <Zap size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-red-200 mb-2">
                Error Loading Deals
              </h3>
              <p className="text-gray-400 text-sm">
                {error}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // If no products, show empty state
  if (products.length === 0) {
    return (
      <section className="container-fluid section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4">
              Amazing Deals
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Discover incredible offers on our premium products
            </p>
            
            {/* Empty State Card */}
            <div className="bg-gradient-to-br from-amber-900/20 via-stone-800/20 to-amber-800/20 rounded-2xl border border-amber-500/20 p-12 max-w-md mx-auto">
              <div className="text-amber-400/60 mb-4">
                <Zap size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-amber-200 mb-2">
                No Deals Available
              </h3>
              <p className="text-gray-400 text-sm">
                Check back soon for amazing offers!
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-fluid section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4">
            Amazing Deals
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Limited time offers on our premium collection
          </p>
          
          {/* Countdown Timer */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <Clock className="text-amber-400 w-5 h-5" />
            <span className="text-amber-200 text-sm font-medium">Deals end in:</span>
            <div className="flex gap-2">
              <div className="bg-gradient-to-br from-amber-600/80 to-amber-800/80 rounded-lg px-3 py-2 min-w-[3rem] text-center">
                <span className="text-amber-100 font-bold text-lg">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-amber-400 text-lg font-bold">:</span>
              <div className="bg-gradient-to-br from-amber-600/80 to-amber-800/80 rounded-lg px-3 py-2 min-w-[3rem] text-center">
                <span className="text-amber-100 font-bold text-lg">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-amber-400 text-lg font-bold">:</span>
              <div className="bg-gradient-to-br from-amber-600/80 to-amber-800/80 rounded-lg px-3 py-2 min-w-[3rem] text-center">
                <span className="text-amber-100 font-bold text-lg">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product, index) => {
            const mainImage = product.images[0]?.image || '/placeholder-product.jpg';
            const hasDiscount = product.discounts && product.discounts.length > 0;
            const discount = hasDiscount ? product.discounts[0] : null;
            const discountPercentage = discount ? discount.value : 0;
            const finalPrice = hasDiscount 
              ? product.basePrice * (1 - discountPercentage / 100)
              : product.basePrice;

            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover="hover"
                className="group"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="bg-gradient-to-br from-amber-900/40 via-stone-800/40 to-amber-800/40 rounded-xl border border-amber-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                      
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          -{discountPercentage}%
                        </div>
                      )}
                      
                      {/* Amazing Deals Badge */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Zap size={12} />
                        DEAL
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      {/* Product Name */}
                      <h3 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors duration-300 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>

                      {/* Price Section */}
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-amber-200">
                            {formatPrice(finalPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.basePrice)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-300/80">
                          per {product.baseUnit.symbol}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={`${
                                star <= 4 ? 'text-amber-400 fill-current' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">(4.8)</span>
                      </div>

                      {/* View Details Button */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-amber-400 group-hover:text-amber-300 transition-colors duration-300">
                          <span className="text-xs font-medium">View Details</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Deals Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105"
          >
            View All Deals
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
