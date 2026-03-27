# Implementation Plan: Codebase Quality Refactor

**Branch**: `003-codebase-refactor` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-codebase-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Perform a comprehensive refactoring of the Morii Coffee frontend codebase to eliminate code smell, reduce duplication, and improve maintainability. The refactor will extract common UI patterns into reusable components, separate business logic from presentation through custom hooks and utilities, and resolve all code quality issues (lint errors, TypeScript types, dead code). The approach follows a phased strategy: P1 focuses on UI component consolidation, P2 on logic extraction, and P3 on code quality polish. All changes must preserve existing functionality and user experience while improving developer productivity and code scalability.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.6 (App Router), React 19
**Primary Dependencies**: next-intl (i18n), Zustand with persist middleware (state), Radix UI + shadcn/ui patterns (components), Tailwind CSS v4, Framer Motion, Lucide React (icons), Embla Carousel, Recharts (admin charts)
**Storage**: Client-side: localStorage via Zustand persist, Cookies (i18n locale)
**Testing**: Manual testing (no automated test infrastructure currently)
**Target Platform**: Modern web browsers (Chrome, Safari, Firefox, Edge) with JavaScript enabled
**Project Type**: Web application (Next.js frontend SPA connecting to .NET 8 backend API)
**Performance Goals**: No performance degradation - refactored code should maintain or improve current performance
**Constraints**: Zero breaking changes to functionality, preserve dark mode and i18n support, maintain Morii Coffee design system (#146d4d primary color), no new external dependencies
**Scale/Scope**: ~50+ page files, ~100+ component files, target 40% reduction in UI duplication, consolidate to maximum 15 shared UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✓ PASS (Constitution template is empty - no specific gates defined for this project)

No constitution constraints are defined in `.specify/memory/constitution.md` (file contains placeholder template only). The project does not have formal architectural principles or constraints documented.

**Default Best Practices Applied**:
- Follow existing codebase patterns (shadcn/ui component structure, Next.js App Router conventions)
- Maintain consistency with current architecture (no framework changes)
- No new dependencies - only reorganization of existing code
- Preserve all existing functionality and user experience
- Ensure backward compatibility with existing integrations

## Project Structure

### Documentation (this feature)

```text
specs/003-codebase-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ui-contracts.md  # Component prop interfaces and usage contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin panel pages
│   │   ├── layout.tsx           # ← REFACTOR: Extract inline components
│   │   ├── products/            # ← REFACTOR: Simplify page logic
│   │   ├── users/               # ← REFACTOR: Extract data tables
│   │   ├── orders/              # ← REFACTOR: Extract order components
│   │   ├── reports/             # ← REFACTOR: Extract chart components
│   │   └── promotions/          # ← REFACTOR: Extract form components
│   ├── sign-in/page.tsx         # ← REFACTOR: Extract auth form components
│   ├── sign-up/page.tsx         # ← REFACTOR: Extract auth form components
│   ├── forgot-password/page.tsx # ← REFACTOR: Extract form components
│   ├── reset-password/page.tsx  # ← REFACTOR: Extract form components
│   ├── profile/page.tsx         # ← REFACTOR: Extract profile components
│   ├── products/                # ← REFACTOR: Extract product components
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Tailwind + CSS variables
│
├── components/
│   ├── ui/                      # ← CONSOLIDATE: Extract all shared UI
│   │   ├── button.tsx           # ← EXTRACT: Consolidate button variants
│   │   ├── input.tsx            # ← EXTRACT: Consolidate input patterns
│   │   ├── form-field.tsx       # ← NEW: Label + input + error wrapper
│   │   ├── loading-spinner.tsx  # ← NEW: Standardized loading state
│   │   ├── skeleton.tsx         # ← NEW: Loading skeleton patterns
│   │   ├── error-message.tsx    # ← NEW: Inline error display
│   │   ├── empty-state.tsx      # ← NEW: Empty list/no results state
│   │   ├── toast.tsx            # ← NEW: Notification system
│   │   ├── modal.tsx            # ← EXTRACT: Dialog/confirmation wrapper
│   │   ├── badge.tsx            # ← EXTRACT: Status/role badges
│   │   ├── card.tsx             # Exists - consolidate usage
│   │   ├── avatar.tsx           # Exists - ensure consistent usage
│   │   ├── data-table.tsx       # ← NEW: Reusable table with pagination
│   │   └── image-with-fallback.tsx # ← NEW: Image with error handling
│   ├── layout/                  # Header, Footer (already exists)
│   ├── home/                    # Home sections (already exists)
│   ├── reviews/                 # Review components (already exists)
│   ├── admin/                   # Admin-specific components
│   └── notifications/           # Notification components
│
├── hooks/                       # ← CREATE/EXPAND: Custom hooks directory
│   ├── use-auth-guard.ts        # Already exists (from 002-auth-route-guard)
│   ├── use-protected-route.ts   # Already exists (from 002-auth-route-guard)
│   ├── use-products.ts          # ← NEW: Product data fetching/mutations
│   ├── use-categories.ts        # ← NEW: Category operations
│   ├── use-banners.ts           # ← NEW: Banner management
│   ├── use-admin-users.ts       # ← NEW: Admin user operations
│   ├── use-orders.ts            # ← NEW: Order operations
│   ├── use-form-validation.ts   # ← NEW: Reusable form validation logic
│   └── use-pagination.ts        # ← NEW: Pagination logic
│
├── lib/                         # Utilities and helpers
│   ├── api.ts                   # API client (already exists)
│   ├── utils.ts                 # cn() helper (already exists)
│   └── constants.ts             # ← EXPAND: Add route/config constants
│
├── utils/                       # ← NEW: Additional utility functions
│   ├── format-currency.ts       # ← EXTRACT: VND formatting (already exists as formatVND in utils.ts)
│   ├── format-date.ts           # ← NEW: Date display helpers
│   ├── image-url.ts             # ← NEW: CDN URL helpers
│   └── validate.ts              # ← NEW: Validation helpers
│
├── constants/                   # ← NEW: Application constants
│   ├── routes.ts                # ← NEW: All app routes as constants
│   ├── api-endpoints.ts         # ← NEW: API path strings
│   └── app-config.ts            # ← NEW: App-wide config values
│
├── services/                    # Service layer (already exists)
│   ├── auth-service.ts          # Auth operations (already exists)
│   ├── user-service.ts          # User operations (already exists)
│   ├── products-service.ts      # Product operations (already exists)
│   └── ...                      # Other services (ensure consistent patterns)
│
├── stores/                      # Zustand stores (already exists)
│   ├── auth-store.ts            # Auth state (already exists)
│   ├── cart-store.ts            # Cart state (already exists)
│   ├── wishlist-store.ts        # Wishlist state (already exists)
│   └── ...                      # Other stores
│
├── i18n/                        # next-intl config (already exists)
├── data/                        # Mock data (already exists)
└── types/                       # Shared TypeScript types (already exists)
```

**Structure Decision**: Next.js App Router (src/app) with component-based architecture. The refactor will create new directories (`hooks/`, `utils/`, `constants/`) to support separation of concerns while extending existing directories (`components/ui/`) with consolidated UI components. The structure follows established Next.js and React best practices with clear separation between presentation (components), logic (hooks), data (stores/services), and configuration (constants).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations. The refactor maintains existing architecture and patterns while improving code organization.
