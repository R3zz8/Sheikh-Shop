'use client';

import { motion } from 'framer-motion';
import { Star, Package, Tag } from 'lucide-react';
import type { ProductsWithImages, Unit, ProductUnit } from '@/types';
import AddToCartButton from './AddToCartButton';
import UnitSelector from '@/components/ui/UnitSelector';
import DiscountBadge from '@/components/ui/DiscountBadge';
import ProductBadge from '@/components/ui/ProductBadge';
import CompactProductUnitSelector from '@/components/ui/CompactProductUnitSelector';
import { calculateFinalPricing } from '@/lib/pricing';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';
import { useUnits } from '@/hooks/useUnits';
import { useUserBehavior } from '@/hooks/useUserBehavior';
import { useState, useMemo, useEffect } from 'react';
import ARProductViewer from '@/components/ar/ARProductViewer';
import { Smartphone } from 'lucide-react';

interface ProductInfoProps {
    product: ProductsWithImages;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    // Initialize hooks first (React rules)
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [selectedProductUnit, setSelectedProductUnit] = useState<ProductUnit | null>(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [arAvailable, setArAvailable] = useState(false);
    const [showAR, setShowAR] = useState(false);

    // Safe hook usage with fallbacks
    const { currency = 'EUR' } = useCurrencySafe() || {};
    const { units: availableUnits = [], loading: unitsLoading = false, error: unitsError = null } = useUnits() || {};
    const { trackProductView = () => {}, trackProductClick = () => {} } = useUserBehavior() || {};

    // Add data validation and error handling
    if (!product) {
        console.error('ProductInfo: Product is null or undefined');
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                <p className="text-red-300">Product data is missing</p>
            </div>
        );
    }

    // Safe default unit computation
    const defaultUnit = product?.baseUnit ?? product?.units?.[0] ?? null;
    
    // Sync selectedUnit with defaultUnit when it changes
    useEffect(() => {
        if (defaultUnit && !selectedUnit) {
            setSelectedUnit(defaultUnit);
        }
    }, [defaultUnit, selectedUnit]);

