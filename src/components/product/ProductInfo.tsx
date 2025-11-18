'use client';

import { motion } from 'framer-motion';
import { Star, Package, Tag, Smartphone, Building2, Hash, MapPin, Award, Ruler, Weight, Shield, Info } from 'lucide-react';
import type { ProductsWithImages, Unit, ProductUnit } from '@/types';
import AddToCartButton from './AddToCartButton';
import UnitSelector from '@/components/ui/UnitSelector';
import DiscountBadge from '@/components/ui/DiscountBadge';
import ProductBadge from '@/components/ui/ProductBadge';
import CompactProductUnitSelector from '@/components/ui/CompactProductUnitSelector';
import { resolveProductPrice } from '@/lib/product-pricing';
import { formatPrice } from '@/lib/currency';
import { useUnits } from '@/hooks/useUnits';
import { useUserBehavior } from '@/hooks/useUserBehavior';
import { useState, useMemo, useEffect } from 'react';
import ARProductViewer from '@/components/ar/ARProductViewer';
import { getProductH1Content } from '@/components/seo/ProductSEO';
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
    const { trackProductView = () => {}, trackProductClick = () => {} } = useUserBehavior() || {};

    if (!product) {
        console.error('ProductInfo: Product is null or undefined');
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                <p className="text-red-300">Product data is missing</p>
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
        if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-400' };
        if (quantity <= 5) return { text: 'Low Stock', color: 'text-yellow-400' };
        return { text: 'In Stock', color: 'text-green-400' };
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
    const h1Content = getProductH1Content({
        h1Override: product.h1Override,
        seoTitle: product.seoTitle,
        name: product.name,
    });

    return (
        <div className="space-y-4 md:space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent leading-tight">
                    {h1Content}
                </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1" />
                    <ProductBadge isNew={product.isNew} isBestSeller={product.isBestSeller} size="md" className="md:scale-100 scale-90" />
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                            {formatPrice(pricing.price)}
                        </span>
                        {pricing.oldPrice && (
                            <span className="text-lg text-gray-400 line-through">
                                {formatPrice(pricing.oldPrice)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm md:text-lg text-amber-200/80">
                            per {useProductUnits && selectedProductUnit ? selectedProductUnit.name : (product.baseUnit?.name || 'unit')}
                        </p>
                        {useProductUnits && (
                            <CompactProductUnitSelector
                                productUnits={availableProductUnits}
                                selectedProductUnit={selectedProductUnit}
                                onProductUnitChange={setSelectedProductUnit}
                                variant="detail"
                                className="flex-shrink-0"
                            />
                        )}
                    </div>
                </div>

                {pricing.hasDiscount && (
                    <DiscountBadge 
                        discountPercentage={pricing.discountPercentage}
                        showCountdown={true}
                        className="text-base"
                    />
                )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i + 1}
                            className={`w-5 h-5 ${(i + 1) <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
                        />
                    ))}
                </div>
                <span className="text-gray-300 font-medium">4.8 (124 reviews)</span>
            </motion.div>

            {arAvailable && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
                    <button
                        onClick={() => setShowAR(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200/30 bg-white/10 text-white hover:bg-white/15 transition-colors"
                    >
                        <Smartphone className="w-4 h-4" />
                        View in AR
                    </button>
                </motion.div>
            )}

            {/* Product Meta Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                        <Tag className="w-4 h-4 text-amber-400" />
                        <span className="text-gray-200 font-medium">{product.category}</span>
                    </div>
                    {product.brand && (
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                            <Building2 className="w-4 h-4 text-amber-400" />
                            <span className="text-gray-200 font-medium">{product.brand}</span>
                        </div>
                    )}
                    {product.sku && (
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                            <Hash className="w-4 h-4 text-amber-400" />
                            <span className="text-gray-200 font-medium text-sm">SKU: {product.sku}</span>
                        </div>
                    )}
                    {product.origin && (
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                            <MapPin className="w-4 h-4 text-amber-400" />
                            <span className="text-gray-200 font-medium">{product.origin}</span>
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex items-center gap-2 text-sm md:text-base">
                <Package className="w-5 h-5 text-gray-400" />
                <span className={`font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{currentStock} units available</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
                {useProductUnits ? (
                    <div className="space-y-4">
                        <div className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-amber-400" />
                                Choose Your Size
                            </h3>
                            <div className="space-y-3">
                                {availableProductUnits.map((productUnit: ProductUnit, index: number) => {
                                    const isSelected = selectedProductUnit?.id === productUnit.id;
                                    const isOutOfStock = productUnit.stock === 0;
                                    const isLowStock = productUnit.stock > 0 && productUnit.stock <= 5;
                                    const isPopular = (productUnit as any).isFeatured || index === 0;

                                    return (
                                        <div
                                            key={productUnit.id}
                                            className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/20'
                                                    : isOutOfStock
                                                        ? 'border-red-200/20 bg-red-500/5 opacity-60 cursor-not-allowed'
                                                        : 'border-amber-200/20 bg-white/5 hover:border-amber-300/40 hover:bg-white/8 hover:shadow-md'
                                            }`}
                                            onClick={() => {
                                                if (!isOutOfStock) {
                                                    setSelectedProductUnit(productUnit);
                                                    trackProductClick(product.id, product.category, productUnit.id);
                                                }
                                            }}
                                        >
                                            {isPopular && (
                                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                                    POPULAR
                                                </div>
                                            )}
                                            <div className="flex items-start gap-4">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                                    isSelected ? 'border-amber-400 bg-amber-400' : 'border-amber-200/40'
                                                }`}>
                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-semibold text-white text-lg">{productUnit.name}</div>
                                                            <div className="text-amber-200 font-medium">
                                                                {formatPrice(Number(productUnit.price), 'EUR')}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isOutOfStock ? (
                                                                <span className="flex items-center gap-1 text-red-400 text-sm font-medium">
                                                                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                                                    Out of Stock
                                                                </span>
                                                            ) : isLowStock ? (
                                                                <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                                                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                                                    Low Stock
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                                    In Stock
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!isOutOfStock && (
                                                        <div className="text-gray-400 text-sm mt-1">{productUnit.stock} units available</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedProductUnit && (
                            <div className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-200">Quantity</label>
                                    <span className="text-xs text-gray-400">Max: {selectedProductUnit.stock} units</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                                        disabled={selectedQuantity <= 1}
                                        className="w-10 h-10 rounded-lg border border-amber-200/20 bg-white/8 text-white hover:bg-white/12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedProductUnit.stock}
                                        value={selectedQuantity}
                                        onChange={(e) => setSelectedQuantity(Math.max(1, Math.min(selectedProductUnit.stock, parseInt(e.target.value) || 1)))}
                                        className="w-20 px-3 py-2 bg-white/8 border border-amber-200/20 rounded-lg text-white text-center focus:ring-2 focus:ring-amber-400 focus:border-amber-300/40"
                                    />
                                    <button
                                        onClick={() => setSelectedQuantity(Math.min(selectedProductUnit.stock, selectedQuantity + 1))}
                                        disabled={selectedQuantity >= selectedProductUnit.stock}
                                        className="w-10 h-10 rounded-lg border border-amber-200/20 bg-white/8 text-white hover:bg-white/12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    {[1, 3, 5].map(qty => (
                                        <button
                                            key={qty}
                                            onClick={() => setSelectedQuantity(Math.min(selectedProductUnit.stock, qty))}
                                            disabled={qty > selectedProductUnit.stock}
                                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                                selectedQuantity === qty
                                                    ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                                                    : 'border-amber-200/20 bg-white/5 text-gray-300 hover:bg-white/8 disabled:opacity-50'
                                            }`}
                                        >
                                            {qty}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <p className="text-red-300 text-sm">No units available for this product</p>
                    </div>
                )}
            </motion.div>

            {/* Excerpt (above the fold) */}
            {(product.excerpt || product.description) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="space-y-2">
                    <p className="text-gray-300 leading-relaxed text-base md:text-lg max-w-prose">
                        {product.excerpt || (product.description ? generateExcerpt(product.description, 200) : null) || 'No description available.'}
                    </p>
                </motion.div>
            )}

            {/* Features List */}
            {product.features && product.features.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} className="space-y-3">
                    <h3 className="text-xl font-semibold text-white">Key Features</h3>
                    <ul className="space-y-2 text-gray-300">
                        {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Full Description */}
            {product.description && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="space-y-3">
                    <h2 className="text-2xl font-semibold text-white">Description</h2>
                    <MarkdownDescription content={product.description} />
                </motion.div>
            )}

            {/* Collapsible Sections */}
            {(product.technicalSpecs || product.materials?.length || product.warranty || product.weight || product.dimensions) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="space-y-4">
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {/* Technical Specifications */}
                        {product.technicalSpecs && (
                            <AccordionItem value="specs" className="border border-amber-200/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                                <AccordionTrigger className="px-6 py-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Info className="w-5 h-5 text-amber-400" />
                                        <span className="text-lg font-semibold text-white">Technical Specifications</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <div className="space-y-2 text-gray-300">
                                        {typeof product.technicalSpecs === 'object' ? (
                                            Object.entries(product.technicalSpecs).map(([key, value]) => (
                                                <div key={key} className="flex justify-between py-2 border-b border-white/10">
                                                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                    <span>{String(value)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p>{String(product.technicalSpecs)}</p>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Materials */}
                        {product.materials && product.materials.length > 0 && (
                            <AccordionItem value="materials" className="border border-amber-200/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                                <AccordionTrigger className="px-6 py-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 text-amber-400" />
                                        <span className="text-lg font-semibold text-white">Materials</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <ul className="space-y-2 text-gray-300">
                                        {product.materials.map((material, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                                                <span>{material}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Weight & Dimensions */}
                        {(product.weight || product.dimensions) && (
                            <AccordionItem value="dimensions" className="border border-amber-200/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                                <AccordionTrigger className="px-6 py-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Ruler className="w-5 h-5 text-amber-400" />
                                        <span className="text-lg font-semibold text-white">Weight & Dimensions</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <div className="space-y-3 text-gray-300">
                                        {product.weight && (
                                            <div className="flex items-center gap-2">
                                                <Weight className="w-4 h-4 text-amber-400" />
                                                <span>Weight: {product.weight} {product.weightUnit || 'kg'}</span>
                                            </div>
                                        )}
                                        {product.dimensions && typeof product.dimensions === 'object' && (
                                            <div className="flex items-center gap-2">
                                                <Ruler className="w-4 h-4 text-amber-400" />
                                                <span>
                                                    Dimensions: {product.dimensions.length || 'N/A'} × {product.dimensions.width || 'N/A'} × {product.dimensions.height || 'N/A'} {product.dimensions.unit || 'cm'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Warranty */}
                        {product.warranty && (
                            <AccordionItem value="warranty" className="border border-amber-200/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                                <AccordionTrigger className="px-6 py-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-amber-400" />
                                        <span className="text-lg font-semibold text-white">Warranty</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <p className="text-gray-300">{product.warranty}</p>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="pt-4">
                <div className="w-full flex">
                    <div className="w-full max-w-sm mx-auto">
                        <AddToCartButton 
                            product={product} 
                            selectedQuantity={selectedQuantity}
                            selectedProductUnit={selectedProductUnit}
                            pricing={pricing}
                        />
                    </div>
                </div>
            </motion.div>

            {currentStock <= 5 && currentStock > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.85 }} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm text-center">
                        Warning: Only {currentStock} units left in stock!
                    </p>
                </motion.div>
            )}

            {currentStock === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.85 }} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-200 text-sm text-center">
                        Cross: This product is currently out of stock
                    </p>
                </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }} className="grid grid-cols-4 gap-2 md:gap-4 pt-6 border-t border-white/10">
                <div className="text-center">
                    <div className="text-sm font-semibold text-amber-400">Free Shipping</div>
                    <div className="text-xs text-gray-400 mt-1">Worldwide Shipping Available</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-semibold text-amber-400">Estimated Delivery</div>
                    <div className="text-xs text-gray-400 mt-1">5–10 Business Days</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-semibold text-amber-400">Premium Quality</div>
                    <div className="text-xs text-gray-400 mt-1">100% Authentic Product</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-semibold text-amber-400">Secure Packaging</div>
                    <div className="text-xs text-gray-400 mt-1">Fresh & Safe Delivery</div>
                </div>
            </motion.div>

            {showAR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="relative w-full max-w-4xl mx-4">
                        <ARProductViewer product={product} onClose={() => setShowAR(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}