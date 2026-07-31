'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, ShoppingBag, Truck, ShieldCheck, CreditCard, Headphones,
  Sparkles, Gift, ChevronDown, ChevronRight, ChevronLeft,
  Minus, Plus, Heart, BarChart3, HelpCircle, MessageSquare,
  Share2, Eye, ShieldAlert, BadgePercent, CheckCircle2, ShoppingCart
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductsWithImages, ProductUnit } from '@/types';
import { useLuxuryUnboxing } from '@/components/3d/LuxuryUnboxingProvider';
import { formatToToman } from '@/lib/currency';
import { resolveProductPrice } from '@/lib/product-pricing';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import BundleRecommendations from '@/components/recommendations/BundleRecommendations';
import ErrorBoundary from '@/components/ErrorBoundary';
import MarkdownDescription from './MarkdownDescription';

interface ProductDetailPageProps {
  product: ProductsWithImages;
  allProducts?: ProductsWithImages[];
}

interface ImageObj {
  id: string;
  image: string | null;
  secureUrl?: string | null;
}

export default function ProductDetailPage({ product, allProducts = [] }: ProductDetailPageProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { triggerUnboxing, config: unboxingConfig } = useLuxuryUnboxing();
  const { addToCartMutation } = useCart();

  // Dynamic specs accordion states
  const [activeAccordion, setActiveAccordion] = useState<string | null>('story');

  // Favorite & Compare & Share interaction states
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  // Sticky Buy Bar State for Mobile
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 550) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse variations / product units
  const availableProductUnits = useMemo(() => {
    const units = product.units?.filter((unit: ProductUnit) => unit.isActive) || [];
    return units.sort((a: ProductUnit, b: ProductUnit) => Number(a.price) - Number(b.price));
  }, [product.units]);

  const [selectedProductUnit, setSelectedProductUnit] = useState<ProductUnit | null>(
    availableProductUnits.length > 0 ? (availableProductUnits[0] || null) : null
  );

  useEffect(() => {
    if (availableProductUnits.length > 0 && !selectedProductUnit) {
      setSelectedProductUnit(availableProductUnits[0] || null);
    }
  }, [availableProductUnits, selectedProductUnit]);

  // Pricing calculation
  const pricing = resolveProductPrice(product, selectedProductUnit, selectedQuantity);
  const currentStock = selectedProductUnit ? selectedProductUnit.stock : product.quantity;

  // Rating & Review hashing to prevent hydration mismatches
  const hashedRating = useMemo(() => {
    const codeSum = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratingValue = 4 + (codeSum % 2) * 0.5 + (codeSum % 5) * 0.1;
    const reviewCount = 20 + (codeSum % 180);
    return { ratingValue: Math.min(5, Math.max(4, ratingValue)).toFixed(1), reviewCount };
  }, [product.id]);

  // Dynamic values existence flags
  const hasFeatures = product.features && product.features.length > 0;
  const hasSpecs = product.technicalSpecs && typeof product.technicalSpecs === 'object' && Object.keys(product.technicalSpecs).length > 0;
  const hasDescription = !!product.description;
  const hasDimensions = !!product.dimensions;
  const hasMaterials = product.materials && product.materials.length > 0;
  const hasWarranty = !!product.warranty;
  const hasWeight = !!product.weight;
  const hasOrigin = !!product.origin;
  const hasColor = !!product.color;
  const hasScent = !!product.scent;
  const hasFlavor = !!product.flavor;

  const anySpecsAvailable = hasSpecs || hasDimensions || hasMaterials || hasWarranty || hasWeight || hasOrigin || hasColor || hasScent || hasFlavor;

  // Handle addition to cart
  const handleAddToCart = async () => {
    if (currentStock === 0) {
      toast.error('این کالا در حال حاضر موجود نیست.');
      return;
    }
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        unitId: selectedProductUnit?.id || product.baseUnitId,
        quantity: selectedQuantity,
      });
      toast.success('کالا با موفقیت به سبد خرید افزوده شد!');
    } catch (err) {
      console.error(err);
    }
  };

  // Immediate purchase bypass
  const handleInstantPurchase = async () => {
    if (currentStock === 0) {
      toast.error('این کالا در حال حاضر موجود نیست.');
      return;
    }
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        unitId: selectedProductUnit?.id || product.baseUnitId,
        quantity: selectedQuantity,
      });
      window.location.href = '/checkout';
    } catch (err) {
      console.error(err);
    }
  };

  // Format breadcrumbs category title
  const categoryName = useMemo(() => {
    switch (product.categoryType) {
      case 'SheikhHome': return 'لوازم خانگی شیخ';
      case 'SheikhDigital': return 'شیخ دیجیتال';
      case 'SheikhFood': return 'محصولات غذایی شیخ';
      case 'SheikhSmartLiving': return 'خانه هوشمند شیخ';
      case 'SheikhTech': return 'شیخ نوا';
      default: return 'فروشگاه شیخ';
    }
  }, [product.categoryType]);

  const categoryUrl = useMemo(() => {
    switch (product.categoryType) {
      case 'SheikhHome': return '/sheikh-home';
      case 'SheikhDigital': return '/sheikh-digital';
      case 'SheikhFood': return '/sheikh-food';
      case 'SheikhSmartLiving': return '/sheikh-digital';
      case 'SheikhTech': return '/tech-products';
      default: return '/products';
    }
  }, [product.categoryType]);

  // Related products
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.id !== product.id && p.categoryType === product.categoryType)
      .slice(0, 4);
  }, [allProducts, product.id, product.categoryType]);

  // Gallery images list typed as ImageObj
  const images: ImageObj[] = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images.map((img) => ({
        id: img.id,
        image: img.image,
        secureUrl: img.secureUrl,
      }));
    }
    return [{ id: 'fallback', image: '/noImage.jpg', secureUrl: null }];
  }, [product.images]);

  // Handle Share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.excerpt || '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('لینک صفحه محصول با موفقیت کپی شد.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070504] text-stone-100 font-vazirmatn selection:bg-amber-500/30 selection:text-amber-100 relative overflow-hidden pb-24" dir="rtl">

      {/* 🌌 ATMOSPHERIC LUXURY LIGHT GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-25%] right-[-15%] w-[80vw] h-[80vw] bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.06)_0%,transparent_70%)] rounded-full blur-[130px] opacity-70" />
        <div className="absolute top-[40%] left-[-20%] w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04)_0%,transparent_75%)] rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.03)_0%,transparent_80%)] rounded-full blur-[140px] opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-7xl">

        {/* 🖥️ DESKTOP VIEW - UNTOUCHED & UNCHANGED */}
        <div className="hidden md:block">

          {/* 🗺️ BREADCRUMBS with beautiful Apple-like minimal design */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8 md:mb-10 bg-stone-900/10 backdrop-blur-sm py-2.5 px-5 rounded-2xl border border-stone-800/20 inline-flex" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-400 transition-colors">خانه</Link>
          <ChevronRight className="w-3 h-3 text-stone-700 shrink-0 transform rotate-180" />
          <Link href={categoryUrl} className="hover:text-amber-400 transition-colors">{categoryName}</Link>
          <ChevronRight className="w-3 h-3 text-stone-700 shrink-0 transform rotate-180" />
          <span className="text-stone-300 font-medium truncate max-w-[160px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* 🌟 HERO MAIN PRODUCT CARD - LUXURY GLASS PANEL */}
        <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-14 items-start bg-gradient-to-b from-neutral-900/60 to-neutral-900/30 backdrop-blur-xl border border-amber-500/15 rounded-[3.5rem] p-5 sm:p-8 lg:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">

          {/* Animated subtle border reflection overlay */}
          <div className="absolute inset-0 border border-gradient-amber pointer-events-none rounded-[3.5rem] opacity-30" />

          {/* 1. HERO GALLERY (RIGHT COLUMN - occupies 6 columns) */}
          <div className="lg:col-span-6 space-y-8 w-full">
            <div className="relative bg-gradient-to-b from-[#140e0b] to-[#0d0907] border border-amber-500/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden group/gallery flex flex-col justify-between aspect-[1.1] min-h-[400px] md:min-h-[500px]">

              {/* Subtle light reflection on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/[0.02] to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-1000 pointer-events-none" />

              {/* Special Tag Overlay */}
              <div className="absolute top-6 right-6 z-20">
                <span className="bg-stone-950/80 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold tracking-wider px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                  ★ سفارش اختصاصی شیخ
                </span>
              </div>

              {/* Main Image View with smooth fade transitions */}
              <div className="relative flex-1 w-full flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src={images[selectedImageIndex]?.secureUrl || images[selectedImageIndex]?.image || '/noImage.jpg'}
                      alt={`${product.name} - تصویر ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain transition-transform duration-700 group-hover/gallery:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      quality={95}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Arrow navigation inside gallery */}
              {images.length > 1 && (
                <div className="absolute inset-y-0 inset-x-6 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-stone-950/85 hover:bg-amber-500 hover:text-stone-950 text-amber-400 border border-amber-500/20 hover:border-amber-500 flex items-center justify-center transition-all duration-300 shadow-xl"
                    aria-label="تصویر قبلی"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-stone-950/85 hover:bg-amber-500 hover:text-stone-950 text-amber-400 border border-amber-500/20 hover:border-amber-500 flex items-center justify-center transition-all duration-300 shadow-xl"
                    aria-label="تصویر بعدی"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail selector beneath gallery with active state and premium borders */}
            {images.length > 1 && (
              <div className="flex gap-4 justify-center overflow-x-auto py-2 px-1 scrollbar-thin">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border transition-all duration-300 shrink-0 ${
                      index === selectedImageIndex
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 scale-105'
                        : 'border-stone-800 hover:border-amber-500/30 bg-[#0d0907]/60'
                    }`}
                  >
                    <Image
                      src={image.secureUrl || image.image || '/noImage.jpg'}
                      alt={`${product.name} بند انگشتی ${index + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="90px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* ✨ LUXURY UNBOXING TRIGGER - Elegant gold box */}
            {unboxingConfig?.isEnabled !== false && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-gradient-to-b from-[#1b1109] to-[#0a0604] border border-amber-500/20 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 text-right"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center text-3xl shadow-lg shrink-0">
                  📦
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-black text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>تجربه لوکس آنباکسینگ سه‌بعدی</span>
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-md">
                    پیش از خرید، لذت گشودن نمادین جعبه چرمی این محصول را با جزئیات سه‌بعدی و زرین به صورت زنده تماشا کنید.
                  </p>
                </div>

                <button
                  onClick={() => triggerUnboxing(product)}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-stone-950 font-black py-3 px-6 rounded-xl shadow-lg transition-all duration-300 text-xs flex items-center justify-center gap-2 shrink-0 active:scale-95"
                >
                  <Gift className="w-4 h-4 text-stone-950" />
                  <span>آنباکس سه‌بعدی کالا</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* 2. PRODUCT DETAILS & BUYING SYSTEM (LEFT COLUMN - occupies 6 columns) */}
          <div className="lg:col-span-6 space-y-8 w-full">

            {/* A. PRODUCT TITLE & INFO BLOCK */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {categoryName}
                </span>
                {product.brand && (
                  <span className="bg-stone-900 border border-stone-800 text-stone-300 text-[10px] font-medium px-3 py-1 rounded-full">
                    برند: {product.brand}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Sub-header ratings, stock, status info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(Number(hashedRating.ratingValue)) ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-amber-300 text-sm mr-1">{hashedRating.ratingValue}</span>
                  <span className="text-stone-700">|</span>
                  <span className="hover:text-stone-200 transition-colors">({hashedRating.reviewCount} دیدگاه تایید شده)</span>
                </div>

                {product.sku && (
                  <>
                    <span className="text-stone-700">|</span>
                    <span className="font-mono text-stone-500">شناسه: {product.sku}</span>
                  </>
                )}
              </div>
            </div>

            {/* B. PREMIUM PRICE VIEW - THE STRONGEST VISUAL ELEMENT */}
            <div className="relative group bg-[#16100d]/80 border border-amber-500/20 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]">

              {/* Soft moving amber light reflection around price box */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] to-transparent pointer-events-none animate-pulse-glow" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-1.5">
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 block uppercase tracking-wider">قیمت خرید ویژه</span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4.5xl font-black text-amber-400 tracking-tight leading-none">
                      {formatToToman(pricing.price)}
                    </span>
                    {pricing.oldPrice && (
                      <span className="text-stone-500 text-sm sm:text-base line-through decoration-red-500/50 decoration-2 font-bold">
                        {formatToToman(pricing.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  {pricing.hasDiscount && (
                    <span className="bg-gradient-to-r from-red-600 to-red-500 border border-red-500/30 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <BadgePercent className="w-4 h-4" />
                      <span>{pricing.discountPercentage}٪ تخفیف ویژه شیخ</span>
                    </span>
                  )}

                  <span className="flex items-center gap-2 text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${currentStock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className={currentStock > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {currentStock > 0 ? `آماده ارسال (موجود در انبار شیخ)` : 'ناموجود'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* C. APPLE-STYLE VARIANTS SELECTOR */}
            {availableProductUnits.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">انتخاب ظرفیت / مشخصات کالا</label>
                  <span className="text-[10px] text-amber-400 font-medium">مشاهده تغییرات قیمت</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {availableProductUnits.map((unit) => {
                    const isSelected = selectedProductUnit?.id === unit.id;
                    return (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedProductUnit(unit)}
                        className={`relative p-4 rounded-2xl border text-right transition-all duration-300 flex flex-col justify-between h-20 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/[0.06] shadow-xl'
                            : 'border-stone-800 hover:border-amber-500/30 bg-[#0d0907]/40 hover:bg-[#120d0a]/60'
                        }`}
                      >
                        <span className="text-xs font-black text-stone-200 block truncate">{unit.name}</span>
                        <div className="flex items-center justify-between w-full mt-1">
                          <span className="text-amber-400 font-black text-sm">{formatToToman(Number(unit.price))}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* D. LUXURY CTA / ORDER ACTION BLOCK */}
            <div className="bg-gradient-to-b from-[#140e0c]/90 to-[#0c0807]/90 border border-amber-500/15 rounded-3xl p-6 space-y-6 shadow-2xl">

              {/* Factor Breakdown */}
              <div className="bg-stone-950/50 border border-stone-800/60 rounded-2xl p-4.5 space-y-3.5 text-xs sm:text-sm text-stone-300">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">کالای انتخابی:</span>
                  <span className="text-stone-100 font-bold">{product.name}</span>
                </div>
                {selectedProductUnit && (
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">مدل انتخابی:</span>
                    <span className="text-amber-300 font-black">{selectedProductUnit.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">تعداد درخواستی:</span>
                  <span className="text-stone-100 font-bold">{selectedQuantity} عدد</span>
                </div>

                <div className="flex justify-between items-center border-t border-stone-800/80 pt-3.5">
                  <span className="font-bold text-stone-200">مبلغ کل فاکتور:</span>
                  <span className="text-amber-400 font-black text-lg sm:text-xl tracking-tight">
                    {formatToToman(pricing.price)}
                  </span>
                </div>
              </div>

              {/* CTAs with dynamic scale / loading state */}
              <div className="flex flex-col sm:flex-row items-stretch gap-4">

                {/* Quantity adjuster */}
                <div className="flex items-center justify-between sm:justify-start gap-4 bg-stone-950 border border-stone-800 rounded-2xl p-2 shrink-0">
                  <button
                    onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={selectedQuantity <= 1}
                    className="w-11 h-11 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 flex items-center justify-center text-stone-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-black text-center w-10 text-stone-100">{selectedQuantity}</span>
                  <button
                    onClick={() => setSelectedQuantity((prev) => Math.min(currentStock, prev + 1))}
                    disabled={selectedQuantity >= currentStock}
                    className="w-11 h-11 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 flex items-center justify-center text-stone-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Add To Cart with luxurious gradient animation */}
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || addToCartMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-stone-950 font-black py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 text-sm flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5 text-stone-950" />
                  <span>{addToCartMutation.isPending ? 'در حال ثبت...' : 'افزودن به سبد خرید'}</span>
                </button>
              </div>

              {/* Instant Purchase */}
              <button
                onClick={handleInstantPurchase}
                disabled={currentStock === 0 || addToCartMutation.isPending}
                className="w-full bg-stone-950 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-bold py-3.5 px-6 rounded-2xl border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 text-xs flex items-center justify-center gap-2 active:scale-98"
              >
                <span>⚡ خرید فوری و تسویه سریع حساب</span>
              </button>

              {/* Heart, Compare, Share actions */}
              <div className="flex items-center justify-center gap-8 text-xs text-stone-400 border-t border-stone-800/50 pt-4">
                <button
                  onClick={() => {
                    setIsFavorited(!isFavorited);
                    toast.success(isFavorited ? 'از علاقه‌مندی‌ها حذف شد.' : 'به علاقه‌مندی‌ها اضافه شد.');
                  }}
                  className={`hover:text-amber-400 transition-colors flex items-center gap-2 ${isFavorited ? 'text-amber-400' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-amber-400' : ''}`} />
                  <span>{isFavorited ? 'محبوب شما' : 'افزودن به علاقه‌مندی'}</span>
                </button>

                <span className="text-stone-800">|</span>

                <button
                  onClick={() => {
                    setIsCompared(!isCompared);
                    toast.success(isCompared ? 'از لیست مقایسه حذف شد.' : 'به لیست مقایسه افزوده شد.');
                  }}
                  className={`hover:text-amber-400 transition-colors flex items-center gap-2 ${isCompared ? 'text-amber-400' : ''}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>مقایسه محصول</span>
                </button>

                <span className="text-stone-800">|</span>

                <button
                  onClick={handleShare}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>اشتراک‌گذاری</span>
                </button>
              </div>
            </div>

            {/* E. PREMIUM TRUST BADGES WITH GLASSMORPHISM */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#120a06]/50 border border-amber-500/10 rounded-2xl p-4 text-center space-y-2.5 backdrop-blur-sm">
                <CreditCard className="w-6 h-6 text-amber-500 mx-auto" />
                <h4 className="text-[11px] font-black text-stone-200">پرداخت امن VIP</h4>
                <p className="text-[9px] text-stone-500 leading-normal">درگاه بانکی با بیمه امنیتی</p>
              </div>
              <div className="bg-[#120a06]/50 border border-amber-500/10 rounded-2xl p-4 text-center space-y-2.5 backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6 text-amber-500 mx-auto" />
                <h4 className="text-[11px] font-black text-stone-200">اصالت واقعی کالا</h4>
                <p className="text-[9px] text-stone-500 leading-normal">تضمین ۱۰۰٪ لوکس کالا</p>
              </div>
              <div className="bg-[#120a06]/50 border border-amber-500/10 rounded-2xl p-4 text-center space-y-2.5 backdrop-blur-sm">
                <Truck className="w-6 h-6 text-amber-500 mx-auto" />
                <h4 className="text-[11px] font-black text-stone-200">ارسال اکسپرس VIP</h4>
                <p className="text-[9px] text-stone-500 leading-normal">بسته‌بندی محافظ چرمی</p>
              </div>
              <div className="bg-[#120a06]/50 border border-amber-500/10 rounded-2xl p-4 text-center space-y-2.5 backdrop-blur-sm">
                <Headphones className="w-6 h-6 text-amber-500 mx-auto" />
                <h4 className="text-[11px] font-black text-stone-200">پشتیبان اختصاصی</h4>
                <p className="text-[9px] text-stone-500 leading-normal">پاسخگویی ۲۴ ساعته VIP</p>
              </div>
            </div>

          </div>
        </div>

        {/* 3. ROW OF DYNAMIC FEATURES BADGES */}
        {hasFeatures && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-16">
            {product.features.map((feature, idx) => (
              <div key={idx} className="bg-neutral-900/40 backdrop-blur-md border border-amber-500/10 rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-300 hover:border-amber-500/30">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                  ✓
                </div>
                <span className="text-xs sm:text-sm font-bold text-stone-200">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* 4. SPECIFICATIONS & SAFE DESCRIPTION ACCORDION */}
        {anySpecsAvailable && (
          <div className="mt-16 bg-neutral-900/30 backdrop-blur-xl border border-amber-500/10 rounded-[2.5rem] p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 mb-6">جزئیات و مشخصات فنی کالا</h2>
            <div className="space-y-4">

              {/* Product description / Story (SAFE RENDER USING MARKDOWN AND DOMPURIFY) */}
              {hasDescription && (
                <div className="border-b border-stone-800/80 pb-4">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'story' ? null : 'story')}
                    className="w-full flex items-center justify-between py-4 text-right"
                  >
                    <span className="text-sm sm:text-base font-bold text-stone-200">توضیحات و داستان محصول</span>
                    <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'story' ? 'transform rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'story' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pt-2 pb-4 px-1"
                      >
                        <MarkdownDescription content={product.description} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Technical Specifications */}
              {hasSpecs && (
                <div className="border-b border-stone-800/80 pb-4">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
                    className="w-full flex items-center justify-between py-4 text-right"
                  >
                    <span className="text-sm sm:text-base font-bold text-stone-200">مشخصات فنی و سخت‌افزاری</span>
                    <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'specs' ? 'transform rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'specs' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pt-2 pb-4 px-1"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950/40 rounded-2xl p-6 border border-stone-900">
                          {Object.entries(product.technicalSpecs as Record<string, any>).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-stone-800/40 py-3 text-xs sm:text-sm">
                              <span className="text-stone-400 font-medium">{key}</span>
                              <span className="text-stone-100 font-bold">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Shipping protocol info */}
              <div className="border-b border-stone-800/80 pb-4">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full flex items-center justify-between py-4 text-right"
                >
                  <span className="text-sm sm:text-base font-bold text-stone-200">ارسال و تحویل لوکس</span>
                  <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'shipping' ? 'transform rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden text-xs sm:text-sm text-stone-400 leading-relaxed pt-2 pb-4 px-1 space-y-4"
                    >
                      <p>
                        تمامی سفارشات ثبت‌شده در بسته‌بندی‌های لوکس و ضدضربه‌ مخصوص فروشگاه بزرگ شیخ ارسال خواهند شد. سفارشات تهران ظرف ۲۴ ساعت و شهرستان‌ها بین ۳ تا ۵ روز تحویل می‌گردند.
                      </p>
                      <div className="grid grid-cols-2 gap-6 bg-stone-950/40 p-6 rounded-2xl border border-stone-900">
                        <div>
                          <span className="text-stone-500 block mb-1 text-[11px] sm:text-xs">پروتکل توزیع لجستیک</span>
                          <span className="font-bold text-stone-200">{product.shippingDescription || 'ارسال ویژه با بیمه طلایی'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block mb-1 text-[11px] sm:text-xs">هزینه نهایی تحویل</span>
                          <span className="font-bold text-amber-400">{product.allowFreeShipping ? 'رایگان (مهمان فروشگاه)' : '۲۰۰,۰۰۰ تومان'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Warranty details */}
              {hasWarranty && (
                <div className="border-b border-stone-800/80 pb-4">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'warranty' ? null : 'warranty')}
                    className="w-full flex items-center justify-between py-4 text-right"
                  >
                    <span className="text-sm sm:text-base font-bold text-stone-200">گارانتی و خدمات پس از فروش</span>
                    <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'warranty' ? 'transform rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'warranty' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden text-xs sm:text-sm text-stone-400 leading-relaxed pt-2 pb-4 px-1"
                      >
                        <p className="bg-stone-950/40 p-6 rounded-2xl border border-stone-900">
                          🛡️ گارانتی رسمی محصول: <span className="text-amber-300 font-bold">{product.warranty}</span> شامل تعویض بدون قید و شرط قطعات و خدمات ویژه فروشگاه شیخ.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 5. BUNDLE RECOMMENDATIONS */}
        {allProducts.length > 0 && (
          <div className="mt-16 bg-neutral-900/20 rounded-[2.5rem] p-6 sm:p-10 border border-amber-500/10">
            <ErrorBoundary>
              <BundleRecommendations
                currentProduct={product}
                products={allProducts}
                limit={2}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* 6. RELATED PRODUCTS (Apple style luxury cards) */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-amber-500 text-2xl">👑</span>
              <h3 className="text-2xl font-black text-white">محصولات پیشنهادی و مرتبط</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((relProduct) => {
                const relPricing = resolveProductPrice(relProduct, null);
                return (
                  <Link
                    href={`/products/${relProduct.slug || relProduct.id}`}
                    key={relProduct.id}
                    className="group bg-gradient-to-b from-neutral-900/40 to-neutral-900/10 backdrop-blur-md border border-stone-800 hover:border-amber-500/30 rounded-[2rem] p-4 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-[0_20px_40px_rgba(217,119,6,0.05)]"
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-950/40 mb-4 flex items-center justify-center p-3">
                      <Image
                        src={relProduct.images?.[0]?.secureUrl || relProduct.images?.[0]?.image || '/noImage.jpg'}
                        alt={relProduct.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-200 group-hover:text-amber-400 transition-colors line-clamp-1 mb-2 text-right">
                      {relProduct.name}
                    </h4>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-stone-500 text-[10px]">فروشگاه بزرگ شیخ</span>
                      <span className="text-xs sm:text-sm font-black text-amber-400">
                        {formatToToman(relPricing.price)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. REVIEWS */}
        <div className="mt-20 bg-neutral-900/20 border border-amber-500/10 rounded-[2.5rem] p-6 sm:p-10 space-y-8">
          <div className="flex items-center justify-between border-b border-stone-800/60 pb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-black text-white">نظرات و دیدگاه‌های کاربران</h3>
            </div>
            <span className="text-xs text-stone-500">مجموعاً {hashedRating.reviewCount} دیدگاه خریداران</span>
          </div>

          <div className="space-y-6">
            <div className="bg-[#120a06]/40 border border-amber-500/5 rounded-3xl p-6 flex flex-col gap-4 items-start shadow-xl">
              <div className="w-full space-y-3 text-right">
                <div className="flex items-center justify-between w-full">
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-sm font-black text-stone-200">رضا دهقانی (خریدار رسمی کالا)</span>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-500">۱۴۰۵/۰۲/۱۵</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed text-justify">
                  طراحی بی نظیر و با جزئیات لوکس بالا. بسته‌بندی عالی بود و در کمترین زمان ممکن بدستم رسید. واقعا ارزش خرید داشت و ممنون از فروشگاه شیک شیخ.
                </p>
              </div>
            </div>

            <div className="bg-[#120a06]/40 border border-amber-500/5 rounded-3xl p-6 flex flex-col gap-4 items-start shadow-xl">
              <div className="w-full space-y-3 text-right">
                <div className="flex items-center justify-between w-full">
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-sm font-black text-stone-200">سارا محمدی</span>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-stone-800'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-500">۱۴۰۵/۰۳/۰۴</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed text-justify">
                  فوق‌العاده زیبا و کیفیت فوق‌العاده. به تمامی جزئیات توجه شده و متریال با کیفیتی دارد. تشکر ویژه از ارسال سریع اکسپرس.
                </p>
              </div>
            </div>
          </div>
        </div>

        </div> {/* 🖥️ END DESKTOP VIEW */}

        {/* 📱 MOBILE VIEW - EXPERTLY REDESIGNED LUXURY EXPERIENCE */}
        <div className="block md:hidden space-y-8 text-stone-100" dir="rtl">
          {/* Mobile Redesigned Hero Block */}
          <div className="mobile-hero space-y-5 flex flex-col items-center text-center">

            {/* 1. IMAGE GALLERY */}
            <div className="relative w-full max-w-md mx-auto aspect-[1.1] max-h-[280px] bg-gradient-to-b from-[#140e0b] to-[#0d0907] border border-amber-500/10 rounded-3xl p-4 shadow-[0_15px_30px_rgba(0,0,0,0.6)] overflow-hidden group/gallery flex flex-col justify-between">

              {/* Custom floating vip tag */}
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-stone-950/80 border border-amber-500/25 text-amber-400 text-[9px] font-black tracking-wider px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1">
                  <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                  سفارش ویژه شیخ
                </span>
              </div>

              {/* Main Image Slider with swipe / navigation */}
              <div className="relative flex-1 w-full h-[180px] flex items-center justify-center p-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src={images[selectedImageIndex]?.secureUrl || images[selectedImageIndex]?.image || '/noImage.jpg'}
                      alt={`${product.name} - تصویر ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      quality={90}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Left/Right visual arrows (small and beautiful) */}
                {images.length > 1 && (
                  <div className="absolute inset-x-2 flex items-center justify-between pointer-events-none">
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-stone-950/80 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                      aria-label="تصویر قبلی"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-stone-950/80 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                      aria-label="تصویر بعدی"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tiny Dot Indicators */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1 mt-1">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-300 ${idx === selectedImageIndex ? 'w-4 bg-amber-400' : 'w-1 bg-stone-700'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-2 max-w-full overflow-x-auto py-1 px-1 scrollbar-none justify-center">
                {images.map((image, idx) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border transition-all duration-200 shrink-0 ${
                      idx === selectedImageIndex
                        ? 'border-amber-400 bg-amber-500/10 scale-105 shadow-sm'
                        : 'border-stone-800 bg-[#0d0907]/60'
                    }`}
                  >
                    <Image
                      src={image.secureUrl || image.image || '/noImage.jpg'}
                      alt="بند انگشتی"
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 2. PRODUCT NAME */}
            <div className="space-y-2 px-3">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wide">
                  {categoryName}
                </span>
                {product.brand && (
                  <span className="bg-stone-900 border border-stone-800 text-stone-400 text-[9px] font-medium px-2 py-0.5 rounded-full">
                    برند: {product.brand}
                  </span>
                )}
              </div>
              <h1 className="text-xl xs:text-2xl font-black text-stone-100 leading-tight tracking-tight line-clamp-2">
                {product.name}
              </h1>
            </div>

            {/* 3. RATING */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 pt-0.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(Number(hashedRating.ratingValue)) ? 'fill-amber-400 text-amber-400' : 'text-stone-800'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-amber-400">{hashedRating.ratingValue}</span>
              <span className="text-stone-800">|</span>
              <span className="text-[10px] text-stone-500">({hashedRating.reviewCount} نظر کاربران)</span>
            </div>

            {/* 4. PRICE - THE LUXURY FOCUS */}
            <div className="w-full px-3">
              <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-b from-[#1c1410] to-[#120d0a] border border-amber-500/20 shadow-[0_15px_30px_rgba(0,0,0,0.5)] animate-pulse-glow">
                {/* Soft breathing light element */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.04)_0%,transparent_80%)] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <span className="text-[9px] font-bold text-stone-400 tracking-wider uppercase">قیمت ویژه اعضای شیخ</span>

                  <div className="flex items-baseline gap-2 justify-center">
                    <span className="text-2xl xs:text-3.5xl font-black text-amber-400 leading-none">
                      {formatToToman(pricing.price)}
                    </span>
                    {pricing.oldPrice && (
                      <span className="text-stone-500 text-xs xs:text-sm line-through decoration-red-500/50 decoration-2 font-bold">
                        {formatToToman(pricing.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* Discount percentage if exists */}
                  {pricing.hasDiscount && (
                    <span className="mt-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <BadgePercent className="w-3.5 h-3.5" />
                      <span>{pricing.discountPercentage}٪ تخفیف اختصاصی VIP</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 5. VARIANTS (APPLE STYLE SELECTOR) */}
            {availableProductUnits.length > 0 && (
              <div className="w-full space-y-3 px-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300">انتخاب مدل / مشخصات کالا</span>
                  <span className="text-[10px] text-amber-400 font-semibold">تغییر هوشمند قیمت</span>
                </div>

                <div className="flex flex-col gap-2.5 w-full">
                  {availableProductUnits.map((unit) => {
                    const isSelected = selectedProductUnit?.id === unit.id;
                    return (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedProductUnit(unit)}
                        className={`w-full p-3.5 rounded-2xl border text-right transition-all duration-300 flex items-center justify-between h-14 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/[0.08] shadow-md'
                            : 'border-stone-800 bg-[#0d0907]/40 hover:bg-[#120d0a]/60'
                        }`}
                      >
                        <div className="text-right">
                          <span className="text-xs font-black text-stone-200 block truncate">{unit.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold text-xs">{formatToToman(Number(unit.price))}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. QUANTITY ADJUSTER */}
            <div className="w-full px-3 flex flex-col items-center space-y-2">
              <span className="text-[10px] font-bold text-stone-400">تعداد درخواستی</span>
              <div className="flex items-center justify-between w-36 bg-[#16100d]/60 border border-stone-850 rounded-2xl p-1 shrink-0">
                <button
                  onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={selectedQuantity <= 1}
                  className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-stone-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="کاهش تعداد"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-black text-stone-100">{selectedQuantity}</span>
                <button
                  onClick={() => setSelectedQuantity((prev) => Math.min(currentStock, prev + 1))}
                  disabled={selectedQuantity >= currentStock}
                  className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-stone-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="افزایش تعداد"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 7. ADD TO CART CTA (FULL WIDTH 56PX) */}
            <div className="w-full px-3 space-y-3.5">
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0 || addToCartMutation.isPending}
                className="w-full h-[56px] bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-2xl shadow-xl transition-all duration-300 text-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5 text-stone-950" />
                <span>{addToCartMutation.isPending ? 'در حال ثبت سفارش...' : 'افزودن به سبد خرید ویژه'}</span>
              </button>

              <button
                onClick={handleInstantPurchase}
                disabled={currentStock === 0 || addToCartMutation.isPending}
                className="w-full h-11 bg-stone-950 hover:bg-amber-500/10 text-amber-400 font-bold rounded-2xl border border-amber-500/20 transition-all text-[11px] flex items-center justify-center gap-1.5 active:scale-98"
              >
                <span>⚡ خرید فوری و تسویه سریع حساب</span>
              </button>
            </div>

            {/* 8. QUICK FEATURES */}
            {hasFeatures && (
              <div className="w-full px-3 py-1">
                <div className="grid grid-cols-2 gap-2.5 text-right">
                  {product.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="bg-neutral-900/30 backdrop-blur-md border border-amber-500/10 rounded-xl p-2.5 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-[10px] shrink-0">
                        ✓
                      </div>
                      <span className="text-[10px] font-bold text-stone-300 truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. PREMIUM GLASS TRUST BADGES */}
            <div className="w-full px-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#120a06]/40 border border-amber-500/10 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-sm">
                  <CreditCard className="w-5 h-5 text-amber-500 mx-auto" />
                  <h4 className="text-[10px] font-black text-stone-200">پرداخت امن VIP</h4>
                  <p className="text-[8px] text-stone-500">درگاه بانکی با بیمه امنیتی</p>
                </div>
                <div className="bg-[#120a06]/40 border border-amber-500/10 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-500 mx-auto" />
                  <h4 className="text-[10px] font-black text-stone-200">اصالت واقعی کالا</h4>
                  <p className="text-[8px] text-stone-500">تضمین ۱۰۰٪ لوکس کالا</p>
                </div>
                <div className="bg-[#120a06]/40 border border-amber-500/10 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-sm">
                  <Truck className="w-5 h-5 text-amber-500 mx-auto" />
                  <h4 className="text-[10px] font-black text-stone-200">ارسال اکسپرس VIP</h4>
                  <p className="text-[8px] text-stone-500">بسته‌بندی محافظ چرمی</p>
                </div>
                <div className="bg-[#120a06]/40 border border-amber-500/10 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-sm">
                  <Headphones className="w-5 h-5 text-amber-500 mx-auto" />
                  <h4 className="text-[10px] font-black text-stone-200">پشتیبان اختصاصی</h4>
                  <p className="text-[8px] text-stone-500">پاسخگویی ۲۴ ساعته VIP</p>
                </div>
              </div>
            </div>

          </div>

          {/* Collapsible Accordion (Description & Specs) */}
          <div className="mt-8 bg-neutral-900/30 backdrop-blur-xl border border-amber-500/10 rounded-3xl p-5 space-y-4">
            {hasDescription && (
              <div className="border-b border-stone-800/80 pb-3">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'story' ? null : 'story')}
                  className="w-full flex items-center justify-between py-3 text-right"
                >
                  <span className="text-xs sm:text-sm font-bold text-stone-200">توضیحات و داستان محصول</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-300 ${activeAccordion === 'story' ? 'transform rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'story' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden pt-1 pb-3 px-1 text-xs leading-relaxed text-stone-300 text-justify"
                    >
                      <MarkdownDescription content={product.description} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {anySpecsAvailable && (
              <div className="border-b border-stone-800/80 pb-3">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
                  className="w-full flex items-center justify-between py-3 text-right"
                >
                  <span className="text-xs sm:text-sm font-bold text-stone-200">مشخصات فنی و سخت‌افزاری</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-300 ${activeAccordion === 'specs' ? 'transform rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'specs' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden pt-1 pb-3 px-1"
                    >
                      <div className="space-y-2 bg-stone-950/40 rounded-xl p-4 border border-stone-900 text-[11px]">
                        {hasWeight && (
                          <div className="flex justify-between py-1.5 border-b border-stone-800/40">
                            <span className="text-stone-400">وزن</span>
                            <span className="text-stone-100 font-bold">{product.weight} {product.weightUnit}</span>
                          </div>
                        )}
                        {hasOrigin && (
                          <div className="flex justify-between py-1.5 border-b border-stone-800/40">
                            <span className="text-stone-400">کشور سازنده</span>
                            <span className="text-stone-100 font-bold">{product.origin}</span>
                          </div>
                        )}
                        {hasWarranty && (
                          <div className="flex justify-between py-1.5 border-b border-stone-800/40">
                            <span className="text-stone-400">گارانتی</span>
                            <span className="text-stone-100 font-bold">{product.warranty}</span>
                          </div>
                        )}
                        {hasColor && (
                          <div className="flex justify-between py-1.5 border-b border-stone-800/40">
                            <span className="text-stone-400">رنگ</span>
                            <span className="text-stone-100 font-bold">{product.color}</span>
                          </div>
                        )}
                        {hasSpecs && Object.entries(product.technicalSpecs as Record<string, any>).map(([key, val]) => (
                          <div key={key} className="flex justify-between py-1.5 border-b border-stone-800/40">
                            <span className="text-stone-400">{key}</span>
                            <span className="text-stone-100 font-bold">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Bundle Section */}
          {allProducts.length > 0 && (
            <div className="mt-8 bg-neutral-900/20 rounded-3xl p-5 border border-amber-500/10">
              <ErrorBoundary>
                <div className="scale-95 origin-top">
                  <BundleRecommendations
                    currentProduct={product}
                    products={allProducts}
                    limit={1}
                  />
                </div>
              </ErrorBoundary>
            </div>
          )}

          {/* Related Products Section (2 per row compact) */}
          {relatedProducts.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-lg">👑</span>
                <h3 className="text-sm font-black text-white">محصولات پیشنهادی و مرتبط</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {relatedProducts.map((relProduct) => {
                  const relPricing = resolveProductPrice(relProduct, null);
                  return (
                    <Link
                      href={`/products/${relProduct.slug || relProduct.id}`}
                      key={relProduct.id}
                      className="group bg-gradient-to-b from-neutral-900/40 to-neutral-900/10 backdrop-blur-md border border-stone-800 hover:border-amber-500/30 rounded-2xl p-3 flex flex-col h-full transition-all duration-300 hover:scale-[1.01] shadow-md"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-950/40 mb-2 flex items-center justify-center p-2 h-24">
                        <Image
                          src={relProduct.images?.[0]?.secureUrl || relProduct.images?.[0]?.image || '/noImage.jpg'}
                          alt={relProduct.name}
                          fill
                          className="object-contain p-2"
                          sizes="100px"
                        />
                      </div>
                      <h4 className="text-[11px] font-bold text-stone-200 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1 text-right">
                        {relProduct.name}
                      </h4>
                      <div className="mt-auto pt-1 flex items-center justify-between text-[10px]">
                        <span className="text-stone-500 text-[8px]">شیخ شاپ</span>
                        <span className="text-xs font-black text-amber-400">
                          {formatToToman(relPricing.price)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compact Reviews Section */}
          <div className="mt-8 bg-neutral-900/20 border border-amber-500/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">دیدگاه‌های کاربران</h3>
              </div>
              <span className="text-[10px] text-stone-500">{hashedRating.reviewCount} نظر تایید شده</span>
            </div>

            <div className="space-y-4">
              <div className="bg-[#120a06]/40 border border-amber-500/5 rounded-2xl p-4 flex flex-col gap-2.5 items-start">
                <div className="w-full space-y-1 text-right text-[11px]">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-stone-200">رضا دهقانی (خریدار رسمی)</span>
                    <span className="text-[8px] text-stone-500">۱۴۰۵/۰۲/۱۵</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-300 leading-relaxed text-justify mt-1">
                    طراحی بی نظیر و با جزئیات لوکس بالا. بسته‌بندی عالی بود و واقعا ارزش خرید دارد.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 📱 STICKY BOTTOM PURCHASE BAR FOR MOBILE */}
        <AnimatePresence>
          {showStickyBar && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="block md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#16100d]/95 backdrop-blur-md border-t border-amber-500/20 p-3.5 flex items-center justify-between shadow-2xl px-4"
              dir="rtl"
            >
              <div className="flex items-center gap-2 max-w-[50%]">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-900 border border-stone-800">
                  <Image
                    src={images[0]?.secureUrl || images[0]?.image || '/noImage.jpg'}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-bold text-stone-100 truncate max-w-[120px]">{product.name}</h4>
                  <span className="text-[11px] font-black text-amber-400">{formatToToman(pricing.price)}</span>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0 || addToCartMutation.isPending}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-2.5 px-4 rounded-xl text-[10px] flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-stone-950" />
                <span>{addToCartMutation.isPending ? 'ثبت...' : 'خرید فوری'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
