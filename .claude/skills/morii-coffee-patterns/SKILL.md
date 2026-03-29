---
name: morii-coffee-patterns
description: Coding standards, component patterns, and refactoring best practices for the Morii Coffee Next.js frontend codebase. Use this skill whenever working on the Morii Coffee project for component creation, code refactoring, implementing new features, fixing code quality issues, or reviewing code. Essential for maintaining consistency with established patterns including UI components (shadcn/ui + Radix), logic separation (hooks/services/utilities), TypeScript strict mode, error handling, dark mode support, and i18n integration.
---

# Morii Coffee Frontend - Coding Patterns & Best Practices

## Overview

This skill defines the established patterns, conventions, and best practices for the Morii Coffee Next.js frontend codebase. Follow these guidelines for all code changes to maintain consistency, quality, and maintainability.

**When to use this skill:**
- Creating new UI components
- Refactoring existing code
- Implementing new features
- Fixing code quality issues
- Separating business logic from presentation
- Writing custom hooks or utilities
- Reviewing code for consistency

## Tech Stack Context

- **Framework**: Next.js 16.1.6 (App Router), React 19, TypeScript 5.x
- **Styling**: Tailwind CSS v4 with CSS variables, shadcn/ui patterns
- **State**: Zustand with persist middleware
- **UI**: Radix UI primitives + custom components
- **i18n**: next-intl (VI/EN locales)
- **Dark Mode**: next-themes with class-based `.dark` selector
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 1. UI Component Patterns

### Component Creation Standard

All shared UI components follow the shadcn/ui pattern with Radix UI primitives.

**Location**: `src/components/ui/`

**Component Structure:**
```typescript
// src/components/ui/button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  fullWidth,
  children,
  onClick,
  className,
}: ButtonProps) {
  return (
    <button
      className={cn(
        'base-styles transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        (isLoading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
}
```

**Key Principles:**
- ✅ Use TypeScript discriminated unions for variants
- ✅ Support all relevant states (loading, disabled, error)
- ✅ Use `cn()` utility for className merging
- ✅ Handle dark mode via Tailwind classes (no explicit dark mode logic)
- ✅ Export named components (not default exports)
- ✅ Use composition over configuration
- ✅ Props interface co-located with component

### Essential Shared Components

Create reusable components for these patterns:

**Form Components:**
- `FormField` - label + input + error wrapper
- `ErrorMessage` - inline error display

**Feedback Components:**
- `Toast` - notifications (success/error/warning/info)
- `EmptyState` - no results/empty list display
- `LoadingSpinner` - animated loading states (logo/spinner/dots)
- `Skeleton` - content placeholders

**Data Display:**
- `DataTable` - table with pagination and sorting
- `Badge` - status indicators with color variants
- `Modal` - dialog/confirmation wrapper

**Utility Components:**
- `ImageWithFallback` - Next.js Image with error handling

### Dark Mode Support

All components must support dark mode using Tailwind's class-based approach:

```typescript
// ✅ Correct - Uses CSS variables that adapt automatically
<div className="bg-background text-foreground">
  <span className="text-muted-foreground">
    {/* Dark mode handled by CSS variables */}
  </span>
</div>

// ❌ Wrong - Don't manually check theme
const { theme } = useTheme();
const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
```

### i18n Integration

All user-facing text must use translations:

```typescript
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('namespace');

  return (
    <button>{t('buttonText')}</button>
  );
}

// ❌ Wrong - No hardcoded English strings
<button>Submit</button>
```

## 2. Logic Separation Strategy

### Pages as Composition Layer

Pages should ONLY handle layout and component composition. Target: under 100 lines.

