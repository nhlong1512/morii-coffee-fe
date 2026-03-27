# UI Contracts: Component APIs and Usage

**Feature**: 003-codebase-refactor
**Date**: 2026-03-27

## Overview

This document defines the public interfaces (contracts) for all UI components, custom hooks, and utilities that will be created or consolidated during the refactor. These contracts serve as the API documentation for developers using these components.

---

## 1. UI Component Contracts

### Button

**Location**: `src/components/ui/button.tsx`

**Import**:
```typescript
import { Button } from '@/components/ui/button';
```

**Props Contract**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
}
```

**Usage Examples**:
```typescript
// Primary button
<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

// Loading state
<Button variant="primary" isLoading>
  Submitting...
</Button>

// Disabled button
<Button variant="secondary" disabled>
  Cannot Click
</Button>

// Full width
<Button variant="primary" fullWidth>
  Full Width Button
</Button>
```

**Visual States**:
- Default: Solid background, brand color
- Hover: Slightly darker background
- Active: Pressed appearance
- Disabled: Reduced opacity, no pointer events
- Loading: Opacity reduced, spinner shown, not clickable

---

### FormField

**Location**: `src/components/ui/form-field.tsx`

**Import**:
```typescript
import { FormField } from '@/components/ui/form-field';
```

**Props Contract**:
```typescript
interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date';
  value: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
}
```

**Usage Examples**:
```typescript
// Basic text input
<FormField
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={setEmail}
/>

// With error message
<FormField
  label="Password"
  name="password"
  type="password"
  value={password}
  error="Password must be at least 8 characters"
  onChange={setPassword}
/>

// Required field
<FormField
  label="Username"
  name="username"
  value={username}
  required
  onChange={setUsername}
/>
```

**Visual States**:
- Default: Label above input, border normal
- Focus: Border highlighted
- Error: Red border, error message below
- Disabled: Gray background, no interaction
- Required: Red asterisk (*) after label

---

### LoadingSpinner

**Location**: `src/components/ui/loading-spinner.tsx`

**Import**:
```typescript
import { LoadingSpinner } from '@/components/ui/loading-spinner';
```

**Props Contract**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'logo' | 'spinner' | 'dots';
  className?: string;
}
```

**Usage Examples**:
```typescript
// Small spinner
<LoadingSpinner size="sm" variant="spinner" />

// Logo animation (for full-page loading)
<LoadingSpinner size="lg" variant="logo" />

// Inline dots
<LoadingSpinner size="sm" variant="dots" />
```

---

### Skeleton

**Location**: `src/components/ui/skeleton.tsx`

**Import**:
```typescript
import { Skeleton } from '@/components/ui/skeleton';
```

**Props Contract**:
```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}
```

**Usage Examples**:
```typescript
// Text skeleton (3 lines)
<Skeleton variant="text" count={3} />

// Avatar skeleton
<Skeleton variant="circular" width={40} height={40} />

// Card skeleton
<Skeleton variant="card" />

// Custom size
<Skeleton variant="rectangular" width="100%" height={200} />
```

---

### Toast

**Location**: `src/components/ui/toast.tsx`

**Import**:
```typescript
import { useToast } from '@/components/ui/toast';
```

**Hook Contract**:
```typescript
interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UseToastReturn {
  showToast: (props: ToastProps) => void;
}
```

**Usage Examples**:
```typescript
function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      variant: 'success',
      message: 'Profile updated successfully!',
      duration: 5000,
    });
  };

  const handleError = () => {
    showToast({
      variant: 'error',
      title: 'Error',
      message: 'Failed to update profile. Please try again.',
      action: {
        label: 'Retry',
        onClick: handleRetry,
      },
    });
  };

  return <button onClick={handleSuccess}>Save</button>;
}
```

---

### EmptyState

**Location**: `src/components/ui/empty-state.tsx`

**Import**:
```typescript
import { EmptyState } from '@/components/ui/empty-state';
```

**Props Contract**:
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}
```

**Usage Examples**:
```typescript
// Empty product list
<EmptyState
  icon={<Package className="h-12 w-12" />}
  title="No products found"
  description="Try adjusting your search or filters"
