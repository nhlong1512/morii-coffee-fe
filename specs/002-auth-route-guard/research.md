# Research: Authenticated Route Protection

**Date**: 2026-03-27
**Feature**: 002-auth-route-guard

## Overview

This document consolidates research findings for implementing route guards that prevent authenticated users from accessing authentication pages and preserve intended destinations for unauthenticated users attempting to access protected content.

---

## 1. Authentication State Management

### Decision: Use Existing Zustand Auth Store

**Rationale**:
- The project already uses Zustand with persist middleware for auth state (`src/stores/auth-store.ts`)
- Auth store provides `isAuthenticated` boolean flag and `user` object
- State is synchronized across tabs via localStorage ("morii-auth" key)
- No additional state management library needed

**Key Store Properties**:
```typescript
interface AuthState {
  isAuthenticated: boolean;      // Primary flag for auth checks
  user: ApiUserProfile | null;   // Full user profile with roles
  accessToken: string | null;
  refreshToken: string | null;
}
```

**Alternatives Considered**:
- **React Context**: Rejected because Zustand already provides global state with better performance and persistence
- **Server-side middleware**: Rejected because Next.js middleware cannot access client-side localStorage/Zustand state, and all auth state is client-side
- **Cookies for auth state**: Rejected to maintain consistency with existing implementation

---

## 2. Route Protection Pattern

### Decision: Client-Side useEffect with router.replace()

**Rationale**:
- Matches existing admin layout protection pattern (`src/app/admin/layout.tsx`)
- Works with Next.js App Router and client-side auth state
- Provides clean user experience with loading state during redirect
- Avoids hydration mismatches by using `useSyncExternalStore` for mount detection

**Implementation Pattern** (from admin layout):
```typescript
"use client";

export default function AuthPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return <LoadingState />;
  }

  if (isAuthenticated) {
    return <LoadingState />; // Show while redirect happens
  }

  return <AuthFormContent />;
}
```

**Why `router.replace()` vs `router.push()`**:
- `replace()` doesn't add to history, preventing back button from returning to auth page
- Admin layout uses `replace()` for this exact reason
- Better UX for auth redirects

**Alternatives Considered**:
- **Next.js Middleware** (`src/middleware.ts`): Rejected because:
  - Cannot access client-side Zustand store or localStorage
  - Would require moving auth to cookies (breaking change)
  - Current client-side approach is established pattern
- **Higher-Order Component (HOC)**: Rejected because:
  - Less composable than hooks
  - Harder to customize per page
  - Modern React favors hooks over HOCs
- **Layout-level guard for all auth pages**: Rejected because:
  - Each auth page may have different redirect logic in future
  - More flexible to have page-level control
  - Minimal code duplication with custom hook

---

## 3. Hydration Safety

### Decision: Use useSyncExternalStore for Mount Detection

**Rationale**:
- Prevents hydration mismatch errors (SSR renders different HTML than client)
- React 18+ recommended approach for detecting client-side rendering
- Already used successfully in admin layout
- Works reliably with Next.js App Router SSR

**Pattern**:
```typescript
const mounted = useSyncExternalStore(
  () => () => {},        // subscribe (no-op)
  () => true,            // client snapshot (mounted)
  () => false            // server snapshot (not mounted)
);
```

**Why Not Alternatives**:
- **`useEffect` with state**: Works but `useSyncExternalStore` is more explicit and React-recommended
- **`typeof window !== 'undefined'`**: Not safe during hydration phase
- **`useState(false)` + `useEffect`**: Extra state and re-render; less idiomatic

---

## 4. Redirect Intent Storage

### Decision: Store Intended URL in Auth Store + localStorage

**Rationale**:
- Zustand persist middleware automatically syncs to localStorage
- No extra persistence logic needed
- Survives page reloads during auth flow
- Cleared after successful redirect

**Implementation Approach**:
```typescript
interface AuthState {
  // Existing fields...
  redirectTo: string | null;

  // New methods
  setRedirectTo: (path: string) => void;
  clearRedirectTo: () => void;
  getAndClearRedirectTo: () => string | null;
}
```

**Where to Store Intent**:
- **Protected page**: When unauthenticated user hits protected route, store current path
- **Sign-in page**: Read from URL param (`?redirect=/profile`) OR store
- **After sign-in**: Use stored path or default to homepage

