# Tasks: Email Integration for Welcome and Password Reset

**Input**: Design documents from `/specs/001-email-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in feature specification - no test tasks included

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project Type**: Next.js web application (single codebase)
- **Source Root**: `src/` at repository root
- **Pages**: `src/app/` (Next.js App Router)
- **i18n**: `src/i18n/messages/`
- **Utilities**: `src/lib/`

---

## Phase 1: Setup (i18n Foundation)

**Purpose**: Add internationalization message keys required by all user stories

- [X] T001 [P] Add English translation keys to src/i18n/messages/en.json under "auth" namespace for password reset flow (forgotPasswordTitle, forgotPasswordDescription, sendResetLink, resetLinkSent, checkSpam, resetPasswordTitle, resetPasswordFor, newPassword, confirmNewPassword, passwordRequirements, passwordReqLength, passwordReqUpperLower, passwordReqNumbers, passwordReqSpecial, resetPasswordButton, resetSuccess, resetSuccessMessage, redirectingToSignIn, invalidResetLink, expiredResetLink, requestNewReset, passwordsMustMatch, invalidEmail)
- [X] T002 [P] Add Vietnamese translation keys to src/i18n/messages/vi.json under "auth" namespace (translate all keys added in T001)
- [X] T003 [P] Add English translation key "welcomeEmailSent" to src/i18n/messages/en.json under "auth" namespace for signup success message
- [X] T004 [P] Add Vietnamese translation for "welcomeEmailSent" to src/i18n/messages/vi.json under "auth" namespace

**Checkpoint**: All i18n keys are available for use in components

---

## Phase 2: Foundational (Utility Functions)

**Purpose**: Optional utility function for Base64URL decoding (can be implemented inline if preferred)

**⚠️ Note**: This phase is OPTIONAL. The base64UrlDecode function can be implemented inline in the reset-password page instead of as a separate utility.

- [ ] T005 [OPTIONAL] Create base64UrlDecode utility function in src/lib/utils.ts that converts Base64URL to standard Base64 and uses atob() for decoding (handles padding and character replacement)

**Checkpoint**: Utility functions (if needed) are ready for use

---

## Phase 3: User Story 3 - Forgot Password Request Page (Priority: P1) 🎯 MVP Component 1

**Goal**: Provide a clear entry point for users to request a password reset link via email

**Independent Test**: Navigate to /forgot-password, verify form displays with email input and instructions, submit valid email, verify success message shows (same message for existing/non-existing emails), verify instructions about spam folder are displayed, verify link to sign-in page works

**Why First**: This is the entry point for the password reset flow. Without this page working, users cannot initiate password recovery. It's also the simplest component with minimal dependencies.

### Implementation for User Story 3

- [X] T006 [US3] Enhance src/app/forgot-password/page.tsx to show success state after form submission with success message (t("resetLinkSent")) and helpful instructions (t("checkSpam")) in a green info box
- [X] T007 [US3] Update src/app/forgot-password/page.tsx to hide form after successful submission and show link back to sign-in page
- [X] T008 [US3] Add client-side email format validation to src/app/forgot-password/page.tsx before API submission with error message (t("invalidEmail"))
- [X] T009 [US3] Update CardDescription in src/app/forgot-password/page.tsx to use t("forgotPasswordDescription") for consistent messaging
- [X] T010 [US3] Verify src/app/sign-in/page.tsx includes visible "Forgot Password?" link that navigates to /forgot-password (if missing, add link below password field using Link component with text t("forgotPassword") and className "text-sm text-primary hover:underline")

**Checkpoint**: Users can navigate to forgot password page, submit email, and see appropriate success messaging

---

## Phase 4: User Story 1 - Password Reset Flow (Priority: P1) 🎯 MVP Component 2

**Goal**: Enable users to set a new password using a reset link from email, with proper validation and error handling

**Independent Test**: Click reset link from email (format: /reset-password?token=...&email=...), verify decoded email displays, verify password requirements are shown, enter mismatched passwords and see error, fix passwords to match, submit form, verify success message appears, verify auto-redirect to /sign-in after 2 seconds, sign in with new password successfully

**Why Second**: This completes the critical password reset flow. Combined with US3, it provides a complete account recovery solution (MVP for password reset).

### Implementation for User Story 1

- [X] T011 [US1] Add URL parameter validation to src/app/reset-password/page.tsx to check if token and email query parameters exist, show error state with t("invalidResetLink") message and link to /forgot-password if parameters are missing
- [X] T012 [US1] Implement base64UrlDecode function inline or import from utils in src/app/reset-password/page.tsx to decode email parameter for display purposes only (convert Base64URL to Base64, add padding, use atob())
- [X] T013 [US1] Update CardDescription in src/app/reset-password/page.tsx to display decoded email with t("resetPasswordFor") prefix (e.g., "Resetting password for user@example.com")
- [X] T014 [US1] Add password requirements checklist to src/app/reset-password/page.tsx before submit button using rounded gray box with t("passwordRequirements") header and bulleted list (t("passwordReqLength"), t("passwordReqUpperLower"), t("passwordReqNumbers"), t("passwordReqSpecial"))
- [X] T015 [US1] Implement client-side password match validation in src/app/reset-password/page.tsx handleSubmit to check newPassword === confirmPassword, show error message t("passwordsMustMatch") if mismatch
- [X] T016 [US1] Add success state to src/app/reset-password/page.tsx that displays green success box with t("resetSuccess") and t("resetSuccessMessage"), shows t("redirectingToSignIn") text, and provides manual link to /sign-in
- [X] T017 [US1] Implement auto-redirect timer in src/app/reset-password/page.tsx using useEffect hook that triggers router.push("/sign-in") 2 seconds after isSuccess becomes true, with cleanup to clearTimeout on unmount
- [X] T018 [US1] Enhance error handling in src/app/reset-password/page.tsx to detect expired/invalid token errors from backend response and show t("expiredResetLink") message with link to /forgot-password
- [X] T019 [US1] Update form labels in src/app/reset-password/page.tsx to use t("newPassword") and t("confirmNewPassword") for consistency
- [X] T020 [US1] Verify src/app/reset-password/page.tsx is wrapped in Suspense boundary for useSearchParams compatibility (should already exist, confirm structure matches: export default wraps Suspense around ResetPasswordForm component)

**Checkpoint**: Complete password reset flow is functional from forgot password request through successful password change and login

---

## Phase 5: User Story 2 - Welcome Email After Registration (Priority: P2)

**Goal**: Enhance user onboarding by informing new users they will receive a welcome email after successful registration

**Independent Test**: Navigate to /sign-up, complete signup form with valid data, submit form, verify success message mentions checking email (t("welcomeEmailSent")), verify account is created successfully, verify redirect to homepage works

**Why Third**: This is an enhancement to the signup flow, not a critical feature. The welcome email is already sent by backend; this just improves user communication.

### Implementation for User Story 2

- [X] T021 [US2] Update success handling in src/app/sign-up/page.tsx to display info message with t("welcomeEmailSent") text either as inline text below form or as alert/toast before redirect (choose option that matches existing patterns)
- [X] T022 [US2] If using inline approach: Add paragraph with text-sm and text-muted-foreground classes in CardContent after form showing t("welcomeEmailSent")
- [X] T023 [US2] If using alert/toast approach: Call alert() or toast component with t("welcomeEmailSent") message in handleSubmit before router.push("/")
- [X] T024 [US2] Verify message is visible for at least 2-3 seconds before redirect (adjust timing if needed or use manual redirect button)

**Checkpoint**: Signup flow now informs users about welcome email, improving onboarding experience

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation across all user stories

- [X] T025 [P] Verify all error states display appropriate messages and include recovery links (forgot-password success → check spam, reset-password error → request new reset)
- [X] T026 [P] Verify all form buttons are disabled during loading states (isLoading) and show loading indicator ("..." or spinner)
- [X] T027 [P] Test keyboard navigation on all modified pages (Tab key, Enter to submit, Esc to clear errors)
- [X] T028 [P] Test responsive layout on mobile viewports for forgot-password and reset-password pages (cards should be full-width with padding)
- [X] T029 [P] Verify color contrast meets accessibility requirements (error messages in red, success messages in green, readable against backgrounds)
- [X] T030 [P] Test forgot password flow with non-existent email to confirm same success message is shown (security: no email enumeration)
- [X] T031 [P] Test reset password flow with expired token to confirm appropriate error message and recovery link
- [X] T032 [P] Test reset password flow with already-used token to confirm appropriate error message
- [X] T033 [P] Test reset password flow with mismatched passwords to confirm client-side validation error
- [X] T034 [P] Test reset password flow with weak password to confirm backend validation error is displayed
- [X] T035 [P] Test network failure scenarios (stop backend) to confirm appropriate error messages with retry options
- [X] T036 [P] Verify auto-redirect timer works correctly on reset password success (2 seconds, can be canceled)
- [X] T037 [P] Manual validation: Complete full password reset flow per quickstart.md testing checklist (request reset, check email, click link, change password, login)
- [X] T038 [P] Manual validation: Complete signup flow per quickstart.md testing checklist (signup, verify success message, check for welcome email)
- [X] T039 [P] Verify Vietnamese translations display correctly when locale is switched to VI
- [X] T040 [P] Check browser console for any errors or warnings during all flows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No dependencies - can start immediately or be skipped if implementing base64UrlDecode inline
- **User Story 3 (Phase 3)**: Depends on Phase 1 (i18n keys) - can run in parallel with US1 if different developers
- **User Story 1 (Phase 4)**: Depends on Phase 1 (i18n keys) and optionally Phase 2 (utility function) - can run in parallel with US3
- **User Story 2 (Phase 5)**: Depends on Phase 1 (i18n keys) - can run in parallel with US1/US3
- **Polish (Phase 6)**: Depends on US1, US2, US3 completion - testing tasks can run in parallel

### User Story Dependencies

- **User Story 3 (P1)**: Independent - requires only i18n keys from Phase 1
- **User Story 1 (P1)**: Independent - requires only i18n keys and optionally utility function, but can reference US3's forgot-password page for user flow
- **User Story 2 (P2)**: Independent - requires only i18n keys

### Critical Path for MVP

```
Phase 1 (i18n) → Phase 3 (US3: Forgot Password) → Phase 4 (US1: Reset Password) → Phase 6 (Testing)
```

**Minimum Viable Product**: Phases 1, 3, 4, and subset of Phase 6 (T037) provides complete password reset functionality.

### Parallel Opportunities

**Maximum Parallelization** (3 developers):
- Developer A: Phase 1 (T001-T004) - All i18n tasks in parallel
- After Phase 1 complete:
  - Developer A: Phase 3 (T006-T010) - User Story 3 implementation
  - Developer B: Phase 4 (T011-T020) - User Story 1 implementation
  - Developer C: Phase 5 (T021-T024) - User Story 2 implementation
- After all stories complete:
  - All developers: Phase 6 (T025-T040) - Testing tasks in parallel

**Moderate Parallelization** (2 developers):
- Developer A: Phase 1 (i18n) → Phase 3 (US3) → Phase 5 (US2)
- Developer B: Phase 1 (i18n) → Phase 4 (US1) → Phase 6 (Testing)

**Sequential** (1 developer):
- Phase 1 (i18n) → Phase 2 (optional utility) → Phase 3 (US3) → Phase 4 (US1) → Phase 5 (US2) → Phase 6 (Polish)

---

## Parallel Example: Phase 1 (i18n Setup)

```bash
# Launch all i18n tasks together (different files):
Task: "Add English translation keys to src/i18n/messages/en.json" [T001]
Task: "Add Vietnamese translation keys to src/i18n/messages/vi.json" [T002]
Task: "Add English key 'welcomeEmailSent' to src/i18n/messages/en.json" [T003]
Task: "Add Vietnamese translation for 'welcomeEmailSent' to src/i18n/messages/vi.json" [T004]
```

---

## Parallel Example: User Stories (After Phase 1)

```bash
# Launch all user story implementations in parallel (different files):
Task: "Enhance forgot-password page success state" [T006-T010] (US3)
Task: "Implement reset-password validation and display" [T011-T020] (US1)
Task: "Update signup success messaging" [T021-T024] (US2)
```

---

## Parallel Example: Phase 6 (Testing)

```bash
# Launch all verification tasks together (read-only testing):
Task: "Verify error states" [T025]
Task: "Verify loading states" [T026]
Task: "Test keyboard navigation" [T027]
Task: "Test responsive layout" [T028]
Task: "Verify color contrast" [T029]
Task: "Test email enumeration prevention" [T030]
... (all T025-T040 can run in parallel)
```

---

## Implementation Strategy

### MVP First (User Stories 3 + 1)

**Goal**: Deliver complete password reset functionality

1. Complete Phase 1: i18n Setup (T001-T004)
2. Complete Phase 3: User Story 3 - Forgot Password Page (T006-T010)
3. Complete Phase 4: User Story 1 - Reset Password Flow (T011-T020)
4. **STOP and VALIDATE**: Run T037 (manual validation of full password reset flow)
5. Deploy/demo if ready

**MVP Deliverables**:
- Users can request password reset via forgot password page
- Users receive email with reset link (backend sends automatically)
- Users can set new password via reset password page
- Complete flow with validation, error handling, and success states

### Incremental Delivery

**Iteration 1 - MVP** (Priority: P1):
1. Phase 1 (i18n) → Phase 3 (US3) → Phase 4 (US1) → Deploy
2. Result: Password reset feature fully functional

**Iteration 2 - Enhancement** (Priority: P2):
1. Phase 5 (US2) → Deploy
2. Result: Signup flow now mentions welcome email

**Iteration 3 - Polish**:
1. Phase 6 (Full testing and validation) → Deploy
2. Result: All edge cases tested, accessibility verified

### Parallel Team Strategy

**With 2 Developers**:

1. **Week 1**: Both developers work on Phase 1 (i18n) together (quick, 1-2 hours)
2. **Week 1-2**:
   - Developer A: Phase 3 (US3 - Forgot Password) + Phase 5 (US2 - Signup Message)
   - Developer B: Phase 4 (US1 - Reset Password) + Phase 2 (optional utility)
3. **Week 2**: Both developers work on Phase 6 (Testing) together
4. Result: Complete feature in 2 weeks with parallel development

**With 3 Developers**:

1. **Day 1**: All developers work on Phase 1 (i18n) together (1-2 hours)
2. **Day 1-2**:
   - Developer A: Phase 3 (US3)
   - Developer B: Phase 4 (US1)
   - Developer C: Phase 5 (US2)
3. **Day 3**: All developers work on Phase 6 (Testing) in parallel
4. Result: Complete feature in 3 days with parallel development

---

## Task Summary

**Total Tasks**: 40
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 1 task (optional)
- Phase 3 (US3 - P1): 5 tasks
- Phase 4 (US1 - P1): 10 tasks
- Phase 5 (US2 - P2): 4 tasks
- Phase 6 (Polish): 16 tasks

**Task Distribution by User Story**:
- User Story 1 (Password Reset Flow): 10 implementation tasks
- User Story 2 (Welcome Email Message): 4 implementation tasks
- User Story 3 (Forgot Password Page): 5 implementation tasks
- Setup/Infrastructure: 5 tasks
- Testing/Validation: 16 tasks

**Parallel Opportunities**:
- Phase 1: All 4 i18n tasks can run in parallel
- Phase 3, 4, 5: All 3 user stories can be developed in parallel (19 implementation tasks)
- Phase 6: All 16 testing tasks can run in parallel

**Suggested MVP Scope** (Minimum for password reset):
- Phase 1: T001-T004 (i18n)
- Phase 3: T006-T010 (Forgot Password Page)
- Phase 4: T011-T020 (Reset Password Flow)
- Phase 6: T037 (Manual validation)
- **Total MVP**: 20 tasks

**Format Validation**: ✅ All tasks follow required format:
- Checkbox prefix: `- [ ]`
- Task ID: T001-T040 (sequential)
- [P] marker: Present on parallelizable tasks
- [Story] label: Present on US1, US2, US3 tasks
- File paths: Included in all task descriptions
- Clear action verbs: Enhance, Add, Update, Verify, Test, etc.

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, US3) maps task to specific user story for traceability
- Each user story is independently completable and testable
- No tests generated (not requested in specification)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are absolute from repository root (src/...)
- Phase 2 (utility function) is optional - can implement base64UrlDecode inline in reset-password page
- User Story 3 listed as "Phase 3" despite being Priority P1 because it's a simpler entry point component
- User Story 1 listed as "Phase 4" and builds on User Story 3 to complete the full password reset flow
- Testing phase (Phase 6) includes manual validation steps from quickstart.md

---

## Quick Reference: File Changes

**Files Modified** (7 total):
1. `src/i18n/messages/en.json` - Add 22+ translation keys
2. `src/i18n/messages/vi.json` - Add 22+ translation keys (Vietnamese)
3. `src/app/sign-in/page.tsx` - Add "Forgot Password?" link
4. `src/app/sign-up/page.tsx` - Add welcome email success message
5. `src/app/forgot-password/page.tsx` - Enhance success state and instructions
6. `src/app/reset-password/page.tsx` - Add validation, email display, requirements, success state
7. `src/lib/utils.ts` - (Optional) Add base64UrlDecode utility function

**Files NOT Modified**:
- `src/services/auth-service.ts` (already has forgotPassword and resetPassword)
- `src/interfaces/auth/index.ts` (already has required types)
- `src/lib/api.ts` (no changes needed)
- `src/stores/auth-store.ts` (no changes needed)

**New Files Created**: 0 (all modifications to existing files)
