# 🚫 Next.js 13+ App Router: Server Component Event Handler Error Guide

## Overview
This guide addresses the **"Event handlers cannot be passed to Client Component props"** error that occurred in your project and provides comprehensive best practices to prevent similar issues in the future.

## 🐛 **Error Analysis**

### **Original Error:**
```
Runtime Error: Event handlers cannot be passed to Client Component props.
Server.

Event handlers cannot be passed to Client Component props.
If you need interactivity, consider converting part of this to a Client Component.
```

### **Root Cause:**
The error was caused by trying to use **event handlers** (like `onClick`) in a **Server Component**. In Next.js 13+ App Router:

- **Server Components** run on the server and cannot have interactive elements
- **Client Components** run in the browser and can handle events
- **Event handlers** like `onClick`, `onChange`, `onSubmit` are browser-only APIs

### **Problematic Code:**
```typescript
// ❌ INCORRECT - Server Component with event handler
export default async function Products() {
  // ... async server code ...
  
  return (
    <div>
      <button onClick={() => window.location.reload()}> {/* ❌ This causes the error */}
        Try Again
      </button>
    </div>
  );
}
```

### **Corrected Approach:**
```typescript
// ✅ CORRECT - Server Component without event handlers
export default async function Products() {
  // ... async server code ...
  
  return (
    <div>
      <p>Please refresh the page to try again.</p> {/* ✅ No event handlers */}
    </div>
  );
}
```

## 🛠️ **Immediate Fix Applied**

### **1. Removed Event Handler from Server Component:**
- **File**: `src/app/products/page.tsx`
- **Change**: Removed `onClick={() => window.location.reload()}` button
- **Result**: Server Component now renders without interactive elements

### **2. Created Proper Error Boundary:**
- **File**: `src/app/products/error.tsx`
- **Purpose**: Handles errors with proper Client Component event handlers
- **Features**: Interactive buttons, error details, proper error handling

### **3. Enhanced Error Handling:**
- Better error messages for users
- Developer-friendly error details
- Proper separation of Server and Client concerns

## 🚀 **Best Practices to Prevent Future Errors**

### **1. Understanding Next.js 13+ App Router Architecture**

#### **Server Components (Default):**
```typescript
// ✅ Server Component - No 'use client' directive
export default async function ServerComponent() {
  // Can use:
  // - Server-side APIs (Prisma, file system, etc.)
  // - Async/await
  // - Server-only libraries
  
  // Cannot use:
  // - useState, useEffect, onClick, etc.
  // - Browser APIs (window, document, localStorage)
  // - Event handlers
  
  return <div>Static content from server</div>;
}
```

#### **Client Components:**
```typescript
'use client'; // ✅ Must have this directive

import { useState, useEffect } from 'react';

export default function ClientComponent() {
  // Can use:
  // - React hooks (useState, useEffect, etc.)
  // - Event handlers (onClick, onChange, etc.)
  // - Browser APIs
  
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### **2. Proper Error Handling Patterns**

#### **Option 1: Error Boundary Components (Recommended)**
```typescript
// src/app/products/error.tsx
'use client';

import React from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({ error, reset }: ErrorProps) {
  return (
    <div>
      <h1>Something went wrong!</h1>
      <button onClick={reset}>Try Again</button> {/* ✅ Event handler in Client Component */}
      <button onClick={() => window.location.href = '/'}>Go Home</button>
    </div>
  );
}
```

#### **Option 2: Try-Catch in Server Components**
```typescript
// src/app/products/page.tsx
export default async function Products() {
  try {
    const data = await prisma.product.findMany({ /* ... */ });
    return <ProductListView products={data} />;
  } catch (error) {
    // ✅ No event handlers - just display error message
    return (
      <div>
        <h1>Error Loading Products</h1>
        <p>Please refresh the page to try again.</p>
        {/* No onClick handlers here */}
      </div>
    );
  }
}
```

#### **Option 3: Hybrid Approach**
```typescript
// Server Component for data fetching
export default async function Products() {
  try {
    const data = await prisma.product.findMany({ /* ... */ });
    return <ProductListView products={data} />;
  } catch (error) {
    // Pass error to Client Component for handling
    return <ProductsErrorHandler error={error} />;
  }
}

