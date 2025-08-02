'use client';

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUser } from './useUser';

// Types for cart operations
interface AddToCartParams {
  productId: string;
  quantity?: number;
}

interface UpdateCartItemParams {
  cartItemId: number;
  quantity: number;
}

interface RemoveFromCartParams {
  cartItemId: number;
}

export const useCart = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  // Fetch cart data with better error handling and caching
  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      console.log('🛒 Fetching cart data...');
      console.log('👤 User:', user?.email);

      if (!user) {
        console.log('❌ No user found, returning empty cart');
        return [];
      }

      const res = await fetch('/api/cart', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      console.log('📡 Cart API response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          console.log('❌ User not authenticated, returning empty cart');
          return [];
        }
        console.error('❌ Failed to fetch cart:', res.status, res.statusText);
        throw new Error('Failed to fetch cart');
      }

      const cartData = await res.json();
      console.log('✅ Cart data fetched:', cartData);
      return cartData;
    },
    staleTime: 30 * 1000, // Cache for 30 seconds (cart changes frequently)
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    retry: 1,
    enabled: !!user, // Only fetch if user is authenticated
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Add to cart mutation with optimistic updates
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: AddToCartParams) => {
      console.log('🛒 Adding to cart:', { productId, quantity });

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      console.log('📡 Add to cart API response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Add to cart failed:', errorData);
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      const result = await res.json();
      console.log('✅ Add to cart successful:', result);
      return result;
    },
    onMutate: async ({ productId, quantity = 1 }) => {
      console.log('🔄 Optimistic update for:', { productId, quantity });

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update the cart
      queryClient.setQueryData(['cart'], (old: any) => {
        if (!old) return old;

        // Check if item already exists
        const existingItemIndex = old.findIndex((item: any) => item.productId === productId);

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedCart = [...old];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + quantity,
          };
          console.log('🔄 Updated existing item in cart');
          return updatedCart;
        } else {
          // Add new item (we'll need to fetch the product data)
          console.log('🔄 Adding new item to cart (will be updated with server response)');
          return old;
        }
      });

      return { previousCart };
    },
    onError: (error, variables, context) => {
      console.error('❌ Add to cart mutation error:', error);
      // Revert optimistic update
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
      toast.error(error.message || 'Failed to add to cart');
    },
    onSuccess: (data) => {
      console.log('✅ Add to cart mutation success:', data);
      // Update cart with server response
      queryClient.setQueryData(['cart'], (old: any) => {
        if (!old) return [data];

        const existingItemIndex = old.findIndex((item: any) => item.productId === data.productId);

        if (existingItemIndex >= 0) {
          // Replace existing item
          const updatedCart = [...old];
          updatedCart[existingItemIndex] = data;
          console.log('🔄 Replaced existing item in cart');
          return updatedCart;
        } else {
          // Add new item
          console.log('🔄 Added new item to cart');
          return [data, ...old];
        }
      });

      toast.success('Added to cart successfully!');
    },
    onSettled: () => {
      console.log('🔄 Add to cart mutation settled, invalidating queries');
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Update cart item quantity
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: UpdateCartItemParams) => {
      console.log('🛒 Updating cart item:', { cartItemId, quantity });

      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update cart');
      }

      return res.json();
    },
    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update quantity
      queryClient.setQueryData(['cart'], (old: any) => {
        if (!old) return old;
        return old.map((item: any) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
      });

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
      toast.error(error.message || 'Failed to update cart');
    },
    onSuccess: () => {
      toast.success('Cart updated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Remove from cart mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async ({ cartItemId }: RemoveFromCartParams) => {
      console.log('🛒 Removing cart item:', cartItemId);

      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to remove from cart');
      }

      return res.json();
    },
    onMutate: async ({ cartItemId }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically remove item
      queryClient.setQueryData(['cart'], (old: any) => {
        if (!old) return old;
        return old.filter((item: any) => item.id !== cartItemId);
      });

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
      toast.error(error.message || 'Failed to remove from cart');
    },
    onSuccess: () => {
      toast.success('Item removed from cart');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      // Remove all items one by one (or implement a bulk delete endpoint)
      const cartItems = queryClient.getQueryData(['cart']) as any[];
      if (!cartItems) return;

      const deletePromises = cartItems.map((item) =>
        fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemId: item.id }),
        })
      );

      await Promise.all(deletePromises);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically clear cart
      queryClient.setQueryData(['cart'], []);

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
      toast.error('Failed to clear cart');
    },
    onSuccess: () => {
      toast.success('Cart cleared successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Calculate cart totals
  const cartTotals = cart ? {
    itemCount: cart.reduce((total: number, item: any) => total + item.quantity, 0),
    subtotal: cart.reduce((total: number, item: any) => total + (item.product.price * item.quantity), 0),
    uniqueItems: cart.length,
  } : {
    itemCount: 0,
    subtotal: 0,
    uniqueItems: 0,
  };

  console.log('🛒 Cart state:', { cart, cartTotals, isLoading, error });

  return {
    cart,
    isLoading,
    error,
    refetch,
    addToCartMutation,
    updateCartItemMutation,
    removeCartItemMutation,
    clearCartMutation,
    cartTotals,
  };
};
