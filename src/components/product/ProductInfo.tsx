'use client';

import { motion } from 'framer-motion';
import { Star, Package, Tag } from 'lucide-react';
import type { ProductsWithImages, Unit } from '@/types';
import AddToCartButton from './AddToCartButton';
import UnitSelector from '@/components/ui/UnitSelector';
import DiscountBadge from '@/components/ui/DiscountBadge';
import ProductBadge from '@/components/ui/ProductBadge';
import { calculateFinalPricing, formatPrice } from '@/lib/pricing';
import { useState } from 'react';

interface ProductInfoProps {
    product: ProductsWithImages;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const [selectedUnit, setSelectedUnit] = useState<Unit>(product.baseUnit);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    // Get available units (you might want to fetch this from an API)
    const availableUnits: Unit[] = [
        { id: '1', name: 'Gram', symbol: 'g', multiplier: 0.001, isActive: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Kilogram', symbol: 'kg', multiplier: 1.0, isActive: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'Package', symbol: 'pkg', multiplier: 1.0, isActive: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
    ];

    // Calculate pricing with discounts
    const pricing = calculateFinalPricing(
        product.basePrice,
        selectedUnit,
        selectedQuantity,
        product.discounts
    );

    // Simulate rating data (in real app, this would come from database)
    const rating = 4.8;
    const reviewCount = 124;
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-400' };
        if (quantity <= 5) return { text: 'Low Stock', color: 'text-yellow-400' };
        return { text: 'In Stock', color: 'text-green-400' };
    };

    const stockStatus = getStockStatus(product.quantity);

    return (
        <div className="space-y-8">
            {/* Product Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent leading-tight">
                    {product.name}
                </h1>
            </motion.div>

            {/* Product Badges */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
            >
                <ProductBadge 
                    isNew={product.isNew}
                    isBestSeller={product.isBestSeller}
                    size="lg"
                />
            </motion.div>

            {/* Price Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
            >
                <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                        {/* Final Price */}
                        <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                            {formatPrice(pricing.finalPrice)}
                        </span>
                        
                        {/* Original Price with line-through if discounted */}
                        {pricing.hasDiscount && (
                            <span className="text-lg text-gray-400 line-through">
                                {formatPrice(pricing.originalPrice)}
                            </span>
                        )}
                    </div>
                    
                    {/* Unit Display */}
                    <p className="text-lg text-amber-200/80">
                        per {selectedUnit.symbol}
                    </p>
                </div>

                {/* Discount Badge */}
                {pricing.hasDiscount && (
                    <DiscountBadge 
                        discount={{
                            type: product.discounts[0]?.discountType || 'PERCENTAGE',
                            value: product.discounts[0]?.value || 0,
                            amount: pricing.discountAmount,
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

            {/* Category Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="text-gray-200 font-medium">{product.category}</span>
                </div>
            </motion.div>

            {/* Stock Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-2"
            >
                <Package className="w-5 h-5 text-gray-400" />
                <span className={`font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                    {product.quantity} units available
                </span>
            </motion.div>

            {/* Unit Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
            >
                <UnitSelector
                    units={availableUnits}
                    basePrice={product.basePrice}
                    baseUnit={product.baseUnit}
                    selectedUnit={selectedUnit}
                    selectedQuantity={selectedQuantity}
                    onUnitChange={setSelectedUnit}
                    onQuantityChange={setSelectedQuantity}
                    showPriceCalculation={true}
                />
            </motion.div>

            {/* Description */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-3"
            >
                <h3 className="text-xl font-semibold text-white">Description</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
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
                <AddToCartButton 
                    product={product} 
                    selectedUnit={selectedUnit}
                    selectedQuantity={selectedQuantity}
                    pricing={pricing}
                />
            </motion.div>

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
        </div>
    );
} 