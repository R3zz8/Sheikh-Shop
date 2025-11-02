# Cart System Documentation

## Overview

The Sheikh Shop cart system provides a complete shopping cart experience with real-time updates, quantity management, and seamless checkout integration. The system uses React Query for state management, optimistic updates for instant UI feedback, and JWT-based authentication for secure cart operations.

## Table of Contents

1. [Architecture](#architecture)
2. [Data Flow](#data-flow)
3. [API Endpoints](#api-endpoints)
4. [State Management](#state-management)
5. [Cart Operations](#cart-operations)
6. [Checkout Integration](#checkout-integration)
7. [Currency Handling](#currency-handling)
8. [Error Handling](#error-handling)
9. [Testing Guide](#testing-guide)

## Architecture

### Components

- **`useCart` Hook**: Central state management and API interaction
- **Cart API Routes** (`/api/cart`): Backend CRUD operations
- **Cart Components**: UI components for cart display and interaction
- **Checkout Page**: Order summary and checkout flow

### Technology Stack

- **React Query**: Server state management and caching
- **Optimistic Updates**: Instant UI feedback before server confirmation
- **Prisma**: Database operations
- **JWT Authentication**: Secure cart operations
- **Next.js API Routes**: RESTful cart endpoints

## Data Flow

### Adding to Cart

```
User clicks "Add to Cart"
  ↓
AddToCartButton component
  ↓
useCart.addToCartMutation
  ↓
Optimistic UI update (immediate)
  ↓
POST /api/cart
  ↓
Server validates & persists
  ↓
Success: Update cart with server data
  ↓
Error: Revert optimistic update + show error
```

### Updating Quantity

```
User clicks increment/decrement
  ↓
useCart.incrementQuantity/decrementQuantity
  ↓
Optimistic UI update
  ↓
PUT /api/cart (with new quantity)
  ↓
Server validates stock & updates
  ↓
If quantity = 0: Auto-remove item
  ↓
Success: Confirm update
  ↓
Error: Revert + show error
```

### Removing Items

```
User clicks remove
  ↓
useCart.removeCartItemById
  ↓
Optimistic removal from UI
  ↓
DELETE /api/cart
  ↓
Server removes from database
  ↓
Success: Confirm removal
  ↓
Error: Revert + show error
```

## API Endpoints

### GET `/api/cart`

Fetch user's cart items.

**Authentication**: Required (access-token, refresh-token, or session-token)

**Response**:
```json
[
  {
    "id": 1,
    "userId": "user123",
    "productId": "prod456",
    "unitId": "unit789",
    "quantity": 2,
    "unitPrice": 89.99,
    "product": {
      "id": "prod456",
      "name": "Premium Saffron",
      "basePrice": 89.99,
      "images": [...],
      "units": [...]
    },
    "unit": {
      "id": "unit789",
      "name": "1g",
      "symbol": "g"
    }
  }
]
```

### POST `/api/cart`

Add item to cart or update quantity if item exists.

**Authentication**: Required

**Request Body**:
```json
{
  "productId": "prod456",
  "unitId": "unit789",  // Optional
  "quantity": 1         // Optional, defaults to 1
}
```

**Response**: Cart item object (same structure as GET response)

**Behavior**:
- If item with same `productId` + `unitId` exists, quantity is incremented
- Otherwise, creates new cart item
- Validates stock availability
- Checks product is active

### PUT `/api/cart`

Update cart item quantity.

**Authentication**: Required

**Request Body**:
```json
{
  "cartItemId": 1,
  "quantity": 3
}
```

**Response**: Updated cart item object

**Behavior**:
- If `quantity === 0`: Automatically removes item from cart
- If `quantity < 0`: Returns 400 error
- Validates stock availability
- Returns 404 if cart item not found or doesn't belong to user

### DELETE `/api/cart`

Remove item from cart.

**Authentication**: Required

**Request Body**:
```json
{
  "cartItemId": 1
}
```

**Response**:
```json
{
  "success": true
}
```

**Behavior**:
- Validates item belongs to user
- Returns 404 if item not found

## State Management

### Cart State Structure

```typescript
{
  cart: CartItem[],              // Array of cart items
  isLoading: boolean,            // Loading state
  error: Error | null,           // Error state
  cartTotals: {
    itemCount: number,            // Total quantity of all items
    subtotal: number,             // Sum of all item totals (EUR)
    uniqueItems: number           // Number of unique products
  }
}
```

### React Query Configuration

```typescript
{
  queryKey: ['cart', user?.id],
  staleTime: 30 * 1000,          // 30 seconds
  gcTime: 2 * 60 * 1000,          // 2 minutes
  retry: 1,
  enabled: !!user,                 // Only fetch if authenticated
  refetchOnWindowFocus: false
}
```

### Optimistic Updates

All mutations use optimistic updates for instant UI feedback:

1. **onMutate**: Update cache optimistically
2. **onSuccess**: Confirm with server data
3. **onError**: Revert optimistic update
4. **onSettled**: Invalidate and refetch

## Cart Operations

### Available Operations

#### `addToCartMutation`
Adds item to cart or increments quantity if exists.

```typescript
addToCartMutation.mutate({
  productId: 'prod123',
  unitId: 'unit456',  // Optional
  quantity: 1         // Optional
});
```

#### `incrementQuantity`
Increments quantity by 1.

```typescript
incrementQuantity(cartItemId);
```

#### `decrementQuantity`
Decrements quantity by 1. Auto-removes if reaches 0.

```typescript
decrementQuantity(cartItemId);
```

#### `updateCartItemMutation`
Updates quantity to specific value.

```typescript
updateCartItemMutation.mutate({
  cartItemId: 1,
  quantity: 5
});
```

#### `removeCartItemById`
Removes item from cart.

```typescript
removeCartItemById(cartItemId);
```

#### `clearCart`
Removes all items from cart.

```typescript
clearCart();
```

### Quantity Control Helpers

The `useCart` hook provides convenient helpers:

```typescript
const {
  incrementQuantity,    // Increment by 1
  decrementQuantity,    // Decrement by 1 (auto-removes at 0)
  removeCartItemById,   // Remove specific item
  clearCart             // Clear all items
} = useCart();
```

## Checkout Integration

### Checkout Page Flow

1. **Load Cart**: Fetches current cart using `useCart` hook
2. **Validate**: Redirects to `/cart` if empty
3. **Display**: Shows cart items with correct quantities and prices
4. **Calculate**: Computes subtotal, shipping, tax, and total
5. **Order Placement**: (TODO) Submit order to backend

### Checkout Calculations

```typescript
const subtotal = cartTotals.subtotal;    // Sum of all items (EUR)
const shipping = subtotal > 0 ? 9.99 : 0; // Shipping fee
const tax = subtotal * 0.08;              // 8% tax rate
const total = subtotal + shipping + tax; // Final total
```

### Currency Formatting

All prices displayed in EUR using `formatPrice`:

```typescript
import { formatPrice } from '@/lib/currency';

formatPrice(89.99, 'EUR'); // "€89.99"
```

## Currency Handling

### Base Currency

**EUR (Euro)** is the base currency for all cart calculations:
- Product prices stored in EUR
- Cart totals calculated in EUR
- Checkout displays EUR

### Price Calculation

Cart uses `unitPrice` (price at time of adding to cart) for calculations:

```typescript
const itemTotal = item.unitPrice * item.quantity;
const subtotal = cart.reduce((sum, item) => 
  sum + (item.unitPrice * item.quantity), 0
);
```

**Fallback**: If `unitPrice` is not available, uses `product.basePrice`.

### Currency Display

```typescript
import { formatPrice } from '@/lib/currency';

// Always use EUR for cart
formatPrice(price, 'EUR');
```

## Error Handling

### Authentication Errors (401)

- **Detection**: Response status 401 or error message contains "401" or "Unauthorized"
- **Action**: 
  - Clear user state
  - Show error toast
  - Redirect to login page after 1.5 seconds

### Stock Validation Errors

- **Backend**: Returns 400 with "Insufficient stock" message
- **Frontend**: Shows error toast, reverts optimistic update

### Network Errors

- **Retry**: Automatic retry (1 attempt)
- **Fallback**: Shows error message, reverts optimistic update

### Optimistic Update Reversion

All mutations maintain a snapshot of the previous cart state:

```typescript
onMutate: async (...) => {
  const previousCart = queryClient.getQueryData(['cart']);
  // ... optimistic update
  return { previousCart };
},
onError: (error, variables, context) => {
  if (context?.previousCart) {
    queryClient.setQueryData(['cart'], context.previousCart);
  }
}
```

## Testing Guide

### Manual Testing Checklist

#### 1. Add to Cart Flow
- [ ] Add product to cart
- [ ] Verify item appears in cart
- [ ] Check quantity is correct
- [ ] Verify price calculation (unitPrice × quantity)

#### 2. Quantity Updates
- [ ] Increment quantity
- [ ] Verify UI updates immediately
- [ ] Verify quantity persists on refresh
- [ ] Decrement quantity
- [ ] Decrement to 0 (should auto-remove)

#### 3. Remove Items
- [ ] Remove single item
- [ ] Verify item disappears
- [ ] Verify totals recalculate

#### 4. Clear Cart
- [ ] Clear all items
- [ ] Verify cart is empty
- [ ] Verify checkout is disabled

#### 5. Checkout Flow
- [ ] Navigate to checkout
- [ ] Verify cart items displayed correctly
- [ ] Verify quantities match cart
- [ ] Verify subtotal calculation
- [ ] Verify shipping calculation
- [ ] Verify tax calculation (8%)
- [ ] Verify total calculation
- [ ] Verify all prices in EUR format

#### 6. Currency Consistency
- [ ] All cart prices in EUR
- [ ] Checkout prices in EUR
- [ ] No USD placeholders visible

#### 7. State Persistence
- [ ] Add items, refresh page, verify items persist
- [ ] Update quantity, refresh, verify quantity persists
- [ ] Navigate between pages, verify cart state

#### 8. Empty Cart Handling
- [ ] Empty cart redirects from checkout
- [ ] Empty cart shows empty state message
- [ ] Cannot proceed to checkout with empty cart

### Integration Testing

```typescript
// Example test structure
describe('Cart System', () => {
  test('adds item to cart', async () => {
    // Test implementation
  });
  
  test('updates quantity', async () => {
    // Test implementation
  });
  
  test('removes item', async () => {
    // Test implementation
  });
  
  test('clears cart', async () => {
    // Test implementation
  });
  
  test('calculates totals correctly', () => {
    // Test implementation
  });
});
```

## Best Practices

### 1. Always Use `credentials: 'include'`

All fetch calls must include cookies:

```typescript
fetch('/api/cart', {
  credentials: 'include',
  // ...
});
```

### 2. Use Optimistic Updates

Provide instant feedback before server confirmation.

### 3. Handle Errors Gracefully

Always revert optimistic updates on error and show user-friendly messages.

### 4. Validate on Server

Client-side validation is for UX, server validation is for security.

### 5. Use `unitPrice` for Calculations

Always use the price stored at cart item creation time, not current product price.

### 6. Consistent Currency

Always use EUR and `formatPrice` utility for currency display.

## Troubleshooting

### Issue: Cart doesn't update after adding item

**Possible Causes**:
- Missing `credentials: 'include'` in fetch
- Query not invalidated after mutation
- React Query cache not updating

**Solution**:
- Check fetch includes `credentials: 'include'`
- Verify `onSettled` invalidates queries
- Check browser network tab for API responses

### Issue: Quantity doesn't update

**Possible Causes**:
- Mutation not calling correct endpoint
- Optimistic update incorrect
- Server response not handled

**Solution**:
- Check mutation function
- Verify optimistic update logic
- Check server response structure

### Issue: Items disappear on refresh

**Possible Causes**:
- Not authenticated
- Token expired
- Database query issue

**Solution**:
- Check authentication state
- Verify token is valid
- Check server logs for errors

### Issue: Wrong totals in checkout

**Possible Causes**:
- Using `basePrice` instead of `unitPrice`
- Currency conversion issue
- Calculation error

**Solution**:
- Verify using `unitPrice` for calculations
- Check currency formatting
- Verify calculation logic

## Future Enhancements

1. **Auto-save**: Save cart to database on every change
2. **Guest Cart**: Support cart for non-authenticated users
3. **Cart Sharing**: Share cart with others
4. **Saved Carts**: Save multiple carts for later
5. **Price Alerts**: Notify when cart item prices change
6. **Stock Alerts**: Notify when items back in stock
7. **Cart Expiration**: Auto-remove items after inactivity period
8. **Bulk Operations**: Add/remove multiple items at once

## Related Documentation

- [Authentication System](./auth.md)
- [API Documentation](../README.md)
- [Currency System](../CURRENCY_SYSTEM_DOCUMENTATION.md)

