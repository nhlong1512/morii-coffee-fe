# Implementation Plan: Store Management

**Branch**: `018-store-management` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-store-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a comprehensive store management module for the Morii Coffee frontend that replaces the current mock-based store locator with backend-driven public discovery, introduces a reusable `src/features/stores` module, adds an admin store management surface for CRUD, status control, and display ordering, and ships with focused unit coverage plus clean lint/build verification. The design keeps `/stores` and the home preview as thin composition layers, computes open or closed state on the client from structured weekly hours, and reuses established admin UI patterns for list management, forms, confirmations, and role-gated operations.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.6 (App Router), React 19.2.3  
**Primary Dependencies**: next-intl, Zustand, Tailwind CSS v4, Radix UI/shadcn-style primitives, Lucide React, Framer Motion, react-hook-form, zod, @hookform/resolvers, @dnd-kit/core, @dnd-kit/sortable, `@googlemaps/js-api-loader` (new dependency for lazy map loading)  
**Storage**: Remote backend REST APIs as source of truth; client-local React state for UI filters, selected store, geolocation result, and form draft state  
**Testing**: Jest 30 + Testing Library for unit/component/hook/service tests, ESLint, Next.js production build  
**Target Platform**: Modern desktop and mobile web browsers for storefront and admin console  
**Project Type**: Next.js web application frontend connected to an existing .NET backend API  
**Performance Goals**: Public store locator should render usable results within a single page load, near-me ranking should update without full page reload, and admin store list/form actions should feel immediate for typical directories under 100 stores  
**Constraints**: Must preserve current route URLs (`/stores`, homepage preview entry point, `/admin` layout), compute open state on the frontend from structured hours, support dark mode and i18n, keep pages thin, avoid raw `fetch`, and finish with passing unit tests plus clean build  
**Scale/Scope**: One new feature module (`src/features/stores`), two public surfaces (home preview + `/stores`), one admin navigation entry, three admin routes (list/new/edit), shared types/mappers/utils/tests, and updates to route/constants/i18n/navigation wiring

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✓ PASS

`.specify/memory/constitution.md` is still an unfilled template, so there are no project-specific constitutional gates to enforce. For this feature, the effective gates come from the repository workflow and current codebase patterns:

- Use the existing API client abstraction (`src/lib/api.ts` / `apiGet` / `apiPost` / `apiPatch` / `apiPut` / `apiDelete`), not raw network calls.
- Keep pages as composition layers and colocate new feature logic inside `src/features/stores/`.
- Reuse shared UI primitives and admin patterns instead of inventing parallel UI systems.
- Externalize user-facing copy to i18n messages and preserve dark-mode compatibility.
- Treat backend DTOs as source of truth, compute derived view state in the frontend, and preserve role-based access boundaries.
- End implementation with unit tests, lint, and production build verification.