/>

// With action button
<EmptyState
  title="Your cart is empty"
  description="Start adding items to your cart"
  action={{
    label: "Browse Products",
    href: "/products",
  }}
/>
```

---

### Modal

**Location**: `src/components/ui/modal.tsx`

**Import**:
```typescript
import { Modal } from '@/components/ui/modal';
```

**Props Contract**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}
```

**Usage Examples**:
```typescript
// Confirmation modal
<Modal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  title="Delete Product"
  description="Are you sure you want to delete this product?"
  size="sm"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  <p>This action cannot be undone.</p>
</Modal>
```

---

### DataTable

**Location**: `src/components/ui/data-table.tsx`

**Import**:
```typescript
import { DataTable } from '@/components/ui/data-table';
```

**Props Contract**:
```typescript
interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: keyof T;
    sortOrder: 'asc' | 'desc';
    onSort: (key: keyof T) => void;
  };
}
```

**Usage Examples**:
```typescript
// Product table
<DataTable
  data={products}
  columns={[
    { key: 'name', header: 'Product Name', sortable: true },
    { key: 'price', header: 'Price', cell: (price) => formatCurrency(price) },
    {
      key: 'id',
      header: 'Actions',
      cell: (_, product) => (
        <Button size="sm" onClick={() => handleEdit(product.id)}>
          Edit
        </Button>
      ),
    },
  ]}
  isLoading={isLoading}
  pagination={{
    currentPage: page,
    totalPages: Math.ceil(totalItems / pageSize),
    pageSize,
    onPageChange: setPage,
  }}
/>
```

---

## 2. Custom Hook Contracts

### useProducts

**Location**: `src/hooks/use-products.ts`

**Import**:
```typescript
import { useProducts } from '@/hooks/use-products';
```

**Return Contract**:
```typescript
interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, data: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

**Usage Example**:
```typescript
function ProductsPage() {
  const { products, isLoading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <ProductGrid products={products} />;
}
```

---

### useFormValidation

**Location**: `src/hooks/use-form-validation.ts`

**Import**:
```typescript
import { useFormValidation } from '@/hooks/use-form-validation';
```

**Parameters**:
```typescript
interface ValidationRules {
  [fieldName: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | undefined;
  };
}
```

**Return Contract**:
```typescript
interface UseFormValidationReturn {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  handleChange: (name: string, value: string) => void;
  handleBlur: (name: string) => void;
  validate: () => boolean;
  reset: () => void;
}
```

**Usage Example**:
```typescript
function SignUpForm() {
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validate,
  } = useFormValidation({
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, minLength: 8 },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Email"
        name="email"
        value={values.email}
        error={touched.email ? errors.email : undefined}
        onChange={(value) => handleChange('email', value)}
        onBlur={() => handleBlur('email')}
      />
    </form>
  );
}
```

---

### usePagination

**Location**: `src/hooks/use-pagination.ts`

**Import**:
```typescript
import { usePagination } from '@/hooks/use-pagination';
```

**Parameters**:
```typescript
interface UsePaginationProps {
  totalItems: number;
  pageSize: number;
  initialPage?: number;
}
```

**Return Contract**:
```typescript
interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}
```

**Usage Example**:
```typescript
function ProductList({ products }: { products: Product[] }) {
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
  } = usePagination({
    totalItems: products.length,
    pageSize: 10,
  });

  const visibleProducts = products.slice(startIndex, endIndex);

  return (
    <>
      <ProductGrid products={visibleProducts} />
      <div>
        <Button disabled={!canGoPrevious} onClick={previousPage}>Previous</Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button disabled={!canGoNext} onClick={nextPage}>Next</Button>
      </div>
    </>
  );
}
```

---

## 3. Utility Function Contracts

### formatCurrency

**Location**: `src/utils/format-currency.ts`

**Signature**:
```typescript
function formatCurrency(amount: number, locale?: string): string;
```

**Usage**:
```typescript
formatCurrency(50000);              // "50,000 ₫"
formatCurrency(1234567);            // "1,234,567 ₫"
formatCurrency(50000, 'en-US');     // "$50,000"
```

---

### formatDate

**Location**: `src/utils/format-date.ts`

**Signature**:
```typescript
function formatDate(
  date: string | Date,
  format?: 'short' | 'long' | 'relative',
  locale?: string
): string;
```

**Usage**:
```typescript
formatDate('2026-03-27');                    // "03/27/2026"
formatDate('2026-03-27', 'long');            // "March 27, 2026"
formatDate('2026-03-26', 'relative');        // "1 day ago"
formatDate('2026-03-27', 'short', 'vi-VN');  // "27/03/2026"
```

---

### validateEmail

**Location**: `src/utils/validate.ts`

**Signature**:
```typescript
function validateEmail(email: string): boolean;
```

**Usage**:
```typescript
validateEmail('user@example.com');  // true
validateEmail('invalid-email');     // false
```

---

### validatePhone

**Location**: `src/utils/validate.ts`

**Signature**:
```typescript
function validatePhone(phone: string): boolean;
```

**Usage**:
```typescript
validatePhone('0912345678');   // true
validatePhone('invalid');      // false
```

---

## 4. Constant Contracts

### ROUTES

**Location**: `src/constants/routes.ts`

**Type**:
```typescript
export const ROUTES: {
  HOME: string;
  SIGN_IN: string;
  // ... other routes
  PRODUCT_DETAIL: (id: string) => string;
  ADMIN: {
    HOME: string;
    PRODUCTS: string;
    // ... other admin routes
  };
};
```

**Usage**:
```typescript
import { ROUTES } from '@/constants/routes';

