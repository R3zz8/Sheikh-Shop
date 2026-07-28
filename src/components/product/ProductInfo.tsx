'use client';

import { motion } from 'framer-motion';
import { Star, Package, Tag, Smartphone, Building2, Hash, MapPin, Award, Ruler, Weight, Shield, Info, ArrowRight, Layers, Sparkles, Check, ChevronDown } from 'lucide-react';
import type { ProductsWithImages, Unit, ProductUnit } from '@/types';
import AddToCartButton from './AddToCartButton';
import { Label } from '@/components/ui';
import DiscountBadge from '@/components/ui/DiscountBadge';
import ProductBadge from '@/components/ui/ProductBadge';
import CompactProductUnitSelector from '@/components/ui/CompactProductUnitSelector';
import { resolveProductPrice } from '@/lib/product-pricing';
import { formatToToman } from '@/lib/currency';
import { useUnits } from '@/hooks/useUnits';
import { useUserBehavior } from '@/hooks/useUserBehavior';
import { useState, useMemo, useEffect } from 'react';
import ARProductViewer from '@/components/ar/ARProductViewer';
import { sanitizeHeading } from '@/lib/seo/heading-manager';
import MarkdownDescription from './MarkdownDescription';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { generateExcerpt } from '@/lib/markdown';

interface ProductInfoProps {
    product: ProductsWithImages;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [arAvailable, setArAvailable] = useState(false);
    const [showAR, setShowAR] = useState(false);

    const { units: availableUnits = [], loading: unitsLoading = false, error: unitsError = null } = useUnits() || {};
    const { trackProductClick = () => {} } = useUserBehavior() || {};

    if (!product) {
        console.error('ProductInfo: Product is null or undefined');
        return (
            <div className="bg-neutral-900/80 border border-red-500/20 rounded-3xl p-6 text-center shadow-2xl">
                <p className="text-red-400 font-bold">اطلاعات محصول یافت نشد</p>
            </div>
        );
    }

    const availableProductUnits = useMemo(() => {
        const units = product.units?.filter((unit: ProductUnit) => unit.isActive) || [];
        return units.sort((a: ProductUnit, b: ProductUnit) => {
            if ((a as any).isFeatured && !(b as any).isFeatured) return -1;
            if (!(a as any).isFeatured && (b as any).isFeatured) return 1;
            return Number(a.price) - Number(b.price);
        });
    }, [product.units]);

    const [selectedProductUnit, setSelectedProductUnit] = useState<ProductUnit | null>(
        availableProductUnits.length > 0 ? availableProductUnits[0] ?? null : null
    );

    useEffect(() => {
        if (availableProductUnits.length > 0 && !selectedProductUnit) {
            setSelectedProductUnit(availableProductUnits[0] ?? null);
        }
    }, [availableProductUnits, selectedProductUnit]);

