# Research: Codebase Refactoring Approach

**Date**: 2026-03-27
**Feature**: 003-codebase-refactor

## Overview

This document consolidates research findings for implementing a comprehensive codebase refactoring that eliminates code smell, reduces duplication, separates concerns, and improves maintainability while preserving all existing functionality.

---

## 1. UI Component Extraction Strategy

### Decision: shadcn/ui Pattern with Radix UI Primitives

**Rationale**:
- The project already uses Radix UI and follows shadcn/ui patterns
- Components should be placed in `src/components/ui/` with clear prop interfaces
- Each component handles all relevant states (loading, error, disabled, dark mode)
- Use TypeScript discriminated unions for variant props
- Follow composition over configuration principle

**Key Components to Extract** (based on common patterns):
1. **Form Components**:
   - `FormField` - label + input + error wrapper
   - Standardized input validation and error display
   - Consistent disabled/loading states

2. **Feedback Components**:
   - `Toast` - success/error/warning/info notifications
   - `ErrorMessage` - inline field errors
   - `EmptyState` - no results/empty list display

3. **Loading Components**:
   - `LoadingSpinner` - animated logo (already used in some places)
   - `Skeleton` - content placeholders for cards, tables, lists

4. **Data Display Components**:
   - `DataTable` - reusable table with pagination, sorting
   - `Badge` - status indicators, role tags
   - `StatusBadge` - order status, user status with color coding

5. **Utility Components**:
   - `ImageWithFallback` - Next.js Image with error handling
   - `Modal` - dialog/confirmation wrapper

**Implementation Pattern** (from admin layout as reference):
```typescript
// Component with variants
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', isLoading, disabled, children }: ButtonProps) {
  return (
    <button
      className={cn(
        'base-styles',
        variantStyles[variant],
        sizeStyles[size],
        isLoading && 'opacity-50 cursor-not-allowed',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled || isLoading}
    >
      {isLoading ? <LoadingSpinner /> : children}
    </button>
  );
}
```

**Alternatives Considered**:
- **Component library (Material UI, Chakra)**: Rejected because project already has Radix UI + Tailwind setup
- **Separate component package**: Rejected because single frontend repo doesn't need package separation
- **CSS-in-JS**: Rejected because Tailwind CSS is established pattern

---

## 2. Logic Extraction Strategy

### Decision: Custom Hooks + Service Layer + Utilities

**Rationale**:
- Separate data fetching (hooks/services) from presentation (components)
- Extract stateful logic into custom hooks for reusability
- Pure functions go into utilities for testability
- Constants extracted for maintainability and type safety

**Custom Hooks Pattern** (based on existing auth hooks):
```typescript
// Pattern: use[Resource].ts
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { products, isLoading, error, fetchProducts };
}
```

**Service Layer Pattern** (from existing services):
- Keep service files focused on API calls only
- Return typed responses
- Handle errors at service boundary
- Pattern: `[resource]-service.ts`

**Utility Functions** (extract pure logic):
```typescript
// Format functions
export function formatCurrency(amount: number): string { ... }
export function formatDate(date: string, locale: string): string { ... }

// Validation functions
export function validateEmail(email: string): boolean { ... }
export function validatePhone(phone: string): boolean { ... }

// Data transformation
export function groupBy<T>(items: T[], key: keyof T): Map<any, T[]> { ... }
```

**Constants Organization**:
```typescript
// constants/routes.ts
export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  PROFILE: '/profile',
  ADMIN: {
    HOME: '/admin/reports',
    PRODUCTS: '/admin/products',
    USERS: '/admin/users',
  },
} as const;

// constants/api-endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
  },
} as const;
```

**Alternatives Considered**:
- **React Query/SWR**: Rejected to avoid new dependencies
- **Redux/MobX**: Rejected because Zustand is already in use
- **Separate utils package**: Rejected because single repo structure

---

## 3. Code Quality Standards

### Decision: ESLint + TypeScript Strict Mode + Consistent Patterns

**Rationale**:
- ESLint already configured - enforce all rules
- TypeScript strict mode already enabled - eliminate all `any` types
- Consistent error handling patterns across all async operations
- Function length limit: 30 lines (extract complex logic)
- File length target: 100-150 lines for pages

**Error Handling Pattern**:
```typescript
// Standardized try/catch
async function handleOperation() {
  try {
    const result = await service.operation();
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    console.error('Operation failed:', error); // Development only - remove before production
    return { success: false, error: message };
  }
}
```

**TypeScript Best Practices**:
- No `any` types - use `unknown` or proper interfaces
- Export all type definitions
- Use discriminated unions for state management
- Prefer `interface` over `type` for object shapes
- Use `readonly` for immutable data

**Code Organization Rules**:
1. **Imports**: React → Next.js → third-party → local
2. **Component structure**: Props interface → component → exports
3. **File naming**: `kebab-case.tsx` for components, `kebab-case.ts` for logic
4. **Export style**: Named exports preferred over default exports

**Dead Code Removal**:
- Delete all commented-out code
- Remove unused imports (ESLint will catch)
- Delete unused functions and variables
- Remove development console.log statements
- Clean up unused mock data

**Alternatives Considered**:
- **Prettier**: Already configured via editor settings
- **Husky pre-commit hooks**: Not in scope for this refactor
- **SonarQube**: No external quality tools required

---

## 4. Page Simplification Strategy

### Decision: Pages as Composition Layer Only

