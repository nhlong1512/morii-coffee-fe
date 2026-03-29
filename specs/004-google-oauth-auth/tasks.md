# Implementation Tasks: Google OAuth External Authentication

**Branch**: `004-google-oauth-auth` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-google-oauth-auth/spec.md`

---

## Task Organization

Tasks are organized by user story priority (P1 → P2 → P3). Each task follows the format:
```
- [ ] T### [P#] [US#] Description (file: path/to/file.ts:line)
```

**Priority Levels**: P1 (Critical) → P2 (High) → P3 (Medium)

**User Stories**:
- **US1 (P1)**: Sign In with Google Account - Core OAuth flow implementation
- **US2 (P2)**: Protected Route Redirect Flow - Navigation preservation
- **US3 (P3)**: Error Handling and Recovery - Graceful error handling

---

## Phase 0: Prerequisites & Setup

**Goal**: Verify environment and update constants before implementing OAuth flow.

- [X] T001 [P1] [Setup] Verify NEXT_PUBLIC_API_BASE_URL environment variable is set (file: .env.local)
- [X] T002 [P1] [Setup] Update routes constants to add AUTH_CALLBACK route (file: src/constants/routes.ts)
- [X] T003 [P1] [Setup] Add AUTH_CALLBACK to isPublicRoute function (file: src/constants/routes.ts)
- [X] T004 [P1] [Setup] Add "google" translation key to English i18n messages (file: src/i18n/messages/en.json)
- [X] T005 [P1] [Setup] Add "google" translation key to Vietnamese i18n messages (file: src/i18n/messages/vi.json)

**Completion Criteria**: All constants updated, i18n keys added, environment verified.

**Parallel Execution**: T004 and T005 can run in parallel.

---

## Phase 1: User Story 1 (P1) - Core OAuth Flow

**Goal**: Implement the fundamental Google OAuth authentication flow.

### 1.1 OAuth Callback Page (Critical Path)

- [X] T101 [P1] [US1] Create /auth/callback directory structure (file: src/app/auth/callback/)
- [X] T102 [P1] [US1] Implement OAuth callback page component with cookie extraction (file: src/app/auth/callback/page.tsx)
- [X] T103 [P1] [US1] Add cookie validation and parsing logic (file: src/app/auth/callback/page.tsx:25-60)
- [X] T104 [P1] [US1] Implement token storage via Zustand auth store (file: src/app/auth/callback/page.tsx:62-75)
- [X] T105 [P1] [US1] Add cookie deletion after successful extraction (file: src/app/auth/callback/page.tsx:77-80)
- [X] T106 [P1] [US1] Implement redirect logic using getAndClearRedirectTo (file: src/app/auth/callback/page.tsx:82-90)
- [X] T107 [P1] [US1] Add loading state UI with LoadingSpinner component (file: src/app/auth/callback/page.tsx:120-130)

**Blockers**: None (can start after Phase 0 completes)

### 1.2 Sign-In Page Integration

- [X] T108 [P1] [US1] Add Google OAuth button to sign-in page (file: src/app/sign-in/page.tsx)
- [X] T109 [P1] [US1] Implement handleGoogleSignIn click handler (file: src/app/sign-in/page.tsx:35-42)
- [X] T110 [P1] [US1] Construct OAuth URL with API base URL and provider param (file: src/app/sign-in/page.tsx:37-38)
- [X] T111 [P1] [US1] Add Google icon to button using Lucide React (file: src/app/sign-in/page.tsx:45)
- [X] T112 [P1] [US1] Integrate i18n translation for button text (file: src/app/sign-in/page.tsx:46)

**Blockers**: T102-T107 should complete first for end-to-end testing.

**Parallel Execution**: T108-T112 can be done as a single file edit operation.

---

## Phase 2: User Story 2 (P2) - Protected Route Redirect

**Goal**: Ensure OAuth users are redirected to their intended destination after authentication.

### 2.1 Redirect Flow Verification

- [X] T201 [P2] [US2] Verify useProtectedRoute hook stores redirectTo correctly (file: src/hooks/use-protected-route.ts)
- [X] T202 [P2] [US2] Verify callback page retrieves redirectTo via getAndClearRedirectTo (file: src/app/auth/callback/page.tsx:85-87)
- [ ] T203 [P2] [US2] Test redirect to protected route after OAuth (manual test scenario 2)
- [ ] T204 [P2] [US2] Test direct sign-in redirect to home page (manual test scenario 1)

**Blockers**: Phase 1 must complete (T101-T112).

**Note**: These are primarily verification tasks, not new implementation. The existing Zustand redirectTo mechanism handles this automatically.

---

## Phase 3: User Story 3 (P3) - Error Handling

**Goal**: Implement comprehensive error handling for all OAuth failure scenarios.

### 3.1 URL Parameter Error Handling

- [X] T301 [P3] [US3] Extract error and message from URL search params (file: src/app/auth/callback/page.tsx:30-35)
- [X] T302 [P3] [US3] Handle "access_denied" error with user-friendly message (file: src/app/auth/callback/page.tsx:36-40)
- [X] T303 [P3] [US3] Display backend error messages from URL params (file: src/app/auth/callback/page.tsx:41-45)

### 3.2 Cookie Error Handling

- [X] T304 [P3] [US3] Handle missing AuthTokenHolder cookie (file: src/app/auth/callback/page.tsx:50-55)
- [X] T305 [P3] [US3] Handle malformed cookie JSON with try-catch (file: src/app/auth/callback/page.tsx:57-65)
- [X] T306 [P3] [US3] Validate cookie has all required fields (file: src/app/auth/callback/page.tsx:67-72)
- [X] T307 [P3] [US3] Validate user profile structure (file: src/app/auth/callback/page.tsx:74-78)

### 3.3 Error Display UI

- [X] T308 [P3] [US3] Create error state UI with Card component (file: src/app/auth/callback/page.tsx:135-150)
- [X] T309 [P3] [US3] Add ErrorMessage component for displaying error text (file: src/app/auth/callback/page.tsx:142-145)
- [X] T310 [P3] [US3] Add "Back to Sign In" button with navigation (file: src/app/auth/callback/page.tsx:147-149)
- [X] T311 [P3] [US3] Style error card with destructive variant (file: src/app/auth/callback/page.tsx:137-140)

**Blockers**: T102 (callback page structure) should be complete before adding error handling.

**Parallel Execution**: T301-T303 (URL errors) and T304-T307 (cookie errors) are independent and can be implemented in parallel.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Goal**: Ensure the feature works perfectly across all project requirements.

### 4.1 Dark Mode Support

- [ ] T401 [P2] [Polish] Verify callback page loading state renders correctly in dark mode (manual test scenario 5)
- [ ] T402 [P2] [Polish] Verify callback page error state renders correctly in dark mode (manual test scenario 5)
- [ ] T403 [P2] [Polish] Verify Google button renders correctly in dark mode (manual test scenario 5)

### 4.2 i18n Support

- [ ] T404 [P2] [Polish] Test Google button text displays correctly in English (manual test scenario 6)
- [ ] T405 [P2] [Polish] Test Google button text displays correctly in Vietnamese (manual test scenario 6)
- [ ] T406 [P2] [Polish] Verify all error messages support i18n (if error messages are externalized)

### 4.3 Multiple Authentication Attempts

- [ ] T407 [P3] [Polish] Test clicking Google button multiple times in quick succession (manual test scenario 7)
- [ ] T408 [P3] [Polish] Test aborting OAuth flow mid-consent and retrying (manual test scenario 3)

**Blockers**: All Phase 1 tasks (T101-T112) must complete.

**Note**: These are primarily validation tasks performed via manual testing.

---

## Phase 5: Testing & Validation

**Goal**: Execute all test scenarios from quickstart.md and verify success criteria.

### 5.1 Happy Path Testing

- [ ] T501 [P1] [Test] Execute test scenario 1: Sign in with Google (happy path)
- [ ] T502 [P2] [Test] Execute test scenario 2: Protected route redirect flow
- [ ] T503 [P1] [Test] Verify user lands on home page after successful OAuth
- [ ] T504 [P1] [Test] Verify auth state persists after page refresh

### 5.2 Error Scenario Testing

- [ ] T505 [P3] [Test] Execute test scenario 3: User denies Google permissions
- [ ] T506 [P3] [Test] Execute test scenario 4: Simulate missing cookie error
- [ ] T507 [P3] [Test] Verify error messages are user-friendly and actionable
- [ ] T508 [P3] [Test] Verify "Back to Sign In" button navigates correctly

### 5.3 Cross-Browser & Cross-Locale Testing

- [ ] T509 [P2] [Test] Test OAuth flow in Chrome (macOS/Windows)
- [ ] T510 [P2] [Test] Test OAuth flow in Safari (macOS)
- [ ] T511 [P2] [Test] Test OAuth flow in Firefox (macOS/Windows)
- [ ] T512 [P2] [Test] Test OAuth flow in Edge (Windows)
- [ ] T513 [P2] [Test] Test UI in Vietnamese locale
- [ ] T514 [P2] [Test] Test UI in English locale

**Blockers**: All implementation tasks (Phase 1-4) must complete.

**Parallel Execution**: T509-T512 (browser testing) can be executed in parallel across different devices.

---

## Phase 6: Documentation & Cleanup

**Goal**: Finalize documentation and prepare for PR submission.

- [ ] T601 [P3] [Docs] Review and update quickstart.md if implementation deviated
- [ ] T602 [P3] [Docs] Review and update contracts/ui-contracts.md if signatures changed
- [ ] T603 [P3] [Docs] Add inline code comments for complex cookie parsing logic
- [ ] T604 [P3] [Docs] Update CLAUDE.md if new patterns emerged during implementation
- [X] T605 [P1] [Cleanup] Remove console.log statements from callback page
- [X] T606 [P1] [Cleanup] Run ESLint and fix any linting errors
- [X] T607 [P1] [Cleanup] Run TypeScript type checking and fix any type errors
- [X] T608 [P1] [Cleanup] Verify no unused imports in modified files

**Blockers**: All testing (Phase 5) must complete successfully.

---

## Dependency Graph

```
Phase 0 (Setup)
    ├─→ T001-T005 (can run in parallel)
    └─→ Phase 1 (Core OAuth Flow)
            ├─→ T101-T107 (Callback Page - sequential)
            ├─→ T108-T112 (Sign-In Page - sequential, but can start after T102)
            └─→ Phase 2 (Protected Route) & Phase 3 (Error Handling)
                    ├─→ T201-T204 (Verification - can run in parallel)
                    ├─→ T301-T311 (Error Handling - some parallel)
                    └─→ Phase 4 (Polish)
                            ├─→ T401-T408 (Validation tasks - parallel)
                            └─→ Phase 5 (Testing)
                                    ├─→ T501-T514 (Test scenarios - some parallel)
                                    └─→ Phase 6 (Docs & Cleanup)
                                            └─→ T601-T608 (Final review)
