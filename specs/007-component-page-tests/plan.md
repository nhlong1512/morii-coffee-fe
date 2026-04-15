# Implementation Plan: Component & Page TSX Tests

**Branch**: `007-component-page-tests` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-component-page-tests/spec.md`

## Summary

Extend the existing Jest test suite (established in feature 006) to cover 9 React TSX components across 4 directories: UI primitives (Button, RatingStars, EmptyState, ErrorMessage, LoadingSpinner), layout components (CartButton), and admin/home display components (ConfirmDialog, StatCard, ProductCard). Tests use `@testing-library/react` with a behavior-driven approach — no Tailwind class assertions. The `jest.config.js` `collectCoverageFrom` is extended to include only the 9 tested component files, keeping the existing 80% global threshold intact.

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 16.1.6, React 19.2.3  
**Primary Dependencies**: Jest 30.3.0, @testing-library/react v16, @testing-library/jest-dom v6, Radix UI (Dialog), Zustand v5, Lucide React, next/jest SWC transform  
**Storage**: N/A  
**Testing**: Jest 30 with next/jest, jsdom environment — all already installed from feature 006  
**Target Platform**: Node.js (jsdom) test environment  
**Project Type**: Next.js web application — frontend component tests  
**Performance Goals**: Test suite completes in < 30s  
**Constraints**: No Tailwind CSS class assertions; all 9 component test files must pass; existing 80% global coverage threshold must remain green  
**Scale/Scope**: 9 component files, 9 test files (~60–80 test cases total)

## Constitution Check

Constitution file is a placeholder template with no project-specific rules. No violations detected.

**Gates**: PASS — no architectural violations, additive-only change (new test files + minimal config update).

## Project Structure

### Documentation (this feature)

```text
specs/007-component-page-tests/
├── plan.md              # This file
├── research.md          # Technical decisions (Phase 0)
├── data-model.md        # N/A — testing infrastructure only
├── quickstart.md        # Test patterns reference
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code changes

```text
# Additions — test files
src/__tests__/
└── components/
    ├── ui/
    │   ├── button.test.tsx
    │   ├── rating-stars.test.tsx
    │   ├── empty-state.test.tsx
    │   ├── error-message.test.tsx
    │   └── loading-spinner.test.tsx
    ├── layout/
    │   └── cart-button.test.tsx
    ├── admin/
    │   ├── confirm-dialog.test.tsx
    │   └── stat-card.test.tsx
    └── home/
        └── product-card.test.tsx

# Modifications — existing files
jest.config.js           # Extend collectCoverageFrom with 9 specific component files
jest.setup.ts            # Add ResizeObserver polyfill for Radix UI Dialog
```

**Structure Decision**: Mirror the `src/components/` directory structure under `src/__tests__/components/`. Tests are co-located by category (ui, layout, admin, home) to match the source layout.

## Complexity Tracking

No constitution violations. No complexity justification required.