**Rationale**:
- Pages should only handle layout and component composition
- All logic extracted to hooks
- All data fetching through services or hooks
- Target: Pages under 100 lines with only JSX composition

**Before/After Pattern**:

**Before** (anti-pattern):
```typescript
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
          <img src={product.image} />
          <h3>{product.name}</h3>
          <p>{product.price.toLocaleString('vi-VN')} VND</p>
        </div>
      ))}
    </div>
  );
}
```

**After** (correct pattern):
```typescript
export default function ProductPage() {
  const { products, isLoading } = useProducts();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
```

**Extraction Checklist** (for each page):
- [ ] Inline components → separate component files
- [ ] useState/useEffect logic → custom hooks
- [ ] API calls → service layer
- [ ] Data transformation → utility functions
- [ ] Magic values → constants
- [ ] Complex conditionals → extracted helper functions

---

## 5. Migration Strategy

### Decision: Incremental Refactor with Continuous Validation

**Rationale**:
- Refactor one user story (P1, P2, P3) at a time
- Validate after each phase before proceeding
- Maintain git history with descriptive commits
- Test key user flows after each major change

**Phased Approach**:

**Phase 1 (P1): UI Component Extraction**
1. Create `src/components/ui/` components with proper TypeScript
2. Replace inline/duplicated UI patterns one page at a time
3. Validate: Run `pnpm build` and manually test affected pages
4. Commit: "refactor(ui): extract [Component] to shared components"

**Phase 2 (P2): Logic Separation**
1. Create `src/hooks/`, `src/utils/`, `src/constants/` directories
2. Extract logic from pages one at a time
3. Validate: Ensure pages still work correctly
4. Commit: "refactor(logic): extract [hook/util] from [page]"

**Phase 3 (P3): Code Quality**
1. Run `pnpm lint` and fix all errors/warnings
2. Remove all `any` types
3. Remove dead code and console.log statements
4. Standardize error handling
5. Validate: Run `pnpm build` with zero errors
6. Commit: "refactor(quality): resolve lint issues and improve types"

**Validation Points**:
- After each component extraction: Test pages using that component
- After each logic extraction: Verify behavior unchanged
- After each phase: Run full build and test 5 key user flows
- Final validation: Complete manual test suite

**Key User Flows** (spot-check after each phase):
1. Sign in → view profile
2. Browse products → view product detail
3. Admin: manage products
4. Admin: manage banners
5. Admin: manage users

**Rollback Strategy**:
- Each commit is atomic and can be reverted independently
- Keep feature branch until full validation complete
- Squash commits before merging to main for clean history

---

## 6. Dark Mode and i18n Preservation

### Decision: Maintain Existing Patterns

**Rationale**:
- Dark mode uses `next-themes` with class-based `.dark` selector
- i18n uses `next-intl` with VI/EN locale support
- All extracted components must preserve these patterns

**Dark Mode Pattern** (maintain in all components):
```typescript
<div className="bg-background text-foreground">
  <span className="text-muted-foreground dark:text-muted-foreground">
    {/* Uses CSS variables that adapt to dark mode */}
  </span>
</div>
```

**i18n Pattern** (maintain in all components):
```typescript
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('namespace');

  return <button>{t('buttonText')}</button>;
}
```

**Validation**:
- Test all extracted components in both light and dark mode
- Verify all user-facing text uses translation keys
- No hardcoded English strings in components

---

## 7. Performance Considerations

### Decision: Maintain or Improve Performance

**Rationale**:
- Extracted components should be as performant as inline code
- Use React.memo() for expensive render components
- Avoid unnecessary re-renders
- Code splitting maintained through Next.js

**Performance Patterns**:
```typescript
// Memoize expensive computations
const sortedProducts = useMemo(
  () => products.sort((a, b) => a.price - b.price),
  [products]
);

// Memoize callbacks
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Memoize components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // component logic
});
```

**Alternatives Considered**:
- **React.lazy() for components**: Not needed as Next.js handles code splitting
- **Virtual scrolling**: Out of scope for this refactor
- **Web Workers**: Out of scope for this refactor

---

## 8. TypeScript Type Strategy

### Decision: Strict Types with No `any`

**Rationale**:
- TypeScript strict mode already enabled
- All custom code should have explicit types
- Use `unknown` for truly unknown values
- Export all type definitions for reuse

**Type Organization**:
```typescript
// src/types/components.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// src/types/models.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}
```

**Type Safety Rules**:
- No `any` types except for third-party library types that can't be avoided
- Use type guards for runtime type checking
- Prefer interfaces over types for extensibility
- Use `readonly` for immutable data structures

---

## Summary of Key Decisions

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| **UI Components** | shadcn/ui pattern with Radix UI | Already established in project |
| **Logic Separation** | Custom hooks + services + utilities | Clear separation of concerns |
| **Code Quality** | ESLint strict + TypeScript strict | Already configured, enforce rules |
| **Page Structure** | Composition only, under 100 lines | Maximize readability |
| **Migration** | Incremental phased approach | Minimize risk, continuous validation |
| **Dark Mode/i18n** | Preserve existing patterns | Maintain consistency |
| **Performance** | Maintain or improve current performance | No degradation allowed |
| **Types** | Strict TypeScript, no `any` | Type safety and maintainability |

---

## Next Steps

With research complete, proceed to Phase 1:
1. Create data model document (component prop interfaces, state shapes)
2. Define UI contracts (component APIs, hook signatures)
3. Write quickstart guide (implementation steps and validation)
