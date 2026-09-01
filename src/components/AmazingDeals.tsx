'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, Zap, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { useAmazingDeals } from '@/hooks/useAmazingDeals';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Keyboard } from 'swiper/modules';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-url';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface Product {
  id: string;
  name: string;
  basePrice: number;
  slug?: string;
  images: { id: string; image: string }[];
  baseUnit: { id: string; name: string; symbol: string };
  units: { id: string; name: string; price: number; stock: number; isActive: boolean }[];
  discounts: { id: string; value: number; discountType: string; endDate: string }[];
  isAmazing: boolean;
}

export default function AmazingDeals() {
  const [isClient, setIsClient] = useState(false);
  const { products, loading, error } = useAmazingDeals();

  const CURRENCY = 'EUR';

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
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
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 0, hours: 23, minutes: 59, seconds: 59 }; // Reset
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  // Loading state placeholder with responsive spacing and Persian text
  if (!isClient) {
    return (
      <section className="container-fluid pt-[16px] pb-6 md:section-padding min-h-[450px]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center flex flex-col items-center">
            <div className="animate-pulse flex flex-col items-center w-full">
              <div className="h-7 bg-amber-950/40 border border-amber-500/10 rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-amber-950/40 border border-amber-500/10 rounded w-72 mx-auto mb-3"></div>
              <div className="h-16 bg-amber-950/40 border border-amber-500/10 rounded-lg w-56 mx-auto mb-6"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <section className="container-fluid pt-[16px] pb-6 md:section-padding min-h-[691px] xs:min-h-[580px] sm:min-h-[690px] lg:min-h-[936px]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center flex flex-col items-center"
          >
            <h2 className="text-[24px] xs:text-[28px] md:text-4xl font-extrabold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-1.5 leading-tight">
              🔥 پیشنهادهای ویژه شیخ
            </h2>
            <p className="text-gray-300 text-[14px] xs:text-[15px] leading-[1.6] max-w-2xl mx-auto mb-3 font-normal">
              در حال بارگذاری پیشنهادهای ویژه...
            </p>
            <div className="flex flex-col items-center gap-2 mt-2 h-16 w-56 mx-auto animate-pulse bg-amber-950/20 border border-amber-500/10 rounded-lg mb-6"></div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="container-fluid pt-[16px] pb-6 md:section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-[24px] xs:text-[28px] md:text-4xl font-extrabold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-3">
              🔥 پیشنهادهای ویژه شیخ
            </h2>
            <p className="text-gray-300 text-[14px] xs:text-[15px] leading-[1.6] max-w-2xl mx-auto mb-6">
              امکان بارگذاری پیشنهادهای ویژه وجود ندارد
            </p>
            <div className="bg-gradient-to-br from-red-900/20 via-stone-800/20 to-red-800/20 rounded-2xl border border-red-500/20 p-8 max-w-md mx-auto">
              <div className="text-red-400/60 mb-3">
                <Zap size={40} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-200 mb-2 font-vazirmatn">
                خطا در بارگذاری پیشنهادها
              </h3>
              <p className="text-gray-400 text-xs">
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
      <section className="container-fluid pt-[16px] pb-6 md:section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-[24px] xs:text-[28px] md:text-4xl font-extrabold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-3">
              🔥 پیشنهادهای ویژه شیخ
            </h2>
            <p className="text-gray-300 text-[14px] xs:text-[15px] leading-[1.6] max-w-2xl mx-auto mb-6">
              بهترین پیشنهادهای محدود با تخفیف اختصاصی
            </p>
            
            <div className="bg-gradient-to-br from-amber-900/10 via-stone-900/30 to-amber-800/10 rounded-2xl border border-amber-500/10 p-8 max-w-md mx-auto">
              <div className="text-amber-400/60 mb-3">
                <Zap size={40} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-amber-200 mb-2 font-vazirmatn">
                پیشنهادی در حال حاضر موجود نیست
              </h3>
              <p className="text-gray-400 text-xs">
                به زودی با پیشنهادهای شگفت‌انگیز دیگر بازگردید!
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-fluid pt-[16px] pb-6 md:section-padding min-h-[450px]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-5 md:mb-10 flex flex-col items-center"
        >
          <h2 className="text-[24px] xs:text-[28px] md:text-4xl font-extrabold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-1.5 leading-tight select-none">
            🔥 پیشنهادهای ویژه شیخ
          </h2>
          <p className="text-gray-300 text-[14px] xs:text-[15px] leading-[1.6] max-w-2xl mx-auto mb-3 font-normal select-none">
            بهترین پیشنهادهای محدود با تخفیف اختصاصی
          </p>
          
          {/* Countdown Timer - Luxury Glass Redesign */}
          <div className="flex flex-col items-center gap-2 mt-2" dir="rtl">
            <div className="flex items-center gap-1.5 text-amber-300 font-medium text-[13px] xs:text-[14px] md:text-sm select-none">
              <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-amber-400" />
              <span>⏳ پایان پیشنهاد تا</span>
            </div>

            <div className="flex items-center gap-1 xs:gap-1.5 select-none">
              {/* Card 1: روز */}
              <div className="bg-neutral-900/60 backdrop-blur-md border border-amber-500/20 rounded-lg py-1 px-1.5 xs:py-1.5 xs:px-2 md:py-2.5 md:px-3 min-w-[42px] xs:min-w-[48px] md:min-w-[64px] text-center shadow-lg shadow-black/40">
                <span className="block text-amber-400 font-bold text-[16px] xs:text-[18px] md:text-2xl leading-none">
                  {timeLeft.days.toString().padStart(2, '0')}
                </span>
                <span className="block text-stone-400 text-[9px] xs:text-[10px] md:text-xs mt-1 leading-none font-medium">
                  روز
                </span>
              </div>

              <span className="text-amber-500/60 font-bold text-xs xs:text-sm md:text-base">:</span>

              {/* Card 2: ساعت */}
              <div className="bg-neutral-900/60 backdrop-blur-md border border-amber-500/20 rounded-lg py-1 px-1.5 xs:py-1.5 xs:px-2 md:py-2.5 md:px-3 min-w-[42px] xs:min-w-[48px] md:min-w-[64px] text-center shadow-lg shadow-black/40">
                <span className="block text-amber-400 font-bold text-[16px] xs:text-[18px] md:text-2xl leading-none">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="block text-stone-400 text-[9px] xs:text-[10px] md:text-xs mt-1 leading-none font-medium">
                  ساعت
                </span>
              </div>

              <span className="text-amber-500/60 font-bold text-xs xs:text-sm md:text-base">:</span>

              {/* Card 3: دقیقه */}
              <div className="bg-neutral-900/60 backdrop-blur-md border border-amber-500/20 rounded-lg py-1 px-1.5 xs:py-1.5 xs:px-2 md:py-2.5 md:px-3 min-w-[42px] xs:min-w-[48px] md:min-w-[64px] text-center shadow-lg shadow-black/40">
                <span className="block text-amber-400 font-bold text-[16px] xs:text-[18px] md:text-2xl leading-none">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="block text-stone-400 text-[9px] xs:text-[10px] md:text-xs mt-1 leading-none font-medium">
                  دقیقه
                </span>
              </div>

              <span className="text-amber-500/60 font-bold text-xs xs:text-sm md:text-base">:</span>

              {/* Card 4: ثانیه */}
              <div className="bg-neutral-900/60 backdrop-blur-md border border-amber-500/20 rounded-lg py-1 px-1.5 xs:py-1.5 xs:px-2 md:py-2.5 md:px-3 min-w-[42px] xs:min-w-[48px] md:min-w-[64px] text-center shadow-lg shadow-black/40">
                <span className="block text-amber-400 font-bold text-[16px] xs:text-[18px] md:text-2xl leading-none">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="block text-stone-400 text-[9px] xs:text-[10px] md:text-xs mt-1 leading-none font-medium">
                  ثانیه
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Carousel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <Swiper
            modules={[Navigation, Autoplay, Keyboard]}
            spaceBetween={12}
            slidesPerView={1}
            centeredSlides={false}
            grabCursor={true}
            loop={true}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              nextEl: '.swiper-button-next-amazing',
              prevEl: '.swiper-button-prev-amazing',
            }}
            keyboard={{
              enabled: true,
              onlyInViewport: true,
            }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 12 },
              361: { slidesPerView: 2, spaceBetween: 12 },
              769: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="amazing-deals-swiper"
          >
            {products.map((product) => {
              const rawMainImage = product.images[0]?.image || '/placeholder-product.jpg';
              const mainImage = getOptimizedCloudinaryUrl(rawMainImage, { width: 400, quality: 75 });
              const hasDiscount = product.discounts && product.discounts.length > 0;
              const discount = hasDiscount ? product.discounts[0] : null;
              const discountPercentage = discount ? discount.value : 0;
              
              // Get the lowest available price
              const getLowestPrice = () => {
                if (product.units && product.units.length > 0) {
                  const activeUnits = product.units.filter(unit => unit.isActive && unit.stock > 0);
                  if (activeUnits.length > 0) {
                    const lowestUnitPrice = Math.min(...activeUnits.map(unit => Number(unit.price)));
                    return hasDiscount 
                      ? lowestUnitPrice * (1 - discountPercentage / 100)
                      : lowestUnitPrice;
                  }
                }
                return hasDiscount 
                  ? product.basePrice * (1 - discountPercentage / 100)
                  : product.basePrice;
              };
              
              const finalPrice = getLowestPrice();
              const hasMultipleUnits = product.units && product.units.length > 1;

              return (
                <SwiperSlide key={product.id}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{
                      y: -6,
                      scale: 1.01,
                      transition: {
                        duration: 0.25,
                        ease: "easeOut"
                      }
                    }}
                    className="group h-full"
                  >
                    <Link href={`/products/${product.slug || product.id}`} className="block h-full">
                      <div className="bg-gradient-to-br from-amber-900/40 via-stone-800/40 to-amber-800/40 rounded-xl border border-amber-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col" dir="rtl">
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            quality={75}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          />
                          
                          {/* Discount Badge */}
                          {hasDiscount && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                              {discountPercentage}-٪
                            </div>
                          )}
                          
                          {/* Amazing Deals Badge */}
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                            <Zap size={11} />
                            ویژه
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 md:p-4 space-y-2 md:space-y-3 flex-grow flex flex-col text-right">
                          {/* Product Name */}
                          <h2 className="text-xs md:text-sm font-semibold text-white group-hover:text-amber-200 transition-colors duration-300 leading-tight truncate md:line-clamp-2 font-vazirmatn">
                            {product.name}
                          </h2>

                          {/* Price Section */}
                          <div className="space-y-1">
                            <div className="flex flex-col xs:flex-row xs:items-baseline gap-1 xs:gap-2">
                              <span className="text-sm xs:text-base md:text-lg font-bold text-amber-200 whitespace-nowrap">
                                {hasMultipleUnits ? 'از ' : ''}{formatPrice(finalPrice, CURRENCY)}
                              </span>
                              {hasDiscount && (
                                <span className="text-[11px] xs:text-xs md:text-sm text-gray-400 line-through whitespace-nowrap">
                                  {hasMultipleUnits ? 'از ' : ''}{formatPrice(product.basePrice, CURRENCY)}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] md:text-xs text-amber-300/80 font-vazirmatn">
                              {hasMultipleUnits ? 'تنوع در ابعاد' : `هر ${product.baseUnit?.symbol || ''}`}
                            </p>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={11}
                                  className={`${
                                    star <= 4 ? 'text-amber-400 fill-current' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] md:text-xs text-gray-400 mr-1">(۴.۸)</span>
                          </div>

                          {/* View Details Button */}
                          <div className="pt-1 md:pt-2 mt-auto">
                            <div className="flex items-center justify-between text-amber-400 group-hover:text-amber-300 transition-colors duration-300">
                              <span className="text-[11px] md:text-xs font-medium font-vazirmatn">مشاهده جزئیات</span>
                              <ArrowLeft size={12} className="md:size-[14px] group-hover:-translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <button
            className="swiper-button-prev-amazing absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-11 h-11 bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:from-amber-700 hover:to-orange-700 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-400/30 z-10 shadow-lg border border-amber-400/20"
            aria-label="Previous deals"
          >
            <ChevronLeft className="w-5.5 h-5.5" />
          </button>
          
          <button
            className="swiper-button-next-amazing absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-11 h-11 bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:from-amber-700 hover:to-orange-700 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-400/30 z-10 shadow-lg border border-amber-400/20"
            aria-label="Next deals"
          >
            <ChevronRight className="w-5.5 h-5.5" />
          </button>
        </motion.div>

        {/* View All Deals Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-6 md:mt-12"
        >
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-6 py-2.5 md:px-8 md:py-3 rounded-xl text-sm md:text-base transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105"
          >
            مشاهده همه پیشنهادها
            <ArrowLeft size={18} className="md:size-5" />
          </Link>
        </motion.div>
      </div>

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .amazing-deals-swiper {
          padding: 0 60px !important;
        }
        
        .swiper-button-prev-amazing:after,
        .swiper-button-next-amazing:after {
          display: none;
        }
        
        .swiper-button-prev-amazing,
        .swiper-button-next-amazing {
          position: absolute !important;
          margin-top: 0 !important;
        }
        
        .swiper-button-prev-amazing.swiper-button-disabled,
        .swiper-button-next-amazing.swiper-button-disabled {
          opacity: 0.3 !important;
          cursor: not-allowed !important;
        }
        
        @media (max-width: 767px) {
          .swiper-button-prev-amazing,
          .swiper-button-next-amazing {
            display: none !important;
          }
          
          .amazing-deals-swiper {
            padding: 0 12px !important;
          }
        }
        
        .amazing-deals-swiper .swiper-slide {
          height: auto !important;
        }
        
        .amazing-deals-swiper .swiper-slide > div {
          height: 100% !important;
        }
      `}</style>
    </section>
  );
}
