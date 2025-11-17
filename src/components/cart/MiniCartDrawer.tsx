'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import type { CartWithProduct } from '@/types';
import { formatPrice } from '@/lib/currency';

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CrossSellProduct {
  id: string;
  name: string;
  basePrice: number;
  images: Array<{ image: string }>;
  category: string;
  isBestSeller?: boolean;
  isAmazing?: boolean;
}

export default function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const { cart, cartTotals, updateCartItem, removeFromCart } = useCart();
  const [crossSellProducts, setCrossSellProducts] = useState<CrossSellProduct[]>([]);
  const [isLoadingCrossSell, setIsLoadingCrossSell] = useState(false);

  // Fetch cross-sell products
  useEffect(() => {
    const fetchCrossSellProducts = async () => {
      if (!isOpen || cart.length === 0) return;
      
      setIsLoadingCrossSell(true);
      try {
        const response = await fetch('/api/products/cross-sell');
        if (response.ok) {
          const data = await response.json();
          setCrossSellProducts(data.products || []);
        }
      } catch (error) {
        console.error('Failed to fetch cross-sell products:', error);
      } finally {
        setIsLoadingCrossSell(false);
      }
    };

    fetchCrossSellProducts();
  }, [isOpen, cart]);

  const handleQuantityChange = async (productId: string, unitId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId, unitId);
    } else {
      await updateCartItem(productId, unitId, newQuantity);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Shopping Cart
                </h2>
                {cartTotals.itemCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {cartTotals.itemCount}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Link href="/products">
                    <Button className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item: CartWithProduct) => (
                    <div key={`${item.productId}-${item.unitId}`} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.product.images?.[0]?.image || '/noImage.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item.unit.name} • {formatPrice(item.unitPrice)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.unitId, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.unitId, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                {/* Cart Summary */}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cartTotals.subtotal)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link href="/checkout" className="block">
                    <Button className="w-full" onClick={onClose}>
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/cart" className="block">
                    <Button variant="outline" className="w-full" onClick={onClose}>
                      View Full Cart
                    </Button>
                  </Link>
                </div>

                {/* Cross-sell Products */}
                {crossSellProducts.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      You might also like
                    </h3>
                    <div className="space-y-2">
                      {crossSellProducts.slice(0, 2).map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${(product as any).slug || product.id}`}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={onClose}
                        >
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={product.images[0]?.image || '/noImage.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                              sizes="48px"
                            />
                            {product.isBestSeller && (
                              <div className="absolute -top-1 -right-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatPrice(product.basePrice)}
                            </p>
                          </div>
                          {product.isAmazing && (
                            <Badge variant="destructive" className="text-xs">
                              Amazing Deal
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}





