# Baseline Metrics: Codebase Before Refactoring

**Date**: 2026-03-28
**Branch**: 003-codebase-refactor
**Purpose**: Document the current state before refactoring begins

## Lint Results

**Command**: `pnpm lint`
**Status**: ✓ PASS (0 errors, 3 warnings)

### Warnings:
1. `/src/app/admin/promotions/page.tsx:971:23` - Using `<img>` instead of `<Image />` from next/image
2. `/src/app/cart/page.tsx:13:10` - 'cn' is defined but never used
3. `/src/components/reviews/review-form.tsx:14:41` - '_productId' is defined but never used

**Baseline Lint Count**: 3 warnings, 0 errors

## Build Results

**Command**: `pnpm build`
**Status**: ✓ PASS
**Build Time**: ~3.3s (TypeScript compilation)
**Total Routes**: 31 routes

## Key User Flows (Manual Test Checklist)

These flows will be tested after each major refactoring phase:

1. **Sign in → view profile**
   - [ ] Navigate to /sign-in
   - [ ] Enter credentials and submit
   - [ ] Redirect to /profile
   - [ ] Profile data displays correctly

2. **Browse products → view detail**
   - [ ] Navigate to /products
   - [ ] Product grid displays
   - [ ] Click a product
   - [ ] Product detail page displays correctly

3. **Admin: manage products**
   - [ ] Navigate to /admin/login
   - [ ] Login as admin
   - [ ] Navigate to /admin/products
   - [ ] Product table displays with pagination
   - [ ] Create/Edit/Delete operations work

4. **Admin: manage banners**
   - [ ] Navigate to /admin/banners
   - [ ] Banner list displays
   - [ ] Create/Edit/Delete operations work
   - [ ] Image upload works

5. **Admin: manage users**
   - [ ] Navigate to /admin/users
   - [ ] User table displays
   - [ ] User detail view works
   - [ ] User status changes work

## Current Component Count

**Existing UI Components** (src/components/ui/):
- avatar.tsx
- badge.tsx ✓
- button.tsx ✓
- card.tsx ✓
- carousel.tsx
- checkbox.tsx
- dialog.tsx ✓
- dropdown-menu.tsx
- input.tsx ✓
- label.tsx ✓
- product-image.tsx
- rating-stars.tsx
- select.tsx
- separator.tsx
- sheet.tsx
- skeleton.tsx ✓
- slider.tsx
- switch.tsx
- tabs.tsx
- textarea.tsx

**Total**: 20 existing UI components

**Target**: Consolidate to ≤15 shared components (may involve removing/merging rarely used ones)

## Current Directory Structure

```
src/
├── app/              (31 routes)
├── components/       (ui/, layout/, home/, reviews/, admin/, notifications/)
├── data/             (mock data)
├── hooks/            (use-auth-guard.ts, use-protected-route.ts)
├── i18n/             (messages/)
├── lib/              (api.ts, utils.ts, constants.ts)
├── services/         (auth-service.ts, user-service.ts, products-service.ts, etc.)
├── stores/           (auth-store.ts, cart-store.ts, wishlist-store.ts, etc.)
├── types/            (shared TypeScript types)
├── utils/            (created, empty)
└── constants/        (created, empty)
```

## Success Criteria Targets

After refactoring completion, we should achieve:

- ✓ SC-001: `pnpm lint` zero errors and warnings (currently 3 warnings)
- ✓ SC-002: `pnpm build` succeeds (currently passing)
- ⏳ SC-003: Page files under 150 lines (80% under 100 lines) - TBD
- ⏳ SC-004: 40% reduction in code duplication - TBD
- ⏳ SC-005: Maximum 15 shared UI components (currently 20)
- ⏳ SC-006: All 5 key user flows work - TBD
- ⏳ SC-007: No console.log statements - TBD
- ⏳ SC-008: No commented-out code - TBD
- ⏳ SC-009: Zero `any` types (except third-party) - TBD
- ⏳ SC-010: 100% type coverage for custom code - TBD

## Notes

- Project is in good shape: zero lint errors, successful build
- Main work will be extraction and consolidation rather than fixing broken code
- Existing components (badge, button, card, dialog, input, label, skeleton) can be leveraged
- Need to create: LoadingSpinner, FormField, ErrorMessage, Toast, EmptyState, Modal, DataTable
- May consolidate or remove some of the 20 existing components to reach ≤15 target
