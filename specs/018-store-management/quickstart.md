# Quickstart: Store Management Implementation Guide

**Feature**: 018-store-management  
**Date**: 2026-05-22

## Overview

This guide outlines the recommended implementation sequence for the Morii Coffee store management feature. Follow the steps in order so the feature gains stable contracts first, then public UI, then admin workflows, and finally verification.

---

## Prerequisites

Before implementation starts:

1. Confirm the backend store APIs described in `docs/features/store-management/frontend-api-guide.md` are available in the local environment.
2. Confirm `NEXT_PUBLIC_API_BASE_URL` points to the backend serving `/v1/stores` and `/v1/admin/stores`.
3. Add the Google Maps loader dependency if it is not yet installed:
   - `@googlemaps/js-api-loader`
4. Confirm `NEXT_PUBLIC_GOOGLE_MAPS_KEY` is available for local browser verification.
5. Review the existing store placeholders in:
   - `src/app/stores/page.tsx`
   - `src/components/home/store-locator-preview.tsx`
   - `src/data/stores.ts`

---

## Implementation Steps

### Step 1: Build the store feature foundation

**Files**:
- `src/features/stores/types.ts`
- `src/features/stores/api.ts`
- `src/features/stores/hooks.ts`
- `src/features/stores/schema.ts`
- `src/features/stores/utils.ts`
- `src/features/stores/index.ts`

**Actions**:
- Add exact backend-aligned store DTOs, query types, form types, and reorder types.
- Add API functions for public list/detail and admin list/detail/create/update/delete/status/reorder.
- Add utility helpers for query building, open-state calculation, city derivation, and payload normalization.
- Add zod-backed form validation and default weekly-hours values.
- Add hooks for public stores, admin stores, and single-store loading.

**Validation**:
- Run focused tests for utilities and API wrappers as soon as they exist.
- Run ESLint on the new feature module.

### Step 2: Replace the public mock locator

**Files**:
- `src/app/stores/page.tsx`
- `src/components/home/store-locator-preview.tsx`
- `src/features/stores/components/store-locator.tsx`
- `src/features/stores/components/store-locator-map.tsx`
- `src/features/stores/components/store-preview-list.tsx`
- `src/features/stores/components/store-status-badge.tsx`
- `src/data/stores.ts` (retire or remove)

**Actions**:
- Mount the public feature component on `/stores`.
- Replace mock homepage preview data with live public stores.
- Implement search, city filter, near-me flow, distance display, selected-store synchronization, and map fallback behavior.
- Move open/closed labels onto derived utility logic.

**Validation**:
- Verify `/stores` works with and without geolocation permission.
- Verify home preview and `/stores` show consistent store details.

### Step 3: Add admin route wiring and navigation

**Files**:
- `src/constants/routes.ts`
- `src/constants/api-endpoints.ts`
- `src/app/admin/layout.tsx`
- `src/i18n/messages/en.json`
- `src/i18n/messages/vi.json`

**Actions**:
- Add admin store routes and navigation entry.
- Add public/admin user-facing strings for store management.
- Align constants with the new store feature surface.

**Validation**:
- Verify the admin sidebar highlights the new section correctly.
- Verify both locale bundles include the new keys cleanly.

### Step 4: Implement admin store directory and form flows

**Files**:
- `src/app/admin/stores/page.tsx`
- `src/app/admin/stores/new/page.tsx`
- `src/app/admin/stores/edit/[id]/page.tsx`
- `src/features/stores/components/admin-store-list.tsx`
- `src/features/stores/components/store-form.tsx`
- `src/features/stores/components/store-hours-editor.tsx`

**Actions**:
- Build the admin list with search, city filter, status filter, retry, empty, and destructive-action states.
- Implement create/edit forms with full weekly-hours editing.
- Implement activate/deactivate, delete, and reorder workflows with appropriate confirmations and role boundaries.

**Validation**:
- Verify create, edit, status toggle, delete, and reorder behavior against the backend contract.
- Verify inactive stores disappear from public browsing after status change.

### Step 5: Add focused unit coverage

**Files**:
- `src/__tests__/features/stores/*.test.ts`
- `src/__tests__/features/stores/*.test.tsx`
- Optional updates to page/home tests if preview behavior is directly asserted there

**Suggested test slices**:
- Opening-hours availability utilities
- Query string and payload normalization helpers
- Public/admin API wrapper functions
- Public/admin data hooks
- Store form validation
- One or more critical feature components (public locator list state, admin list state, or store form behavior)

### Step 6: Run final verification before shipping

**Required commands**:

```bash
pnpm test -- --runInBand
pnpm lint
pnpm build
```

**Required manual checks**:
- Public `/stores` page loads and shows real data.
- Near-me gracefully falls back when location permission is denied.
- Store selection syncs between list and map.
- Homepage preview links to `/stores` and shows live availability details.
- Admin `/admin/stores` list loads, filters, and navigates correctly.
- Create/edit/delete/status/reorder workflows behave correctly for authorized roles.

---

## Ship Gate

The feature is ready to move beyond implementation only when all of the following are true:

- Public store discovery is backend-driven and no longer depends on `src/data/stores.ts`.
- Admin store workflows cover create, edit, deactivate, remove, and reorder.
- Unit tests pass for the new feature module.
- `pnpm lint` passes.
- `pnpm build` passes.
- Manual public/admin browser verification is complete.
