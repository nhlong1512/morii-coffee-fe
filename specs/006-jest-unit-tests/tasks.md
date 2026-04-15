# Tasks: Jest Unit Test Setup

**Input**: Design documents from `/specs/006-jest-unit-tests/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Test tasks ARE the primary deliverable of this feature. All phases produce test files.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup (Install Dependencies)

**Purpose**: Add Jest and testing packages to the project so subsequent phases can run tests.

- [X] T001 Install Jest dev dependencies: `jest@^29`, `jest-environment-jsdom@^29`, `@testing-library/react@^16`, `@testing-library/jest-dom@^6`, `@types/jest@^29` via `pnpm add -D` in `package.json`

---

## Phase 2: Foundational (Jest Infrastructure)

**Purpose**: Create the Jest configuration and setup files that ALL test phases depend on. No test file can pass until this phase is complete.

**⚠️ CRITICAL**: No user story test work can begin until this phase is complete.

- [X] T002 Create `jest.config.ts` at repo root using `next/jest` SWC transform, `testEnvironment: 'jsdom'`, `moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }`, `setupFilesAfterFramework: ['./jest.setup.ts']`, and `collectCoverageFrom` scoped to `src/utils/**`, `src/helpers/**`, `src/hooks/**`, `src/stores/**`, `src/lib/utils.ts` with `coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } }`
- [X] T003 Create `jest.setup.ts` at repo root importing `@testing-library/jest-dom` and exporting a `resetZustandStores` helper that resets all stores to initial state for use in `beforeEach` blocks
- [X] T004 Add `"test": "jest"` and `"test:coverage": "jest --coverage"` scripts to `package.json`

**Checkpoint**: Run `pnpm test` — should exit with "no tests found" (not a config error). Foundation is ready.

---

## Phase 3: User Story 1 — Test Runner Verified (Priority: P1) 🎯 MVP

**Goal**: Confirm the Jest infrastructure works end-to-end with at least one real passing test and a valid coverage report.

**Independent Test**: Run `pnpm test` — suite passes. Run `pnpm test:coverage` — coverage report appears with no errors.

- [X] T005 [US1] Create `src/__tests__/lib/utils.test.ts` testing `cn` (class merging, conflict resolution) and `formatCategory` (known category slug → display name, unknown slug → title-cased fallback) from `src/lib/utils.ts`

**Checkpoint**: `pnpm test src/__tests__/lib/utils.test.ts` passes. `pnpm test:coverage` generates a coverage report without errors.

---

## Phase 4: User Story 2 — Pure Utility Functions Covered (Priority: P1)

**Goal**: All six utility modules have full test coverage of happy path, boundary values, and error inputs. No Tailwind class assertions.

**Independent Test**: `pnpm test src/__tests__/utils/` — all files pass. Coverage for `src/utils/` exceeds 90% lines.

- [X] T006 [P] [US2] Create `src/__tests__/utils/format-currency.test.ts` testing: `formatVND(0)`, `formatVND(100000)` → correct locale string, `formatVND(1234567)`, `parseVND("100.000 ₫")` → `100000`, `parseVND` with malformed string, `formatCompactVND(999)` (uses `formatVND`), `formatCompactVND(45000)` → `"45.0K ₫"`, `formatCompactVND(1200000)` → `"1.2M ₫"`
- [X] T007 [P] [US2] Create `src/__tests__/utils/format-date.test.ts` testing: `formatShortDate` and `formatLongDate` with ISO string and Date object, `formatDateTime` includes time, `formatDateRange` format `"DD MMM YYYY → DD MMM YYYY"`, `formatRelativeTime` for "just now" (<60s), "X minutes ago" (<60min), "X hours ago" (<24h), "X days ago" (<7d), future date fallback, `formatInputDate` → `"YYYY-MM-DD"` format
- [X] T008 [P] [US2] Create `src/__tests__/utils/image-url.test.ts` testing: `getProductImageUrl(null)` → default placeholder, `getProductImageUrl("")` → default, `getProductImageUrl("/path")` → returns as-is, same for `getAvatarImageUrl` and `getBannerImageUrl`, `buildCdnUrl` with no `NEXT_PUBLIC_CDN_URL` → returns path unchanged, `buildCdnUrl` with CDN base + options → correct query string, `isExternalUrl("http://...")` → true, `isExternalUrl("/path")` → false, `isExternalUrl("https://...")` → true, `getOptimizedImageUrl` with each size variant
- [X] T009 [P] [US2] Create `src/__tests__/utils/validate.test.ts` testing: `isValidEmail` with valid email, missing `@`, missing domain, spaces; `validatePassword` for min-length failure, missing uppercase, missing lowercase, missing number, passing password; `isValidPhone` with `0912345678`, `+84912345678`, invalid formats; `isRequired` with empty string, whitespace, null, undefined, number `0`, non-zero number; `validatePasswordMatch` matching and non-matching; `isValidUrl` with `https://`, `http://`, relative path, garbage string; `isInRange` for in-range, below min, above max, at boundaries
- [X] T010 [P] [US2] Create `src/__tests__/utils/products.test.ts` testing: `generateSlug` with plain string, string with spaces, special characters, leading/trailing spaces, multiple consecutive hyphens, uppercase; `toggleArrayItem` add new item, remove existing item, array remains unchanged type; `toggleSetItem` add new string, remove existing string, returns new Set (immutability); `ALL_SIZES` contains Small/Medium/Large in order
- [X] T011 [P] [US2] Create `src/__tests__/utils/oauth.test.ts` testing: `initiateOAuthFlow` mocks `document.createElement`, `document.body.appendChild`, `form.submit` — verifies form `action` contains correct provider and encoded `returnUrl`; `initiateGoogleSignIn` calls `initiateOAuthFlow("Google", "/")` (spy); default `provider` and `returnUrl` values when omitted; env var `NEXT_PUBLIC_API_BASE_URL` used in URL

**Checkpoint**: `pnpm test src/__tests__/utils/` — all 6 files pass with no failures.

---

## Phase 5: User Story 3 — Hook Logic Covered (Priority: P2)

**Goal**: All eight custom hooks have tests covering state transitions, async loading/error states, and filtering logic.

**Independent Test**: `pnpm test src/__tests__/hooks/` — all files pass. Coverage for `src/hooks/` exceeds 80% branches.

- [X] T012 [P] [US3] Create `src/__tests__/hooks/use-pagination.test.ts` using `renderHook`: initial state (`page=1`, `totalPages=1` when `totalCount=0`), `nextPage` increments when `hasNext`, `nextPage` no-ops at last page, `previousPage` decrements when `hasPrevious`, `previousPage` no-ops at page 1, `goToPage` clamps to `[1, totalPages]`, `goToLastPage`, `goToFirstPage`, `setPageSize` resets to page 1, `offset` and `limit` computed correctly, `totalPages = ceil(totalCount / pageSize)`
- [X] T013 [P] [US3] Create `src/__tests__/hooks/use-form-validation.test.ts` using `renderHook`: `validateField` with "required" rule on empty string, `validateField` with "email" rule on invalid email, `validateField` with "password" rule (each failure branch), `validateField` with `minLength` / `maxLength` rules, `validateField` with `custom` rule, `validateForm` returns false when any field invalid and populates `errors`, `validateForm` handles "match" rule between two fields (matching and non-matching), `clearError` removes single field error, `clearAllErrors` empties all errors, `setError` manually sets an error
- [X] T014 [P] [US3] Create `src/__tests__/hooks/use-orders.test.ts` using `renderHook`: no filter returns all orders, `search` matching `customerName` (case-insensitive), `search` matching `orderNumber`, `search` with no match returns empty, `orderStatus` filter exact match, `orderStatus: "all"` returns all, `paymentStatus` filter, combined search + status filters
- [X] T015 [P] [US3] Create `src/__tests__/hooks/use-toast.test.ts` testing the exported `reducer` directly (no hook render needed): `ADD_TOAST` appends to front, respects `TOAST_LIMIT=3`, `UPDATE_TOAST` updates matching id only, `DISMISS_TOAST` with id sets `open: false` for that id, `DISMISS_TOAST` without id sets all `open: false`, `REMOVE_TOAST` with id removes it, `REMOVE_TOAST` without id clears all toasts
- [X] T016 [P] [US3] Create `src/__tests__/hooks/use-banners.test.ts`: mock `@/services/banners-service`, verify loading=true on mount, loading=false after resolve, banners sorted by `displayOrder` ascending, error state set when service throws, `refetch` re-calls the service
- [X] T017 [P] [US3] Create `src/__tests__/hooks/use-categories.test.ts`: mock `@/services/categories-service`, verify loading=true on mount, loading=false after resolve, categories sorted by `displayOrder` ascending, error state set when service throws, `refetch` re-calls the service
- [X] T018 [P] [US3] Create `src/__tests__/hooks/use-products.test.ts`: mock `@/services/products-service`, verify loading=true on mount, products/hasNext/totalCount set on success, error state set when service throws, `refetch` re-calls the service
- [X] T019 [P] [US3] Create `src/__tests__/hooks/use-admin-users.test.ts`: mock `@/services/user-service`, verify loading=true on mount, users/metadata set on success, error state set when service throws, `refetch` re-calls the service

**Checkpoint**: `pnpm test src/__tests__/hooks/` — all 8 files pass.

---

## Phase 6: User Story 4 — Zustand Store Logic Covered (Priority: P2)

**Goal**: All five Zustand store files have tests covering every exported action and derived getter, with store state reset between each test.

**Independent Test**: `pnpm test src/__tests__/stores/` — all files pass. Coverage for `src/stores/` exceeds 85% functions.

- [X] T020 [P] [US4] Create `src/__tests__/stores/cart-store.test.ts`: reset store in `beforeEach` via `useCartStore.setState(initialState, true)`; test `addItem` adds new item with `quantity=1`, `addItem` same productId+size increments quantity, `addItem` same productId different size is separate entry; `removeItem` removes correct item leaving others; `updateQuantity` sets quantity, `updateQuantity(id, 0)` removes item; `clearCart` empties items; `totalItems` sums quantities; `totalPrice` sums price×quantity
- [X] T021 [P] [US4] Create `src/__tests__/stores/wishlist-store.test.ts`: reset store in `beforeEach`; `addItem` adds new id, `addItem` same id again no-ops (length unchanged); `removeItem` removes existing, `removeItem` non-existent is safe; `isInWishlist` returns true/false correctly
- [X] T022 [P] [US4] Create `src/__tests__/stores/notification-store.test.ts`: reset store in `beforeEach` seeding known notifications; `markAsRead(id)` sets only that notification's `isRead=true`, others unchanged; `markAllAsRead` sets all `isRead=true`; `unreadCount()` returns correct count before and after marking; marking already-read notification is idempotent
- [X] T023 [P] [US4] Create `src/__tests__/stores/admin-store.test.ts`: reset store in `beforeEach`; initial `sidebarOpen=true`; `toggleSidebar` flips to false then back to true; `setSidebarOpen(false)` sets false; `setSidebarOpen(true)` sets true; `setSidebarOpen` with current value is idempotent
- [X] T024 [US4] Create `src/__tests__/stores/auth-store.test.ts`: mock `@/services/auth-service` and `@/services/user-service`; reset store in `beforeEach`; `signIn` sets `user`, `accessToken`, `refreshToken`, `isAuthenticated=true`; `signUp` same shape; `logout` clears all auth fields; `hasRole` returns true for matching role, false for non-matching; `setTokens` updates tokens; `setRedirectTo` / `clearRedirectTo` / `getAndClearRedirectTo` round-trip; `syncProfile` calls `getProfile` and updates `user`; `signIn` throws when service throws (error propagates)

**Checkpoint**: `pnpm test src/__tests__/stores/` — all 5 files pass.

---

## Phase 7: User Story 5 — Helper FormData Builders Covered (Priority: P3)

**Goal**: All three FormData builder helpers produce correctly keyed and valued `FormData` entries.

**Independent Test**: `pnpm test src/__tests__/helpers/` — all 3 files pass.

- [X] T025 [P] [US5] Create `src/__tests__/helpers/categories.test.ts` testing `buildCategoryFormData`: full `CreateCategoryRequest` produces `Name`, `Description`, `Icon` (File), `DisplayOrder` entries with correct values and casing; optional fields omitted when undefined (no spurious entries); `IsActive` only present in `UpdateCategoryRequest` when provided; `DisplayOrder` appended as string
- [X] T026 [P] [US5] Create `src/__tests__/helpers/products.test.ts` testing `buildProductFormData`: full request produces all expected keys (`Name`, `Slug`, `Description`, `BasePrice`, `CategoryIds`, `Thumbnail`, `IsFeatured`, `DisplayOrder`); multiple `CategoryIds` appended as repeated entries; `Status` only present when `status` field exists on request; empty `categoryIds` array appends no `CategoryIds` entries; optional fields absent when undefined
- [X] T027 [P] [US5] Create `src/__tests__/helpers/banners.test.ts` testing `buildBannerFormData`: full `CreateBannerRequest` produces `Title`, `Subtitle`, `Cta`, `CtaLink`, `DisplayOrder`, `StartDate`, `EndDate`, `IsActive`, `Image` entries; optional fields absent when undefined; `IsActive` appended as string `"true"` / `"false"`; `DisplayOrder` appended as string; `Image` as File object appended under correct key

**Checkpoint**: `pnpm test src/__tests__/helpers/` — all 3 files pass.

---

## Phase 8: Polish & Coverage Gate

**Purpose**: Validate aggregate coverage meets the 80% threshold across all dimensions and confirm no Tailwind assertions exist.

- [X] T028 Run `pnpm test:coverage` and confirm all four coverage dimensions (statements, branches, functions, lines) are ≥ 80%; if any fail, add missing test cases to the relevant test files to close gaps
- [X] T029 [P] Audit all test files in `src/__tests__/` to confirm zero calls to `toHaveClass` with Tailwind utility class names (e.g., `w-full`, `flex`, `text-sm`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (pnpm install must complete first)
- **Phases 3–7 (User Stories)**: All depend on Phase 2 (jest.config.ts must exist)
  - Phase 3 (US1) should be done first to verify infrastructure
  - Phases 4–7 can proceed in any order after Phase 3 validates config
- **Phase 8 (Polish)**: Depends on all story phases being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 foundation only
- **US2 (P1)**: Depends on Phase 2 + Phase 3 (US1 verifies config)
- **US3 (P2)**: Depends on Phase 2 + Phase 3; independent of US2
- **US4 (P2)**: Depends on Phase 2 + Phase 3; independent of US2/US3
- **US5 (P3)**: Depends on Phase 2 + Phase 3; independent of US2/US3/US4

### Within Each User Story

- All `[P]` tasks within a story can run in parallel (different files)
- Store test files require `beforeEach` reset boilerplate (defined in jest.setup.ts from T003)
- Mock service calls (T016–T019, T024) depend on knowing the service module interface, available from `src/services/`

### Parallel Opportunities

- T006–T011 (US2 utils): all 6 files are independent — can be written in parallel
- T012–T019 (US3 hooks): all 8 files are independent — can be written in parallel
- T020–T023 (US4 stores): 4 files independent; T024 (auth-store) slightly more complex
- T025–T027 (US5 helpers): all 3 files are independent — can be written in parallel
- T028–T029 (Polish): can run in parallel

---

## Parallel Example: User Story 2 (Utils)

```bash
# Launch all 6 util test files together — no file conflicts, no shared state:
Task T006: format-currency.test.ts
Task T007: format-date.test.ts
Task T008: image-url.test.ts
Task T009: validate.test.ts
Task T010: products.test.ts
Task T011: oauth.test.ts
```

## Parallel Example: User Story 3 (Hooks)

```bash
# Launch all 8 hook test files together:
Task T012: use-pagination.test.ts
Task T013: use-form-validation.test.ts
Task T014: use-orders.test.ts
Task T015: use-toast.test.ts
Task T016: use-banners.test.ts
Task T017: use-categories.test.ts
Task T018: use-products.test.ts
Task T019: use-admin-users.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Install dependencies (T001)
2. Complete Phase 2: Jest config + setup + scripts (T002–T004)
3. Complete Phase 3: US1 smoke test (T005)
4. **STOP and VALIDATE**: `pnpm test` passes, `pnpm test:coverage` runs cleanly

### Incremental Delivery

1. Setup + Foundation → `pnpm test` works (MVP infrastructure)
2. Add US2 utils tests → `pnpm test:coverage` shows 90%+ utils coverage
3. Add US3 hook tests → hook coverage added
4. Add US4 store tests → store coverage added
5. Add US5 helper tests → all in-scope coverage targets met
6. Phase 8 coverage gate → final validation

### Parallel Team Strategy

With multiple developers (once Phases 1–3 complete):
- Developer A: US2 (T006–T011, utils tests)
- Developer B: US3 (T012–T019, hooks tests)
- Developer C: US4 (T020–T024, store tests) + US5 (T025–T027, helper tests)

---

## Notes

- `[P]` tasks = different files, no dependencies — safe to run concurrently
- `[Story]` label maps each task to a specific user story for traceability
- Zustand v5: use `useStore.setState(useStore.getInitialState(), true)` — NOT v4 middleware
- `@testing-library/react` must be v16+ for React 19 compatibility
- Never assert on Tailwind CSS class names in any test
- Commit after each phase checkpoint passes