    // Check if product has required data
    if (!product.baseUnit && (!product.units || product.units.length === 0)) {
        console.error('ProductInfo: Product has no baseUnit or units', product);
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                <p className="text-red-300">Product has no available units</p>
            </div>
        );
    }

    // Track product view on component mount
    useEffect(() => {
        trackProductView(product.id, product.category?.name);
    }, [product.id, product.category, trackProductView]);

    // Detect if AR model exists (product-specific or category fallback)
    useEffect(() => {
        let isMounted = true;
        const checkModels = async () => {
            try {
                const productModel = `/models/${product.id}.gltf`;
                const categoryModel = `/models/${String(product.category?.name || '').toLowerCase()}.glb`;
                const [res1, res2] = await Promise.allSettled([
                    fetch(productModel, { method: 'HEAD' }),
                    fetch(categoryModel, { method: 'HEAD' }),
                ]);
                const ok1 = res1.status === 'fulfilled' && (res1 as PromiseFulfilledResult<Response>).value.ok;
                const ok2 = res2.status === 'fulfilled' && (res2 as PromiseFulfilledResult<Response>).value.ok;
                if (isMounted) setArAvailable(Boolean(ok1 || ok2));
            } catch {
                if (isMounted) setArAvailable(false);
            }
        };
        checkModels();
        return () => { isMounted = false; };
    }, [product.id, product.category]);

    // Get available product units (filtered by active status)
    const availableProductUnits = useMemo(() => {
        const units = product.units?.filter(unit => unit.isActive) || [];
        // Sort by featured first, then by price
        return units.sort((a, b) => {
            if ((a as any).isFeatured && !(b as any).isFeatured) return -1;
            if (!(a as any).isFeatured && (b as any).isFeatured) return 1;
            return Number(a.price) - Number(b.price);
        });
    }, [product.units]);

    // Determine if we should use ProductUnit system or legacy system
    const useProductUnits = availableProductUnits.length > 0;

    // Calculate pricing with discounts (basePrice is in EUR)
    const pricing = calculateFinalPricing(
        useProductUnits && selectedProductUnit ? Number(selectedProductUnit.price) : product.basePrice,
        selectedUnit || defaultUnit,
        selectedQuantity,
        product.discounts
    );

    // Convert prices to current currency (with error handling)
    let convertedFinalPrice = pricing.finalPrice;
    let convertedOriginalPrice = pricing.originalPrice;
    let convertedDiscountAmount = pricing.discountAmount;
    
    try {
        convertedFinalPrice = convertCurrency(pricing.finalPrice, 'EUR', currency);
        convertedOriginalPrice = convertCurrency(pricing.originalPrice, 'EUR', currency);
        convertedDiscountAmount = convertCurrency(pricing.discountAmount, 'EUR', currency);
    } catch (error) {
        console.error('Currency conversion error:', error);
        // Fallback to EUR prices if conversion fails
    }

    // Simulate rating data (in real app, this would come from database)
    const rating = 4.8;
    const reviewCount = 124;
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-400' };
        if (quantity <= 5) return { text: 'Low Stock', color: 'text-yellow-400' };
        return { text: 'In Stock', color: 'text-green-400' };
    };

    // Get stock status based on selected unit
    const getCurrentStock = () => {
        if (useProductUnits && selectedProductUnit) {
            return selectedProductUnit.stock;
        }
        return product.quantity;
    };

    const currentStock = getCurrentStock();
    const stockStatus = getStockStatus(currentStock);

    return (
        <div className="space-y-4 md:space-y-8">
            {/* Product Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent leading-tight">
                    {product.name}
                </h1>
            </motion.div>

            {/* Product Badges */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1" />
                    <ProductBadge 
                        isNew={product.isNew}
                        isBestSeller={product.isBestSeller}
                        size="md"
                        className="md:scale-100 scale-90"
                    />
                </div>
            </motion.div>

            {/* Price Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
            >
                <div className="space-y-3">
                    {/* Price row: final + original (if discount) aligned on one line for mobile */}
                    <div className="flex items-baseline gap-3 flex-wrap">
                        {/* Final Price */}
                        <span className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                            {formatPrice(convertedFinalPrice, currency)}
                        </span>
                        
                        {/* Original Price with line-through if discounted */}
                        {pricing.hasDiscount && (
                            <span className="text-lg text-gray-400 line-through">
                                {formatPrice(convertedOriginalPrice, currency)}
                            </span>
                        )}
                    </div>
                    
                    {/* Unit Display and Selector Row */}
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm md:text-lg text-amber-200/80">
                            per {useProductUnits && selectedProductUnit ? selectedProductUnit.name : (selectedUnit?.symbol || defaultUnit?.symbol || 'unit')}
                        </p>
                        
                        {/* Compact Unit Selector for ProductUnits */}
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

                {/* Discount Badge */}
                {pricing.hasDiscount && (
                    <DiscountBadge 
                        discount={{
                            type: product.discounts[0]?.discountType || 'PERCENTAGE',
                            value: product.discounts[0]?.value || 0,
                            amount: convertedDiscountAmount,
                            percentage: pricing.discountPercentage,
                            endDate: product.discounts[0]?.endDate || new Date(),
                            isActive: true,
                        }}
                        showCountdown={true}
                        className="text-base"
                    />
                )}
            </motion.div>

            {/* Rating */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-3"
            >
                <div className="flex items-center gap-1">
                    {stars.map((star) => (
                        <Star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.floor(rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : star <= rating
                                        ? 'fill-amber-400/50 text-amber-400'
                                        : 'text-gray-600'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-gray-300 font-medium">
                    {rating} ({reviewCount} reviews)
                </span>
            </motion.div>

            {/* AR Button (conditional) */}
            {arAvailable && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                >
                    <button
                        onClick={() => setShowAR(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200/30 bg-white/10 text-white hover:bg-white/15 transition-colors"
                    >
                        <Smartphone className="w-4 h-4" />
                        View in AR
                    </button>
                </motion.div>
            )}

            {/* Category Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="text-gray-200 font-medium">{product.category?.name}</span>
                </div>
            </motion.div>

            {/* Stock Status (muted, below price/unit) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-2 text-sm md:text-base"
            >
                <Package className="w-5 h-5 text-gray-400" />
                <span className={`font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">
                    {currentStock} units available
                </span>
            </motion.div>

            {/* Unit Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
            >
                {useProductUnits ? (
                    // ProductUnit-based selection with enhanced UX
                    <div className="space-y-4">
                        <div className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-amber-400" />
                                Choose Your Size
                            </h3>
                            <div className="space-y-3">
                                {availableProductUnits.map((productUnit, index) => {
                                    const isSelected = selectedProductUnit?.id === productUnit.id;
                                    const isOutOfStock = productUnit.stock === 0;
                                    const isLowStock = productUnit.stock > 0 && productUnit.stock <= 5;
                                    const isPopular = (productUnit as any).isFeatured || index === 0; // Featured unit or first unit is popular
                                    
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
                                                    trackProductClick(product.id, product.category?.name, productUnit.id);
                                                }
                                            }}
                                        >
                                            {/* Popular Badge */}
                                            {isPopular && (
                                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                                    POPULAR
                                                </div>
                                            )}
                                            
                                            {/* Radio Button */}
                                            <div className="flex items-start gap-4">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                                    isSelected 
                                                        ? 'border-amber-400 bg-amber-400' 
                                                        : 'border-amber-200/40'
                                                }`}>
                                                    {isSelected && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-semibold text-white text-lg">
                                                                {productUnit.name}
                                                            </div>
                                                            <div className="text-amber-200 font-medium">
                                                                {formatPrice(convertCurrency(Number(productUnit.price), 'EUR', currency), currency)}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Stock Status Badge */}
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
                                                    
                                                    {/* Stock Count */}
                                                    {!isOutOfStock && (
                                                        <div className="text-gray-400 text-sm mt-1">
                                                            {productUnit.stock} units available
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Enhanced Quantity selector for selected unit */}
                        {selectedProductUnit && (
                            <div className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-200">
                                        Quantity
                                    </label>
                                    <span className="text-xs text-gray-400">
                                        Max: {selectedProductUnit.stock} units
                                    </span>
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
                                
                                {/* Quick quantity buttons */}
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
                    // Legacy unit selection
                    unitsLoading ? (
                        <div className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-lg p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-amber-200/20 rounded w-1/4 mb-4"></div>
                                <div className="h-8 bg-amber-200/20 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-amber-200/20 rounded w-3/4"></div>
                            </div>
                        </div>
                    ) : unitsError ? (
                        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-4">
                            <p className="text-red-300 text-sm">
                                Error loading units: {unitsError}. Using default units.
                            </p>
                        </div>
                    ) : (
                        defaultUnit ? (
                            <UnitSelector
                                units={availableUnits}
                                basePrice={product.basePrice}
                                baseUnit={defaultUnit}
                                selectedUnit={selectedUnit || defaultUnit}
                                selectedQuantity={selectedQuantity}
                                onUnitChange={setSelectedUnit}
                                onQuantityChange={setSelectedQuantity}
                                showPriceCalculation={true}
                            />
                        ) : (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-red-300 text-sm">No units available for this product</p>
                            </div>
                        )
                    )
                )}
            </motion.div>

            {/* Description */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-3"
            >
                <h3 className="text-xl font-semibold text-white">Description</h3>
                <p className="text-gray-300 leading-relaxed text-base md:text-lg max-w-prose">
                    {product.description || 'No description available for this product.'}
                </p>
            </motion.div>

            {/* Product Features */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="space-y-3"
            >
                <h3 className="text-xl font-semibold text-white">Features</h3>
                <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        Premium quality materials
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        Comfortable and durable design
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        Perfect for everyday use
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        Easy to maintain and clean
                    </li>
                </ul>
            </motion.div>

            {/* Add to Cart Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="pt-4"
            >
                {/* Single main Add to Cart button: centered and full-width on mobile */}
                <div className="w-full flex">
                    <div className="w-full max-w-sm mx-auto">
                        <AddToCartButton 
                            product={product} 
                            selectedUnit={selectedUnit || defaultUnit}
                            selectedQuantity={selectedQuantity}
                            selectedProductUnit={selectedProductUnit}
                            pricing={pricing}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Stock Warning */}
            {currentStock <= 5 && currentStock > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.85 }}
                    className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
                >
                    <p className="text-yellow-200 text-sm text-center">
                        ⚠️ Only {currentStock} units left in stock!
                    </p>
                </motion.div>
            )}

            {/* Out of Stock Message */}
            {currentStock === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.85 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                >
                    <p className="text-red-200 text-sm text-center">
                        ❌ This product is currently out of stock
                    </p>
                </motion.div>
            )}

            {/* Additional Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10"
            >
                <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">Free</div>
                    <div className="text-sm text-gray-400">Shipping</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">30 Days</div>
                    <div className="text-sm text-gray-400">Returns</div>
                </div>
            </motion.div>

            {/* AR Modal */}
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