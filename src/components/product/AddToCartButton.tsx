'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import type { ProductsWithImages, Unit, ProductUnit } from '@/types';
import { type ResolvedPrice } from '@/lib/product-pricing';
import { useCart } from '@/hooks/useCart';
import { useUserBehavior } from '@/hooks/useUserBehavior';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/currency';
import UpsellSuggestions from './UpsellSuggestions';
import OrderConfirmationModal from './OrderConfirmationModal';

interface AddToCartButtonProps {
    product: ProductsWithImages;
    selectedQuantity: number;
    selectedProductUnit?: ProductUnit | null;
    pricing: ResolvedPrice;
}

export default function AddToCartButton({ 
    product, 
    selectedQuantity, 
    selectedProductUnit,
    pricing 
}: AddToCartButtonProps) {
    const { addToCartMutation } = useCart();
    const { trackAddToCart } = useUserBehavior();
    const [showSuccess, setShowSuccess] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const executeAddToCart = async () => {
        try {
            await addToCartMutation.mutateAsync({
                productId: product.id,
                unitId: selectedProductUnit?.id || product.baseUnitId,
                quantity: selectedQuantity
            });

            // Track add to cart event
            trackAddToCart(
                product.id,
                selectedProductUnit?.id || product.baseUnitId,
                selectedQuantity,
                selectedProductUnit ? Number(selectedProductUnit.price) : product.basePrice
            );

            // Show success state
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const handleAddToCart = () => {
        if ((product as any).requiresOrderConfirmation) {
            setIsConfirmationOpen(true);
            return;
        }
        executeAddToCart();
    };

    // Determine if button should be disabled
    const getCurrentStock = () => {
        if (selectedProductUnit) {
            return selectedProductUnit.stock;
        }
        return product.quantity;
    };

    const currentStock = getCurrentStock();
    const isDisabled = addToCartMutation.isPending || currentStock === 0;

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

            {/* Enhanced Pricing Summary */}
            <div className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-semibold text-center">Order Summary</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Product:</span>
                        <span className="text-white">{product.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-300">Size:</span>
                        <span className="text-white font-medium">
                            {selectedProductUnit?.name || product.baseUnit?.name || 'unit'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-300">Quantity:</span>
                        <span className="text-white">{selectedQuantity}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-300">Price per unit:</span>
                        <span className="text-amber-200 font-medium">
                            {formatPrice(pricing.price, 'EUR')}
                        </span>
                    </div>
                    
                    {pricing.hasDiscount && pricing.oldPrice && (
                        <>
                            <div className="flex justify-between text-green-400">
                                <span>Discount:</span>
                                <span>-{formatPrice(pricing.oldPrice - pricing.price, 'EUR')}</span>
                            </div>
                            <div className="flex justify-between text-green-400">
                                <span>You Save:</span>
                                <span>{pricing.discountPercentage}%</span>
                            </div>
                        </>
                    )}
                    
                    <div className="border-t border-amber-200/20 pt-2">
                        <div className="flex justify-between">
                            <span className="text-white font-semibold">Total:</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                                {formatPrice(pricing.price * selectedQuantity, 'EUR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upsell Suggestions */}
            {selectedProductUnit && product.units && product.units.length > 1 && (
                <UpsellSuggestions 
                    product={product} 
                    selectedUnit={selectedProductUnit} 
                    currency={'EUR'}
                />
            )}

            {/* Stock Warning */}
            {currentStock <= 5 && currentStock > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm text-center">
                        ⚠️ Only {currentStock} units left in stock!
                    </p>
                </div>
            )}

            {/* Out of Stock Message */}
            {currentStock === 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-200 text-sm text-center">
                        ❌ This product is currently out of stock
                    </p>
                </div>
            )}

            {/* Pre-Payment Order Confirmation Modal */}
            <OrderConfirmationModal
                isOpen={isConfirmationOpen}
                onClose={() => setIsConfirmationOpen(false)}
                onConfirmAndProceed={() => {
                    setIsConfirmationOpen(false);
                    executeAddToCart();
                }}
                product={product}
                selectedQuantity={selectedQuantity}
                currentPrice={pricing.price}
            />
        </div>
    );
} 