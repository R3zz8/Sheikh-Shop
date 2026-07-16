'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import { getShippingCost, calculateOrderTotal } from '@/lib/shipping';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cart, cartTotals, updateCartItemMutation, removeCartItemMutation } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItemMutation.mutate({ cartItemId: productId as unknown as number });
    } else {
      updateCartItemMutation.mutate({ cartItemId: productId as unknown as number, quantity: newQuantity });
    }
  };

  const getCrossSellProducts = () => {
    return [
      {
        id: 'cross-sell-1',
        name: 'زعفران سرگل ممتاز',
        price: 89000,
        image: '/saffron.jpg',
        category: 'SAFFRON',
      },
      {
        id: 'cross-sell-2',
        name: 'عسل طبیعی کوهستان',
        price: 24900,
        image: '/honey.jpg',
        category: 'HONEY',
      },
    ];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Cart Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-200 font-vazirmatn ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">سبد خرید</h2>
            {cartTotals.itemCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold">
                {cartTotals.itemCount} کالا
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {cartTotals.itemCount === 0 ? (
            // Empty Cart
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                سبد خرید شما خالی است
              </h3>
              <p className="text-gray-500 mb-6">
                برای شروع، محصولات مورد نظر خود را به سبد خرید اضافه کنید.
              </p>
              <Button onClick={handleClose} className="w-full">
                ادامه خرید
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart?.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product.images?.[0]?.image || '/noImage.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                        sizes="64px"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 text-right">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.unit.name} • {formatPrice(item.unitPrice)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            aria-label="کاهش تعداد"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            aria-label="افزایش تعداد"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeCartItemMutation.mutate({ cartItemId: item.productId as unknown as number })}
                          aria-label="حذف"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cross-sell Section */}
              {cartTotals.itemCount > 0 && (
                <div className="border-t p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    شاید این محصولات را هم بپسندید
                  </h3>
                  <div className="space-y-2">
                    {getCrossSellProducts().map((product) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          افزودن
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Summary */}
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>جمع فرعی ({cartTotals.itemCount} کالا)</span>
                  <span className="font-medium">{formatPrice(cartTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>هزینه ارسال</span>
                  <span className="font-medium">
                    {formatPrice(getShippingCost(cartTotals.subtotal))}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>جمع کل</span>
                  <span>{formatPrice(calculateOrderTotal(cartTotals.subtotal))}</span>
                </div>
                
                <div className="space-y-2">
                  <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700">
                    <Link href="/cart" onClick={handleClose}>
                      مشاهده سبد خرید و تسویه حساب
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleClose}>
                    ادامه خرید
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
