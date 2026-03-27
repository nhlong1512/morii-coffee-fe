# Quickstart: Codebase Refactoring Implementation

**Feature**: 003-codebase-refactor
**Date**: 2026-03-27

## Overview

This guide provides step-by-step instructions for implementing the codebase refactoring. Follow these steps in order to ensure a successful refactor with continuous validation.

---

## Prerequisites

Before starting the refactor, ensure:

1. ✓ All changes committed to git (clean working directory)
2. ✓ On feature branch `003-codebase-refactor`
3. ✓ `pnpm install` completed successfully
4. ✓ `pnpm dev` starts without errors
5. ✓ Manual test baseline: 5 key user flows work correctly

**Key User Flows** (baseline test):
1. Sign in → view profile
2. Browse products → view product detail
3. Admin: manage products
4. Admin: manage banners
5. Admin: manage users

---

## Phase 1: UI Component Extraction (P1)

### Goal
Extract and consolidate all common UI patterns into reusable components under `src/components/ui/`.

### Steps

#### 1.1 Create Component Infrastructure

```bash
# Create necessary directories (if not exist)
mkdir -p src/components/ui
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/constants
```

#### 1.2 Extract Loading Components

**Action**: Create loading spinner and skeleton components

```bash
# Create files
touch src/components/ui/loading-spinner.tsx
touch src/components/ui/skeleton.tsx
```

**Implementation**:
- Copy loading spinner pattern from `src/app/admin/layout.tsx:148-158` (animated logo)
- Add spinner and dots variants
- Add skeleton patterns for text, cards, tables

**Validation**:
- Test loading spinner in light and dark mode
- Verify skeleton animations work
- Check that all variants render correctly

**Commit**: `refactor(ui): add LoadingSpinner and Skeleton components`

#### 1.3 Extract Form Components

**Action**: Create form field wrapper and error message components

```bash
touch src/components/ui/form-field.tsx
touch src/components/ui/error-message.tsx
```

**Implementation**:
- Extract form field pattern from sign-in/sign-up pages
- Consolidate label + input + error display
- Add consistent styling and error states

**Target Pages**:
- `src/app/sign-in/page.tsx`
- `src/app/sign-up/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`

**Validation**:
- Test form validation displays correctly
- Verify error messages show in red
- Check disabled and loading states
- Test required field indicators

**Commit**: `refactor(ui): add FormField and ErrorMessage components`

#### 1.4 Extract Feedback Components

**Action**: Create toast notification and empty state components

```bash
touch src/components/ui/toast.tsx
touch src/components/ui/empty-state.tsx
```

**Implementation**:
- Create toast provider and hook
- Add success/error/warning/info variants
- Create empty state for lists with no data

**Validation**:
- Test toast notifications appear and dismiss
- Verify all toast variants display correctly
- Check empty states render with icons and actions

**Commit**: `refactor(ui): add Toast and EmptyState components`

#### 1.5 Extract Modal Component

**Action**: Create standardized modal/dialog wrapper

```bash
touch src/components/ui/modal.tsx
```

**Implementation**:
- Extract modal pattern from admin pages
- Add overlay backdrop with close on click
- Add footer slot for action buttons

**Validation**:
- Test modal opens and closes
- Verify overlay backdrop works
- Check escape key closes modal
- Test focus trap within modal

**Commit**: `refactor(ui): add Modal component`

#### 1.6 Extract Data Table Component

**Action**: Create reusable data table with pagination

```bash
touch src/components/ui/data-table.tsx
```

**Implementation**:
- Extract table pattern from admin users/products pages
- Add pagination controls
- Add sortable columns
- Add loading and empty states

**Validation**:
- Test table renders data correctly
- Verify pagination works
- Check sorting functionality
- Test loading skeleton displays

**Commit**: `refactor(ui): add DataTable component`

#### 1.7 Consolidate Button Variants

**Action**: Ensure all button patterns use consistent component

**Target**: Existing `src/components/ui/button.tsx`

**Implementation**:
- Review all button usage across pages
- Ensure all variants exist (primary, secondary, ghost, danger, outline)
- Add loading state if missing