// Static routes
<Link href={ROUTES.SIGN_IN}>Sign In</Link>

// Dynamic routes
<Link href={ROUTES.PRODUCT_DETAIL('123')}>View Product</Link>

// Admin routes
<Link href={ROUTES.ADMIN.PRODUCTS}>Admin Products</Link>
```

---

### API_ENDPOINTS

**Location**: `src/constants/api-endpoints.ts`

**Type**:
```typescript
export const API_ENDPOINTS: {
  AUTH: {
    LOGIN: string;
    REGISTER: string;
    // ...
  };
  PRODUCTS: {
    LIST: string;
    DETAIL: (id: string) => string;
    // ...
  };
};
```

**Usage**:
```typescript
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Fetch products
const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST);

// Fetch product detail
const product = await api.get(API_ENDPOINTS.PRODUCTS.DETAIL('123'));
```

---

### APP_CONFIG

**Location**: `src/constants/app-config.ts`

**Type**:
```typescript
export const APP_CONFIG: {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: number;
    PAGE_SIZE_OPTIONS: number[];
  };
  VALIDATION: {
    PASSWORD_MIN_LENGTH: number;
    // ...
  };
  // ...
};
```

**Usage**:
```typescript
import { APP_CONFIG } from '@/constants/app-config';

// Use configuration values
if (password.length < APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
  setError('Password too short');
}

const [pageSize, setPageSize] = useState(APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE);
```

---

## Contract Guarantees

All components, hooks, and utilities contract to:

1. **TypeScript Support**: Full TypeScript type definitions for all props and returns
2. **Dark Mode**: All UI components support dark mode via Tailwind classes
3. **i18n Compatibility**: Components that display text accept translated strings
4. **Error Handling**: All async operations return errors in a consistent format
5. **Loading States**: All data-fetching hooks provide isLoading flag
6. **Accessibility**: All UI components follow ARIA best practices (where applicable)
7. **Backward Compatibility**: No breaking changes to existing component APIs

---

## Migration Guide

When replacing existing code with these contracts:

1. Import the new component/hook/utility
2. Replace inline implementation with contract usage
3. Pass required props according to the contract
4. Test that behavior is unchanged
5. Remove old inline implementation

Example:
```typescript
// Before
<button
  className="bg-primary text-white px-4 py-2 rounded"
  onClick={handleClick}
>
  Submit
</button>

// After
import { Button } from '@/components/ui/button';

<Button variant="primary" onClick={handleClick}>
  Submit
</Button>
```
