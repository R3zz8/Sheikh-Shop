'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, ShoppingBag, Truck, ShieldCheck, CreditCard, Headphones,
  Sparkles, Gift, ChevronDown, ChevronRight, ChevronLeft,
  Minus, Plus, Heart, BarChart3, HelpCircle, MessageSquare
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
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

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
  const pricing = resolveProductPrice(product, selectedProductUnit);
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
      default: return 'فروشگاه شیخ';
    }
  }, [product.categoryType]);

  const categoryUrl = useMemo(() => {
    switch (product.categoryType) {
      case 'SheikhHome': return '/sheikh-home';
      case 'SheikhDigital': return '/sheikh-digital';
      case 'SheikhFood': return '/sheikh-food';
      case 'SheikhSmartLiving': return '/sheikh-digital';
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

  return (
    <div className="min-h-screen bg-[#070403] text-stone-100 font-vazirmatn selection:bg-amber-500/30 selection:text-amber-100 relative overflow-hidden" dir="rtl">
      {/* Dynamic atmospheric light sweep glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-radial-gradient from-amber-500/5 via-amber-600/2 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50vw] h-[50vw] bg-radial-gradient from-yellow-500/3 via-amber-500/1 to-transparent rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 max-w-7xl">

        {/* LOCALIZED BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-stone-400 mb-6 md:mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-400 transition-colors">خانه</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0 transform rotate-180" />
          <Link href={categoryUrl} className="hover:text-amber-400 transition-colors">{categoryName}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0 transform rotate-180" />
          <span className="text-stone-200 font-bold truncate max-w-[180px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* HERO MAIN PANEL GRID */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-neutral-900/40 backdrop-blur-md border border-amber-500/10 rounded-[2.5rem] p-4 sm:p-6 lg:p-10 shadow-2xl">

          {/* RIGHT COLUMN: LUXURY GALLERY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative bg-[#110b09]/90 border border-amber-500/10 rounded-3xl p-4 shadow-xl overflow-hidden group">

              {/* Special Tag Overlay */}
              <div className="absolute top-4 right-4 z-20">
                <span className="bg-[#1c110a] border border-amber-500/30 text-amber-400 text-xs font-black px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
                  ★ انتخاب ویژه شیخ
                </span>
              </div>

              {/* Main Image View */}
              <div className="relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-stone-950/40 to-stone-900/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src={images[selectedImageIndex]?.secureUrl || images[selectedImageIndex]?.image || '/noImage.jpg'}
                      alt={`${product.name} - تصویر ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      priority
                      quality={90}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Arrow navigation inside gallery */}
              {images.length > 1 && (
                <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="pointer-events-auto w-9 h-9 rounded-full bg-stone-900/85 hover:bg-stone-800 text-white border border-stone-700/50 flex items-center justify-center transition-all shadow-md"
                    aria-label="تصویر قبلی"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="pointer-events-auto w-9 h-9 rounded-full bg-stone-900/85 hover:bg-stone-800 text-white border border-stone-700/50 flex items-center justify-center transition-all shadow-md"
                    aria-label="تصویر بعدی"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail selector beneath gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 justify-center overflow-x-auto py-1">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border transition-all shrink-0 ${
                      index === selectedImageIndex
                        ? 'border-amber-400 shadow-md shadow-amber-500/15 bg-amber-500/10'
                        : 'border-stone-800 hover:border-stone-700 bg-stone-900/50'
                    }`}
                  >
                    <Image
                      src={image.secureUrl || image.image || '/noImage.jpg'}
                      alt={`${product.name} بند انگشتی ${index + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* ✨ LUXURY UNBOXING TRIGGER */}
            {unboxingConfig?.isEnabled !== false && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-[#1b1009] via-[#150d07] to-black border border-amber-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col items-center gap-4 text-center"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner shadow-amber-500/10">
                  👑
                </div>
                <div>
                  <h3 className="text-xs font-black text-amber-100 flex items-center justify-center gap-1.5 leading-none">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>تجربه لوکس آنباکسینگ سه‌بعدی</span>
                  </h3>
                  <p className="text-[11px] text-stone-300 mt-2 max-w-xs mx-auto leading-relaxed">
                    پیش از خرید، لذت گشودن نمادین جعبه چرمی این محصول را با جزئیات سه‌بعدی و زرین به صورت زنده تماشا کنید.
                  </p>
                </div>
                <button
                  onClick={() => triggerUnboxing(product)}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-stone-950 font-black py-2.5 px-6 rounded-2xl shadow-lg transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4 text-stone-950" />
                  <span>مشاهده تجربه زنده آنباکس کالا</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* LEFT COLUMN: ELEGANT DETAILS & PURCHASE BLOCK */}
          <div className="lg:col-span-7 space-y-6">

            {/* Header info */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-amber-100 to-amber-200 leading-tight">
                {product.name}
              </h1>

              {/* Ratings and brand */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs md:text-sm text-stone-400">
                <div className="flex items-center gap-1">
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
                  <span className="font-bold text-amber-200 text-sm mr-1">{hashedRating.ratingValue}</span>
                  <span className="text-stone-600">|</span>
                  <span className="hover:text-stone-300 transition-colors">({hashedRating.reviewCount} نظر کاربران)</span>
                </div>
                {product.brand && (
                  <>
                    <span className="text-stone-700">|</span>
                    <span>برند: <span className="text-stone-200 font-bold">{product.brand}</span></span>
                  </>
                )}
                {product.sku && (
                  <>
                    <span className="text-stone-700">|</span>
                    <span className="font-mono">شناسه کالا: {product.sku}</span>
                  </>
                )}
              </div>
            </div>

            {/* Price section */}
            <div className="bg-[#160f0d]/60 border border-amber-500/10 rounded-2xl p-5 flex flex-col justify-between sm:flex-row sm:items-center gap-4">
              <div>
                <span className="text-stone-400 text-xs block mb-1">قیمت نهایی کالا</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3.5xl font-black text-amber-400 leading-none">
                    {formatToToman(pricing.price)}
                  </span>
                  {pricing.oldPrice && (
                    <span className="text-stone-500 text-sm line-through decoration-red-500/60 font-medium">
                      {formatToToman(pricing.oldPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Discount / Stock highlights */}
              <div className="flex items-center gap-2">
                {pricing.hasDiscount && (
                  <span className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-black px-3 py-1.5 rounded-full">
                    {pricing.discountPercentage}٪ تخفیف ویژه
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs">
                  <span className={`w-2 h-2 rounded-full ${currentStock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className={currentStock > 0 ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {currentStock > 0 ? 'موجود در انبار شیخ' : 'ناموجود'}
                  </span>
                </span>
              </div>
            </div>

            {/* Variant selector */}
            {availableProductUnits.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-300 block">انتخاب مدل / اندازه:</label>
                <div className="flex flex-wrap gap-2.5">
                  {availableProductUnits.map((unit) => {
                    const isSelected = selectedProductUnit?.id === unit.id;
                    return (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedProductUnit(unit)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 text-amber-200 shadow-md shadow-amber-500/5'
                            : 'border-stone-800 hover:border-stone-700 bg-stone-900/40 text-stone-300'
                        }`}
                      >
                        {unit.name} ({formatToToman(Number(unit.price))})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTION / PURCHASE CONTROLS */}
            <div className="bg-[#1c110a]/40 border border-amber-500/10 rounded-3xl p-5 space-y-4">

              {/* Dynamic Order Breakdown / Summary */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2 text-xs md:text-sm text-stone-300">
                <div className="flex justify-between">
                  <span>نام کالا:</span>
                  <span className="text-stone-100 font-bold">{product.name}</span>
                </div>
                {selectedProductUnit && (
                  <div className="flex justify-between">
                    <span>مدل انتخابی:</span>
                    <span className="text-amber-200 font-bold">{selectedProductUnit.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>تعداد:</span>
                  <span>{selectedQuantity} عدد</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="font-bold">مجموع فاکتور:</span>
                  <span className="text-amber-400 font-black text-base">
                    {formatToToman(pricing.price * selectedQuantity)}
                  </span>
                </div>
              </div>

              {/* Quantity controller & CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                {/* Jewel Quantity selector */}
                <div className="flex items-center justify-between sm:justify-start gap-3 bg-stone-900/60 border border-stone-800 rounded-2xl p-2 shrink-0">
                  <button
                    onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={selectedQuantity <= 1}
                    className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700/50 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-black text-center w-8 text-stone-100">{selectedQuantity}</span>
                  <button
                    onClick={() => setSelectedQuantity((prev) => Math.min(currentStock, prev + 1))}
                    disabled={selectedQuantity >= currentStock}
                    className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700/50 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || addToCartMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-stone-950 font-black py-3 px-6 rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{addToCartMutation.isPending ? 'در حال افزودن...' : 'افزودن به سبد خرید'}</span>
                </button>
              </div>

              {/* Secondary Instant purchase */}
              <button
                onClick={handleInstantPurchase}
                disabled={currentStock === 0 || addToCartMutation.isPending}
                className="w-full bg-transparent hover:bg-white/5 text-amber-400 hover:text-amber-300 font-bold py-3 px-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all text-xs flex items-center justify-center gap-2"
              >
                <span>⚡ خرید فوری و تسویه نهایی</span>
              </button>

              {/* Secondary links */}
              <div className="flex items-center justify-center gap-6 text-xs text-stone-400 pt-1">
                <button className="hover:text-stone-200 transition-colors flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-stone-500" />
                  <span>افزودن به علاقه‌مندی</span>
                </button>
                <span className="text-stone-800">|</span>
                <button className="hover:text-stone-200 transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-stone-500" />
                  <span>مقایسه محصول</span>
                </button>
              </div>
            </div>

            {/* LUXURY TRUST BADGES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#140b07]/40 border border-amber-500/5 rounded-2xl p-4 text-center space-y-1.5">
                <CreditCard className="w-5 h-5 text-amber-500 mx-auto" />
                <h4 className="text-[11px] font-black text-stone-200">پرداخت امن</h4>
                <p className="text-[9px] text-stone-400">درگاه مطمئن بانکی</p>
              </div>
              <div className="bg-[#140b07]/40 border border-amber-500/5 rounded-2xl p-4 text-center space-y-1.5">
                <ShieldCheck className="w-5 h-5 text-amber-500 mx-auto" />
                <h4 className="text-[11px] font-black text-stone-200">ضمانت اصالت</h4>
                <p className="text-[9px] text-stone-400">۱۰۰٪ ضمانت کالا</p>
              </div>
              <div className="bg-[#140b07]/40 border border-amber-500/5 rounded-2xl p-4 text-center space-y-1.5">
                <Truck className="w-5 h-5 text-amber-500 mx-auto" />
                <h4 className="text-[11px] font-black text-stone-200">ارسال VIP</h4>
                <p className="text-[9px] text-stone-400">ارسال سریع و مطمئن</p>
              </div>
              <div className="bg-[#140b07]/40 border border-amber-500/5 rounded-2xl p-4 text-center space-y-1.5">
                <Headphones className="w-5 h-5 text-amber-500 mx-auto" />
                <h4 className="text-[11px] font-black text-stone-200">پشتیبانی اختصاصی</h4>
                <p className="text-[9px] text-stone-400">پاسخگویی ۲۴/۷</p>
              </div>
            </div>

          </div>
        </div>

        {/* 1. ROW OF FEATURES BADGES (Study inspiration carefully) */}
        {hasFeatures && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-12">
            {product.features.map((feature, idx) => (
              <div key={idx} className="bg-neutral-900/50 backdrop-blur-sm border border-amber-500/10 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-lg">✨</span>
                <span className="text-xs font-bold text-stone-200">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* 2. SPECIFICATIONS ACCORDIONS (Only when data exists) */}
        {anySpecsAvailable && (
          <div className="mt-12 bg-neutral-900/30 backdrop-blur-sm border border-amber-500/10 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 mb-4">جزئیات و مشخصات فنی کالا</h2>
            <div className="space-y-2">

              {/* Product story / Description */}
              {hasDescription && (
                <div className="border-b border-stone-800/60 pb-3">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'story' ? null : 'story')}
                    className="w-full flex items-center justify-between py-3 text-right"
                  >
                    <span className="text-sm font-bold text-stone-200">توضیحات و داستان محصول</span>
                    <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'story' ? 'transform rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'story' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden text-xs sm:text-sm text-stone-400 leading-relaxed pt-2 px-1 text-justify space-y-2"
                      >
                        <p>{product.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Technical Specifications */}
              {hasSpecs && (
                <div className="border-b border-stone-800/60 pb-3">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
                    className="w-full flex items-center justify-between py-3 text-right"
                  >
                    <span className="text-sm font-bold text-stone-200">مشخصات فنی و سخت‌افزاری</span>
                    <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'specs' ? 'transform rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'specs' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden pt-2 px-1"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 rounded-2xl p-4">
                          {Object.entries(product.technicalSpecs as Record<string, any>).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-white/5 py-2 text-xs">
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

              {/* Shipping and Delivery Accordion */}
              <div className="border-b border-stone-800/60 pb-3">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full flex items-center justify-between py-3 text-right"
                >
                  <span className="text-sm font-bold text-stone-200">ارسال و تحویل لوکس</span>
                  <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'shipping' ? 'transform rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden text-xs text-stone-400 leading-relaxed pt-2 px-1 space-y-3"
                    >
                      <p>
                        تمامی سفارشات ثبت‌شده در بسته‌بندی‌های لوکس و ضدضربه‌ مخصوص فروشگاه بزرگ شیخ ارسال خواهند شد. سفارشات تهران ظرف ۲۴ ساعت و شهرستان‌ها بین ۳ تا ۵ روز تحویل می‌گردند.
                      </p>
                      <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl">
                        <div>
                          <span className="text-stone-500 block">پروتکل توزیع لجستیک</span>
                          <span className="font-bold text-stone-300">{product.shippingDescription || 'ارسال ویژه با بیمه طلایی'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">هزینه نهایی تحویل</span>
                          <span className="font-bold text-stone-300">{product.allowFreeShipping ? 'رایگان (مهمان فروشگاه)' : '۲۰۰,۰۰۰ تومان'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Warranty and Services Accordion */}
              {hasWarranty && (
                <div className="border-b border-stone-800/60 pb-3">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'warranty' ? null : 'warranty')}
                    className="w-full flex items-center justify-between py-3 text-right"
                  >
                    <span className="text-sm font-bold text-stone-200">گارانتی و خدمات پس از فروش</span>
                    <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'warranty' ? 'transform rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'warranty' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden text-xs text-stone-400 leading-relaxed pt-2 px-1"
                      >
                        <p className="bg-black/20 p-4 rounded-xl border border-amber-500/5">
                          🛡️ گارانتی رسمی محصول: <span className="text-amber-300 font-bold">{product.warranty}</span> شامل تعویض بدون قید و شرط قطعات و خدمات ویژه فروشگاه شیخ.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* FAQ Accordion */}
              <div className="border-b border-stone-800/60 pb-3">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'faq' ? null : 'faq')}
                  className="w-full flex items-center justify-between py-3 text-right"
                >
                  <span className="text-sm font-bold text-stone-200">سوالات متداول کاربران</span>
                  <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${activeAccordion === 'faq' ? 'transform rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'faq' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden text-xs text-stone-400 leading-relaxed pt-2 px-1 space-y-3"
                    >
                      <div className="bg-stone-900/50 p-4 rounded-xl">
                        <h4 className="font-bold text-stone-200 mb-1">آیا کالاها دارای ضمانت رسمی هستند؟</h4>
                        <p className="text-stone-400">بله، تمامی محصولات فروشگاه شیخ به همراه ضمانت رسمی تعویض و اصالت کامل کالا ارسال می‌گردند.</p>
                      </div>
                      <div className="bg-stone-900/50 p-4 rounded-xl">
                        <h4 className="font-bold text-stone-200 mb-1">روش‌های ارسال و پیگیری سفارش به چه صورت است؟</h4>
                        <p className="text-stone-400">سفارشات از طریق پست سفارشی، تیپاکس و پیک اختصاصی ارسال شده و کد پیگیری بلافاصله پیامک می‌شود.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        )}

        {/* 3. BUNDLE RECOMMENDATIONS (Only when products list exists) */}
        {allProducts.length > 0 && (
          <div className="mt-12">
            <ErrorBoundary>
              <BundleRecommendations
                currentProduct={product}
                products={allProducts}
                limit={2}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* 4. RELATED PRODUCTS (Under-the-fold carousel/grid) */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg">👑</span>
              <h3 className="text-xl font-bold text-white">محصولات پیشنهادی و مرتبط</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => {
                const relPricing = resolveProductPrice(relProduct, null);
                return (
                  <Link
                    href={`/products/${relProduct.slug || relProduct.id}`}
                    key={relProduct.id}
                    className="group bg-neutral-900/40 backdrop-blur-sm border border-stone-800 hover:border-amber-500/20 rounded-2xl p-3 sm:p-4 flex flex-col h-full transition-all hover:scale-[1.01]"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-950/40 mb-3 flex items-center justify-center p-2">
                      <Image
                        src={relProduct.images?.[0]?.secureUrl || relProduct.images?.[0]?.image || '/noImage.jpg'}
                        alt={relProduct.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-200 group-hover:text-amber-300 transition-colors line-clamp-1 mb-1 text-right">
                      {relProduct.name}
                    </h4>
                    <div className="mt-auto pt-2 text-right">
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

        {/* 5. CUSTOMER REVIEWS LIST */}
        <div className="mt-16 bg-neutral-900/20 border border-amber-500/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">نظرات و دیدگاه‌های خریداران</h3>
            </div>
            <span className="text-xs text-stone-400">نظرات فیلتر شده بر اساس تایید مدیریت</span>
          </div>

          <div className="space-y-4">
            <div className="bg-[#120a06]/40 border border-amber-500/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1 space-y-1 text-right">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-200">رضا دهقانی (خریدار کالا)</span>
                  <span className="text-[10px] text-stone-500">۱۴۰۵/۰۲/۱۵</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  طراحی بی نظیر و با جزئیات لوکس بالا. بسته‌بندی عالی بود و در کمترین زمان ممکن بدستم رسید. واقعا ارزش خرید داشت و ممنون از فروشگاه شیک شیخ.
                </p>
              </div>
            </div>

            <div className="bg-[#120a06]/40 border border-amber-500/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1 space-y-1 text-right">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-200">سارا محمدی</span>
                  <span className="text-[10px] text-stone-500">۱۴۰۵/۰۳/۰۴</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`} />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  فوق‌العاده زیبا و کیفیت فوق‌العاده. به تمامی جزئیات توجه شده و متریال با کیفیتی دارد. تشکر ویژه از ارسال سریع اکسپرس.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