**Validation**:
- Test all button variants
- Verify loading state works
- Check disabled state styling

**Commit**: `refactor(ui): consolidate Button component variants`

#### 1.8 Extract Badge Component

**Action**: Consolidate status badges and labels

```bash
touch src/components/ui/badge.tsx
```

**Implementation**:
- Extract badge patterns from order status, user roles
- Add color variants (success, warning, error, info)
- Ensure consistent sizing

**Validation**:
- Test all badge variants
- Verify colors match design system
- Check badge sizing consistency

**Commit**: `refactor(ui): add Badge component`

#### 1.9 Update Pages to Use New Components

**Action**: Replace inline UI patterns with extracted components

**Target Pages** (update one at a time):
1. `src/app/sign-in/page.tsx`
2. `src/app/sign-up/page.tsx`
3. `src/app/forgot-password/page.tsx`
4. `src/app/reset-password/page.tsx`
5. `src/app/profile/page.tsx`
6. Admin pages

**Implementation**:
- Import new components
- Replace inline UI with component usage
- Remove duplicated styling
- Test each page individually

**Validation** (after each page):
- Run `pnpm build` - should succeed
- Test page functionality in browser
- Verify dark mode still works
- Check i18n translations display

**Commit** (one per page): `refactor(ui): update [page] to use shared components`

#### 1.10 Phase 1 Validation

**Action**: Full validation of UI component extraction

**Tests**:
1. ✓ Run `pnpm lint` - zero errors
2. ✓ Run `pnpm build` - zero errors
3. ✓ Test all 5 key user flows - all work
4. ✓ Test light and dark mode - both work
5. ✓ Test i18n (VI/EN) - translations display

**If any test fails**: Fix before proceeding to Phase 2

**Commit**: `refactor(ui): complete Phase 1 - UI component extraction`

---

## Phase 2: Logic Separation (P2)

### Goal
Extract business logic, data fetching, and state management from pages into hooks, services, and utilities.

### Steps

#### 2.1 Extract Utility Functions

**Action**: Create utility functions for formatting and validation

```bash
touch src/utils/format-currency.ts
touch src/utils/format-date.ts
touch src/utils/validate.ts
touch src/utils/image-url.ts
```

**Implementation**:
- Extract `formatVND` from `src/lib/utils.ts` → `format-currency.ts`
- Create date formatting helpers
- Create email/phone validation functions
- Create image URL helpers

**Validation**:
- Test each utility function with sample inputs
- Verify locale support for formatting
- Check edge cases (null, undefined, empty values)

**Commit**: `refactor(logic): extract utility functions`

#### 2.2 Extract Constants

**Action**: Create constant files for routes, endpoints, config

```bash
touch src/constants/routes.ts
touch src/constants/api-endpoints.ts
touch src/constants/app-config.ts
```

**Implementation**:
- Extract all route strings from pages → `routes.ts`
- Extract all API endpoint strings → `api-endpoints.ts`
- Extract magic numbers and config → `app-config.ts`

**Validation**:
- Verify TypeScript type inference works (`as const`)
- Check that all routes are captured
- Test dynamic route functions (e.g., `PRODUCT_DETAIL(id)`)

**Commit**: `refactor(logic): extract constants`

#### 2.3 Extract Custom Hooks

**Action**: Create custom hooks for data operations

```bash
touch src/hooks/use-products.ts
touch src/hooks/use-categories.ts
touch src/hooks/use-orders.ts
touch src/hooks/use-form-validation.ts
touch src/hooks/use-pagination.ts
```

**Implementation**:
- Extract data fetching logic from pages
- Create consistent return shape (data, isLoading, error)
- Add CRUD operations for each resource

**Target Pages** (extract logic from):
- Product pages → `useProducts`
- Admin pages → various hooks
- Profile page → extract profile logic

**Validation**:
- Test each hook in isolation
- Verify loading states work
- Check error handling
- Test CRUD operations

**Commit**: `refactor(logic): extract custom hooks`

#### 2.4 Update Pages to Use Hooks and Utilities