**Post-design check**: Planned artifacts remain compliant with all of the above gates. The design introduces one new feature module, reuses existing infrastructure, and does not require architecture-breaking exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/018-store-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/
│   └── ui-contracts.md  # Public/admin routes, feature exports, API-facing contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── stores/
│   │   └── page.tsx                         # UPDATE: mount public store locator feature
│   ├── admin/
│   │   ├── layout.tsx                       # UPDATE: add Stores nav entry
│   │   └── stores/
│   │       ├── page.tsx                     # NEW: admin store directory
│   │       ├── new/
│   │       │   └── page.tsx                 # NEW: create store page
│   │       └── edit/
│   │           └── [id]/
│   │               └── page.tsx             # NEW: edit store page
│   └── page.tsx                             # UPDATE: home preview still mounts store teaser
├── components/
│   ├── admin/
│   │   ├── data-table.tsx                   # REUSE
│   │   └── confirm-dialog.tsx               # REUSE
│   ├── home/
│   │   └── store-locator-preview.tsx        # UPDATE: use feature-backed preview
│   └── ui/                                  # REUSE: button, badge, input, select, card, dialog, skeleton, empty-state, error-message, loading-spinner
├── constants/
│   ├── api-endpoints.ts                     # UPDATE: store/admin-store endpoint constants
│   └── routes.ts                            # UPDATE: admin store routes
├── features/
│   └── stores/
│       ├── api.ts                           # NEW: public/admin store API calls
│       ├── hooks.ts                         # NEW: public/admin data hooks
│       ├── index.ts                         # NEW: re-exports
│       ├── schema.ts                        # NEW: zod schemas + form defaults
│       ├── types.ts                         # NEW: DTO, query, form, reorder types
│       ├── utils.ts                         # NEW: open-now logic, hours helpers, filters, mappers
│       └── components/
│           ├── admin-store-list.tsx         # NEW
│           ├── store-form.tsx               # NEW
│           ├── store-hours-editor.tsx       # NEW
│           ├── store-locator.tsx            # NEW
│           ├── store-locator-map.tsx        # NEW
│           ├── store-preview-list.tsx       # NEW
│           └── store-status-badge.tsx       # NEW
├── data/
│   └── stores.ts                            # DELETE or retire after feature migration
├── i18n/
│   └── messages/
│       ├── en.json                          # UPDATE: public/admin store copy
│       └── vi.json                          # UPDATE: public/admin store copy
├── lib/
│   └── api.ts                               # REUSE
├── services/                                # LEAVE EXISTING FILES AS-IS
└── __tests__/
    ├── features/
    │   └── stores/                          # NEW: feature-level tests
    ├── components/
    │   └── home/                            # UPDATE: store preview tests if needed
    └── app/
        └── admin/                           # OPTIONAL: page smoke tests if needed
```

**Structure Decision**: Use `src/features/stores` as the primary implementation boundary because the repo already has a forward-looking feature-module pattern (`src/features/blogs`) and the local implementation skill explicitly standardizes new work under `src/features/{feature-name}`. Public and admin pages stay thin and mount reusable feature components, while shared route/constants/i18n wiring remains in their existing top-level folders.

## Phase Breakdown

### Phase 0 - Research

- Confirm the implementation boundary for a new feature module versus legacy `src/services/*`.
- Lock the API integration pattern for public/admin store endpoints, including query building, schedule validation constraints, and role-sensitive mutations.
- Choose the public locator interaction model for search, city filters, geolocation fallback, selected-store synchronization, and client-side open-state derivation.
- Choose the admin management model for CRUD, active-state control, reorder UX, and confirmation flows.
- Define the test scope that satisfies the user's shipping goal: unit tests first-class, plus build/lint verification before completion.

### Phase 1 - Design & Contracts

- Model backend DTOs, frontend form state, derived locator state, and reorder payloads.
- Define route/page contracts for public and admin surfaces.
- Define module exports and service/hook/component responsibilities for `src/features/stores`.
- Document the verification quickstart for implementation, local testing, and final ship gate.

### Phase 2 - Implementation Planning

- Build the feature module foundation (`types`, `api`, `utils`, `schema`, `hooks`) before UI migration.
- Replace public mock usage on the homepage and `/stores` page with backend-backed feature components.
- Add the admin routes and navigation entry, then implement list, create, edit, deactivate, remove, and reorder flows.
- Finish with focused unit coverage for utilities, services, hooks, and key components, then run lint and production build.

## Code Review Graph Notes

- `code-review-graph` shows the current `/stores` entry point is isolated and still mock-driven, while admin patterns are concentrated around reusable `DataTable`, `ConfirmDialog`, and hook/service boundaries.
- Estimated blast radius is high once store routing, admin layout, and shared constants are touched, so implementation should keep writes localized and verify navigation, route constants, and homepage preview behavior carefully.
- Existing test coverage is stronger around services/hooks/components than around pages, so the plan prioritizes unit-level coverage in the new feature module and light page wrappers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitutional violations or architecture exceptions are required by this design.
