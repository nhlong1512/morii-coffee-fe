# Data Model: Codebase Refactoring

**Feature**: 003-codebase-refactor
**Date**: 2026-03-27

## Overview

This document defines the data structures, interfaces, and state shapes for the refactored codebase. These entities represent the organizational structure of UI components, hooks, utilities, and constants that will be created or consolidated during the refactor.

---

## 1. UI Component Entities

### Button Component

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

**Purpose**: Consolidate all button patterns across the application
**States**: default, hover, active, disabled, loading
**Variants**: primary (brand color), secondary (muted), ghost (transparent), danger (destructive), outline (bordered)

---

### Form Field Component

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

**Purpose**: Standardize form input fields with label and error display
**States**: default, focus, error, disabled, loading
**Features**: Built-in label, error message display, consistent styling

---

### Loading Spinner Component

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'logo' | 'spinner' | 'dots';
  className?: string;
}
```

**Purpose**: Standardize loading states across the application
**Variants**: logo (animated Morii logo), spinner (circular), dots (three dots)

---

### Skeleton Component

```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}
```

**Purpose**: Content placeholders during loading
**Variants**: text (single line), circular (avatar), rectangular (image), card (content card), table (data table rows)

---

### Toast Notification Component

```typescript
interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  showToast: (props: ToastProps) => void;
  hideToast: (id: string) => void;
}
```

**Purpose**: Standardized user feedback system
**Variants**: success (green), error (red), warning (yellow), info (blue)
**Features**: Auto-dismiss, manual close, optional action button

---

### Error Message Component

```typescript
interface ErrorMessageProps {
  message: string;
  inline?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}
```

**Purpose**: Consistent error display
**Types**: inline (field-level), block (page-level), dismissible (with close button)

---

### Empty State Component

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

**Purpose**: Handle empty lists, no results, no data states
**Features**: Icon, title, description, optional action button

---

### Modal Component

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

**Purpose**: Standardized dialog/confirmation wrapper
**Sizes**: sm (400px), md (600px), lg (800px), xl (1000px)
**Features**: Overlay backdrop, close button, custom footer

---

### Badge Component

```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}
```

**Purpose**: Status indicators, labels, tags
**Variants**: default (neutral), success (green), warning (yellow), error (red), info (blue)

---

### Data Table Component

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

**Purpose**: Reusable data table with pagination and sorting
**Features**: Custom cell renderers, sortable columns, loading state, empty state, pagination controls

---

## 2. Custom Hook Entities

### Use Products Hook

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

**Purpose**: Encapsulate all product data operations
**State**: products list, loading flag, error message
**Operations**: fetch, create, update, delete, refetch

---

### Use Form Validation Hook

```typescript
interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

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

**Purpose**: Reusable form validation logic
**Features**: Field-level validation, touched state, error messages, form-level validation

---

### Use Pagination Hook

```typescript
interface UsePaginationProps {
  totalItems: number;
  pageSize: number;
  initialPage?: number;
}

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

**Purpose**: Pagination logic extraction
**Features**: Page navigation, bounds checking, index calculation

---

## 3. Utility Function Entities

### Format Currency

```typescript
function formatCurrency(amount: number, locale?: string): string;
```

**Purpose**: Consistent currency formatting (VND)
**Input**: Numeric amount
**Output**: Formatted string (e.g., "50,000 ₫")

---

### Format Date

```typescript
function formatDate(date: string | Date, format?: 'short' | 'long' | 'relative', locale?: string): string;
```

**Purpose**: Consistent date formatting
**Formats**: short (MM/DD/YYYY), long (Month DD, YYYY), relative (2 days ago)

---

### Validation Utilities

```typescript
function validateEmail(email: string): boolean;
function validatePhone(phone: string): boolean;
function validatePassword(password: string): { isValid: boolean; errors: string[] };
```

**Purpose**: Reusable validation functions
**Features**: Email format, phone format, password strength

---

### Image URL Utilities

```typescript
function getImageUrl(path: string): string;
function getImageFallback(type: 'avatar' | 'product' | 'banner'): string;
```

**Purpose**: CDN URL helpers and fallback images
**Features**: Environment-aware URL construction, type-specific fallbacks

---

## 4. Constant Entities

### Routes

```typescript
export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  ORDERS: '/orders',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  ADMIN: {
    HOME: '/admin/reports',
    PRODUCTS: '/admin/products',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    PROMOTIONS: '/admin/promotions',
    BANNERS: '/admin/banners',
  },
} as const;
```

**Purpose**: Centralized route definitions
**Benefits**: Type safety, single source of truth, easy refactoring

---

### API Endpoints

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/admin/products',
    UPDATE: (id: string) => `/admin/products/${id}`,
    DELETE: (id: string) => `/admin/products/${id}`,
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_AVATAR: '/users/avatar',
  },
} as const;
```

**Purpose**: Centralized API endpoint definitions
**Benefits**: Type safety, consistency, easy endpoint updates

---

### App Configuration

```typescript
export const APP_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
  },
  TOAST: {
    DEFAULT_DURATION: 5000,
    ERROR_DURATION: 7000,
  },
  IMAGE: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },
} as const;
```

**Purpose**: Centralized configuration values
**Benefits**: Easy to modify, no magic numbers, type safety

---

## 5. State Shape Entities

### Component State

```typescript
interface ComponentState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
```

**Purpose**: Standardized async data state
**Used By**: All data-fetching hooks

---

### Pagination State

```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

**Purpose**: Standardized pagination state
**Used By**: Data tables, product lists, user lists

---

### Form State

```typescript
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}
```

**Purpose**: Standardized form state
**Used By**: All forms (auth, profile, admin)

---

## Entity Relationships

```text
Page Component
    ↓
Custom Hook (useProducts, useOrders, etc.)
    ↓
Service Layer (products-service, orders-service, etc.)
    ↓
API Client (lib/api.ts)

Page Component
    ↓
UI Components (Button, FormField, DataTable, etc.)
    ↓
Utility Functions (formatCurrency, validateEmail, etc.)
    ↓
Constants (ROUTES, API_ENDPOINTS, APP_CONFIG)
```

---

## Validation Rules

1. **UI Components**:
   - Must accept all relevant state props (isLoading, disabled, error)
   - Must support dark mode via Tailwind classes
   - Must handle i18n if text is displayed
   - Must have TypeScript prop interfaces

2. **Custom Hooks**:
   - Must return consistent state shape (data, isLoading, error)
   - Must handle errors gracefully
   - Must be reusable across multiple components

3. **Utilities**:
   - Must be pure functions (no side effects)
   - Must have proper TypeScript types
   - Must handle edge cases (null, undefined, empty values)

4. **Constants**:
   - Must use `as const` for type inference
   - Must be exported from centralized files
   - Must use UPPER_SNAKE_CASE for primitive values

---

## Implementation Notes

- All entities should be created in their designated directories (`components/ui/`, `hooks/`, `utils/`, `constants/`)
- Existing files should be refactored to use these new entities
- Each entity should be independently testable
- TypeScript strict mode applies to all entities (no `any` types)
