'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import type { ProductsWithImages, Unit, ProductPricing } from '@/types';
import { useCart } from '@/hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';

interface AddToCartButtonProps {
    product: ProductsWithImages;
    selectedUnit: Unit;
    selectedQuantity: number;
    pricing: ProductPricing;
}

export default function AddToCartButton({ 
    product, 
    selectedUnit, 
    selectedQuantity, 
    pricing 
}: AddToCartButtonProps) {
    const { currency } = useCurrencySafe();
    const { addToCartMutation } = useCart();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddToCart = async () => {
        try {
            await addToCartMutation.mutateAsync({
                productId: product.id,
                quantity: selectedQuantity
            });

            // Show success state
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            // Error handling is done in the mutation
            console.error('Failed to add to cart:', error);
        }
    };

    const isDisabled = addToCartMutation.isPending || product.quantity === 0;

    return (
        <div className="space-y-4">
            {/* Add to Cart Button */}
            <Button
                onClick={handleAddToCart}
                disabled={isDisabled}
                className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white font-semibold border border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg py-3 md:py-6"
                size="lg"
            >
                <AnimatePresence mode="wait">
                    {showSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Added to Cart!
                        </motion.div>
                    ) : addToCartMutation.isPending ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Adding to Cart...
                        </motion.div>
                    ) : (
                        <motion.div
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>

            {/* Pricing Summary */}
            <div className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-semibold text-center">Order Summary</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Product:</span>
                        <span className="text-white">{product.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-300">Unit:</span>
                        <span className="text-white">{selectedQuantity} {selectedUnit.symbol}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-300">Unit Price:</span>
                        <span className="text-white">
                            {pricing.finalPrice / selectedQuantity > 0 
                                ? formatPrice(convertCurrency(pricing.finalPrice / selectedQuantity, 'EUR', currency), currency)
                                : 'Free'
                            }
                        </span>
                    </div>
                    
                    {pricing.hasDiscount && (
                        <>
                            <div className="flex justify-between text-green-400">
                                <span>Discount:</span>
                                <span>-{formatPrice(convertCurrency(pricing.discountAmount, 'EUR', currency), currency)}</span>
                            </div>
                            <div className="flex justify-between text-green-400">
                                <span>You Save:</span>
                                <span>{pricing.discountPercentage.toFixed(1)}%</span>
                            </div>
                        </>
                    )}
                    
                    <div className="border-t border-amber-200/20 pt-2">
                        <div className="flex justify-between">
                            <span className="text-white font-semibold">Total:</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                                {formatPrice(convertCurrency(pricing.finalPrice, 'EUR', currency), currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Warning */}
            {product.quantity <= 5 && product.quantity > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm text-center">
                        ⚠️ Only {product.quantity} units left in stock!
                    </p>
                </div>
            )}

            {/* Out of Stock Message */}
            {product.quantity === 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-200 text-sm text-center">
                        ❌ This product is currently out of stock
                    </p>
                </div>
            )}
        </div>
    );
} 