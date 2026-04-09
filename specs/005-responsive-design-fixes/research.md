# Research: Responsive Design Fixes

**Branch**: `005-responsive-design-fixes` | **Date**: 2026-04-09

## Findings

### Decision: Breakpoint Strategy
- **Decision**: Use Tailwind's built-in breakpoints — `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- **Rationale**: The project spec targets mobile < 768px, tablet 768-1024px, desktop > 1024px. This maps directly to `md:` (≥768px) and `lg:` (≥1024px) prefixes. No custom breakpoints needed.
- **Alternatives considered**: Custom CSS media queries — rejected, violates project constraint of Tailwind-only responsive classes.

### Decision: Table Overflow Strategy
- **Decision**: Wrap `<table>` elements in `overflow-x-auto` div instead of removing columns on mobile
- **Rationale**: Admin data tables have many columns that are all useful. Horizontal scroll within container is the standard pattern and is already implemented for the outer container but missing at the table wrapper level in `DataTable` component.
- **Alternatives considered**: Column hiding on mobile — too much complexity, not worth it for admin use case.

### Decision: Mobile Filter Drawer (Products Page)
- **Decision**: Keep the existing `fixed inset-0` overlay filter approach — it already works correctly
- **Rationale**: The products page already has a proper mobile filter toggle with `lg:hidden` filter button and `fixed inset-0` overlay. No changes needed to this mechanism.
- **Alternatives considered**: Sheet/drawer component — already functionally equivalent.

### Decision: Admin Sidebar Mobile Navigation
- **Decision**: Keep the existing Sheet-based mobile navigation in admin layout — it already works correctly
- **Rationale**: Admin layout already uses `<Sheet>` for mobile (< lg) and a collapsible sidebar for desktop (>= lg). The hamburger menu is visible with `lg:hidden`.
- **Alternatives considered**: None needed.

---

## Audit Results: Issues Found Per File

### Critical Issues (cause overflow/broken layout)

| File | Issue | Fix |
|------|-------|-----|
| `src/components/admin/data-table.tsx:131` | Table container missing `overflow-x-auto` | Add `overflow-x-auto` to the outer div |
| `src/app/products/page.tsx` (grid) | Product grid skips `lg:` breakpoint: `sm:grid-cols-2 xl:grid-cols-3` | Change to `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| `src/app/admin/reports/page.tsx` (header) | `flex items-center justify-between` with large title + button, no mobile stacking | Add `flex-col gap-4 sm:flex-row sm:items-center` |
| `src/app/admin/reports/page.tsx` (chart header) | Date range button row can overflow on < 480px | Add `flex-wrap gap-1` |

### Moderate Issues (degraded UX but no overflow)

| File | Issue | Fix |
|------|-------|-----|
| `src/components/layout/header.tsx` | Right section has 6+ items in a row; SearchBar visible on all screens crowds mobile header | Hide `SearchBar` on mobile (`hidden sm:flex`), show only on sm+ |
| `src/app/admin/orders/page.tsx` | Filter row `flex items-center gap-4` with search + 2 selects — on mobile wraps without `flex-col sm:flex-row` | Add responsive flex direction |
| `src/app/products/[slug]/page.tsx` | Product detail actions (variants, add-to-cart) use fixed button rows — needs mobile wrap check | Verify/add `flex-wrap` where needed |
| `src/app/profile/page.tsx` | Profile tabs are wide; on mobile tab list may overflow | Add `overflow-x-auto` or smaller tab text |
| `src/app/admin/products/new/page.tsx` / `edit/[id]/page.tsx` | Admin form grid may have fixed-width sections | Verify and add responsive grid |
| `src/app/admin/orders/[id]/page.tsx` | Order detail page may have side-by-side layout needing stacking | Check and add `lg:grid-cols-2` pattern |
| `src/app/admin/users/[id]/page.tsx` | User detail layout may have fixed side-by-side sections | Check and add responsive grid |

### Minor Issues (fine-tuning)

| File | Issue | Fix |
|------|-------|-----|
| `src/components/home/hero-carousel.tsx` | Arrow buttons always show; on very small screens they overlap content text | Keep but verify positioning at 320px |
| `src/app/admin/promotions/page.tsx` | Dialog/modal content with form fields — check max-w at mobile | Verify `DialogContent` max-w |
| `src/components/layout/mobile-menu.tsx` | Already correct; minor: add `md:hidden` guard on outer div (currently uses `md:hidden` on the div) | Already correct — `md:hidden` on outer div |

---

## Technology Stack Confirmation

- **Tailwind CSS**: v4 (CSS variable-based, same responsive prefix system as v3)
- **Next.js**: 16 App Router
- **No additional libraries needed** — all fixes are pure Tailwind class changes