**Action**: Replace inline logic with hooks and utilities

**Target Pages** (update one at a time):
1. Product pages - use `useProducts`, `formatCurrency`
2. Profile page - use extracted profile logic
3. Admin pages - use admin hooks

**Implementation**:
- Import hooks and utilities
- Remove inline data fetching
- Remove inline formatting logic
- Replace magic values with constants

**Validation** (after each page):
- Verify page logic unchanged
- Test all page interactions
- Check that data loads correctly

**Commit** (one per page): `refactor(logic): extract logic from [page]`

#### 2.5 Phase 2 Validation

**Action**: Full validation of logic separation

**Tests**:
1. ✓ Run `pnpm lint` - zero errors
2. ✓ Run `pnpm build` - zero errors
3. ✓ Test all 5 key user flows - all work
4. ✓ Pages are under 150 lines (80% under 100 lines)
5. ✓ No inline API calls in pages
6. ✓ No magic values in pages

**If any test fails**: Fix before proceeding to Phase 3

**Commit**: `refactor(logic): complete Phase 2 - logic separation`

---

## Phase 3: Code Quality (P3)

### Goal
Resolve all lint errors, remove dead code, improve TypeScript types, and ensure consistent code style.

### Steps

#### 3.1 Run Lint and Fix Auto-Fixable Issues

**Action**: Fix all ESLint auto-fixable issues

```bash
pnpm lint --fix
```

**Review**: Check what was auto-fixed and verify correctness

**Commit**: `refactor(quality): auto-fix lint issues`

#### 3.2 Fix Remaining Lint Errors

**Action**: Manually fix remaining lint errors

```bash
pnpm lint
```

**Focus Areas**:
- Unused imports
- Unused variables
- Missing return types
- Inconsistent naming

**Validation**:
- Run `pnpm lint` - zero errors
- Run `pnpm lint` - zero warnings

**Commit**: `refactor(quality): resolve lint errors and warnings`

#### 3.3 Improve TypeScript Types

**Action**: Replace all `any` types with proper types

**Search Pattern**: Search codebase for `any` keyword

**Implementation**:
- Replace `any` with proper interfaces
- Add explicit return types to functions
- Use `unknown` for truly unknown values
- Export all type definitions

**Validation**:
- Run `pnpm build` - zero TypeScript errors
- Search for `any` - only third-party types remain

**Commit**: `refactor(quality): improve TypeScript types`

#### 3.4 Remove Dead Code

**Action**: Remove all commented-out code and unused code

**Search Patterns**:
- Commented-out code blocks
- Unused functions (ESLint should flag)
- Unused mock data

**Implementation**:
- Delete all commented-out code
- Remove unused imports (already done by lint)
- Remove unused mock data files

**Validation**:
- Search for `//` multi-line comments
- Search for `/* */` comment blocks
- Verify no commented JSX

**Commit**: `refactor(quality): remove dead code`

#### 3.5 Remove Development Debugging Code

**Action**: Remove all console.log statements

```bash
# Search for console.log
grep -r "console\.log" src/
```

**Implementation**:
- Remove or replace with proper logging
- Keep console.error for production errors (if needed)

**Validation**:
- Search returns zero `console.log` instances

**Commit**: `refactor(quality): remove console.log statements`

#### 3.6 Standardize Error Handling

**Action**: Ensure all async operations have try/catch

**Review**: All async functions in hooks and services

**Implementation**:
- Add try/catch to async operations without error handling
- Ensure consistent error message format
- Return errors in consistent shape

**Validation**:
- Review all async functions
- Test error scenarios
- Verify error messages display to users

**Commit**: `refactor(quality): standardize error handling`

#### 3.7 Break Down Long Functions

**Action**: Refactor functions exceeding 30 lines

**Search**: Manually review long functions

**Implementation**:
- Extract helper functions
- Break down complex logic
- Use early returns to reduce nesting

**Validation**:
- Verify behavior unchanged
- Check readability improved

**Commit**: `refactor(quality): break down long functions`

#### 3.8 Phase 3 Validation

**Action**: Final quality validation