    const useProductUnits = availableProductUnits.length > 0;
    const pricing = resolveProductPrice(product, selectedProductUnit);

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { text: 'ناموجود', color: 'text-rose-400 bg-rose-500/10' };
        if (quantity <= 5) return { text: 'موجودی محدود', color: 'text-amber-400 bg-amber-500/10' };
        return { text: 'موجود در انبار ویژه', color: 'text-emerald-400 bg-emerald-500/10' };
    };

    const getCurrentStock = () => {
        if (useProductUnits && selectedProductUnit) {
            return selectedProductUnit.stock;
        }
        return product.quantity;
    };

    const currentStock = getCurrentStock();
    const stockStatus = getStockStatus(currentStock);

    // Get H1 content: h1Override > seoTitle > product.name
    const h1Text = product.h1Override || product.seoTitle || product.name;
    const h1Content = sanitizeHeading(h1Text);

    // Filter dynamic specifications to check if any exist
    const hasTechnicalSpecs = !!product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0;
    const hasMaterials = !!product.materials && product.materials.length > 0;
    const hasWeightOrDims = !!product.weight || (!!product.dimensions && Object.keys(product.dimensions).length > 0);
    const hasWarranty = !!product.warranty;
    const hasSensoryOrHeritage = !!product.color || !!product.scent || !!product.flavor || !!product.origin;
    const hasSpecsSection = hasTechnicalSpecs || hasMaterials || hasWeightOrDims || hasWarranty || hasSensoryOrHeritage;

    return (
        <div className="space-y-8 md:space-y-12 text-right font-vazirmatn" dir="rtl">

            {/* Header / Title / Badges Section */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                    {product.isNew && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-black px-3 py-1 rounded-full tracking-wider shadow-inner">
                            ✨ نوآوری جدید
                        </span>
                    )}
                    {product.isBestSeller && (
                        <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-200 border border-amber-500/30 text-[11px] font-black px-3 py-1 rounded-full shadow-lg">
                            🏆 محبوب‌ترین انتخاب
                        </span>
                    )}
                    {product.isAmazing && (
                        <span className="bg-rose-500/15 text-rose-300 border border-rose-500/20 text-[11px] font-black px-3 py-1 rounded-full animate-pulse">
                            🔥 پیشنهاد شگفت‌انگیز
                        </span>
                    )}
                </div>

                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-l from-amber-200 via-white to-amber-100 bg-clip-text text-transparent leading-tight tracking-tight"
                >
                    {h1Content}
                </motion.h1>

                {/* Sub-header Brand & Category */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-stone-400">
                    {product.brand && (
                        <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-amber-500/70" />
                            <span>برند: <span className="font-bold text-stone-200">{product.brand}</span></span>
                        </div>
                    )}
                    {product.category && (
                        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
                            <Tag className="w-4 h-4 text-amber-500/70" />
                            <span>دسته‌بندی: <span className="font-bold text-stone-200">{product.category}</span></span>
                        </div>
                    )}
                    {product.sku && (
                        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
                            <span className="text-xs text-stone-500 font-mono">SKU: {product.sku}</span>
                        </div>
                    )}
                </div>

                {/* Premium Gold-outlined Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {product.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 transition-colors text-[10px] font-medium text-amber-300/90 px-2 py-0.5 rounded-md"
                            >
                                # {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${(i + 1) <= 4 ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`}
                        />
                    ))}
                </div>
                <span className="text-sm font-bold text-stone-300">۴.۸</span>
                <span className="text-xs text-stone-500 pr-2 border-r border-white/10">(۱۲۰ دیدگاه خریداران)</span>
                <span className="mr-auto px-3 py-1 rounded-full text-xs font-bold transition-all shadow-inner border border-white/5 h-auto leading-none flex items-center justify-center gap-1.5 p-1.5 bg-neutral-900/60 text-stone-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    تحویل آنی لوکس
                </span>
            </div>

            {/* Price Presentation Block */}
            <div className="bg-neutral-950/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col gap-3">
                    <span className="text-xs text-stone-400 font-bold">بهای این اثر نفیس:</span>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-l from-amber-300 via-yellow-200 to-amber-100 bg-clip-text text-transparent">
                            {formatToToman(pricing.price)}
                        </span>
                        {pricing.oldPrice && (
                            <span className="text-lg text-stone-500 line-through decoration-rose-500/50">
                                {formatToToman(pricing.oldPrice)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-1 border-t border-white/5 pt-3 text-xs">
                        <p className="text-stone-300 font-medium">
                            مبنای هر واحد: <span className="font-bold text-amber-300">{useProductUnits && selectedProductUnit ? selectedProductUnit.name : (product.baseUnit?.name || 'عدد')}</span>
                        </p>
                        {pricing.hasDiscount && (
                            <span className="bg-rose-500 text-white font-black px-2.5 py-1 rounded-full shadow-lg shadow-rose-500/20 text-[11px]">
                                {pricing.discountPercentage}٪ تخفیف انحصاری
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Dynamic Variants (Product Units Selection) */}
            {useProductUnits && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-black text-amber-200 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-amber-400" />
                            <span>انتخاب بسته یا نوع ارائه کالا:</span>
                        </Label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableProductUnits.map((productUnit: ProductUnit, index: number) => {
                            const isSelected = selectedProductUnit?.id === productUnit.id;
                            const isOutOfStock = productUnit.stock === 0;
                            const isPopular = (productUnit as any).isFeatured || index === 0;

                            return (
                                <motion.div
                                    key={productUnit.id}
                                    whileHover={!isOutOfStock ? { scale: 1.01 } : {}}
                                    whileTap={!isOutOfStock ? { scale: 0.99 } : {}}
                                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between gap-3 ${
                                        isSelected
                                            ? 'border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/5'
                                            : isOutOfStock
                                                ? 'border-rose-500/10 bg-rose-500/5 opacity-50 cursor-not-allowed'
                                                : 'border-white/5 bg-neutral-900/40 hover:border-white/10'
                                    }`}
                                    onClick={() => {
                                        if (!isOutOfStock) {
                                            setSelectedProductUnit(productUnit);
                                            trackProductClick(product.id, product.category, productUnit.id);
                                        }
                                    }}
                                >
                                    {isPopular && (
                                        <div className="absolute top-2 left-2 bg-gradient-to-l from-amber-500 to-amber-600 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                                            پیشنهادی
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 ${
                                            isSelected ? 'border-amber-400 bg-amber-400' : 'border-stone-700'
                                        }`}>
                                            {isSelected && <div className="w-1.5 h-1.5 bg-neutral-950 rounded-full"></div>}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-base">{productUnit.name}</div>
                                            <div className="text-amber-200/90 font-black text-sm mt-1">
                                                {formatToToman(Number(productUnit.price))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] border-t border-white/5 pt-2 mt-1">
                                        <span className="text-stone-400">موجودی: {productUnit.stock} عدد</span>
                                        {isOutOfStock ? (
                                            <span className="text-rose-400 font-bold">ناموجود</span>
                                        ) : (
                                            <span className="text-emerald-400 font-bold">آماده ارسال</span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quantity Selector & Add to Cart Card */}
            {selectedProductUnit && !useProductUnits && (
                <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-300">موجودی این کالا:</span>
                        <span className="text-amber-400 font-bold">{selectedProductUnit.stock} عدد</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                            disabled={selectedQuantity <= 1}
                            className="w-11 h-11 rounded-xl border border-white/10 bg-neutral-950/40 text-white hover:bg-white/5 disabled:opacity-30 flex items-center justify-center transition-all text-xl"
                        >
                            −
                        </button>
                        <input
                            type="number"
                            min="1"
                            max={selectedProductUnit.stock}
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(Math.max(1, Math.min(selectedProductUnit.stock, parseInt(e.target.value) || 1)))}
                            className="flex-1 h-11 bg-neutral-950/40 border border-white/10 rounded-xl text-white text-center focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold font-mono"
                        />
                        <button
                            onClick={() => setSelectedQuantity(Math.min(selectedProductUnit.stock, selectedQuantity + 1))}
                            disabled={selectedQuantity >= selectedProductUnit.stock}
                            className="w-11 h-11 rounded-xl border border-white/10 bg-neutral-950/40 text-white hover:bg-white/5 disabled:opacity-30 flex items-center justify-center transition-all text-xl"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            {/* AR Viewer & Primary CTA Container */}
            <div className="space-y-4 pt-2">
                <div className="w-full flex">
                    <div className="w-full">
                        <AddToCartButton
                            product={product}
                            selectedQuantity={selectedQuantity}
                            selectedProductUnit={selectedProductUnit}
                            pricing={pricing}
                        />
                    </div>
                </div>

                {arAvailable && (
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setShowAR(true)}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-200 hover:bg-amber-500/10 transition-all font-bold text-sm shadow-lg shadow-amber-500/5"
                    >
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>مشاهده کالا با واقعیت افزوده AR 📱</span>
                    </motion.button>
                )}
            </div>

            {/* Dynamic Highlights / Key Features ( hidding section if empty ) */}
            {product.features && product.features.length > 0 && (
                <div className="space-y-4 bg-neutral-950/20 border border-white/5 p-6 rounded-3xl">
                    <h3 className="text-sm font-black text-amber-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>ویژگی‌های برجسته و کلیدی کالا:</span>
                    </h3>
                    <ul className="grid grid-cols-1 gap-3 text-sm text-stone-300">
                        {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 mt-0.5">
                                    <Check className="w-3 h-3" />
                                </span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Dynamic Specifications Accordion ( hidding completely if no specs exist ) */}
            {hasSpecsSection && (
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-amber-200 flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-400" />
                        <span>مشخصات فنی و فیزیکی اثر:</span>
                    </h3>

                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {/* Technical Specs Object */}
                        {hasTechnicalSpecs && (
                            <AccordionItem value="tech-specs" className="border border-white/5 rounded-2xl overflow-hidden bg-neutral-900/30 backdrop-blur-md px-4">
                                <AccordionTrigger className="hover:no-underline py-4 flex items-center justify-between text-stone-200 hover:text-white font-bold text-sm">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-amber-400" />
                                        <span>پارامترهای فنی کالا</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300" />
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-1 text-xs leading-relaxed text-stone-300 border-t border-white/5">
                                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                                        {Object.entries(product.technicalSpecs).map(([key, val]) => (
                                            <div key={key} className="flex justify-between items-center py-2 px-3 bg-neutral-950/40 rounded-xl border border-white/5">
                                                <span className="text-stone-400 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="font-bold text-stone-100">{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Physical attributes (materials) */}
                        {hasMaterials && (
                            <AccordionItem value="materials-spec" className="border border-white/5 rounded-2xl overflow-hidden bg-neutral-900/30 backdrop-blur-md px-4">
                                <AccordionTrigger className="hover:no-underline py-4 flex items-center justify-between text-stone-200 hover:text-white font-bold text-sm">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-amber-400" />
                                        <span>مواد اولیه و متریال تشکیل‌دهنده</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300" />
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-1 text-xs leading-relaxed text-stone-300 border-t border-white/5">
                                    <div className="flex flex-wrap gap-2 pt-3">
                                        {product.materials.map((material, idx) => (
                                            <span key={idx} className="bg-neutral-950/60 border border-white/5 text-stone-200 px-3.5 py-1.5 rounded-xl font-medium">
                                                🌿 {material}
                                            </span>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Weight & dimensions */}
                        {hasWeightOrDims && (
                            <AccordionItem value="dims-spec" className="border border-white/5 rounded-2xl overflow-hidden bg-neutral-900/30 backdrop-blur-md px-4">
                                <AccordionTrigger className="hover:no-underline py-4 flex items-center justify-between text-stone-200 hover:text-white font-bold text-sm">
                                    <div className="flex items-center gap-2">
                                        <Ruler className="w-4 h-4 text-amber-400" />
                                        <span>جرم، ابعاد و مشخصات فیزیکی</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300" />
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-1 text-xs leading-relaxed text-stone-300 border-t border-white/5 space-y-3.5">
                                    {product.weight && (
                                        <div className="flex justify-between items-center py-2 px-3 bg-neutral-950/40 rounded-xl border border-white/5 mt-2">
                                            <span className="text-stone-400 flex items-center gap-1">
                                                <Weight className="w-3.5 h-3.5 text-amber-500/75" />
                                                وزن خالص کالا
                                            </span>
                                            <span className="font-bold text-stone-100">{product.weight} {product.weightUnit || 'گرم'}</span>
                                        </div>
                                    )}
                                    {product.dimensions && typeof product.dimensions === 'object' && (
                                        <div className="flex justify-between items-center py-2 px-3 bg-neutral-950/40 rounded-xl border border-white/5">
                                            <span className="text-stone-400 flex items-center gap-1">
                                                <Ruler className="w-3.5 h-3.5 text-amber-500/75" />
                                                ابعاد هندسی (طول × عرض × ارتفاع)
                                            </span>
                                            <span className="font-bold text-stone-100 font-mono">
                                                {product.dimensions.length || '—'} × {product.dimensions.width || '—'} × {product.dimensions.height || '—'} {product.dimensions.unit || 'سانتی‌متر'}
                                            </span>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Sensory, Flavor, Scent, Color & Heritage Specs */}
                        {hasSensoryOrHeritage && (
                            <AccordionItem value="sensory-spec" className="border border-white/5 rounded-2xl overflow-hidden bg-neutral-900/30 backdrop-blur-md px-4">
                                <AccordionTrigger className="hover:no-underline py-4 flex items-center justify-between text-stone-200 hover:text-white font-bold text-sm">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <span>مشخصات حسی و اصالت کالا</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300" />
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-1 text-xs leading-relaxed text-stone-300 border-t border-white/5 space-y-3.5">
                                    {product.color && (
                                        <div className="flex justify-between items-center py-2 px-3 bg-neutral-950/40 rounded-xl border border-white/5 mt-2">
                                            <span className="text-stone-400">رنگ ظاهری</span>
                                            <span className="font-bold text-stone-100">{product.color}</span>
                                        </div>
                                    )}
                                    {product.scent && (
                                        <div className="flex justify-between items-center py-2 px-3 bg-neutral-950/40 rounded-xl border border-white/5">
                                            <span className="text-stone-400">عطر و رایحه</span>
                                            <span className="font-bold text-stone-100">{product.scent}</span>
                                        </div>
                                    )}
                                    {product.flavor && (
                                        <div className="flex justify-between items-center py-2 px-3 bg-neutral-950/40 rounded-xl border border-white/5">
                                            <span className="text-stone-400">طعم و مزه</span>
                                            <span className="font-bold text-stone-100">{product.flavor}</span>
                                        </div>
                                    )}
                                    {product.origin && (
                                        <div className="flex justify-between items-center py-2 px-3 bg-neutral-950/40 rounded-xl border border-white/5">
                                            <span className="text-stone-400 flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-amber-500/75" />
                                                خاستگاه و کشور تولیدکننده
                                            </span>
                                            <span className="font-bold text-stone-100">{product.origin}</span>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Warranty information */}
                        {hasWarranty && (
                            <AccordionItem value="warranty-spec" className="border border-white/5 rounded-2xl overflow-hidden bg-neutral-900/30 backdrop-blur-md px-4">
                                <AccordionTrigger className="hover:no-underline py-4 flex items-center justify-between text-stone-200 hover:text-white font-bold text-sm">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-amber-400" />
                                        <span>خدمات پس از فروش و گارانتی اصالت</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300" />
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-1 text-xs leading-relaxed text-stone-300 border-t border-white/5">
                                    <div className="p-3 bg-neutral-950/40 rounded-xl border border-white/5 mt-2 flex items-center gap-2.5">
                                        <Award className="w-5 h-5 text-amber-400 shrink-0" />
                                        <span className="font-bold text-stone-200 leading-relaxed">{product.warranty}</span>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                </div>
            )}

            {/* Live Premium Shipping Tracker & Logistics details */}
            <div className="p-6 border border-amber-500/20 bg-gradient-to-br from-neutral-950 via-neutral-900/60 to-neutral-950 backdrop-blur-xl rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">🚚</span>
                        <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-white to-amber-300">
                            جزئیات ارسال و بیمه لجستیک
                        </h3>
                    </div>
                    {product.allowFreeShipping ? (
                        <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full border border-green-400/20 shadow-md">
                            🎁 ارسال رایگان
                        </span>
                    ) : product.shippingPriority === 'Express' ? (
                        <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                            ⚡ ارسال اکسپرس
                        </span>
                    ) : (
                        <span className="bg-neutral-950 text-amber-300 border border-amber-500/20 text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                            📦 لجستیک بیمه‌شده
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="bg-neutral-950/60 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-stone-400 font-bold block mb-1">تعرفه تحویل لوکس:</span>
                        {product.allowFreeShipping ? (
                            <span className="text-sm font-black text-emerald-400">کاملاً رایگان (مهمان فروشگاه)</span>
                        ) : (
                            <span className="text-base font-black text-amber-300">
                                {formatToToman(product.shippingCost !== undefined && product.shippingCost !== null ? product.shippingCost : 200000)}
                            </span>
                        )}
                    </div>

                    <div className="bg-neutral-950/60 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-stone-400 font-bold block mb-1">پروتکل آماده‌سازی:</span>
                        <span className="text-sm font-bold text-stone-200">
                            {product.shippingDescription || 'سفارشی ویژه با بسته‌بندی نفیس'}
                        </span>
                    </div>
                </div>

                {/* Elegant Delivery Tracker Timeline */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400">⏱</span>
                        <h4 className="text-xs font-black text-stone-300">مراحل لجستیک تحویل شاهکار:</h4>
                    </div>

                    <div className="relative flex justify-between items-center px-1 py-4">
                        <div className="absolute top-[28px] left-6 right-6 h-[2px] bg-gradient-to-l from-amber-500/40 via-amber-500/10 to-stone-800 rounded-full z-0 pointer-events-none" />

                        {/* Phase 1 */}
                        <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950 text-xs font-black shadow-lg shadow-amber-500/20">
                                ✓
                            </div>
                            <span className="text-[10px] font-bold text-amber-200">سفارش</span>
                        </div>

                        {/* Phase 2 */}
                        <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950 text-xs font-black shadow-lg shadow-amber-500/20">
                                ✓
                            </div>
                            <span className="text-[10px] font-bold text-amber-200">آماده‌سازی</span>
                        </div>

                        {/* Phase 3 */}
                        <div className="flex flex-col items-center gap-2 relative z-10">
                            <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-500 flex items-center justify-center text-amber-400 text-xs shadow-md shadow-amber-500/10"
                            >
                                🚚
                            </motion.div>
                            <span className="text-[10px] font-bold text-stone-200">حمل ویژه</span>
                        </div>

                        {/* Phase 4 */}
                        <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className="w-8 h-8 rounded-full bg-neutral-950 border border-white/5 flex items-center justify-center text-stone-600 text-xs">
                                🎁
                            </div>
                            <span className="text-[10px] font-medium text-stone-500">تحویل</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-stone-400 text-center leading-relaxed bg-neutral-950/40 py-2 rounded-xl border border-white/5">
                        📦 زمان تقریبی دریافت کالا: <span className="text-amber-300 font-bold">
                            {product.shippingPriority === 'Express' ? '۱ الی ۲ روز کاری (اکسپرس)' : '۳ الی ۵ روز کاری'}
                        </span>
                    </p>
                </div>
            </div>

            {/* AR Overlay portal */}
            {showAR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <div className="relative w-full max-w-4xl mx-4">
                        <ARProductViewer product={product} onClose={() => setShowAR(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
