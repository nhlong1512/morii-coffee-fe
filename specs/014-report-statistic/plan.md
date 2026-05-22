# Implementation Plan: Admin Report Statistics

**Branch**: `014-report-statistic` | **Date**: 2026-05-22 | **Spec**: [spec.md](/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/014-report-statistic/spec.md)
**Input**: Feature specification from `/specs/014-report-statistic/spec.md`

## Summary

Replace the current dummy-data implementation of `/admin/reports` with a backend-driven reporting feature that loads admin-only dashboard metrics, keeps all report sections synchronized to the selected reporting range, supports CSV export for the active view, and adds focused unit coverage for report normalization, range behavior, and UI states. The implementation will follow existing Morii frontend patterns by introducing typed report DTOs, a dedicated service layer, thin page composition, and reusable view-model helpers for comparison and empty/error handling.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.1.6 with React 19  
**Primary Dependencies**: Next.js App Router, next-intl, Zustand auth session, Lucide React, Recharts, Tailwind CSS v4, project UI primitives, built-in fetch wrapper in `src/lib/api.ts`  
**Storage**: Frontend is stateless for reports; remote backend APIs are the source of truth  
**Testing**: Jest 30.x with Testing Library and existing unit/component test setup  
**Target Platform**: Responsive admin web application in modern desktop and mobile browsers  
**Project Type**: Frontend web application consuming backend REST APIs  
**Performance Goals**: Reports page should complete a single dashboard load flow with coherent loading, success, empty, or error states and should avoid redundant requests for synchronized sections  
**Constraints**: Must preserve current phase-1 report scope, must not reintroduce loyalty analytics, must honor admin-only access, must keep export output consistent with the active view, must pass unit tests and production build cleanly  
**Scale/Scope**: One admin reports route, two backend endpoints, five in-scope report sections, new DTOs/services/hooks/components/tests limited to the frontend repository

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The repository constitution file at `.specify/memory/constitution.md` is still an unfilled template, so there are no project-specific constitutional gates to enforce beyond existing repository instructions.
- Repository instructions still require minimal-impact changes, verification before done, and focused testing for touched areas.
- Plan status: PASS, with the expectation that implementation remains scoped to the reports feature, adds tests, and finishes with clean test/build verification.

## Project Structure

### Documentation (this feature)

```text
specs/014-report-statistic/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── admin-reports.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── admin/
│       └── reports/
│           └── page.tsx
├── components/
│   ├── admin/
│   └── ui/
├── hooks/
├── lib/
├── services/
├── types/
└── __tests__/
    ├── components/
    ├── hooks/
    └── services/
```

**Structure Decision**: Keep the existing admin reports route in `src/app/admin/reports/page.tsx`, add typed report contracts under `src/types/`, add a dedicated reports service under `src/services/`, optionally add a focused hook for dashboard loading under `src/hooks/`, and place verification in existing Jest test locations. This matches current repo patterns and avoids broad refactors.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this phase.