**Anti-pattern (DON'T DO THIS):**
```typescript
// ❌ Bad - Logic mixed with presentation
export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price.toLocaleString('vi-VN')} VND</p>
        </div>
      ))}
    </div>
  );
}
```

**Correct Pattern:**
```typescript
// ✅ Good - Clean composition, logic extracted
export default function ProductPage() {
  const { products, isLoading } = useProducts();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container">
      <ProductGrid products={products} />
    </div>
  );
}
```

### Custom Hooks Pattern

Extract stateful logic and data fetching into custom hooks.

**Location**: `src/hooks/`
**Naming**: `use-[resource].ts` (kebab-case)

```typescript
// src/hooks/use-products.ts
import { useState, useCallback } from 'react';
import * as productsService from '@/services/products-service';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { products, isLoading, error, fetchProducts };
}
```

**Hook Standards:**
- ✅ Return consistent shape: `{ data, isLoading, error, ...actions }`
- ✅ Use `useCallback` for action functions
- ✅ Handle errors consistently
- ✅ Set loading states before and after async operations
- ✅ Export named functions (not default)

### Service Layer Pattern

API calls go in service files, not directly in components or hooks.

**Location**: `src/services/`
**Naming**: `[resource]-service.ts` (kebab-case)

```typescript
// src/services/products-service.ts
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { ApiProductDetail, ApiProductSummary } from '@/types/api';

export async function getAll(): Promise<ApiProductSummary[]> {
  return apiGet<ApiProductSummary[]>('/v1/products');
}

export async function getById(id: string): Promise<ApiProductDetail> {
  return apiGet<ApiProductDetail>(`/v1/products/${id}`);
}

export async function create(data: CreateProductInput): Promise<ApiProductDetail> {
  return apiPost<ApiProductDetail>('/v1/products', data);
}

export async function update(id: string, data: UpdateProductInput): Promise<ApiProductDetail> {
  return apiPut<ApiProductDetail>(`/v1/products/${id}`, data);
}

export async function remove(id: string): Promise<void> {
  return apiDelete(`/v1/products/${id}`);
}
```

**Service Standards:**
- ✅ Use the project's `apiGet/apiPost/apiPut/apiDelete` helpers
- ✅ Return typed responses (no `any`)
- ✅ Let errors bubble up (service layer doesn't handle UI errors)
- ✅ Export named functions
- ✅ Keep focused on one resource

### Utility Functions

Pure functions for data transformation, formatting, validation.

**Location**: `src/utils/`
**Naming**: `[purpose].ts` (kebab-case)

```typescript
// src/utils/format-currency.ts
export function formatCurrency(amount: number, locale: string = 'vi-VN'): string {
  if (locale === 'vi-VN') {
    return `${amount.toLocaleString('vi-VN')} ₫`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// src/utils/format-date.ts
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'relative' = 'short',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return formatRelativeDate(dateObj);
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: '2-digit', day: '2-digit' };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

// src/utils/validate.ts
export function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

export function validatePhone(phone: string): boolean {
  const pattern = /^0\d{9}$/; // Vietnamese phone pattern
  return pattern.test(phone);
}
```

**Utility Standards:**
- ✅ Pure functions (no side effects)
- ✅ Explicit types (no `any`)
- ✅ Export named functions
- ✅ Testable in isolation
- ✅ Single responsibility

### Constants Organization

Extract all magic values, routes, and configuration.

**Location**: `src/constants/`

```typescript
// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  PROFILE: '/profile',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  ADMIN: {
    ROOT: '/admin',
    PRODUCTS: '/admin/products',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
  },
} as const;

// src/constants/api-endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/signin',
    REGISTER: '/v1/auth/signup',
    REFRESH: '/v1/auth/refresh-token',
  },
  PRODUCTS: {
    LIST: '/v1/products',
    DETAIL: (id: string) => `/v1/products/${id}`,
  },
} as const;

// src/constants/app-config.ts
export const APP_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    USERNAME_MIN_LENGTH: 3,
  },
  TOAST: {
    DEFAULT_DURATION: 5000,
    ERROR_DURATION: 7000,
  },
} as const;
```

**Constant Standards:**
- ✅ Use `as const` for type inference
- ✅ Group related constants
- ✅ Use SCREAMING_SNAKE_CASE for top-level constants
- ✅ Functions for dynamic values (e.g., routes with params)

## 3. TypeScript Best Practices

### Strict Mode Compliance

TypeScript strict mode is enabled. Follow these rules:

```typescript
// ❌ Never use 'any'
const data: any = await fetch();

// ✅ Use proper types
const data: ApiResponse = await fetch();

// ❌ Never use 'any' for error handling
catch (error: any) {
  console.error(error.message);
}

// ✅ Use type guards
catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(message);
}

// ✅ Use 'unknown' when type is truly unknown
function processData(data: unknown) {
  if (isValidData(data)) {
    // Now TypeScript knows the type
  }
}
```

**Type Standards:**
- ✅ No `any` types (zero tolerance)
- ✅ Explicit return types for functions
- ✅ Prefer `interface` over `type` for object shapes
- ✅ Use discriminated unions for state management
- ✅ Export all type definitions
- ✅ Use `readonly` for immutable data

### Type Organization

```typescript
// Component props with component
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button(props: ButtonProps) { ... }

// Shared types in src/types/
// src/types/api.ts - API response types
export interface ApiUserProfile { ... }
export interface ApiProductDetail { ... }

// src/types/models.ts - Domain models
export interface User { ... }
export interface Product { ... }
```

## 4. Error Handling Standards

### Async Operation Pattern

All async operations must have proper error handling:

```typescript
// ✅ Correct pattern
async function handleOperation() {
  setIsLoading(true);
  setError(null);

  try {
    const result = await service.operation();
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    setError(message);
    return { success: false, error: message };
  } finally {
    setIsLoading(false);
  }
}

// ❌ Wrong - No error handling
async function handleOperation() {
  const result = await service.operation();
  return result;
}

// ❌ Wrong - Swallowing errors
catch (error) {
  // Silent failure
}
```

**Error Handling Rules:**
- ✅ Always use try/catch for async operations
- ✅ Set loading states before and after
- ✅ Clear previous errors before new operations
- ✅ Use type guards for error messages
- ✅ Let service layer errors bubble up to hooks
- ✅ Display user-friendly error messages in UI

## 5. Code Quality Standards

### Function Length

Target: Functions under 30 lines. Extract complex logic into helper functions.

```typescript
// ❌ Too long - extract logic
function ComplexComponent() {
  // 50+ lines of logic mixed with JSX
}

// ✅ Better - extracted helpers
function ComplexComponent() {
  const processedData = useProcessedData(rawData);
  const validationResult = useValidation(formData);

  return <UI data={processedData} validation={validationResult} />;
}

function useProcessedData(raw: RawData) {
  // Logic extracted to hook
}
```

### Import Organization

Follow this order:

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. Next.js
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 3. Third-party
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// 4. Local - UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 5. Local - Hooks/utils/services
import { useProducts } from '@/hooks/use-products';
import { formatCurrency } from '@/utils/format-currency';
import * as productsService from '@/services/products-service';

// 6. Local - Types/constants
import type { Product } from '@/types/models';
import { ROUTES } from '@/constants/routes';
```

### Dead Code Removal

Never commit:
- ❌ Commented-out code blocks
- ❌ Unused imports or variables
- ❌ `console.log` statements (use `console.error` for production errors only)
- ❌ Development debugging code
- ❌ Unused functions or components

### Naming Conventions

```typescript
// Files: kebab-case
use-products.ts
format-currency.ts
button.tsx

// Components: PascalCase
export function Button() {}
export function ProductCard() {}

// Hooks: camelCase starting with 'use'
export function useProducts() {}
export function useFormValidation() {}

// Constants: SCREAMING_SNAKE_CASE or camelCase for objects
export const API_BASE_URL = '...';
export const APP_CONFIG = { ... };

// Variables/functions: camelCase
const isLoading = true;
function fetchProducts() {}
```

## 6. Refactoring Checklist

When refactoring a page or component:

- [ ] Extract inline components to separate files
- [ ] Move useState/useEffect logic to custom hooks
- [ ] Replace direct API calls with service layer
- [ ] Extract data transformation to utility functions
- [ ] Replace magic values with constants
- [ ] Remove all `any` types
- [ ] Add proper TypeScript interfaces
- [ ] Implement proper error handling (try/catch)
- [ ] Remove console.log statements
- [ ] Delete commented-out code
- [ ] Verify dark mode works
- [ ] Verify i18n works (no hardcoded strings)
- [ ] Test that functionality is unchanged
- [ ] Ensure page is under 100 lines (if possible)

## 7. Migration Pattern

When extracting shared patterns:

**Step 1: Create the shared component/hook/utility**
```typescript
// Create src/components/ui/button.tsx
export function Button({ variant, children, ...props }: ButtonProps) {
  // Implementation
}
```

**Step 2: Update one page at a time**
```typescript
// Before
<button className="bg-primary px-4 py-2">Submit</button>

// After
import { Button } from '@/components/ui/button';
<Button variant="primary">Submit</Button>
```

**Step 3: Validate**
- Run `pnpm build` - ensure no TypeScript errors
- Test the page manually - ensure functionality unchanged
- Check dark mode and i18n still work

**Step 4: Commit**
```bash
git commit -m "refactor(ui): extract Button component"
```

## 8. Performance Considerations

Maintain or improve performance:

```typescript
// ✅ Memoize expensive computations
const sortedProducts = useMemo(
  () => products.sort((a, b) => a.price - b.price),
  [products]
);

// ✅ Memoize callbacks
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// ✅ Memoize expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // component logic
});

