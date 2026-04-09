# Implementation Plan: Responsive Design Fixes

**Branch**: `005-responsive-design-fixes` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-responsive-design-fixes/spec.md`

## Summary

Audit and fix all responsive design issues across 35+ pages and components in the Morii Coffee Next.js frontend. Every page must render correctly at mobile (< 768px), tablet (768–1024px), and desktop (> 1024px) breakpoints. All fixes use Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) — no new libraries or custom CSS.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16 (App Router), Tailwind CSS v4, Radix UI, Framer Motion  
**Storage**: N/A  
**Testing**: Visual inspection at 320px, 768px, 1024px, 1280px viewports  
**Target Platform**: Web (mobile, tablet, desktop browsers)  
**Project Type**: Web application (customer-facing storefront + admin panel)  
**Performance Goals**: No layout shift or horizontal overflow at any breakpoint  
**Constraints**: Tailwind responsive prefixes only; no custom media queries; no new libraries  
**Scale/Scope**: 35+ pages, ~60 components across `src/app/` and `src/components/`

## Constitution Check

*GATE: Must pass before implementation.*

The constitution file is a blank template — no project-specific gates are defined. Proceeding under CLAUDE.md principles:

- **Simplicity First**: Touch only what is necessary. No refactors of unrelated logic.
- **Minimal Impact**: Change only CSS classes; no component restructuring.
- **No Laziness**: Every file listed in the audit must be checked, not skimmed.

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-responsive-design-fixes/
├── plan.md              # This file
├── research.md          # Audit of all responsive issues
├── data-model.md        # N/A — pure layout/CSS changes
├── checklists/
│   └── requirements.md  # Spec quality checklist (all pass)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (files to be modified)

```text
src/
├── components/
│   ├── admin/
│   │   └── data-table.tsx          # Add overflow-x-auto wrapper [CRITICAL]
│   ├── layout/
│   │   └── header.tsx              # Hide SearchBar on xs, show on sm+ [MODERATE]
│   └── home/
│       └── (all already responsive) 
├── app/
│   ├── products/
│   │   ├── page.tsx                # Fix grid breakpoint sm→lg→xl [CRITICAL]
│   │   └── [slug]/page.tsx         # Verify mobile layout (single col already)
│   ├── cart/page.tsx               # Verify cart item flex on 320px
│   ├── profile/page.tsx            # Check tabs overflow, form grid
│   ├── orders/page.tsx             # Verify order item row
│   ├── wishlist/page.tsx           # Verify product grid
│   ├── blog/page.tsx               # Already responsive
│   ├── blog/[slug]/page.tsx        # Already responsive
│   ├── stores/page.tsx             # Already responsive
│   ├── loyalty/page.tsx            # Already responsive
│   ├── feedback/page.tsx           # Verify form layout
│   ├── sign-in/page.tsx            # Verify card form
│   ├── sign-up/page.tsx            # Verify card form
│   ├── forgot-password/page.tsx    # Verify card form
│   ├── change-password/page.tsx    # Verify card form
│   └── admin/
│       ├── reports/page.tsx        # Stack header on mobile, wrap chart controls [CRITICAL]
│       ├── orders/page.tsx         # Responsive filter row [MODERATE]
│       ├── orders/[id]/page.tsx    # Check detail layout
│       ├── users/page.tsx          # Already has responsive filter row
│       ├── users/[id]/page.tsx     # Check detail layout
│       ├── products/page.tsx       # DataTable fix covers this
│       ├── products/new/page.tsx   # Check form grid
│       ├── products/edit/[id]/page.tsx  # Check form grid
│       ├── promotions/page.tsx     # Check dialog + tabs
│       └── banners/page.tsx        # Check layout
```

## Implementation Phases

### Phase A: Critical Fixes (unbreak overflow)

**A1 — DataTable overflow** (`src/components/admin/data-table.tsx:131`)
- Current: `<div className="rounded-md border border-border overflow-hidden">`
- Fix: `<div className="overflow-x-auto rounded-md border border-border">`
- Impact: Fixes all admin pages using DataTable (products, orders, promotions)

**A2 — Products grid missing lg: breakpoint** (`src/app/products/page.tsx`)
- Current: `grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`
- Fix: `grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Impact: At 1024px (laptop), shows 3 columns instead of 2

**A3 — Admin reports header stacking** (`src/app/admin/reports/page.tsx`)
- Current: `flex items-center justify-between` (no mobile stacking)
- Fix: `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`
- Fix revenue chart header similarly
- Fix date range buttons: add `flex-wrap`

### Phase B: Moderate Fixes (UX improvements)

**B1 — Header SearchBar visibility** (`src/components/layout/header.tsx`)
- Current: SearchBar is always visible in the header right section
- Fix: Wrap SearchBar in `hidden sm:flex` — move search to mobile menu or show icon-only on xs
- Note: Mobile menu already has navigation links; search can remain accessible via a dedicated search button on mobile

**B2 — Admin orders filter row** (`src/app/admin/orders/page.tsx`)
- The search + 2 selects row needs `flex-col sm:flex-row` responsive direction

**B3 — Profile page tabs** (`src/app/profile/page.tsx`)
- Tabs list may overflow on narrow screens; wrap TabsList in `overflow-x-auto`
- Check all form grids in the profile editing section

**B4 — Product detail page** (`src/app/products/[slug]/page.tsx`)
- Grid is `lg:grid-cols-2` (single col on mobile/tablet) — already correct
- Verify variant selector and action buttons wrap correctly on mobile

### Phase C: Full Audit Pass (verify remaining pages)

For each remaining page not covered in A/B, do a quick class scan:
- Auth pages (sign-in, sign-up, forgot-password, change-password): card-centered layouts — typically already mobile-safe
- Admin product new/edit forms: check Card grid layouts
- Admin order detail, user detail: check side-by-side layouts
- Admin promotions: check Dialog max-w and Tabs on mobile
- Admin banners: check grid/table
- Not-found page: centered layout, likely fine

### Phase D: Validation

For each page modified, verify at:
- 320px (iPhone SE)
- 375px (iPhone 14)
- 768px (iPad portrait)
- 1024px (iPad landscape / small laptop)
- 1280px (desktop)

Check criteria per breakpoint:
- No horizontal scrollbar on the page
- No text overflow or truncation that breaks layout
- All interactive elements are accessible (not hidden behind other elements)
- Grid/flex layouts reflow as expected

## Complexity Tracking

No constitution violations. No unjustified complexity introduced.

## Key Implementation Rules

1. **Class changes only** — do not restructure JSX or rename components
2. **Mobile-first** — default class is mobile, add breakpoint prefixes for larger screens
3. **Minimal diff** — change only the specific class strings causing issues
4. **Preserve dark mode** — responsive changes must not affect dark/light theme classes
5. **Test at 320px minimum** — the smallest supported viewport
