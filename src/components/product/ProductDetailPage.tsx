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
import ReviewSubmissionCard from './ReviewSubmissionCard';
import DynamicReviewSection from './DynamicReviewSection';
import ImageGallery from './ImageGallery';
import LuxuryFeatureChip from './LuxuryFeatureChip';

// Imports from LuxuryEffects
import {
  AnimatedBorder,
  AmbientGlow,
  GlassReflection,
  HoverGlow,
  LuxuryCard,
  LuxuryButton,
  MotionWrapper
} from '@/components/ui/LuxuryEffects';

interface ProductDetailPageProps {
  product: ProductsWithImages;
  allProducts?: ProductsWithImages[];
  ratingValue?: number;
  reviewCount?: number;
}

interface ImageObj {
  id: string;
  image: string | null;
  secureUrl?: string | null;
}

export default function ProductDetailPage({
  product,
  allProducts = [],
  ratingValue,
  reviewCount = 0,
}: ProductDetailPageProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { triggerUnboxing, config: unboxingConfig } = useLuxuryUnboxing();
  const { addToCartMutation } = useCart();

  // Dynamic specs accordion states
  const [activeAccordion, setActiveAccordion] = useState<string | null>('story');

  // Favorite & Compare & Share interaction states
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  // Sticky Buy Bar State for Mobile
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Review refresh trigger state
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const handleReviewChange = () => setReviewRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 550) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEscapeListener ? null : window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse variations / product units
  const availableProductUnits = useMemo(() => {
    const units = product.units?.filter((unit: ProductUnit) => unit.isActive) || [];
    return units.sort((a: ProductUnit, b: ProductUnit) => Number(a.price) - Number(b.price));
  }, [product.units]);

  const [selectedProductUnit, setSelectedProductUnit] = useState<ProductUnit | null>(
    availableProductUnits.length > 0 ? (availableProductUnits[0] || null) : null
  );

  // Multi-option state
  const hasOptionsAndVariants = Array.isArray((product as any).productAttributes) && (product as any).productAttributes.length > 0;
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Auto-initialize selectedOptions on mount
  useEffect(() => {
    if (hasOptionsAndVariants) {
      const initial: Record<string, string> = {};
      (product as any).productAttributes.forEach((attr: any) => {
        if (attr.values && attr.values.length > 0) {
          initial[attr.id] = attr.values[0].id;
        }
      });
      setSelectedOptions(initial);
    }
  }, [product, hasOptionsAndVariants]);

  // Resolve matching ProductUnit based on selected combinations
  useEffect(() => {
    if (hasOptionsAndVariants && Object.keys(selectedOptions).length > 0) {
      const matchingUnit = (product.units || []).find((unit: any) => {
        if (!unit.values || unit.values.length === 0) return false;

        // Every selected option must match the unit's attribute values
        return Object.entries(selectedOptions).every(([attrId, valId]) => {
          return unit.values.some((v: any) => v.attributeValueId === valId);
        });
      });

      if (matchingUnit) {
        setSelectedProductUnit(matchingUnit);
      } else {
        setSelectedProductUnit(null);
      }
    } else if (availableProductUnits.length > 0 && !selectedProductUnit) {
      setSelectedProductUnit(availableProductUnits[0] || null);
    }
  }, [selectedOptions, product.units, hasOptionsAndVariants, availableProductUnits, selectedProductUnit]);

  // Check if option value is available in combination
  const isOptionValueAvailable = (attrId: string, valId: string) => {
    if ((product as any).productAttributes.length <= 1) return true;

    const hypotheticalSelection = { ...selectedOptions, [attrId]: valId };

    return (product.units || []).some((unit: any) => {
      if (!unit.isActive) return false;
      return Object.entries(hypotheticalSelection).every(([aId, vId]) => {
        return unit.values?.some((v: any) => v.attributeValueId === vId);
      });
    });
  };

  // Pricing calculation
  const pricing = resolveProductPrice(product, selectedProductUnit, selectedQuantity);
  const currentStock = selectedProductUnit ? selectedProductUnit.stock : product.quantity;

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
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] via-[#F3EAD8] via-[#EADBC8] to-[#2A1A12] text-[#2C1A11] font-vazirmatn selection:bg-amber-500/30 selection:text-amber-950 relative overflow-hidden pb-24" dir="rtl">

      {/* 🌌 ATMOSPHERIC LUXURY LIGHT GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-25%] right-[-15%] w-[80vw] h-[80vw] bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.05)_0%,transparent_70%)] rounded-full blur-[130px] opacity-80" />
        <div className="absolute top-[40%] left-[-20%] w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_75%)] rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.02)_0%,transparent_80%)] rounded-full blur-[140px] opacity-50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-7xl">

        {/* 🖥️ DESKTOP VIEW - UPGRADED TO MAXIMUM LUXURY */}
        <div className="hidden md:block">

          {/* 🗺️ BREADCRUMBS with beautiful Apple-like minimal design */}
          <nav className="flex items-center gap-1.5 text-xs text-[#5D4037] mb-8 md:mb-10 bg-[#FAF6EE]/80 backdrop-blur-sm py-2.5 px-5 rounded-2xl border border-amber-500/15 inline-flex shadow-sm" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700 transition-colors">خانه</Link>
            <ChevronRight className="w-3 h-3 text-amber-800 shrink-0 transform rotate-180" />
            <Link href={categoryUrl} className="hover:text-amber-700 transition-colors">{categoryName}</Link>
            <ChevronRight className="w-3 h-3 text-amber-800 shrink-0 transform rotate-180" />
            <span className="text-[#2C1A11] font-black truncate max-w-[160px] sm:max-w-none">{product.name}</span>
          </nav>

          {/* 🌟 HERO MAIN PRODUCT CARD - LUXURY GLASS PANEL */}
          <HoverGlow>
            <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-14 items-start bg-[#2A1A12]/85 backdrop-blur-xl border border-amber-500/10 rounded-[3.5rem] p-5 sm:p-8 lg:p-14 shadow-[0_30px_70px_-15px_rgba(42,26,18,0.4)] overflow-hidden">

              {/* Animated Gold border flow */}
              <AnimatedBorder color="gold" borderWidth={1.5} />

              {/* Gold Ambient light behind main card */}
              <AmbientGlow color="gold" opacity={0.15} blur={160} className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] z-0" />

              {/* Subtle glass reflection sweeping diagonal line */}
              <GlassReflection duration={14} />

              {/* 1. HERO GALLERY (RIGHT COLUMN - occupies 6 columns) */}
              <div className="lg:col-span-6 space-y-8 w-full relative z-10">
                <ImageGallery images={images} productName={product.name} layoutIdPrefix="desktop" />

                {/* ✨ LUXURY UNBOXING TRIGGER - Elegant gold box */}
                {unboxingConfig?.isEnabled !== false && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="bg-gradient-to-b from-[#3E2723] to-[#2A1A12] border border-amber-500/25 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 text-right group"
                  >
                    {/* Tiny emerald / gold glow */}
                    <AmbientGlow color="gold" opacity={0.1} blur={50} className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] z-0" />

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/35 flex items-center justify-center text-3xl shadow-lg shrink-0 z-10">
                      📦
                    </div>

                    <div className="flex-1 space-y-1 z-10">
                      <h3 className="text-sm font-black text-amber-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>تجربه لوکس آنباکسینگ سه‌بعدی</span>
                      </h3>
                      <p className="text-xs text-stone-300 leading-relaxed max-w-md">
                        پیش از خرید، لذت گشودن نمادین جعبه چرمی این محصول را با جزئیات سه‌بعدی و زرین به صورت زنده تماشا کنید.
                      </p>
                    </div>

                    <LuxuryButton
                      onClick={() => triggerUnboxing(product)}
                      variant="gold"
                      className="w-full sm:w-auto py-3 px-6 text-xs shrink-0 z-10"
                    >
                      <Gift className="w-4 h-4 text-stone-950" />
                      <span>آنباکس سه‌بعدی کالا</span>
                    </LuxuryButton>
                  </motion.div>
                )}
              </div>

              {/* 2. PRODUCT DETAILS & BUYING SYSTEM (LEFT COLUMN - occupies 6 columns) */}
              <div className="lg:col-span-6 space-y-8 w-full relative z-10">

                {/* A. PRODUCT TITLE & INFO BLOCK - UPGRADED TO LUXURY FLOATING CONTAINER */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#FAF6EE]/50 backdrop-blur-md border border-amber-500/20 p-6 md:p-8 shadow-[0_20px_45px_-10px_rgba(217,119,6,0.08)] transition-all duration-300 hover:border-amber-500/35 hover:shadow-[0_25px_50px_-8px_rgba(217,119,6,0.12)]">
                  {/* Soft amber ambient glow inside */}
                  <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.03)_0%,transparent_75%)] pointer-events-none rounded-full" />

                  {/* Subtle glass reflection sweeping line */}
                  <GlassReflection duration={14} />

                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-amber-500/10 border border-amber-500/25 text-amber-850 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {categoryName}
                      </span>
                      {product.brand && (
                        <span className="bg-[#FAF6EE]/80 border border-[#5D4037]/25 text-[#5D4037] text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                          برند: {product.brand}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2C1A11] leading-tight tracking-tight">
                      {product.name}
                    </h1>

                    {/* Sub-header ratings, stock, status info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5D4037] pt-1">
                      <div className="flex items-center gap-1.5">
                        {reviewCount > 0 && ratingValue !== undefined ? (
                          <>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.round(ratingValue) ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-extrabold text-amber-700 text-sm mr-1">{ratingValue.toFixed(1)}</span>
                            <span className="text-stone-300">|</span>
                            <span className="hover:text-amber-800 font-medium transition-colors">({reviewCount} دیدگاه تایید شده)</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 text-stone-300"
                                />
                              ))}
                            </div>
                            <span className="font-extrabold text-[#5D4037] text-sm mr-1">بدون امتیاز</span>
                            <span className="text-stone-300">|</span>
                            <span className="text-stone-500 font-medium transition-colors">(۰ دیدگاه تایید شده)</span>
                          </>
                        )}
                      </div>

                      {product.sku && (
                        <>
                          <span className="text-stone-300">|</span>
                          <span className="font-mono text-[#5D4037] font-medium">شناسه: {product.sku}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* B. PREMIUM PRICE VIEW - THE STRONGEST VISUAL ELEMENT */}
                <div className="relative group bg-[#1C120C] border border-amber-500/20 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_15px_30px_rgba(42,26,18,0.2)]">

                  {/* Moving neon amber border pulse */}
                  <AnimatedBorder color="amber" borderWidth={1} />

                  {/* Soft moving amber light reflection around price box */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.05] to-transparent pointer-events-none animate-pulse-glow" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1.5">
                      <span className="text-[10px] sm:text-xs font-bold text-stone-300 block uppercase tracking-wider">قیمت خرید ویژه</span>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-3xl sm:text-4.5xl font-black text-amber-400 tracking-tight leading-none text-glow">
                          {formatToToman(pricing.price)}
                        </span>
                        {pricing.oldPrice && (
                          <span className="text-stone-400 text-sm sm:text-base line-through decoration-red-500/50 decoration-2 font-bold">
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

                {/* C. LUXURIOUS ATTRIBUTES & VARIANTS SELECTORS */}
                {hasOptionsAndVariants ? (
                  <div className="space-y-6">
                    {(product as any).productAttributes.map((attr: any) => (
                      <div key={attr.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-[#5D4037] uppercase tracking-wider">{attr.displayName}</label>
                          <span className="text-[10px] text-amber-700/80 font-bold">انتخاب گزینه</span>
                        </div>

                        {attr.type === 'COLOR' ? (
                          // Render Visual Swatches for Color Attributes
                          <div className="flex items-center gap-3">
                            {(attr.values || []).map((val: any) => {
                              const isSelected = selectedOptions[attr.id] === val.id;
                              const isAvailable = isOptionValueAvailable(attr.id, val.id);
                              return (
                                <button
                                  key={val.id}
                                  onClick={() => isAvailable && setSelectedOptions({ ...selectedOptions, [attr.id]: val.id })}
                                  disabled={!isAvailable}
                                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isSelected
                                      ? 'scale-110 shadow-lg ring-2 ring-amber-500 ring-offset-2 ring-offset-[#FAF7F2]'
                                      : 'hover:scale-105 border border-[#5D4037]/20 bg-[#FAF6EE]'
                                  } ${!isAvailable ? 'opacity-25 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                                  title={val.value}
                                >
                                  <span
                                    className="w-8 h-8 rounded-full border border-[#2C1A11]/15 inline-block shadow-inner"
                                    style={{ backgroundColor: val.hex || '#000000' }}
                                  />
                                  {isSelected && (
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-600 border border-[#FAF7F2] flex items-center justify-center">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          // Render visionOS-inspired Glassmorphic Chips for non-color attributes
                          <div className="flex flex-wrap gap-2.5">
                            {(attr.values || []).map((val: any) => {
                              const isSelected = selectedOptions[attr.id] === val.id;
                              const isAvailable = isOptionValueAvailable(attr.id, val.id);
                              return (
                                <button
                                  key={val.id}
                                  onClick={() => isAvailable && setSelectedOptions({ ...selectedOptions, [attr.id]: val.id })}
                                  disabled={!isAvailable}
                                  className={`relative px-4 py-2.5 rounded-xl border text-xs font-black text-right transition-all duration-300 flex items-center gap-1.5 h-10 overflow-hidden ${
                                    isSelected
                                      ? 'border-amber-500 bg-amber-500/[0.08] shadow-md scale-102 text-[#2C1A11]'
                                      : 'border-[#5D4037]/15 hover:border-amber-500/25 bg-[#FAF6EE]/80 hover:bg-[#FAF6EE] text-[#5D4037]'
                                  } ${!isAvailable ? 'opacity-20 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                                >
                                  {isSelected && <AnimatedBorder color="amber" borderWidth={1} />}
                                  <span>{val.value} {val.unit || ''}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 relative z-10" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Fallback: Legacy flat-units list selector
                  availableProductUnits.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">انتخاب ظرفیت / مشخصات کالا</label>
                        <span className="text-[10px] text-amber-700 font-bold">مشاهده تغییرات قیمت</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {availableProductUnits.map((unit) => {
                          const isSelected = selectedProductUnit?.id === unit.id;
                          return (
                            <button
                              key={unit.id}
                              onClick={() => setSelectedProductUnit(unit)}
                              className={`relative p-4 rounded-2xl border text-right transition-all duration-300 flex flex-col justify-between h-20 overflow-hidden ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-500/[0.08] shadow-xl scale-102'
                                  : 'border-[#5D4037]/25 hover:border-amber-500/35 bg-[#FAF6EE]/90 hover:bg-[#FAF6EE]'
                              }`}
                            >
                              {isSelected && <AnimatedBorder color="amber" borderWidth={1} />}
                              <span className="text-xs font-black text-[#2C1A11] block truncate relative z-10">{unit.name}</span>
                              <div className="flex items-center justify-between w-full mt-1 relative z-10">
                                <span className="text-amber-700 font-black text-sm">{formatToToman(Number(unit.price))}</span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                {/* D. LUXURY CTA / ORDER ACTION BLOCK */}
                <div className="relative bg-[#2A1A12] border border-amber-500/20 rounded-3xl p-6 space-y-6 shadow-2xl overflow-hidden">

                  {/* Neon Golden border & subtle ambient reflection */}
                  <AnimatedBorder color="gold" borderWidth={1} />
                  <AmbientGlow color="gold" opacity={0.1} blur={90} className="absolute -bottom-[20%] -left-[20%] w-[120%] h-[120%] z-0" />

                  {/* Factor Breakdown */}
                  <div className="bg-[#1C120C]/95 border border-amber-500/10 rounded-2xl p-4.5 space-y-3.5 text-xs sm:text-sm text-stone-300 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-300">کالای انتخابی:</span>
                      <span className="text-stone-100 font-bold">{product.name}</span>
                    </div>
                    {selectedProductUnit && (
                      <div className="flex justify-between items-center">
                        <span className="text-stone-300">مدل انتخابی:</span>
                        <span className="text-amber-400 font-black">{selectedProductUnit.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-stone-300">تعداد درخواستی:</span>
                      <span className="text-stone-100 font-bold">{selectedQuantity} عدد</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-amber-500/15 pt-3.5">
                      <span className="font-bold text-stone-200">مبلغ کل فاکتور:</span>
                      <span className="text-amber-400 font-black text-lg sm:text-xl tracking-tight">
                        {formatToToman(pricing.price)}
                      </span>
                    </div>
                  </div>

                  {/* CTAs upgraded to Luxury design */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-4 relative z-10">

                    {/* Quantity adjuster */}
                    <div className="flex items-center justify-between sm:justify-start gap-4 bg-[#1C120C] border border-[#5D4037]/30 rounded-2xl p-2 shrink-0">
                      <button
                        onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                        disabled={selectedQuantity <= 1}
                        className="w-11 h-11 rounded-xl bg-[#2A1A12] hover:bg-[#3E2723] border border-amber-500/15 flex items-center justify-center text-stone-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        aria-label="کاهش تعداد"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-black text-center w-10 text-stone-100">{selectedQuantity}</span>
                      <button
                        onClick={() => setSelectedQuantity((prev) => Math.min(currentStock, prev + 1))}
                        disabled={selectedQuantity >= currentStock}
                        className="w-11 h-11 rounded-xl bg-[#2A1A12] hover:bg-[#3E2723] border border-amber-500/15 flex items-center justify-center text-stone-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        aria-label="افزایش تعداد"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Primary Add To Cart with luxurious gradient animation */}
                    <LuxuryButton
                      onClick={handleAddToCart}
                      disabled={currentStock === 0 || addToCartMutation.isPending}
                      isLoading={addToCartMutation.isPending}
                      variant="gold"
                      className="flex-1 py-4 text-sm"
                    >
                      <ShoppingBag className="w-5 h-5 text-stone-950" />
                      <span>افزودن به سبد خرید</span>
                    </LuxuryButton>
                  </div>

                  {/* Instant Purchase upgraded to Luxury button */}
                  <LuxuryButton
                    onClick={handleInstantPurchase}
                    disabled={currentStock === 0 || addToCartMutation.isPending}
                    variant="dark"
                    className="w-full py-3.5 text-xs relative z-10"
                  >
                    <span>⚡ خرید فوری و تسویه سریع حساب</span>
                  </LuxuryButton>

                  {/* Heart, Compare, Share actions */}
                  <div className="flex items-center justify-center gap-8 text-xs text-stone-300 border-t border-amber-500/15 pt-4 relative z-10">
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

                    <span className="text-amber-500/20">|</span>

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

                    <span className="text-amber-500/20">|</span>

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
                  <div className="bg-[#FAF6EE]/90 border border-amber-500/20 rounded-2xl p-4 text-center space-y-2.5 backdrop-blur-sm shadow-md relative overflow-hidden group">
                    <GlassReflection duration={11} />
                    <CreditCard className="w-6 h-6 text-amber-700 mx-auto transition-transform group-hover:scale-105" />
                    <h4 className="text-[11px] font-black text-[#2C1A11]">پرداخت امن VIP</h4>
                    <p className="text-[9px] text-[#5D4037] leading-normal font-bold">درگاه بانکی با بیمه امنیتی</p>
                  </div>
                  <div className="bg-[#FAF6EE]/90 border border-amber-500/20 rounded-2xl p-4 text-center space-y-2.5 backdrop-blur-sm shadow-md relative overflow-hidden group">
                    <GlassReflection duration={12} />
                    <ShieldCheck className="w-6 h-6 text-amber-700 mx-auto transition-transform group-hover:scale-105" />
                    <h4 className="text-[11px] font-black text-[#2C1A11]">اصالت واقعی کالا</h4>
                    <p className="text-[9px] text-[#5D4037] leading-normal font-bold">تضمین ۱۰۰٪ لوکس کالا</p>
                  </div>
                  <div className="bg-[#FAF6EE]/90 border border-amber-500/20 rounded-2xl p-4 text-center space-y-2.5 backdrop-blur-sm shadow-md relative overflow-hidden group">
                    <GlassReflection duration={10} />
                    <Truck className="w-6 h-6 text-amber-700 mx-auto transition-transform group-hover:scale-105" />
                    <h4 className="text-[11px] font-black text-[#2C1A11]">ارسال اکسپرس VIP</h4>
                    <p className="text-[9px] text-[#5D4037] leading-normal font-bold">بسته‌بندی محافظ چرمی</p>
                  </div>
                  <div className="bg-[#FAF6EE]/90 border border-amber-500/20 rounded-2xl p-4 text-center space-y-2.5 backdrop-blur-sm shadow-md relative overflow-hidden group">
                    <GlassReflection duration={13} />
                    <Headphones className="w-6 h-6 text-amber-700 mx-auto transition-transform group-hover:scale-105" />
                    <h4 className="text-[11px] font-black text-[#2C1A11]">پشتیبان اختصاصی</h4>
                    <p className="text-[9px] text-[#5D4037] leading-normal font-bold">پاسخگویی ۲۴ ساعته VIP</p>
                  </div>
                </div>

              </div>
            </div>
          </HoverGlow>

          {/* 3. ROW OF DYNAMIC FEATURES BADGES */}
          {hasFeatures && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-16">
              {product.features.map((feature, idx) => (
                <LuxuryFeatureChip key={idx} feature={feature} />
              ))}
            </div>
          )}

          {/* 4. SPECIFICATIONS & SAFE DESCRIPTION ACCORDION */}
          {anySpecsAvailable && (
            <HoverGlow>
              <div className="relative mt-16 bg-[#2A1A12] border border-amber-500/15 rounded-[2.5rem] p-6 sm:p-10 space-y-6 shadow-2xl overflow-hidden">

                {/* Neon soft amber pulse border and ambient light */}
                <AnimatedBorder color="amber" borderWidth={1.5} />
                <AmbientGlow color="amber" opacity={0.14} blur={150} className="absolute -top-[15%] -left-[15%] w-[130%] h-[130%] z-0" />
                <GlassReflection duration={15} />

                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 mb-6 relative z-10">جزئیات و مشخصات فنی کالا</h2>
                <div className="space-y-4 relative z-10">

                  {/* Product description / Story with Custom Animated Border & Glow */}
                  {hasDescription && (
                    <div className="border-b border-amber-500/15 pb-4">
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
                            <div className="relative bg-[#1C120C]/90 rounded-2xl p-6 border border-amber-500/10 overflow-hidden">
                              {/* Soft amber border & subtle glow around description card */}
                              <AnimatedBorder color="amber" borderWidth={1} />
                              <AmbientGlow color="amber" opacity={0.08} blur={90} className="absolute -inset-10 z-0" />
                              <GlassReflection duration={12} />

                              <div className="relative z-10">
                                <MarkdownDescription content={product.description} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Technical Specifications */}
                  {hasSpecs && (
                    <div className="border-b border-amber-500/15 pb-4">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1C120C]/90 rounded-2xl p-6 border border-amber-500/10 relative overflow-hidden">
                              <GlassReflection duration={13} />
                              {Object.entries(product.technicalSpecs as Record<string, any>).map(([key, val]) => (
                                <div key={key} className="flex justify-between border-b border-amber-500/10 py-3 text-xs sm:text-sm relative z-10">
                                  <span className="text-stone-300 font-medium">{key}</span>
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
                  <div className="border-b border-amber-500/15 pb-4">
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
                          className="overflow-hidden text-xs sm:text-sm text-stone-300 leading-relaxed pt-2 pb-4 px-1 space-y-4"
                        >
                          <p>
                            تمامی سفارشات ثبت‌شده در بسته‌بندی‌های لوکس و ضدضربه‌ مخصوص فروشگاه بزرگ شیخ ارسال خواهند شد. سفارشات تهران ظرف ۲۴ ساعت و شهرستان‌ها بین ۳ تا ۵ روز تحویل می‌گردند.
                          </p>
                          <div className="grid grid-cols-2 gap-6 bg-[#1C120C]/90 p-6 rounded-2xl border border-amber-500/10 relative overflow-hidden">
                            <GlassReflection duration={12} />
                            <div className="relative z-10">
                              <span className="text-stone-400 block mb-1 text-[11px] sm:text-xs">پروتکل توزیع لجستیک</span>
                              <span className="font-bold text-stone-200">{product.shippingDescription || 'ارسال ویژه با بیمه طلایی'}</span>
                            </div>
                            <div className="relative z-10">
                              <span className="text-stone-400 block mb-1 text-[11px] sm:text-xs">هزینه نهایی تحویل</span>
                              <span className="font-bold text-amber-400">{product.allowFreeShipping ? 'رایگان (مهمان فروشگاه)' : '۲۰۰,۰۰۰ تومان'}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Warranty details */}
                  {hasWarranty && (
                    <div className="border-b border-amber-500/15 pb-4">
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
                            className="overflow-hidden text-xs sm:text-sm text-stone-300 leading-relaxed pt-2 pb-4 px-1"
                          >
                            <p className="bg-[#1C120C]/90 p-6 rounded-2xl border border-amber-500/10 relative overflow-hidden">
                              <GlassReflection duration={11} />
                              🛡️ گارانتی رسمی محصول: <span className="text-amber-300 font-bold relative z-10">{product.warranty}</span> شامل تعویض بدون قید و شرط قطعات و خدمات ویژه فروشگاه شیخ.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                </div>
              </div>
            </HoverGlow>
          )}

          {/* 5. BUNDLE RECOMMENDATIONS */}
          {allProducts.length > 0 && (
            <div className="mt-16">
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
                <h3 className="text-2xl font-black text-[#2C1A11]">محصولات پیشنهادی و مرتبط</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                {relatedProducts.map((relProduct) => {
                  const relPricing = resolveProductPrice(relProduct, null);
                  return (
                    <Link
                      href={`/products/${relProduct.slug || relProduct.id}`}
                      key={relProduct.id}
                      className="group bg-[#2A1A12] border border-amber-500/15 rounded-[2rem] p-4 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-[0_20px_40px_rgba(217,119,6,0.08)] relative overflow-hidden"
                    >
                      {/* Orange luxury border sweeps & ambient glows on hover */}
                      <AnimatedBorder color="orange" borderWidth={1.2} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <AmbientGlow color="orange" opacity={0.12} blur={80} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                      <GlassReflection duration={11} />

                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#1C120C]/90 mb-4 flex items-center justify-center p-3 border border-amber-500/10 z-10">
                        <Image
                          src={relProduct.images?.[0]?.secureUrl || relProduct.images?.[0]?.image || '/noImage.jpg'}
                          alt={relProduct.name}
                          fill
                          className="object-contain p-4 transition-transform duration-700 ease-[0.16, 1, 0.3, 1] group-hover:scale-106"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-200 group-hover:text-amber-400 transition-colors duration-300 line-clamp-1 mb-2 text-right z-10">
                        {relProduct.name}
                      </h4>
                      <div className="mt-auto pt-2 flex items-center justify-between z-10">
                        <span className="text-stone-400 text-[10px]">فروشگاه بزرگ شیخ</span>
                        <span className="text-xs sm:text-sm font-black text-amber-400 group-hover:text-amber-300 transition-colors duration-300 text-glow">
                          {formatToToman(relPricing.price)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review form gets its own card styling with glowing borders */}
          <div className="mt-20 relative overflow-hidden rounded-[2.5rem]">
            <ReviewSubmissionCard
              productId={product.id}
              productName={product.name}
              onReviewChange={handleReviewChange}
            />
          </div>

          {/* 7. REVIEWS */}
          <HoverGlow>
            <div className="relative mt-10 bg-[#2A1A12]/95 border border-amber-500/15 rounded-[2.5rem] p-6 sm:p-10 space-y-8 shadow-2xl overflow-hidden">

              {/* Blue-Gold premium border, glow, reflection sweep */}
              <AnimatedBorder color="blue" borderWidth={1.5} />
              <AmbientGlow color="blue" opacity={0.15} blur={160} className="absolute -top-[15%] -left-[15%] w-[130%] h-[130%] z-0" />
              <GlassReflection duration={14} />

              <div className="flex items-center justify-between border-[#5D4037]/35 pb-6 border-b relative z-10">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-black text-white">نظرات و دیدگاه‌های کاربران</h3>
                </div>
              </div>

              <div className="relative z-10">
                <DynamicReviewSection
                  productId={product.id}
                  refreshTrigger={reviewRefreshTrigger}
                />
              </div>
            </div>
          </HoverGlow>

        </div> {/* 🖥️ END DESKTOP VIEW */}

        {/* 📱 MOBILE VIEW - EXPERTLY REDESIGNED LUXURY EXPERIENCE */}
        <div className="block md:hidden space-y-8 text-stone-100" dir="rtl">
          {/* Mobile Redesigned Hero Block */}
          <div className="mobile-hero space-y-5 flex flex-col items-center text-center">

            {/* 1. IMAGE GALLERY */}
            <div className="w-full px-3">
              <ImageGallery images={images} productName={product.name} layoutIdPrefix="mobile" />
            </div>

            {/* 2 & 3. PRODUCT NAME & RATING - UPGRADED TO MOBILE LUXURY FLOATING CONTAINER */}
            <div className="w-full px-3">
              <div className="relative overflow-hidden rounded-3xl bg-[#FAF6EE]/50 backdrop-blur-md border border-amber-500/20 p-5 shadow-[0_15px_35px_-8px_rgba(217,119,6,0.06)] transition-all duration-300 hover:border-amber-500/30">
                {/* Soft ambient glow and glass reflection */}
                <div className="absolute -inset-6 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.02)_0%,transparent_80%)] pointer-events-none rounded-full" />
                <GlassReflection duration={12} />

                <div className="relative z-10 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="bg-amber-500/10 border border-amber-500/25 text-amber-850 text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wide">
                      {categoryName}
                    </span>
                    {product.brand && (
                      <span className="bg-[#FAF6EE]/80 border border-[#5D4037]/25 text-[#5D4037] text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        برند: {product.brand}
                      </span>
                    )}
                  </div>

                  <h1 className="text-lg xs:text-xl font-black text-[#2C1A11] leading-tight tracking-tight line-clamp-2">
                    {product.name}
                  </h1>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5D4037] pt-0.5">
                    {reviewCount > 0 && ratingValue !== undefined ? (
                      <>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.round(ratingValue) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-extrabold text-amber-700">{ratingValue.toFixed(1)}</span>
                        <span className="text-stone-355">|</span>
                        <span className="font-bold">({reviewCount} نظر کاربران)</span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5 text-stone-300"
                            />
                          ))}
                        </div>
                        <span className="font-extrabold text-[#5D4037]">بدون امتیاز</span>
                        <span className="text-stone-355">|</span>
                        <span className="font-bold">(۰ نظر کاربران)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PRICE - THE LUXURY FOCUS */}
            <div className="w-full px-3">
              <div className="relative overflow-hidden rounded-3xl p-5 bg-[#1C120C] border border-amber-500/25 shadow-[0_15px_30px_rgba(42,26,18,0.25)]">
                {/* Subtle border / glow */}
                <AnimatedBorder color="amber" borderWidth={1} />
                <AmbientGlow color="amber" opacity={0.08} blur={50} className="absolute inset-0" />

                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <span className="text-[9px] font-bold text-stone-300 tracking-wider uppercase">قیمت ویژه اعضای شیخ</span>

                  <div className="flex items-baseline gap-2 justify-center">
                    <span className="text-2xl xs:text-3.5xl font-black text-amber-400 leading-none">
                      {formatToToman(pricing.price)}
                    </span>
                    {pricing.oldPrice && (
                      <span className="text-stone-400 text-xs xs:text-sm line-through decoration-red-500/50 decoration-2 font-bold">
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
                  <span className="font-bold text-[#5D4037]">انتخاب مدل / مشخصات کالا</span>
                  <span className="text-[10px] text-amber-700 font-bold">تغییر هوشمند قیمت</span>
                </div>

                <div className="flex flex-col gap-2.5 w-full">
                  {availableProductUnits.map((unit) => {
                    const isSelected = selectedProductUnit?.id === unit.id;
                    return (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedProductUnit(unit)}
                        className={`w-full p-3.5 rounded-2xl border text-right transition-all duration-300 flex items-center justify-between h-14 relative overflow-hidden ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/[0.08] shadow-md scale-102'
                            : 'border-[#5D4037]/25 bg-[#FAF6EE]/90 hover:bg-[#FAF6EE]'
                        }`}
                      >
                        {isSelected && <AnimatedBorder color="amber" borderWidth={1} />}
                        <div className="text-right relative z-10">
                          <span className="text-xs font-black text-[#2C1A11] block truncate">{unit.name}</span>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                          <span className="text-amber-700 font-bold text-xs">{formatToToman(Number(unit.price))}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. QUANTITY ADJUSTER */}
            <div className="w-full px-3 flex flex-col items-center space-y-2">
              <span className="text-[10px] font-bold text-[#5D4037]">تعداد درخواستی</span>
              <div className="flex items-center justify-between w-36 bg-[#FAF6EE] border border-[#5D4037]/25 rounded-2xl p-1 shrink-0 shadow-sm">
                <button
                  onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={selectedQuantity <= 1}
                  className="w-9 h-9 rounded-xl bg-[#FAF6EE] hover:bg-[#FAF6EE]/80 flex items-center justify-center text-stone-700 transition-colors border border-amber-500/10 disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="کاهش تعداد"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-black text-[#2C1A11]">{selectedQuantity}</span>
                <button
                  onClick={() => setSelectedQuantity((prev) => Math.min(currentStock, prev + 1))}
                  disabled={selectedQuantity >= currentStock}
                  className="w-9 h-9 rounded-xl bg-[#FAF6EE] hover:bg-[#FAF6EE]/80 flex items-center justify-center text-stone-700 transition-colors border border-amber-500/10 disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="افزایش تعداد"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 7. ADD TO CART CTA (FULL WIDTH 56PX) */}
            <div className="w-full px-3 space-y-3.5">
              <LuxuryButton
                onClick={handleAddToCart}
                disabled={currentStock === 0 || addToCartMutation.isPending}
                isLoading={addToCartMutation.isPending}
                variant="gold"
                className="w-full h-[56px] text-sm"
              >
                <ShoppingBag className="w-5 h-5 text-stone-950" />
                <span>افزودن به سبد خرید ویژه</span>
              </LuxuryButton>

              <LuxuryButton
                onClick={handleInstantPurchase}
                disabled={currentStock === 0 || addToCartMutation.isPending}
                variant="dark"
                className="w-full h-11 text-[11px]"
              >
                <span>⚡ خرید فوری و تسویه سریع حساب</span>
              </LuxuryButton>
            </div>

            {/* 8. QUICK FEATURES */}
            {hasFeatures && (
              <div className="w-full px-3 py-1">
                <div className="grid grid-cols-2 gap-2.5 text-right">
                  {product.features.slice(0, 4).map((feature, idx) => (
                    <LuxuryFeatureChip key={idx} feature={feature} />
                  ))}
                </div>
              </div>
            )}

            {/* 9. PREMIUM GLASS TRUST BADGES */}
            <div className="w-full px-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAF6EE]/90 border border-amber-500/20 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-sm shadow-md relative overflow-hidden">
                  <GlassReflection duration={11} />
                  <CreditCard className="w-5 h-5 text-amber-750 mx-auto" />
                  <h4 className="text-[10px] font-black text-[#2C1A11]">پرداخت امن VIP</h4>
                  <p className="text-[8px] text-[#5D4037] font-bold">درگاه بانکی با بیمه امنیتی</p>
                </div>
                <div className="bg-[#FAF6EE]/90 border border-amber-500/20 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-sm shadow-md relative overflow-hidden">
                  <GlassReflection duration={12} />
                  <ShieldCheck className="w-5 h-5 text-amber-750 mx-auto" />
                  <h4 className="text-[10px] font-black text-[#2C1A11]">اصالت واقعی کالا</h4>
                  <p className="text-[8px] text-[#5D4037] font-bold">تضمین ۱۰۰٪ لوکس کالا</p>
                </div>
                <div className="bg-[#FAF6EE]/90 border border-amber-500/20 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-sm shadow-md relative overflow-hidden">
                  <GlassReflection duration={10} />
                  <Truck className="w-5 h-5 text-amber-750 mx-auto" />
                  <h4 className="text-[10px] font-black text-[#2C1A11]">ارسال اکسپرس VIP</h4>
                  <p className="text-[8px] text-[#5D4037] font-bold">بسته‌بندی محافظ چرمی</p>
                </div>
                <div className="bg-[#FAF6EE]/90 border border-amber-500/20 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-sm shadow-md relative overflow-hidden">
                  <GlassReflection duration={13} />
                  <Headphones className="w-5 h-5 text-amber-750 mx-auto" />
                  <h4 className="text-[10px] font-black text-[#2C1A11]">پشتیبان اختصاصی</h4>
                  <p className="text-[8px] text-[#5D4037] font-bold">پاسخگویی ۲۴ ساعته VIP</p>
                </div>
              </div>
            </div>

          </div>

          {/* Collapsible Accordion (Description & Specs) */}
          <div className="mt-8 bg-[#2A1A12] border border-amber-500/15 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
            <AnimatedBorder color="amber" borderWidth={1} />
            <AmbientGlow color="amber" opacity={0.06} blur={60} className="absolute inset-0" />

            {hasDescription && (
              <div className="border-b border-amber-500/15 pb-3 relative z-10">
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
              <div className="border-b border-amber-500/15 pb-3 relative z-10">
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
                      <div className="space-y-2 bg-[#1C120C]/90 rounded-xl p-4 border border-amber-500/10 text-[11px] relative overflow-hidden">
                        <GlassReflection duration={11} />
                        {hasWeight && (
                          <div className="flex justify-between py-1.5 border-b border-amber-500/10 relative z-10">
                            <span className="text-stone-350">وزن</span>
                            <span className="text-stone-100 font-bold">{product.weight} {product.weightUnit}</span>
                          </div>
                        )}
                        {hasOrigin && (
                          <div className="flex justify-between py-1.5 border-b border-amber-500/10 relative z-10">
                            <span className="text-stone-355">کشور سازنده</span>
                            <span className="text-stone-100 font-bold">{product.origin}</span>
                          </div>
                        )}
                        {hasWarranty && (
                          <div className="flex justify-between py-1.5 border-b border-amber-500/10 relative z-10">
                            <span className="text-stone-355">گارانتی</span>
                            <span className="text-stone-100 font-bold">{product.warranty}</span>
                          </div>
                        )}
                        {hasColor && (
                          <div className="flex justify-between py-1.5 border-b border-amber-500/10 relative z-10">
                            <span className="text-stone-355">رنگ</span>
                            <span className="text-stone-100 font-bold">{product.color}</span>
                          </div>
                        )}
                        {hasSpecs && Object.entries(product.technicalSpecs as Record<string, any>).map(([key, val]) => (
                          <div key={key} className="flex justify-between py-1.5 border-b border-amber-500/10 relative z-10">
                            <span className="text-stone-355">{key}</span>
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
            <div className="mt-8 bg-[#2A1A12] rounded-3xl p-5 border border-amber-500/20 shadow-2xl relative overflow-hidden">
              <AnimatedBorder color="emerald" borderWidth={1} />
              <AmbientGlow color="emerald" opacity={0.06} blur={60} className="absolute inset-0" />
              <ErrorBoundary>
                <div className="scale-95 origin-top relative z-10">
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
                <h3 className="text-sm font-black text-[#2C1A11]">محصولات پیشنهادی و مرتبط</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/25 to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {relatedProducts.map((relProduct) => {
                  const relPricing = resolveProductPrice(relProduct, null);
                  return (
                    <Link
                      href={`/products/${relProduct.slug || relProduct.id}`}
                      key={relProduct.id}
                      className="group bg-[#2A1A12] border border-amber-500/20 rounded-2xl p-3 flex flex-col h-full transition-all duration-300 hover:scale-[1.01] shadow-md relative overflow-hidden"
                    >
                      <AnimatedBorder color="orange" borderWidth={1} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <GlassReflection duration={11} />

                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1C120C]/90 mb-2 flex items-center justify-center p-2 h-24 border border-amber-500/10 z-10">
                        <Image
                          src={relProduct.images?.[0]?.secureUrl || relProduct.images?.[0]?.image || '/noImage.jpg'}
                          alt={relProduct.name}
                          fill
                          className="object-contain p-2"
                          sizes="100px"
                        />
                      </div>
                      <h4 className="text-[11px] font-bold text-stone-200 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1 text-right z-10">
                        {relProduct.name}
                      </h4>
                      <div className="mt-auto pt-1 flex items-center justify-between text-[10px] z-10">
                        <span className="text-stone-400 text-[8px]">شیخ شاپ</span>
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

          <div className="mt-8 relative overflow-hidden rounded-3xl">
            <ReviewSubmissionCard
              productId={product.id}
              productName={product.name}
              onReviewChange={handleReviewChange}
            />
          </div>

          {/* Compact Reviews Section */}
          <div className="mt-8 bg-[#2A1A12] border border-amber-500/15 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
            <AnimatedBorder color="blue" borderWidth={1} />
            <AmbientGlow color="blue" opacity={0.06} blur={60} className="absolute inset-0" />

            <div className="flex items-center justify-between border-b border-[#5D4037]/35 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">دیدگاه‌های کاربران</h3>
              </div>
            </div>

            <div className="relative z-10">
              <DynamicReviewSection
                productId={product.id}
                refreshTrigger={reviewRefreshTrigger}
              />
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
              className="block md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#1C120C]/95 backdrop-blur-md border-t border-amber-500/20 p-3.5 flex items-center justify-between shadow-2xl px-4"
              dir="rtl"
            >
              <div className="flex items-center gap-2 max-w-[50%]">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#2A1A12] border border-amber-500/15">
                  <Image
                    src={images[0]?.secureUrl || images[0]?.image || '/noImage.jpg'}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-bold text-stone-200 truncate max-w-[120px]">{product.name}</h4>
                  <span className="text-[11px] font-black text-amber-400">{formatToToman(pricing.price)}</span>
                </div>
              </div>
              <LuxuryButton
                onClick={handleAddToCart}
                disabled={currentStock === 0 || addToCartMutation.isPending}
                isLoading={addToCartMutation.isPending}
                variant="gold"
                className="py-2.5 px-4 rounded-xl text-[10px] shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-stone-950" />
                <span>خرید فوری</span>
              </LuxuryButton>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
