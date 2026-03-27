---

description: "Task list for Authenticated Route Protection feature"
---

# Tasks: Authenticated Route Protection

**Input**: Design documents from `/specs/002-auth-route-guard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md (required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Review existing auth store at src/stores/auth-store.ts to understand current authentication state management
- [x] T002 Review existing admin layout protection pattern at src/app/admin/layout.tsx to understand reference implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Extend auth store to add redirect intent storage methods (setRedirectTo, clearRedirectTo, getAndClearRedirectTo) in src/stores/auth-store.ts
- [x] T004 Create useAuthGuard hook for auth page protection in src/hooks/use-auth-guard.ts
- [x] T005 Create useProtectedRoute hook for protected page guards in src/hooks/use-protected-route.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Redirect Authenticated Users from Auth Pages (Priority: P1) 🎯 MVP

**Goal**: Prevent authenticated users from accessing sign-in and sign-up pages by automatically redirecting them to homepage

**Independent Test**: Sign in, then manually navigate to `/sign-in` or `/sign-up` URL, and verify automatic redirect to homepage with no flash of auth form

### Implementation for User Story 1

- [x] T006 [P] [US1] Modify sign-in page to use useAuthGuard hook in src/app/sign-in/page.tsx
- [x] T007 [P] [US1] Modify sign-up page to use useAuthGuard hook in src/app/sign-up/page.tsx
- [x] T008 [US1] Update sign-in logic to handle redirect intent after successful authentication in src/app/sign-in/page.tsx
- [x] T009 [US1] Test authenticated user redirect from sign-in page (manual test)
- [x] T010 [US1] Test authenticated user redirect from sign-up page (manual test)
- [x] T011 [US1] Test unauthenticated user can still access sign-in and sign-up normally (manual test)

**Checkpoint**: At this point, User Story 1 should be fully functional - authenticated users are redirected from sign-in/sign-up pages

---

## Phase 4: User Story 2 - Redirect from Password Recovery Pages (Priority: P2)

**Goal**: Prevent authenticated users from accessing password recovery pages (forgot-password, reset-password) by automatically redirecting to homepage

**Independent Test**: Sign in, then attempt to access `/forgot-password` and `/reset-password` URLs, and verify redirect to homepage

### Implementation for User Story 2

- [x] T012 [P] [US2] Modify forgot-password page to use useAuthGuard hook in src/app/forgot-password/page.tsx
- [x] T013 [P] [US2] Modify reset-password page to use useAuthGuard hook in src/app/reset-password/page.tsx
- [x] T014 [US2] Test authenticated user redirect from forgot-password page (manual test)
- [x] T015 [US2] Test authenticated user redirect from reset-password page (manual test)
- [x] T016 [US2] Test unauthenticated user can still access password recovery pages normally (manual test)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - all auth pages now redirect authenticated users

---

## Phase 5: User Story 3 - Preserve Intended Destination for New Users (Priority: P3)

**Goal**: When unauthenticated users attempt to access protected pages, redirect them to sign-in and return them to the originally intended page after successful authentication

**Independent Test**: Access a protected page while logged out (e.g., `/profile`), sign in, and verify return to the originally requested page

### Implementation for User Story 3

- [x] T017 [P] [US3] Identify protected pages that need useProtectedRoute hook (profile, orders, change-password, etc.)
- [x] T018 [US3] Modify profile page to use useProtectedRoute hook and store redirect intent in src/app/profile/page.tsx
- [x] T019 [US3] Update sign-in success handler to use getAndClearRedirectTo for post-auth navigation in src/app/sign-in/page.tsx
- [x] T020 [US3] Test redirect intent preservation (access /profile while logged out, sign in, verify redirect back to /profile)
- [x] T021 [US3] Test normal sign-in flow (access /sign-in directly, sign in, verify redirect to homepage)
- [x] T022 [US3] Test redirect intent is cleared after successful redirect (manual test)

**Checkpoint**: All user stories should now be independently functional - complete auth flow with intent preservation works

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure quality

- [x] T023 [P] Test edge case: session expires while on protected page (verify API client handles this)
- [x] T024 [P] Test edge case: concurrent tabs (sign out in one tab, verify other tab behavior)
- [x] T025 [P] Test edge case: deep links to auth pages while authenticated (verify redirect)
- [x] T026 Measure redirect performance to ensure sub-200ms target is met
- [x] T027 Verify no visible page flashing or multiple page loads during redirects
- [x] T028 Test authentication state check overhead is under 50ms
- [x] T029 Verify admin area protection still works correctly (regression test)
- [x] T030 Run full manual test suite from research.md section 10

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent from US1
- **User Story 3 (P3)**: Depends on Phase 2 + US1 T008 (sign-in redirect logic) - Builds on US1's authentication flow

### Within Each User Story

- US1: Hooks application (T006, T007) can be parallel, then redirect logic (T008), then testing
- US2: Page modifications (T012, T013) can be parallel, then testing
- US3: Sequential - identify pages (T017) → modify profile (T018) → update sign-in handler (T019) → testing

### Parallel Opportunities

- Phase 1: Both review tasks (T001, T002) can run in parallel
- Phase 2: All three foundational tasks (T003, T004, T005) can run in parallel (different files)
- User Story 1: T006 and T007 can run in parallel (different files)
- User Story 2: T012 and T013 can run in parallel (different files)
- Phase 6: T023, T024, T025 can run in parallel (different test scenarios)

---

## Parallel Example: User Story 1

```bash
# Launch both page modifications together:
Task: "Modify sign-in page to use useAuthGuard hook in src/app/sign-in/page.tsx"
Task: "Modify sign-up page to use useAuthGuard hook in src/app/sign-up/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T006-T011)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - core issue is fixed

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T005)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - main issue fixed!)
3. Add User Story 2 → Test independently → Deploy/Demo (complete auth page protection)
4. Add User Story 3 → Test independently → Deploy/Demo (enhanced UX with intent preservation)
5. Polish phase → Final validation and edge case testing

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T005)
2. Once Foundational is done:
   - Developer A: User Story 1 (T006-T011)
   - Developer B: User Story 2 (T012-T016)
3. After US1 completes:
   - Developer C: User Story 3 (T017-T022) - depends on US1 T008
4. All developers: Polish phase together (T023-T030)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing is used per research.md (no automated tests in current project)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Performance targets: Sub-200ms redirects, <50ms auth checks, no flashing
- Follow existing admin layout pattern for consistency
