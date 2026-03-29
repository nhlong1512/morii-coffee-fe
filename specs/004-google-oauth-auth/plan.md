# Implementation Plan: Google OAuth External Authentication

**Branch**: `004-google-oauth-auth` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-google-oauth-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement Google OAuth external authentication for the Morii Coffee Next.js frontend, allowing users to sign in using their Google accounts. The implementation will integrate a "Sign in with Google" button on the sign-in page, create an OAuth callback route (`/auth/callback`) to process authentication tokens, and maintain consistency with the existing email/password authentication flow by using the same Zustand auth store and redirect patterns. The feature includes protected route redirect preservation, comprehensive error handling, and full support for dark mode and i18n (Vietnamese/English).

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.6 (App Router), React 19
**Primary Dependencies**: next-intl (i18n), Zustand with persist middleware (state), Radix UI + shadcn/ui patterns (components), Tailwind CSS v4, Framer Motion, Lucide React (icons)
**Storage**: Client-side: localStorage via Zustand persist, Cookies (temporary OAuth tokens, i18n locale)
**Testing**: Manual testing (no automated test infrastructure currently)
**Target Platform**: Modern web browsers (Chrome, Safari, Firefox, Edge) with JavaScript enabled
**Project Type**: Web application (Next.js frontend SPA connecting to .NET 8 backend API)
**Performance Goals**: OAuth flow completes in under 15 seconds from button click to authenticated state
**Constraints**: Zero breaking changes to existing auth system, preserve dark mode and i18n support, maintain consistency with Morii Coffee design system (#146d4d primary color), reuse existing UI components
**Scale/Scope**: Single OAuth callback page, update to existing sign-in page, integration with existing Zustand auth store

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✓ PASS (Constitution template is empty - no specific gates defined for this project)

No constitution constraints are defined in `.specify/memory/constitution.md` (file contains placeholder template only). The project does not have formal architectural principles or constraints documented.

**Default Best Practices Applied**:
- Follow existing codebase patterns (shadcn/ui component structure, Next.js App Router conventions, Zustand state management)
- Maintain consistency with current architecture (no framework changes)
- No new dependencies - only reorganization and extension of existing code
- Preserve all existing functionality and user experience
- Ensure backward compatibility with existing email/password authentication

## Project Structure

### Documentation (this feature)

```text
specs/004-google-oauth-auth/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ui-contracts.md  # Component and hook interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # ← NEW: OAuth callback routes
│   │   └── callback/             # ← NEW: OAuth callback page
│   │       └── page.tsx          # ← NEW: Token extraction and redirect
│   ├── sign-in/page.tsx          # ← UPDATE: Add Google OAuth button
│   ├── layout.tsx                # Root layout (providers, fonts)
│   └── globals.css               # Tailwind + CSS variables
│
├── components/
│   ├── ui/                       # Reusable UI primitives (existing)
│   │   ├── button.tsx            # ← REUSE: For OAuth button and error page
│   │   ├── card.tsx              # ← REUSE: For error display
│   │   ├── loading-spinner.tsx   # ← REUSE: For callback processing state
│   │   └── error-message.tsx     # ← REUSE: For error display
│   ├── layout/                   # Header, Footer (existing)
│   └── auth/                     # ← OPTIONAL: May extract Google button component
│
├── stores/                       # Zustand stores (existing)
│   └── auth-store.ts             # ← REUSE: setUser, setTokens, getAndClearRedirectTo
│
├── hooks/                        # Custom hooks (existing)
│   ├── use-auth-guard.ts         # ← REUSE: No changes needed
│   └── use-protected-route.ts    # ← REUSE: No changes needed
│
├── constants/                    # Application constants (existing)
│   └── routes.ts                 # ← UPDATE: Add AUTH_CALLBACK constant
│
├── i18n/                         # next-intl config (existing)
│   └── messages/                 # ← UPDATE: Add Google OAuth translations
│       ├── en.json               # ← UPDATE: Add "google" translation key
│       └── vi.json               # ← UPDATE: Add "google" translation key
│
├── lib/                          # Utilities (existing)
│   ├── api.ts                    # ← REUSE: Token management works as-is
│   └── utils.ts                  # ← REUSE: cn() helper for styling
│
└── types/                        # Shared TypeScript types (existing)
    └── api.ts                    # ← REUSE: ApiUserProfile already defined
```

**Structure Decision**: Next.js App Router with App directory structure. The implementation extends the existing authentication system by:
1. Adding a new public route at `/app/auth/callback/page.tsx` for OAuth token processing
2. Updating the existing `/app/sign-in/page.tsx` to include the Google OAuth button
3. Extending the `/constants/routes.ts` to include the new callback route as a public route
4. Adding i18n translations for the Google button text
5. Reusing all existing UI components, hooks, stores, and utilities without modification

The structure follows established Next.js and React best practices with clear separation between pages (routes), components (UI), state (stores), and configuration (constants, i18n).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations. The implementation maintains existing architecture and extends it minimally with a single new route and UI updates.
