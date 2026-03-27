# Implementation Plan: Authenticated Route Protection

**Branch**: `002-auth-route-guard` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-auth-route-guard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement route guards to prevent authenticated users from accessing authentication pages (sign-in, sign-up, forgot-password, reset-password) by automatically redirecting them to the homepage. Additionally, enhance the authentication flow to preserve and restore the user's originally intended destination after successful sign-in. The solution will use client-side protection with React hooks and Next.js navigation, following the existing patterns established in the admin layout protection.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.6 (App Router), React 19
**Primary Dependencies**: next-intl (i18n), Zustand (state management with persist middleware), Radix UI + shadcn/ui (components), Tailwind CSS v4
**Storage**: Client-side: localStorage (via Zustand persist for auth state and redirect intent), Cookies (for i18n locale)
**Testing**: Not specified (project appears to use manual testing currently)
**Target Platform**: Web browsers (Chrome, Safari, Firefox, Edge) with JavaScript enabled
**Project Type**: Web application (Next.js frontend SPA with API backend integration)
**Performance Goals**: Sub-200ms redirect performance, no visible page flashing, <50ms auth state check overhead
**Constraints**: Client-side only (no middleware), hydration-safe (must handle SSR/CSR boundary), compatible with existing Zustand auth store patterns
**Scale/Scope**: 4 auth pages to protect (sign-in, sign-up, forgot-password, reset-password), existing admin layout pattern as reference implementation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✓ PASS (Constitution template is empty - no specific gates defined for this project)

No constitution constraints are defined in `.specify/memory/constitution.md` (file contains placeholder template only). The project does not have formal architectural principles or constraints documented.

**Default Best Practices Applied**:
- Follow existing codebase patterns (admin layout guard pattern)
- Maintain consistency with current auth implementation (Zustand store)
- No new dependencies or architectural changes required
- Client-side implementation aligns with existing protected route patterns

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-route-guard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ui-contracts.md  # Page routes, hooks, component contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router pages
│   ├── sign-in/
│   │   └── page.tsx             # ← ADD: Auth guard hook (redirect if authenticated)
│   ├── sign-up/
│   │   └── page.tsx             # ← ADD: Auth guard hook (redirect if authenticated)
│   ├── forgot-password/
│   │   └── page.tsx             # ← ADD: Auth guard hook (redirect if authenticated)
│   ├── reset-password/
│   │   └── page.tsx             # ← ADD: Auth guard hook (redirect if authenticated)
│   └── profile/
│       └── page.tsx             # ← MODIFY: Add redirect intent storage
│
├── hooks/                        # Custom React hooks
│   ├── use-auth-guard.ts        # ← NEW: Reusable auth page guard hook
│   └── use-protected-route.ts   # ← NEW: Reusable protected route hook
│
├── stores/
│   └── auth-store.ts            # ← MODIFY: Add redirect intent storage methods
│
├── lib/
│   └── constants.ts             # ← MODIFY: Add route constants (if needed)
│
└── types/
    └── auth.ts                  # ← MODIFY: Add redirect intent types (if needed)
```

**Structure Decision**: Next.js App Router (src/app) with client-side protection. The feature will add two new custom hooks for reusability (`use-auth-guard.ts` for auth pages, `use-protected-route.ts` for protected pages) and modify existing auth pages to use them. The Zustand auth store will be extended to handle redirect intent storage. This follows the existing pattern established in the admin layout (`src/app/admin/layout.tsx`) which uses `useEffect` + `router.replace()` for protection.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations. Implementation follows existing patterns and adds minimal complexity (two new hooks, four page modifications).
