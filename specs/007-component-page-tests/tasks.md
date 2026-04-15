# Tasks: Component & Page TSX Tests

**Input**: Design documents from `/specs/007-component-page-tests/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing Jest config to collect coverage for the 9 tested component files and polyfill Radix UI's ResizeObserver dependency. Both tasks edit different files and can run in parallel.

- [X] T001 [P] Extend `collectCoverageFrom` in jest.config.js to add the 9 specific component paths: `src/components/ui/button.tsx`, `src/components/ui/rating-stars.tsx`, `src/components/ui/empty-state.tsx`, `src/components/ui/error-message.tsx`, `src/components/ui/loading-spinner.tsx`, `src/components/layout/cart-button.tsx`, `src/components/admin/confirm-dialog.tsx`, `src/components/admin/stat-card.tsx`, `src/components/home/product-card.tsx`
- [X] T002 [P] Add `global.ResizeObserver` stub to jest.setup.ts (needed for Radix UI Dialog in jsdom)

**Checkpoint**: Config updated — `pnpm test:coverage` now collects coverage for component files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No new infrastructure required — Jest 30, @testing-library/react v16, @testing-library/jest-dom v6, and Zustand v5 store reset pattern are all in place from feature 006. This phase is a pass-through checkpoint.

**⚠️ CRITICAL**: Verify `pnpm test` still passes (zero regressions) before beginning story phases.

- [X] T003 Verify all existing 006 tests pass by running `pnpm test` and confirming zero failures

**Checkpoint**: Baseline confirmed — user story test writing can begin in parallel.

---

## Phase 3: User Story 1 — UI Primitive Component Tests (Priority: P1) 🎯 MVP

**Goal**: Tests for the 5 UI primitive components (Button, RatingStars, EmptyState, ErrorMessage, LoadingSpinner). All 5 test files are fully independent and can be written in parallel.

**Independent Test**: `pnpm test src/__tests__/components/ui/` — all 5 files pass with zero Tailwind class assertions.

### Implementation for User Story 1

- [X] T004 [P] [US1] Create `src/__tests__/components/ui/button.test.tsx` — tests: renders without throwing; all 6 variants (default, destructive, outline, secondary, ghost, link) render accessible button markup; disabled button does NOT call onClick handler; asChild renders child element not a button
- [X] T005 [P] [US1] Create `src/__tests__/components/ui/rating-stars.test.tsx` — tests: rating=5 renders 5 full stars (no half, no empty); rating=3.5 renders 3 full + 1 half + 1 empty; rating=3 renders 3 full + 0 half + 2 empty; rating=0 renders 5 empty stars; rating=0.5 renders 0 full + 1 half + 4 empty (verifies hasHalf logic)
- [X] T006 [P] [US1] Create `src/__tests__/components/ui/empty-state.test.tsx` — tests: renders title text; renders description when provided; renders no description element when omitted; renders Link (anchor) when action.href is provided; renders Button when action.onClick is provided; renders no action element when action prop is absent; renders icon when provided
- [X] T007 [P] [US1] Create `src/__tests__/components/ui/error-message.test.tsx` — tests: inline=true (default) renders message text without role="alert"; inline=false renders with role="alert"; dismissible=true + onDismiss fires callback when dismiss button clicked; dismissible=false hides dismiss button even if onDismiss provided
- [X] T008 [P] [US1] Create `src/__tests__/components/ui/loading-spinner.test.tsx` — tests: variant="spinner" (default) renders the Loader2 icon container; variant="dots" renders 3 animated dot divs; variant="logo" renders an img element; size="sm"/"md"/"lg" renders without throwing for each variant combination

**Checkpoint**: US1 complete — `pnpm test src/__tests__/components/ui/` passes.

---

## Phase 4: User Story 2 — Stateful Layout & Dialog Component Tests (Priority: P1)

**Goal**: Tests for CartButton (Zustand store integration, badge display, 99+ overflow) and ConfirmDialog (callback wiring, cancel closes dialog). Both test files are independent.

**Independent Test**: `pnpm test src/__tests__/components/layout/ src/__tests__/components/admin/confirm-dialog.test.tsx` — both files pass.

### Implementation for User Story 2

- [X] T009 [P] [US2] Create `src/__tests__/components/layout/cart-button.test.tsx` — tests: renders cart link pointing to /cart; shows no badge when cart is empty (pre-mount safety); after mount with 0 items shows no badge; after mount with 3 items shows "3" in badge; after mount with 100 items shows "99+" in badge. Reset `useCartStore.setState({ items: [] })` in beforeEach
- [X] T010 [P] [US2] Create `src/__tests__/components/admin/confirm-dialog.test.tsx` — tests: open=false renders no dialog content; open=true renders title and description text; clicking Confirm calls onConfirm callback; clicking Confirm also calls onOpenChange(false); clicking Cancel calls onOpenChange(false) without calling onConfirm; variant="destructive" renders Confirm button without throwing

**Checkpoint**: US2 complete — CartButton store integration and ConfirmDialog callbacks verified.

---

## Phase 5: User Story 3 — Product & Admin Display Component Tests (Priority: P2)

**Goal**: Tests for ProductCard (out-of-stock state, cart dispatch, navigation href) and StatCard (positive/negative/zero trend display). Both test files are independent.

**Independent Test**: `pnpm test src/__tests__/components/home/ src/__tests__/components/admin/stat-card.test.tsx` — both files pass.

### Implementation for User Story 3

- [X] T011 [P] [US3] Create `src/__tests__/components/home/product-card.test.tsx` — tests: renders product name; renders formatted price; link href points to /products/{slug}; inStock=true shows enabled Add button; inStock=false shows disabled Add button; inStock=false shows "Out of Stock" badge; clicking Add on in-stock product calls useCartStore addItem; clicking Add does nothing when out of stock. Reset `useCartStore.setState({ items: [] })` in beforeEach; use mockProduct fixture from data-model.md
- [X] T012 [P] [US3] Create `src/__tests__/components/admin/stat-card.test.tsx` — tests: renders title text; renders value text; change > 0 renders TrendingUp icon (query by accessible label or test-id); change < 0 renders TrendingDown icon; change === 0 treated as positive (isPositive = change >= 0); renders without throwing for any numeric change value. Use `TrendingUp` from lucide-react as icon prop

**Checkpoint**: US3 complete — all 9 component test files exist and pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the full suite passes, coverage is reported correctly, and no regressions from feature 006 were introduced.

- [X] T013 Run `pnpm test` — confirm all tests pass (zero failures across features 006 and 007)
- [X] T014 Run `pnpm test:coverage` — confirm coverage report includes the 9 component files and global threshold (80%) remains green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 can run in parallel immediately
- **Foundational (Phase 2)**: Depends on T001 + T002 — T003 must pass before story phases begin
- **US1 (Phase 3)**: Depends on Phase 2 checkpoint — T004–T008 are all fully parallel
- **US2 (Phase 4)**: Depends on Phase 2 checkpoint — T009–T010 are fully parallel; can run concurrently with US1
- **US3 (Phase 5)**: Depends on Phase 2 checkpoint — T011–T012 are fully parallel; can run concurrently with US1 and US2
- **Polish (Phase 6)**: Depends on all story phases — T013 before T014

### User Story Dependencies

- **US1 (P1)**: Independent — starts after Phase 2
- **US2 (P1)**: Independent — starts after Phase 2, no dependency on US1
- **US3 (P2)**: Independent — starts after Phase 2, no dependency on US1 or US2

### Parallel Opportunities

- T001 and T002 (Setup) — different files, fully parallel
- T004, T005, T006, T007, T008 (US1) — 5 different files, fully parallel
- T009, T010 (US2) — 2 different files, fully parallel
- T011, T012 (US3) — 2 different files, fully parallel
- All story phases (US1, US2, US3) can run simultaneously once Phase 2 is confirmed

---

## Parallel Example: US1 (5 test files simultaneously)

```bash
# All 5 can be created in one pass:
Task: "Create src/__tests__/components/ui/button.test.tsx"
Task: "Create src/__tests__/components/ui/rating-stars.test.tsx"
Task: "Create src/__tests__/components/ui/empty-state.test.tsx"
Task: "Create src/__tests__/components/ui/error-message.test.tsx"
Task: "Create src/__tests__/components/ui/loading-spinner.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002 in parallel)
2. Complete Phase 2: Foundational (T003 verification)
3. Complete Phase 3: US1 (T004–T008 in parallel)
4. **STOP and VALIDATE**: `pnpm test src/__tests__/components/ui/` — 5 files pass
5. Deliver: 5 tested UI primitives

### Incremental Delivery

1. Setup + Foundational → config ready
2. US1 (5 files) → primitives covered → MVP deliverable
3. US2 (2 files) → stateful components covered
4. US3 (2 files) → all 9 component files covered
5. Polish → full suite validated

---

## Notes

- All test files must use `@testing-library/react` `render`/`screen` — no Enzyme, no direct DOM queries on class names
- ResizeObserver polyfill (T002) is required before ConfirmDialog tests (T010) can pass
- CartButton uses `React.useEffect` for `mounted` state — tests must account for this (the badge appears after mount, which happens synchronously in jsdom's act() wrapping from @testing-library/react)
- `next/jest` auto-handles `next/image` → `<img>` and `next/link` → `<a>` — no manual mocks needed
- Zustand store reset: `useCartStore.setState({ items: [] })` (not `setState(initialState, true)` — partial reset is sufficient since items is the only relevant slice)
