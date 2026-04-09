# Tasks: Responsive Design Fixes

**Input**: Design documents from `/specs/005-responsive-design-fixes/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: No test tasks — spec does not request TDD. Verification is visual inspection at breakpoints.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- All fixes are Tailwind CSS class changes only — no logic or component restructuring

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Fix the shared `DataTable` component — used across all admin pages. Must complete before any admin (US3) work begins.

**⚠️ CRITICAL**: Admin user story tasks depend on this fix.

- [X] T001 In `src/components/admin/data-table.tsx` line 131, change the table wrapper div from `className="rounded-md border border-border overflow-hidden"` to `className="overflow-x-auto rounded-md border border-border"` so that wide admin tables scroll horizontally within their container instead of overflowing the page on narrow viewports

**Checkpoint**: Admin data tables now scroll horizontally on mobile/tablet without page-level overflow.

---

## Phase 2: User Story 1 — Mobile Visitor Browsing Products (Priority: P1) 🎯 MVP

**Goal**: All public-facing pages (home, products, product detail, cart, auth) render without horizontal overflow on viewports ≥ 320px, with readable layouts and tappable controls.

**Independent Test**: Open home page, `/products`, `/products/[any-slug]`, and `/cart` at 375px viewport width. Confirm no horizontal scrollbar, all grids stack vertically, navigation opens cleanly, and cart controls are accessible.

### Implementation for User Story 1

- [X] T002 [P] [US1] In `src/components/layout/header.tsx`, wrap the `<SearchBar />` component with a `hidden sm:flex` container so the search bar is hidden on xs viewports (< 640px) and reappears on sm+, reducing header crowding on small phones
- [X] T003 [P] [US1] In `src/components/layout/mobile-menu.tsx`, verify the `md:hidden` outer div is present — it already wraps the component; confirm the dropdown uses `position: absolute` anchored to the `sticky` header parent (no change needed if already correct)
- [X] T004 [P] [US1] In `src/app/products/page.tsx`, change the product grid class from `grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4` to `grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` so that at 1024px (laptop) three columns are shown instead of jumping directly to `xl:`
- [X] T005 [P] [US1] In `src/app/products/page.tsx`, verify the Search + Sort bar row `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between` already stacks on mobile — if not, add the `flex-col` default and `sm:flex-row`
- [X] T006 [P] [US1] In `src/app/products/[slug]/page.tsx`, read the full page JSX and verify the product detail layout uses `grid gap-8 lg:grid-cols-2` (single column on mobile/tablet, two columns on desktop). Verify the variant size buttons and add-to-cart row use `flex flex-wrap gap-2` so they wrap on small screens; add `flex-wrap` if missing
- [X] T007 [P] [US1] In `src/app/cart/page.tsx`, verify the cart item row `flex gap-4` with `h-24 w-24 shrink-0` image and `flex-1 min-w-0` content renders correctly at 320px. If the bottom row (quantity controls + price + remove) overflows at 320px, change it to `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
- [X] T008 [P] [US1] In `src/app/sign-in/page.tsx`, read the full page JSX and verify the sign-in card is centered with `mx-auto max-w-md` and all form fields are full-width. Fix any fixed-width inputs that could overflow on mobile
- [X] T009 [P] [US1] In `src/app/sign-up/page.tsx`, read the full page JSX and apply the same checks as T008 — centered card, full-width inputs, no fixed widths
- [X] T010 [P] [US1] In `src/app/forgot-password/page.tsx`, read the full page JSX and apply the same checks — centered card layout, full-width inputs
- [X] T011 [P] [US1] In `src/app/reset-password/page.tsx`, read the full page JSX and apply the same checks — centered card layout, full-width inputs
- [X] T012 [P] [US1] In `src/app/change-password/page.tsx`, read the full page JSX and apply the same checks — centered card layout, full-width inputs
- [X] T013 [P] [US1] In `src/components/home/hero-carousel.tsx`, verify the `CarouselFallback` and live slide content text uses `text-4xl md:text-6xl` (already present). Verify arrow buttons at `left-4` / `right-4` do not overlap the text at 320px — if they do, reduce to `left-2 right-2` on mobile using `left-2 sm:left-4`
- [X] T014 [P] [US1] In `src/components/home/store-locator-preview.tsx`, read the full component and verify it uses responsive classes. Add `sm:` or `md:` prefixes to any fixed-width or fixed-layout classes that would overflow on mobile