**Alternatives Considered**:
- **URL query parameter only**: Rejected because:
  - Lost if user navigates away from sign-in page
  - Not persisted across page reloads
  - More fragile than store + localStorage
- **Session storage only** (separate from Zustand): Rejected because:
  - Duplicates persistence logic
  - Not integrated with existing auth state
  - Zustand persist already provides this

---

## 5. Loading State Strategy

### Decision: Show Logo Loading During Redirect

**Rationale**:
- Matches admin layout pattern (shows animated logo)
- Prevents flash of auth form before redirect
- Provides visual feedback during navigation
- Minimal perceived delay

**Pattern** (from admin layout):
```typescript
if (!mounted || isAuthenticated) {
  return (
    <div className="flex h-screen items-center justify-center">
      <Image
        src="/images/logo.png"
        alt="Morii Coffee"
        width={120}
        height={40}
        className="h-10 w-auto animate-pulse"
      />
    </div>
  );
}
```

**Alternatives Considered**:
- **No loading state**: Rejected because causes flash of auth form
- **Spinner**: Rejected to maintain visual consistency with admin area
- **Skeleton**: Overkill for sub-200ms redirect

---

## 6. Custom Hooks Design

### Decision: Create Two Reusable Hooks

**Hook 1: `useAuthGuard()` - For Auth Pages**
- Redirects authenticated users to homepage (or custom destination)
- Returns `{ isLoading: boolean }` for render control
- Used in sign-in, sign-up, forgot-password, reset-password

**Hook 2: `useProtectedRoute()` - For Protected Pages**
- Redirects unauthenticated users to sign-in
- Stores redirect intent before navigation
- Returns `{ isLoading: boolean, isAuthenticated: boolean }`
- Used in profile, orders, change-password, etc.

**Rationale**:
- Separates concerns (auth pages vs protected pages)
- Reusable across multiple pages
- Encapsulates mount detection and redirect logic
- Easier to test and maintain

**Hook Signatures**:
```typescript
// For auth pages (sign-in, sign-up, etc.)
function useAuthGuard(redirectTo: string = "/"): { isLoading: boolean }

// For protected pages (profile, orders, etc.)
function useProtectedRoute(): {
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

**Alternatives Considered**:
- **Single hook with options**: Rejected because auth pages and protected pages have different concerns
- **No hooks (inline logic)**: Rejected because duplicates code across 4+ pages
- **HOC pattern**: Rejected in favor of hooks (modern React pattern)

---

## 7. Edge Case Handling

### Decision: Handle Specific Edge Cases

**Edge Case 1: Session Expires on Protected Page**
- **Solution**: Existing API client handles this via 401 → refresh → clear session → redirect to `/sign-in`
- **No change needed**: Already implemented in `src/lib/api.ts`

**Edge Case 2: Concurrent Tabs**
- **Solution**: Zustand persist syncs across tabs via localStorage events
- **Behavior**: Sign-out in one tab triggers re-render in other tabs
- **No change needed**: Built-in to Zustand persist

**Edge Case 3: Expired Token + Auth Page Access**
- **Solution**: If `isAuthenticated` is true but token expired, user will be redirected away
- **Recovery**: Next API call will trigger token refresh or session clear
- **Acceptable**: Edge case resolves itself within one request

**Edge Case 4: Deep Links to Auth Pages (Authenticated User)**
- **Solution**: useAuthGuard hook redirects on mount
- **User Experience**: Brief loading state → redirect to homepage
- **Performance**: Sub-200ms redirect meets success criteria

**Edge Case 5: Registration Redirect**
- **Decision**: Sign-up redirects to homepage (current behavior)
- **Future**: Could add onboarding flow, but out of scope for this feature
- **No change**: Preserve existing behavior

---

## 8. Performance Considerations

### Decision: Optimize for Speed

**Performance Targets** (from spec success criteria):
- Sub-200ms redirect time
- <50ms auth state check overhead
- No visible page flashing

**Optimization Techniques**:
1. **Zustand state check is synchronous** - no async overhead
2. **`router.replace()` is immediate** - no animation delay
3. **`useSyncExternalStore` is zero-cost** - React built-in
4. **Loading state shows immediately** - prevents layout shift

**Measurement Plan**:
- Use browser DevTools Performance tab
- Measure time from navigation to redirect
- Verify no additional re-renders

**Alternatives Considered**:
- **Debouncing redirects**: Rejected because adds unnecessary delay
- **Pre-checking before page mount**: Not possible with App Router SSR
- **Route prefetching**: Already handled by Next.js Link component

---

## 9. Internationalization (i18n)

### Decision: No Translation Changes Needed

**Rationale**:
- Feature only adds redirects and loading states
- No new user-facing text required
- Existing loading states already use logo (no text)
- Error messages (if needed) already in i18n files

**Future Consideration**:
- If adding "You're already signed in" message, use existing i18n pattern
- Message keys would go in `src/i18n/messages/en.json` and `vi.json`

---

## 10. Testing Strategy

### Decision: Manual Testing + Integration Test Plan

**Current State**: Project uses manual testing (no test files found)

**Manual Test Plan**:

**Test 1: Auth Page Protection (P1)**
1. Sign in to the application
2. Manually navigate to `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
3. Verify immediate redirect to homepage
4. Verify no flash of auth form