**Tests**:
1. ✓ Run `pnpm lint` - zero errors, zero warnings
2. ✓ Run `pnpm build` - zero errors
3. ✓ Test all 5 key user flows - all work
4. ✓ No `console.log` statements remain
5. ✓ No commented-out code blocks remain
6. ✓ No `any` types remain (except third-party)
7. ✓ All async operations have error handling

**If any test fails**: Fix before final validation

**Commit**: `refactor(quality): complete Phase 3 - code quality`

---

## Final Validation

### Complete Test Suite

**Action**: Run full manual test suite

**Tests**:
1. ✓ Build succeeds: `pnpm build`
2. ✓ Lint passes: `pnpm lint`
3. ✓ Dev server starts: `pnpm dev`
4. ✓ Key user flow 1: Sign in → view profile
5. ✓ Key user flow 2: Browse products → view detail
6. ✓ Key user flow 3: Admin manage products
7. ✓ Key user flow 4: Admin manage banners
8. ✓ Key user flow 5: Admin manage users
9. ✓ Light mode works correctly
10. ✓ Dark mode works correctly
11. ✓ i18n VI locale works
12. ✓ i18n EN locale works
13. ✓ Mobile responsive layout works
14. ✓ Loading states display correctly
15. ✓ Error states display correctly

### Success Criteria Validation

Check against spec success criteria:

- ✓ **SC-001**: `pnpm lint` produces zero errors and warnings
- ✓ **SC-002**: `pnpm build` succeeds with zero errors
- ✓ **SC-003**: Page files under 150 lines (80% under 100)
- ✓ **SC-004**: 40% reduction in code duplication
- ✓ **SC-005**: Maximum 15 shared UI components
- ✓ **SC-006**: All 5 key user flows work
- ✓ **SC-007**: No console.log statements
- ✓ **SC-008**: No commented-out code
- ✓ **SC-009**: Zero `any` types (except third-party)
- ✓ **SC-010**: 100% type coverage for custom code

### Final Commit and Documentation

**Action**: Final commit and update documentation

```bash
# Final commit
git add .
git commit -m "refactor: complete codebase quality refactor

- Extracted 15 shared UI components
- Separated business logic into hooks and utilities
- Resolved all lint errors and warnings
- Removed all `any` types from custom code
- Eliminated dead code and console.log statements
- Achieved 40% reduction in code duplication
- All page files now under 150 lines
- All 5 key user flows validated and working

Closes #003"
```

**Update Documentation**:
- Update `CLAUDE.md` if new patterns established
- Create summary document in `docs/summaries/refactor-summary.md` (if docs directory exists)

---

## Troubleshooting

### Build Errors

**Issue**: TypeScript compilation errors

**Solution**:
1. Run `pnpm build` to see specific errors
2. Fix type errors one at a time
3. Ensure all imports are correct
4. Check that all exported types match usage

### Functionality Broken

**Issue**: Page doesn't work after refactor

**Solution**:
1. Revert last commit: `git revert HEAD`
2. Identify what broke (compare before/after)
3. Fix the specific issue
4. Re-apply changes carefully
5. Test incrementally

### Performance Degradation

**Issue**: Pages load slower after refactor

**Solution**:
1. Check for unnecessary re-renders
2. Add `React.memo()` to expensive components
3. Use `useMemo()` for expensive computations
4. Use `useCallback()` for callback functions
5. Verify no circular dependencies

---

## Next Steps

After completing all phases and validations:

1. Create pull request for review
2. Run full regression testing if available
3. Deploy to staging environment for additional testing
4. Monitor for any issues in staging
5. Merge to main after approval
6. Deploy to production
7. Monitor production metrics

---

## Reference Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm lint                   # Run ESLint
pnpm lint --fix            # Auto-fix lint issues

# Git
git status                  # Check status
git diff                    # View changes
git add .                   # Stage changes
git commit -m "message"     # Commit changes
git log --oneline          # View commit history

# Search
grep -r "pattern" src/      # Search in source files
grep -r "console.log" src/  # Find console.log
grep -r "any" src/          # Find any types
```