**Checkpoint**: All public-facing pages render without horizontal overflow at 375px. Home → Products → Product Detail → Cart flow is fully usable on mobile.

---

## Phase 3: User Story 2 — Tablet User Browsing (Priority: P2)

**Goal**: All pages adapt correctly at 768px and 1024px breakpoints — grids shift from single to multi-column, no layout jumps, blog cards scale, profile forms display correctly.

**Independent Test**: Resize browser to exactly 768px and 1024px. Confirm product cards show 2 and 3 columns respectively, blog cards don't overflow, profile tab list is scrollable, and store/loyalty/orders/wishlist pages display correctly.

### Implementation for User Story 2

- [X] T015 [P] [US2] In `src/app/blog/page.tsx`, verify the grid `grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3` is present. Confirm blog cards have `overflow-hidden` and images use `h-48` with `object-cover` so they don't stretch at tablet widths — no change needed if already correct
- [X] T016 [P] [US2] In `src/app/blog/[slug]/page.tsx`, verify the article header image uses responsive height `h-64 sm:h-80` and the prose content is inside `max-w-3xl mx-auto` so it doesn't stretch too wide on tablet — add `sm:h-80` to image if missing
- [X] T017 [US2] In `src/app/profile/page.tsx`, read the full page JSX and:
  1. Wrap the `<TabsList>` in `<div className="overflow-x-auto">` if the tab list can overflow on narrow screens
  2. Verify edit form fields use `grid gap-4 sm:grid-cols-2` where two inputs are shown side by side on tablet and stacked on mobile
  3. Verify the profile header (avatar + name + edit button) uses `flex flex-col sm:flex-row` for proper mobile stacking
- [X] T018 [P] [US2] In `src/app/orders/page.tsx`, read the full page JSX and verify order rows use `flex flex-col sm:flex-row` or appropriate responsive layout. Confirm the order item detail expansion uses full-width layout on mobile
- [X] T019 [P] [US2] In `src/app/wishlist/page.tsx`, read the full page JSX and verify the product grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — add responsive breakpoints if missing. Confirm action buttons (add to cart, remove) are accessible on mobile
- [X] T020 [P] [US2] In `src/app/stores/page.tsx`, read the full page JSX and verify the two-column layout `grid gap-8 lg:grid-cols-2` stacks to single column on mobile/tablet. Verify the map placeholder has a responsive height (e.g., `h-64 lg:h-full`) and doesn't collapse on tablet
- [X] T021 [P] [US2] In `src/app/loyalty/page.tsx`, read the full page JSX and verify:
  1. The top stat cards use `grid gap-6 sm:grid-cols-2` — already present
  2. The tier progress section uses responsive layout
  3. The rewards grid uses `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` — already present
  4. No fixed-width containers that overflow at 768px
- [X] T022 [P] [US2] In `src/app/feedback/page.tsx`, read the full page JSX and verify the two-column layout (form + contact info) uses `grid gap-8 lg:grid-cols-2` so it stacks on mobile/tablet. Add `lg:grid-cols-2` if the columns are side-by-side without a breakpoint guard
- [X] T023 [P] [US2] In `src/app/not-found.tsx`, read the full page JSX and verify it is a centered flex layout that works at all breakpoints — likely already correct

**Checkpoint**: All pages display correctly at 768px and 1024px. No layout jumps between mobile and desktop.

---