// ❌ Don't memoize everything - only when needed
// Profile first, optimize second
```

## 9. Validation Points

After each refactor, verify:

1. **Build**: `pnpm build` completes with zero errors
2. **Lint**: `pnpm lint` produces zero errors and warnings
3. **Key Flows**:
   - Sign in → view profile
   - Browse products → view detail
   - Admin manage products
   - Admin manage users
4. **Dark Mode**: Test in both light and dark mode
5. **i18n**: Test with both VI and EN locales
6. **Functionality**: All features work exactly as before

## Summary

**Core Principles:**
- ✅ Components in `src/components/ui/` following shadcn/ui patterns
- ✅ Logic extracted to hooks (`src/hooks/`), services (`src/services/`), utilities (`src/utils/`)
- ✅ Constants in `src/constants/`
- ✅ Pages are composition-only, under 100 lines
- ✅ TypeScript strict mode, zero `any` types
- ✅ Proper error handling with try/catch
- ✅ Dark mode via Tailwind classes
- ✅ i18n via next-intl (no hardcoded strings)
- ✅ No console.log, no commented code
- ✅ Named exports preferred
- ✅ Validate after every change

**When in doubt, look at existing examples:**
- Hooks: `src/hooks/use-auth-guard.ts`
- Services: `src/services/auth-service.ts`
- Components: `src/components/ui/button.tsx`
- API client: `src/lib/api.ts`
- Store: `src/stores/auth-store.ts`
