'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ProductsWithImages } from '@/types';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface AddToCartButtonProps {
    product: ProductsWithImages;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addToCartMutation } = useCart();

    const handleAddToCart = async () => {
        if (product.quantity === 0) {
            toast.error('This product is out of stock');
            return;
        }

        if (quantity > product.quantity) {
            toast.error(`Only ${product.quantity} units available`);
            return;
        }

        setIsAdding(true);
        try {
            // Add to cart with quantity
            for (let i = 0; i < quantity; i++) {
                await addToCartMutation.mutateAsync(product.id);
            }

            toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
            setQuantity(1); // Reset quantity
        } catch (error) {
            toast.error('Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= product.quantity) {
            setQuantity(newQuantity);
        }
    };

    const isOutOfStock = product.quantity === 0;

    return (
        <div className="space-y-4">
            {/* Quantity Selector */}
            {!isOutOfStock && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex items-center gap-4"
                >
                    <span className="text-white font-medium">Quantity:</span>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="w-8 h-8 p-0 text-white hover:bg-white/20"
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center text-white font-medium">
                            {quantity}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= product.quantity}
                            className="w-8 h-8 p-0 text-white hover:bg-white/20"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <span className="text-gray-400 text-sm">
                        {product.quantity} available
                    </span>
                </motion.div>
            )}

            {/* Add to Cart Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
            >
                <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`
            w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300
            ${isOutOfStock
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transform hover:-translate-y-0.5'
                        }
            focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2
          `}
                >
                    {isAdding ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                    ) : isOutOfStock ? (
                        <>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Out of Stock
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Add to Cart
                        </>
                    )}
                </Button>
            </motion.div>

            {/* Success State */}
            {addToCartMutation.isSuccess && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-green-400 font-medium"
                >
                    <Check className="w-5 h-5" />
                    Added to cart successfully!
                </motion.div>
            )}

            {/* Error State */}
            {addToCartMutation.isError && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-red-400 font-medium"
                >
                    Failed to add to cart. Please try again.
                </motion.div>
            )}
        </div>
    );
} 