**Test 2: Protected Route Intent Preservation (P3)**
1. Sign out
2. Navigate to `/profile` or other protected page
3. Verify redirect to `/sign-in`
4. Complete sign-in
5. Verify redirect back to `/profile` (intended destination)

**Test 3: Normal Auth Flow**
1. Sign out
2. Navigate to `/sign-in` directly
3. Complete sign-in
4. Verify redirect to homepage (not back to sign-in)

**Test 4: Admin Area (Regression)**
1. Sign in as admin user
2. Verify admin routes still protected
3. Verify admin login still accessible when not authenticated

**Future Automated Tests** (if implemented):
- Component tests with mocked auth store
- E2E tests with Playwright or Cypress
- Unit tests for custom hooks

---

## 11. Migration & Rollout

### Decision: No Breaking Changes, Incremental Addition

**Migration Plan**:
1. Add custom hooks (`useAuthGuard`, `useProtectedRoute`)
2. Extend auth store with redirect intent methods
3. Modify auth pages one by one to use `useAuthGuard`
4. Test each page individually
5. No database migrations or API changes needed

**Rollout Safety**:
- Feature is additive (no existing functionality removed)
- Can be tested in dev environment before production
- No backend coordination required
- Rollback is simple (revert component changes)

**Backward Compatibility**:
- Existing auth flow unchanged for users already on auth pages
- No impact to users who never manually navigate to auth pages while authenticated
- Admin area protection unchanged

---

## 12. Dependencies & Constraints

### Dependencies (All Existing)
- `next` (16.1.6) - Router and navigation
- `react` (19.x) - `useSyncExternalStore` hook
- `zustand` - Auth store
- `next/navigation` - `useRouter`, `usePathname`

### Constraints
- **Client-side only**: No middleware solution possible with current architecture
- **localStorage dependency**: Required for Zustand persist
- **JavaScript required**: Auth protection won't work if JS disabled (acceptable for this app type)
- **No server-side protection**: API endpoints must handle their own authorization

---

## Summary of Key Decisions

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| **State Management** | Extend existing Zustand auth store | Already in use, persistent, proven |
| **Protection Pattern** | useEffect + router.replace() | Matches admin layout, App Router compatible |
| **Hydration Safety** | useSyncExternalStore | React 18+ recommended approach |
| **Intent Storage** | Auth store + localStorage | Integrated with existing persistence |
| **Loading State** | Animated logo (admin pattern) | Consistent UX, prevents flash |
| **Code Reuse** | Custom hooks (useAuthGuard, useProtectedRoute) | DRY principle, composable |
| **Edge Cases** | Leverage existing API error handling | Already handles session expiry |
| **Performance** | Synchronous checks, immediate redirects | Meets <200ms requirement |
| **Testing** | Manual testing (matches project) | No test infrastructure exists yet |
| **Migration** | Incremental, non-breaking | Low risk, easy rollback |

---

## Next Steps

With research complete, proceed to Phase 1:
1. Create data model document (state shape, entities)
2. Define UI contracts (hook APIs, component props)
3. Write quickstart guide (implementation steps)
