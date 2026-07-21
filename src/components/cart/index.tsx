'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Button,
} from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import type { CartWithProduct } from '@/types';
import { ShoppingCart, Trash2, Sparkles, Plus, Minus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';
import { getShippingCost, calculateOrderTotal } from '@/lib/shipping';
import EstimatedDelivery from '@/components/shipping/EstimatedDelivery';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDropdown() {
  const {
    cart,
    isLoading,
    incrementQuantity,
    decrementQuantity,
    removeCartItemById,
    clearCart,
    cartTotals
  } = useCart();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="باز کردن سبد خرید"
          className={cn(
            'relative w-10 h-10 rounded-xl bg-white/8 backdrop-blur-sm',
            'border border-white/20 text-gray-300 hover:text-white',
            'transition-all duration-300 hover:bg-white/12 hover:border-white/30',
            'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartTotals.itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center rounded-full',
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold',
                'shadow-lg border border-amber-300/30',
              )}
            >
              {cartTotals.itemCount > 99 ? '۹۹+' : cartTotals.itemCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn(
        'w-96 p-6 bg-white/12 backdrop-blur-2xl border border-white/20',
        'shadow-2xl shadow-amber-900/30 rounded-2xl font-vazirmatn',
      )} align="end">
        <div className="flex items-center justify-between mb-4" dir="rtl">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-300" />
            <h4 className="text-lg font-semibold text-white">سبد خرید</h4>
            {cartTotals.uniqueItems > 0 && (
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-semibold',
                'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900',
              )}>
                {cartTotals.uniqueItems} کالا
              </span>
            )}
          </div>
          {cart && cart.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              پاک کردن همه
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-300 text-sm">در حال بارگذاری سبد خرید...</div>
          </div>
        ) : !cart || cart?.length === 0 ? (
          <div className="text-center py-8" dir="rtl">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 text-sm">سبد خرید شما خالی است</p>
            <p className="text-gray-400 text-xs mt-1">برای شروع، محصولات مورد نظر خود را به سبد خرید اضافه کنید.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto" dir="rtl">
            <AnimatePresence>
              {cart?.map((item: CartWithProduct) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl',
                    'bg-white/8 backdrop-blur-sm border border-white/15',
                    'hover:bg-white/12 hover:border-white/25 transition-all duration-300',
                  )}
                >
                  {/* Product Image */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={(item.product as any).images?.[0]?.image || '/assets/noImage.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-amber-300 font-medium">
                      {formatPrice(item.unitPrice || item.product.basePrice)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => decrementQuantity(Number(item.id))}
                      aria-label="کاهش تعداد"
                      className="w-6 h-6 p-0 rounded-md bg-white/8 backdrop-blur-sm border border-white/20 text-gray-400 hover:text-white hover:bg-white/12"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    <span className="text-sm text-white font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => incrementQuantity(Number(item.id))}
                      aria-label="افزایش تعداد"
                      className="w-6 h-6 p-0 rounded-md bg-white/8 backdrop-blur-sm border border-white/20 text-gray-400 hover:text-white hover:bg-white/12"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Item Total */}
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-amber-300">
                      {formatPrice((item.unitPrice || item.product.basePrice) * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCartItemById(Number(item.id))}
                    aria-label="حذف کالا"
                    className={cn(
                      'w-6 h-6 p-0 rounded-md bg-white/8 backdrop-blur-sm',
                      'border border-white/20 text-gray-400 hover:text-red-400',
                      'hover:bg-white/12 hover:border-red-400/30 transition-all duration-300',
                    )}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {cart && cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-white/10 space-y-2.5"
            dir="rtl"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>جمع کالاها:</span>
              <span className="font-medium text-gray-300">{formatPrice(cartTotals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>هزینه ارسال:</span>
              <span className="font-medium text-gray-300">{formatPrice(cartTotals.shippingTotal)}</span>
            </div>

            <EstimatedDelivery variant="glass" className="my-1.5" />

            <div className="flex items-center justify-between pt-1 border-t border-white/5 mb-3">
              <span className="text-sm text-gray-300">مبلغ قابل پرداخت:</span>
              <span className="text-lg font-semibold bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">
                {formatPrice(cartTotals.subtotal + cartTotals.shippingTotal)}
              </span>
            </div>
            <Button asChild className={cn(
              'w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600',
              'hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700',
              'text-white font-semibold py-2 px-4 rounded-xl border border-amber-500/30',
              'shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300',
              'transform hover:-translate-y-0.5 backdrop-blur-sm flex items-center justify-center gap-2',
            )}>
              <Link href="/checkout">
                <Sparkles className="w-4 h-4" />
                ادامه برای تسویه حساب
              </Link>
            </Button>
          </motion.div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