// Client Component for error handling
'use client';
function ProductsErrorHandler({ error }: { error: Error }) {
  return (
    <div>
      <h1>Error</h1>
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  );
}
```

### **3. Component Architecture Best Practices**

#### **Server-First Design:**
```typescript
// ✅ GOOD: Server Component fetches data, Client Component handles UI
export default async function ProductsPage() {
  const products = await fetchProducts();
  
  return (
    <div>
      <ProductsHeader /> {/* Server Component */}
      <ProductsList products={products} /> {/* Client Component */}
      <ProductsFooter /> {/* Server Component */}
    </div>
  );
}

// Client Component for interactive features
'use client';
function ProductsList({ products }: { products: Product[] }) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  return (
    <div>
      <input 
        onChange={(e) => filterProducts(e.target.value)} 
        placeholder="Search products..."
      />
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### **Avoiding Common Pitfalls:**
```typescript
// ❌ DON'T: Mix Server and Client concerns in one component
export default async function BadComponent() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      <button onClick={() => handleClick()}> {/* ❌ Event handler in Server Component */}
        Click me
      </button>
    </div>
  );
}

// ✅ DO: Separate concerns
export default async function GoodComponent() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      <InteractiveButton /> {/* Client Component */}
    </div>
  );
}

'use client';
function InteractiveButton() {
  return (
    <button onClick={() => handleClick()}>
      Click me
    </button>
  );
}
```

### **4. File Structure Best Practices**

#### **Recommended Structure:**
```
src/app/products/
├── page.tsx           # Server Component (main page)
├── error.tsx          # Client Component (error handling)
├── loading.tsx        # Server Component (loading state)
├── not-found.tsx      # Server Component (404)
└── _components/       # Shared components
    ├── ProductList.tsx    # Client Component (interactive)
    ├── ProductCard.tsx    # Client Component (interactive)
    └── ProductHeader.tsx  # Server Component (static)
```

#### **Component Naming Conventions:**
```typescript
// Server Components (no 'use client')
- page.tsx
- layout.tsx
- loading.tsx
- error.tsx
- not-found.tsx
- ComponentName.tsx (when no interactivity needed)

// Client Components (with 'use client')
- InteractiveComponentName.tsx
- FormComponentName.tsx
- ButtonComponentName.tsx
- ModalComponentName.tsx
```

### **5. Development Tools & Validation**

#### **ESLint Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended'
  ],
  rules: {
    // Prevent event handlers in Server Components
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    
    // Enforce proper component usage
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

#### **TypeScript Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "preserve"
  }
}
```

### **6. Testing & Validation Strategies**

#### **Component Testing:**
```typescript
// __tests__/components/ProductsPage.test.tsx
import { render, screen } from '@testing-library/react';
import ProductsPage from '@/app/products/page';

describe('ProductsPage', () => {
  it('should render without event handlers in Server Component', () => {
    render(<ProductsPage />);
    
    // Should not find interactive elements in Server Component
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('input')).not.toBeInTheDocument();
  });
  
  it('should display products when data is available', () => {
    // Mock Prisma response
    // Test rendering logic
  });
});
```

#### **Error Boundary Testing:**
```typescript
// __tests__/components/ProductsError.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsError from '@/app/products/error';

