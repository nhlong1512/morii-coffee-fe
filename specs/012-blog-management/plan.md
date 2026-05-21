# Implementation Plan: Blog Management

**Branch**: `012-blog-management` | **Date**: 2026-05-21 | **Spec**: [spec.md](/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/specs/012-blog-management/spec.md)
**Input**: Feature specification from `/specs/012-blog-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the current mock-data blog experience with a comprehensive internal blog CMS that fits the Morii frontend architecture: admin users manage posts and categories from the existing admin area, public blog routes read published content from backend APIs, blog rich text uses a structured editor payload plus rendered HTML, and the feature ships with typed services, reusable feature modules, route integration, and focused automated coverage that keeps `pnpm test` and `pnpm build` clean.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.3, Next.js 16.1.6 (App Router)  
**Primary Dependencies**: `next-intl`, Zustand, Tailwind CSS v4, Radix UI primitives, `react-toastify`, plus planned additions `@tiptap/react`, `@tiptap/starter-kit`, `react-hook-form`, `zod`, `@hookform/resolvers`, and optionally `@dnd-kit/core`/`@dnd-kit/sortable` for reorder UX  
**Storage**: Frontend consumes existing backend REST APIs; blog content persists remotely and replaces current local mock data sources  
**Testing**: Jest 30, `@testing-library/react`, `@testing-library/jest-dom`, targeted service/component/hook/page tests, plus full `pnpm test` and `pnpm build` verification before completion  
**Target Platform**: Responsive web application for storefront and admin dashboard in modern desktop/mobile browsers  
**Project Type**: Single Next.js web application with authenticated admin routes and public storefront routes  
**Performance Goals**: Public blog listing/detail should remain as responsive as current storefront content pages, admin CRUD flows should complete without additional navigation dead-ends, and publish/unpublish changes should appear on the next data refresh cycle  
**Constraints**: Must preserve current app patterns (`src/features`, `src/services`, shared UI primitives, i18n messages, auth guard behavior), must replace mock blog data without regressing public blog routes, must reuse shared upload infrastructure, and must satisfy clean unit-test and production-build gates  
**Scale/Scope**: One internal CMS module spanning public blog listing/detail, admin blog list/create/edit, category management, shared typed DTO/service/hook layers, and comprehensive automated coverage for the new surfaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The file [.specify/memory/constitution.md](/Users/zephyr.nguyen/dev-space/projects/morii/morii-coffee-fe/.specify/memory/constitution.md) is still an unfilled template, so there are no enforceable project-specific constitutional gates to evaluate directly.

Fallback gates applied from repository instructions and current feature scope:

- Preserve simplicity: internal CMS only, no approval workflow, no per-author feature branching inside the blog module.
- Reuse existing frontend patterns: shared API client, typed DTOs, feature-local modules, existing admin shell, existing public routes, and existing upload flow.
- Maintain i18n and responsive UI parity for both admin and storefront surfaces.
- Do not mark the feature complete until unit tests pass and the production build is clean.

**Gate Result (pre-research)**: PASS  
**Post-design re-check**: PASS, provided implementation follows the generated feature modules, uses the shared API layer and upload path, and includes the planned automated verification.

## Project Structure

### Documentation (this feature)

```text
specs/012-blog-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── blog-management-api.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── blogs/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── edit/[id]/page.tsx
│   └── blog/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── components/
│   ├── admin/
│   ├── home/
│   ├── layout/
│   └── ui/
├── features/
│   └── blogs/
│       ├── api.ts
│       ├── hooks.ts
│       ├── types.ts
│       ├── schema.ts
│       ├── utils.ts
│       └── components/
├── services/
│   └── file-service.ts
├── types/
│   └── api.ts
└── i18n/
    └── messages/

src/__tests__/
├── components/
├── hooks/
├── pages/
└── services/
```

**Structure Decision**: Use the existing single-project Next.js structure. Add the new domain logic under `src/features/blogs/`, keep route composition in `src/app/admin/blogs/*` and `src/app/blog/*`, extend shared DTOs and route constants where needed, and place focused tests under `src/__tests__/` using the same service/component/hook split already used elsewhere in the repo.

## Complexity Tracking

No constitution violations currently require justification.