## Phase 4: User Story 3 — Admin Panel on Tablet (Priority: P3)

**Goal**: The admin panel is fully operable on a 768px tablet viewport. Stat cards reflow, data tables scroll horizontally, form fields stack on mobile, and the sidebar remains accessible.

**Independent Test**: Open admin `/reports`, `/orders`, `/products`, `/users`, and `/promotions` at 768px. Confirm stat cards are in 2-column grid, data tables scroll horizontally (not the page), filter rows wrap, and all forms are usable.

**Depends on**: T001 (DataTable overflow fix)

### Implementation for User Story 3

- [X] T024 [US3] In `src/app/admin/reports/page.tsx`:
  1. Change the page header `flex items-center justify-between` to `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between` so title and Export button stack on mobile
  2. In the Revenue chart `CardHeader`, change the inner flex row `flex items-center justify-between` to `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` so the chart title and date range buttons wrap on small screens
  3. Add `flex-wrap` to the date range buttons container so `7D 30D 90D 1Y` buttons wrap on very narrow screens
- [X] T025 [P] [US3] In `src/app/admin/orders/page.tsx`, read the full page JSX and:
  1. Change the filter row containing search input and two selects to `flex flex-col gap-3 sm:flex-row sm:items-center` so it stacks on mobile
  2. Verify the page header uses responsive stacking
- [X] T026 [P] [US3] In `src/app/admin/orders/[id]/page.tsx`, read the full page JSX and verify the order detail layout uses `grid gap-6 lg:grid-cols-2` or similar so the order info and customer info panels stack on mobile/tablet. Add responsive grid classes if missing
- [X] T027 [P] [US3] In `src/app/admin/users/[id]/page.tsx`, read the full page JSX and verify user detail layout stacks on mobile. Add `flex-col sm:flex-row` or grid responsive classes as needed
- [X] T028 [P] [US3] In `src/app/admin/products/new/page.tsx`, read the full page JSX and verify form sections use responsive grid layout. Product forms typically have side-by-side fields (name/slug, price/status) — ensure they use `grid gap-4 sm:grid-cols-2` and fall back to single column on mobile
- [X] T029 [P] [US3] In `src/app/admin/products/edit/[id]/page.tsx`, apply the same responsive form grid checks as T028. Verify image upload, variant editor, and category selector components stack properly on mobile
- [X] T030 [P] [US3] In `src/app/admin/users/page.tsx`, read the filter row and verify it already uses `flex flex-col gap-4 sm:flex-row sm:items-center` — it should from the initial audit. Verify the users table (direct rendering, not DataTable) has responsive overflow handling
- [X] T031 [P] [US3] In `src/app/admin/promotions/page.tsx`, read the full page JSX and:
  1. Verify the `<Tabs>` component's `TabsList` is scrollable on mobile
  2. Check the coupon/reward create/edit `<Dialog>` uses `max-w-md` or similar so it doesn't overflow on mobile
  3. Verify the dialog form fields are full-width and stacked on mobile
- [X] T032 [P] [US3] In `src/app/admin/banners/page.tsx`, read the full page JSX and verify the banners list uses a responsive layout. Check the banner table/list has horizontal scroll if it uses a DataTable
- [X] T033 [P] [US3] In `src/app/admin/banners/new/page.tsx`, read the full page JSX and apply responsive form grid checks — form fields should stack on mobile
- [X] T034 [P] [US3] In `src/app/admin/banners/edit/[id]/page.tsx`, apply the same responsive form grid checks as T033
- [X] T035 [P] [US3] In `src/app/admin/login/page.tsx`, read the full page JSX and verify the login card uses `mx-auto max-w-md` centering and full-width inputs — typically already responsive

**Checkpoint**: Admin panel fully operable at 768px. All tables scroll horizontally. All forms are usable on mobile.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final sweep of shared components and edge cases.

