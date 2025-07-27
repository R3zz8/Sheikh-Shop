'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Button,
} from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { CartWithProduct } from '@/types';
import { ShoppingCart, Trash2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartDropdown() {
  const { cart, isLoading, removeCartItemMutation } = useCart();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "relative w-10 h-10 rounded-xl bg-white/8 backdrop-blur-sm",
            "border border-white/20 text-gray-300 hover:text-white",
            "transition-all duration-300 hover:bg-white/12 hover:border-white/30",
            "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          {cart?.length > 0 && (
            <span className={cn(
              "absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full",
              "bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold",
              "shadow-lg border border-amber-300/30"
            )}>
              {cart.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn(
        "w-80 p-6 bg-white/12 backdrop-blur-2xl border border-white/20",
        "shadow-2xl shadow-amber-900/30 rounded-2xl"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-amber-300" />
          <h4 className="text-lg font-semibold text-white">Shopping Cart</h4>
          {cart?.length > 0 && (
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900"
            )}>
              {cart.length} items
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-300 text-sm">Loading cart...</div>
          </div>
        ) : !cart || cart?.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 text-sm">Your cart is empty</p>
            <p className="text-gray-400 text-xs mt-1">Add some premium products to get started</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {cart?.map((item: CartWithProduct) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  "bg-white/8 backdrop-blur-sm border border-white/15",
                  "hover:bg-white/12 hover:border-white/25 transition-all duration-300"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-amber-300 font-medium">
                      ${(item.product.price || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCartItemMutation.mutate(item.product.id)}
                  className={cn(
                    "w-8 h-8 p-0 rounded-lg bg-white/8 backdrop-blur-sm",
                    "border border-white/20 text-gray-400 hover:text-red-400",
                    "hover:bg-white/12 hover:border-red-400/30 transition-all duration-300"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {cart && cart.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Total:</span>
              <span className="text-lg font-semibold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                ${cart.reduce((total: number, item: CartWithProduct) => total + ((item.product.price || 0) * item.quantity), 0).toFixed(2)}
              </span>
            </div>
            <Button className={cn(
              "w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600",
              "hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700",
              "text-white font-semibold py-2 px-4 rounded-xl border border-amber-500/30",
              "shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300",
              "transform hover:-translate-y-0.5 backdrop-blur-sm"
            )}>
              <Sparkles className="w-4 h-4 mr-2" />
              Checkout
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