```

---

## Parallel Execution Opportunities

**High Parallelism**:
- **Phase 0**: T004 (English i18n) and T005 (Vietnamese i18n) can run in parallel
- **Phase 2**: T201-T204 are all verification tasks and can be checked simultaneously
- **Phase 3**: T301-T303 (URL errors) and T304-T307 (cookie errors) are independent
- **Phase 4**: All validation tasks (T401-T408) can run in parallel after Phase 1 completes
- **Phase 5**: Browser testing (T509-T512) can run in parallel across devices

**Sequential Requirements**:
- **Phase 1**: T101-T107 must be sequential (building callback page component)
- **Phase 1**: T108-T112 can only start after T102 (callback page structure exists)
- **Phase 5**: Cannot start until all implementation is complete
- **Phase 6**: Must be last after all testing passes

---

## Risk Mitigation

**High-Risk Tasks** (require extra validation):
- **T102-T106**: Core callback page logic - test thoroughly with multiple OAuth flows
- **T304-T307**: Cookie validation - ensure all edge cases are handled
- **T501-T508**: End-to-end testing - must pass before considering feature complete

**Common Pitfalls**:
- **Cookie encoding**: Use `decodeURIComponent` before `JSON.parse`
- **Cookie deletion**: Delete immediately after extraction to prevent token leakage
- **Type safety**: Ensure ApiUserProfile structure matches backend response
- **Error messages**: Keep messages user-friendly, avoid exposing sensitive info

---

## Success Criteria Mapping

| Success Criterion | Related Tasks |
|------------------|---------------|
| SC-001: Google button visible | T108-T112 |
| SC-002: OAuth flow completes <15s | T102-T112, T501 |
| SC-003: Tokens stored in Zustand | T104 |
| SC-004: Protected route redirect | T201-T204, T502 |
| SC-005: User denial handled | T301-T303, T505 |
| SC-006: Dark mode support | T401-T403 |
| SC-007: i18n support | T404-T406, T513-T514 |
| SC-008: Multiple browser support | T509-T512 |

---

## Estimated Task Count

- **Phase 0 (Setup)**: 5 tasks
- **Phase 1 (Core OAuth)**: 12 tasks
- **Phase 2 (Protected Route)**: 4 tasks
- **Phase 3 (Error Handling)**: 11 tasks
- **Phase 4 (Polish)**: 8 tasks
- **Phase 5 (Testing)**: 14 tasks
- **Phase 6 (Docs & Cleanup)**: 8 tasks

**Total**: 62 tasks

**Critical Path**: T001-T005 → T101-T107 → T108-T112 → T501-T504 → T601-T608 (≈25 tasks)

---

## Implementation Notes

1. **Start with Phase 0** to establish all constants and translations before coding.
2. **Focus on T101-T107 first** (callback page) as it's the critical path for the OAuth flow.
3. **Test incrementally** - don't wait until Phase 5 to test. Verify each phase as you complete it.
4. **Use existing components** - LoadingSpinner, ErrorMessage, Button, Card are already implemented.
5. **Follow morii-coffee-patterns** - reuse patterns from existing auth implementation.
6. **No new dependencies** - all required libraries are already installed.

---

## Next Steps

After task generation:
1. Review tasks with team/stakeholder if needed
2. Begin implementation starting with Phase 0
3. Use `/speckit.implement` to execute tasks (if available)
4. Track progress by checking off completed tasks in this file
5. Update this file if new tasks emerge during implementation

---

**Generated**: 2026-03-28 | **Feature**: 004-google-oauth-auth | **Command**: `/speckit.tasks`