- [X] T036 [P] In `src/components/layout/notification-bell.tsx`, read the component and verify the notification dropdown uses `right-0` positioning and a `max-h` with `overflow-y-auto` so it doesn't extend below the viewport on mobile
- [X] T037 [P] In `src/components/reviews/review-form.tsx`, read the component and verify the form uses full-width inputs and stacks properly on mobile
- [X] T038 [P] In `src/components/reviews/review-list.tsx`, read the component and verify review cards don't overflow on mobile (avatar + name + stars row)
- [X] T039 [P] In `src/components/reviews/store-rating.tsx`, read the component and verify the rating display is responsive
- [X] T040 [P] In `src/app/auth/callback/page.tsx`, read the full page JSX and verify it is a simple centered loading/redirect page that works at all breakpoints
- [ ] T041 Do a final visual sweep: open each of the following at 375px and 768px in the browser and confirm no horizontal scrollbar appears: `/`, `/products`, `/products/[slug]`, `/cart`, `/blog`, `/blog/[slug]`, `/stores`, `/loyalty`, `/orders`, `/wishlist`, `/feedback`, `/profile`, `/sign-in`, `/admin/reports`, `/admin/products`, `/admin/orders`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **User Story 1 (Phase 2)**: No dependency on Phase 1 — can start immediately in parallel with Phase 1
- **User Story 2 (Phase 3)**: No dependency on Phase 1 or 2 — can start immediately
- **User Story 3 (Phase 4)**: **Depends on T001** (DataTable fix) for tasks T025, T032, T034
- **Polish (Phase 5)**: Can start after US1 and US2 complete

### User Story Dependencies

- **US1 (P1)**: Independent — start immediately
- **US2 (P2)**: Independent — start immediately (same or parallel with US1)
- **US3 (P3)**: Depends on T001 only (DataTable) for admin table pages

### Within Each User Story

- All `[P]`-marked tasks within a story can run in parallel (different files)
- Tasks without `[P]` should run after any prerequisite tasks within the story complete

### Parallel Opportunities

All tasks within US1 marked `[P]` can run simultaneously — they touch different files.
All tasks within US2 marked `[P]` can run simultaneously — they touch different files.
All tasks within US3 marked `[P]` can run simultaneously after T001 completes.

---

## Parallel Example: User Story 1 (Mobile Fixes)

```text
# All these tasks touch different files — run together:
T002: src/components/layout/header.tsx
T003: src/components/layout/mobile-menu.tsx
T004: src/app/products/page.tsx (grid fix)
T006: src/app/products/[slug]/page.tsx
T007: src/app/cart/page.tsx
T008: src/app/sign-in/page.tsx
T009: src/app/sign-up/page.tsx
T013: src/components/home/hero-carousel.tsx
T014: src/components/home/store-locator-preview.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (DataTable — quick win)
2. Complete Phase 2 tasks T002–T014 (all public pages mobile-ready)
3. **STOP and VALIDATE**: Test all public pages at 375px
4. Ship — mobile UX is now unbroken for customers

### Incremental Delivery

1. T001 (DataTable) → instant admin win
2. Phase 2 (US1) → mobile customers unblocked (MVP)
3. Phase 3 (US2) → tablet users unblocked
4. Phase 4 (US3) → admin team on tablet unblocked
5. Phase 5 (Polish) → final edge-case cleanup

### Parallel Strategy

With a single developer working sequentially:
- Start with T001 (1 change, high impact)
- Then batch all `[P]` tasks within each story using parallel tool calls
- T041 (final validation) is the last task

---

## Notes

- `[P]` tasks = different files, no dependencies — safe to run in parallel
- `[Story]` label maps each task to its user story for traceability
- No new components, no logic changes — only Tailwind class adjustments
- Commit after each phase (or after each logical batch)
- Stop at Phase 2 checkpoint to validate US1 independently before proceeding
- Total tasks: 41 (1 foundational + 13 US1 + 9 US2 + 12 US3 + 6 polish)