describe('ProductsError', () => {
  const mockError = new Error('Test error');
  const mockReset = jest.fn();
  
  it('should render error message and interactive buttons', () => {
    render(<ProductsError error={mockError} reset={mockReset} />);
    
    expect(screen.getByText('Failed to Load Products')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Home' })).toBeInTheDocument();
  });
  
  it('should call reset function when Try Again is clicked', () => {
    render(<ProductsError error={mockError} reset={mockReset} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(mockReset).toHaveBeenCalled();
  });
});
```

### **7. Common Patterns & Solutions**

#### **Form Handling:**
```typescript
// ❌ DON'T: Handle form submission in Server Component
export default async function BadForm() {
  const handleSubmit = (e: FormEvent) => { /* ❌ Event handler */ };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ DO: Use Client Component for forms
export default function GoodForm() {
  return <FormComponent />;
}

'use client';
function FormComponent() {
  const handleSubmit = (e: FormEvent) => { /* ✅ Event handler in Client Component */ };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### **State Management:**
```typescript
// ❌ DON'T: Use React hooks in Server Component
export default async function BadComponent() {
  const [state, setState] = useState(); /* ❌ Hook in Server Component */
  
  return <div>{state}</div>;
}

// ✅ DO: Use Client Component for state
export default function GoodComponent() {
  return <StatefulComponent />;
}

'use client';
function StatefulComponent() {
  const [state, setState] = useState(); /* ✅ Hook in Client Component */
  
  return <div>{state}</div>;
}
```

#### **Event Listeners:**
```typescript
// ❌ DON'T: Add event listeners in Server Component
export default async function BadComponent() {
  useEffect(() => { /* ❌ Effect in Server Component */
    window.addEventListener('resize', handleResize);
  }, []);
  
  return <div>Content</div>;
}

// ✅ DO: Use Client Component for event listeners
export default function GoodComponent() {
  return <EventListenerComponent />;
}

'use client';
function EventListenerComponent() {
  useEffect(() => { /* ✅ Effect in Client Component */
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>Content</div>;
}
```

## 🔍 **Debugging Tools & Commands**

### **Development Commands:**
```bash
# Check for build errors
npm run build

# Run development server with error checking
npm run dev

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Run tests
npm run test
```

### **Common Error Messages & Solutions:**
```typescript
// Error: "Event handlers cannot be passed to Client Component props"
// Solution: Move event handlers to Client Components

// Error: "useState is not a function"
// Solution: Add 'use client' directive

// Error: "window is not defined"
// Solution: Use Client Component or check for window availability

// Error: "localStorage is not defined"
// Solution: Use Client Component or check for localStorage availability
```

## 📚 **Additional Resources**

### **Documentation:**
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Server Components vs Client Components](https://nextjs.org/docs/getting-started/react-essentials#server-components)
- [Error Handling in App Router](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

### **Community:**
- [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)
- [Next.js Discord](https://discord.gg/nextjs)
- [Stack Overflow - Next.js Tag](https://stackoverflow.com/questions/tagged/next.js)

## 🏁 **Summary**

The **"Event handlers cannot be passed to Client Component props"** error was caused by trying to use interactive elements (like `onClick` buttons) in a Server Component. This has been fixed by:

1. **Removing Event Handlers**: Eliminated `onClick` from Server Component
2. **Proper Error Boundaries**: Created `error.tsx` for handling errors with Client Components
3. **Architecture Separation**: Clear distinction between Server and Client concerns

### **Key Takeaways:**
- ✅ **Server Components**: Handle data fetching, no interactivity
- ✅ **Client Components**: Handle user interactions, events, state
- ✅ **Error Boundaries**: Use `error.tsx` for proper error handling
- ✅ **File Structure**: Follow Next.js 13+ App Router conventions
- ✅ **Testing**: Validate component behavior and error handling
- ✅ **Development Tools**: Use ESLint, TypeScript, and proper linting

### **Remember:**
- **Server Components** = Static content, data fetching, no browser APIs
- **Client Components** = Interactive elements, state management, event handling
- **Error Handling** = Use proper error boundaries and separation of concerns
- **Architecture** = Design with Server-First approach, add Client Components as needed

By following these best practices, you can prevent similar errors and build robust, maintainable applications with Next.js 13+ App Router!
