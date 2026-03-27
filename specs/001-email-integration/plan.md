# Implementation Plan: Email Integration for Welcome and Password Reset

**Branch**: `001-email-integration` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-email-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement frontend user experience enhancements for email integration in the authentication flow. This includes:
1. Adding "Forgot Password?" link to the login page
2. Updating the forgot password page with proper messaging and instructions
3. Enhancing the reset password page with parameter validation, email display, and password requirements
4. Adding success messaging to the signup page to inform users about the welcome email

The backend email delivery (Welcome and Password Reset) is already implemented and operational. This frontend work focuses on providing clear user guidance, proper error handling, and seamless navigation through password recovery flows.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 (App Router, strict mode)
**Primary Dependencies**:
- React 19
- Next.js 16 with App Router
- next-intl (i18n - EN/VI)
- Zustand (state management with persist middleware)
- Radix UI primitives
- Tailwind CSS v4 with CSS variables
- Lucide React (icons)

**Storage**: Client-side localStorage via Zustand persist (for auth tokens)
**Testing**: Not specified in codebase exploration (no test files found)
**Target Platform**: Web browsers (desktop + mobile responsive)
**Project Type**: Next.js web application (coffee shop e-commerce frontend)
**Performance Goals**:
- Password reset flow completion under 3 minutes (excluding email delivery)
- 95% success rate on first attempt with valid reset link
- Real-time form validation feedback

**Constraints**:
- Backend API endpoints already implemented (`POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`)
- Email delivery is fire-and-forget (frontend doesn't control email sending)
- Must prevent email enumeration attacks (same success message regardless of email existence)
- Token encoding is Base64URL (must not decode before sending to backend)
- Password complexity requirements enforced by backend

**Scale/Scope**:
- 2 new page routes (already exist, need enhancements)
- 1 existing page modification (login page - add forgot password link)
- 4 UI components to modify/enhance
- 10+ i18n message keys to add
- Base64URL utility function (optional, for email display)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: No constitution file found at `.specify/memory/constitution.md` (file contains only template placeholders). No specific project principles to validate against.

**Default Gates Applied**:
- ✅ Feature aligns with existing authentication patterns (uses same form patterns, API client, error handling)
- ✅ No new external dependencies required (all libraries already in use)
- ✅ Follows established routing conventions (App Router, page.tsx structure)
- ✅ Maintains security best practices (no email enumeration, token handling)
- ✅ Uses existing UI component library (shadcn/Radix UI)

**Post-Phase 1 Re-evaluation**:
- ✅ **Design Artifacts Complete**: All Phase 1 deliverables created (research.md, data-model.md, contracts/ui-contracts.md, quickstart.md)
- ✅ **No Architecture Changes**: Feature modifies existing pages only, no new components or services required
- ✅ **Technology Decisions Documented**: Base64URL decoding, form validation strategy, error messaging, i18n approach all researched and aligned with existing patterns
- ✅ **Security Requirements Met**: Design preserves email enumeration prevention, token encoding, and password complexity enforcement
- ✅ **Performance Goals Achievable**: Client-side validation and existing API client patterns support <3 minute flow completion
- ✅ **Accessibility Considered**: UI contracts define WCAG 2.1 AA compliance requirements with keyboard navigation, screen reader support, and color contrast
- ✅ **i18n Properly Scoped**: 20+ new translation keys fit cleanly into existing `auth` namespace without conflicts
- ✅ **No Breaking Changes**: All modifications are additive or enhancement-only; existing auth flows remain functional

**Gate Status**: ✅ **PASSED** - Ready to proceed to `/speckit.tasks` command for task generation

## Project Structure

### Documentation (this feature)

```text
specs/001-email-integration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                           # Next.js App Router pages
│   ├── sign-in/page.tsx          # ✏️ MODIFY: Add "Forgot Password?" link
│   ├── sign-up/page.tsx          # ✏️ MODIFY: Add welcome email success message
│   ├── forgot-password/page.tsx  # ✏️ MODIFY: Enhance messaging and instructions
│   └── reset-password/page.tsx   # ✏️ MODIFY: Add validation, email display, requirements
│
├── components/
│   └── ui/                        # Existing shadcn/Radix UI components (no changes)
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── card.tsx
│
├── lib/
│   ├── api.ts                     # Existing API client (no changes needed)
│   └── utils.ts                   # ✏️ POTENTIALLY ADD: base64UrlDecode utility
│
├── services/
│   └── auth-service.ts            # Existing service (already has forgotPassword, resetPassword)
│
├── types/
│   └── api.ts                     # Existing types (no changes needed)
│
├── interfaces/
│   └── auth/
│       └── index.ts               # Existing interfaces (ForgotPasswordRequest, ResetPasswordRequest already defined)
│
└── i18n/
    └── messages/
        ├── en.json                # ✏️ MODIFY: Add new message keys
        └── vi.json                # ✏️ MODIFY: Add new message keys (translations)
```

**Structure Decision**: Single Next.js web application with App Router. All changes are modifications to existing auth pages and i18n messages. No new files required except potentially a small utility function. The project already has the complete API service layer and type definitions in place.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. Feature follows all existing patterns and conventions.
