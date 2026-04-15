# Implementation Plan: Jest Unit Test Setup

**Branch**: `006-jest-unit-tests` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-jest-unit-tests/spec.md`

## Summary

Set up Jest with SWC transform (via `next/jest`) for the Morii Coffee Next.js frontend, then write unit tests covering all utility functions, helper FormData builders, custom hooks, and Zustand store actions. Target: >80% aggregate coverage across statement/branch/function/line dimensions, with no assertions on Tailwind CSS class names.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.6, React 19.2.3, Zustand 5.0.11, next-intl 4.8.3  
**Storage**: N/A (no database; stores use in-memory state + localStorage via Zustand persist)  
**Testing**: Jest 29/30 + SWC transform via `next/jest`, `@testing-library/react` v16+, `jest-environment-jsdom` v30+  
**Target Platform**: Node.js (jsdom for DOM APIs)  
**Project Type**: Next.js web application (App Router, `src/` directory)  
**Performance Goals**: Test suite completes in under 30 seconds; individual file under 5 seconds  
**Constraints**: No Tailwind CSS class assertions; tests must be order-independent; >80% coverage  
**Scale/Scope**: ~25 test files covering utils, helpers, hooks, and stores

## Constitution Check

*The project constitution is a placeholder template with no custom rules defined.*  
No gates apply. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/006-jest-unit-tests/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# New files added by this feature:
jest.config.ts                   # Jest configuration with SWC, jsdom, path aliases
jest.setup.ts                    # @testing-library/jest-dom setup + Zustand reset

src/__tests__/
├── utils/
│   ├── format-currency.test.ts
│   ├── format-date.test.ts
│   ├── image-url.test.ts
│   ├── validate.test.ts
│   ├── products.test.ts          # generateSlug, toggleArrayItem, toggleSetItem
│   └── oauth.test.ts
├── helpers/
│   ├── categories.test.ts        # buildCategoryFormData
│   ├── products.test.ts          # buildProductFormData
│   └── banners.test.ts           # buildBannerFormData
├── lib/
│   └── utils.test.ts             # cn, formatCategory
├── hooks/
│   ├── use-form-validation.test.ts
│   ├── use-pagination.test.ts
│   ├── use-orders.test.ts
│   ├── use-toast.test.ts         # reducer + toast action
│   ├── use-banners.test.ts
│   ├── use-categories.test.ts
│   ├── use-products.test.ts
│   └── use-admin-users.test.ts
└── stores/
    ├── cart-store.test.ts
    ├── wishlist-store.test.ts
    ├── notification-store.test.ts
    ├── admin-store.test.ts
    └── auth-store.test.ts

# Modified files:
package.json                     # Add test + test:coverage scripts, add dev dependencies
```

**Structure Decision**: Tests live under `src/__tests__/` mirroring the source tree. This keeps tests close to source, avoids polluting top-level directories, and aligns with the existing `src/` convention.

## Complexity Tracking

No constitution violations. Not applicable.
