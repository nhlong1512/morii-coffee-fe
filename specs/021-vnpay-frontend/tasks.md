# Implementation Tasks: VNPAY Frontend Integration

**Feature**: `021-vnpay-frontend`  
**Status**: Ready for Implementation  
**Total Tasks**: 58  
**Estimated Duration**: 6-8 days (single developer, full cycle including tests)

---

## Overview

Tasks are organized by user story priority (P1, P2) and execution phase. Each task is independently testable and includes file paths for clarity. Parallelizable tasks are marked with `[P]`.

---

## Phase 1: Setup & Project Initialization

**Goal**: Prepare development environment and establish base types.

### Setup Tasks

- [ ] T001 Create feature branch and verify git setup: `git checkout 021-vnpay-frontend && git status`
- [ ] T002 Create directory structure for VNPAY feature tests: `mkdir -p src/__tests__/services src/__tests__/components src/__tests__/checkout`
- [ ] T003 [P] Verify Next.js build passes with no errors: `pnpm build`
- [ ] T004 [P] Verify TypeScript strict mode enabled: Check `tsconfig.json` has `"strict": true`
- [ ] T005 [P] Install and verify dependencies: Confirm `zustand`, `next-intl`, `@testing-library/react` versions in `package.json`

---

## Phase 2: Foundational Types & Enums

**Goal**: Establish provider-neutral payment type system (blocking all user stories).

**Independent Test**: TypeScript compilation passes, enum values accessible, no breaking changes to Stripe/COD.

### Foundational Type Tasks

- [ ] T006 [P] Extend PaymentMethod enum in `src/types/index.ts`: Add `"VNPAY"` to union type
- [ ] T007 [P] Add PaymentProvider type to `src/lib/payment.ts`: Create enum `"Stripe" | "Vnpay"`
- [ ] T008 [P] Add PendingHostedCheckout interface to `src/lib/payment.ts`: Include provider, checkoutDraftId, providerSessionId, expiresAtUtc
- [ ] T009 [P] Add sessionStorage helpers to `src/lib/payment.ts`: Implement `getPendingCheckout()`, `setPendingCheckout()`, `clearPendingCheckout()`, `isPendingCheckoutExpired()`
- [ ] T010 [P] Add VNPAY DTOs to `src/types/api.ts`: Create `CreateVnpayPaymentUrlRequest`, `CreateVnpayPaymentUrlResponse`, `ReconcileVnpayPaymentRequest`, `ReconcileVnpayPaymentResponse`
- [ ] T011 [P] Extend Payment interface in `src/types/api.ts`: Add `provider` field, provider-neutral fields (`providerSessionId`, `providerPaymentId`, `providerTransactionId`), VNPAY diagnostic fields
- [ ] T012 [P] Create payment status helper functions in `src/lib/payment.ts`: `getPaymentStatusLabel()`, `getPaymentProviderLabel()` using i18n keys
- [ ] T013 Verify TypeScript compilation succeeds: `pnpm build` (no errors, all new types accessible)

---

## Phase 3: User Story 1 - Customer Selects VNPAY and Completes Checkout (P1)

**Goal**: Enable customer to select VNPAY, create signed payment URL, and redirect to VNPAY hosted page.

**Independent Test**: 
- VNPAY appears in payment selector
- Checkout submission with VNPAY creates payment URL via backend API
- Payment URL is valid HTTPS URL
- sessionStorage contains pending checkout with correct structure
- Customer is redirected to VNPAY payment page

**Story Tasks: Payment Service & Checkout Flow**

- [ ] T014 [P] [US1] Add VNPAY payment methods to `src/services/payment-service.ts`: Implement `createVnpayPaymentUrl(request)` and `reconcileVnpayPayment(request)` with Bearer auth
- [ ] T015 [P] [US1] Update payment-method-selector component in `src/components/checkout/payment-method-selector.tsx`: Add VNPAY button with icon (use Lucide CreditCard), handle onClick to set payment method
- [ ] T016 [US1] Extend checkout page handler in `src/app/checkout/page.tsx`: Add VNPAY payment flow (call `createVnpayPaymentUrl`, store pending checkout, redirect with `window.location.assign()`)
- [ ] T017 [P] [US1] Update GHN shipping quote helper in `src/lib/shipping.ts`: Treat VNPAY as prepaid (cod_amount = 0, same as Stripe)
- [ ] T018 [P] [US1] Add unit tests for payment service in `src/__tests__/services/payment-service.test.ts`: Test `createVnpayPaymentUrl()` success/error cases, `reconcileVnpayPayment()` for various status responses
- [ ] T019 [P] [US1] Add integration test for checkout flow in `src/__tests__/checkout/vnpay-checkout.integration.test.ts`: Test VNPAY selection → payment URL creation → redirect sequence
- [ ] T020 [US1] Verify US1 complete: Run tests, manual verification of VNPAY option visibility and redirect behavior

---

## Phase 4: User Story 2 - Customer Returns From VNPAY and Sees Payment Status (P1)

**Goal**: Implement return page with polling logic to confirm payment state, clear cart on success.

**Independent Test**:
- Return page loads, retrieves pending checkout from sessionStorage
- Polling begins immediately, calls reconcile endpoint every 2-3 seconds
- Success state (paymentStatus === "Paid") clears cart and shows success message
- Failed/Expired states show appropriate UI
- Polling timeout after 300 seconds shows timeout message
- Edge case: browser close before return, sessionStorage persists on return

**Story Tasks: Return Page & Polling**

- [ ] T021 [P] [US2] Create VNPAY return state component `src/components/checkout/vnpay-return-state.tsx`: Implement polling logic, status states (loading/success/failed/expired/invalid), UI rendering
- [ ] T022 [US2] Create return page route `src/app/checkout/vnpay/return/page.tsx`: Load query params, render VnpayReturnState component with Suspense fallback
- [ ] T023 [P] [US2] Implement polling logic in vnpay-return-state: Initial poll within 1s, subsequent 2-3s intervals, 300s timeout, stop conditions (Paid/Failed/Expired/timeout/expiration)
- [ ] T024 [P] [US2] Add cart clearing on success in vnpay-return-state: Call `useCheckoutStore.setState({ cart: [] })` when paymentStatus === "Paid"
- [ ] T025 [P] [US2] Add navigation to order on success: Redirect to `/orders/{orderId}` after cart cleared
- [ ] T026 [US2] Handle error states in vnpay-return-state: Show failure, expiration, timeout, invalid messages using i18n keys
- [ ] T027 [P] [US2] Add sessionStorage edge case handling: Detect missing sessionStorage, show recoverable error
- [ ] T028 [P] [US2] Add unit tests for polling logic in `src/__tests__/checkout/vnpay-polling.test.ts`: Test interval timing, terminal states, timeout behavior, expiration detection
- [ ] T029 [P] [US2] Add integration test for return flow in `src/__tests__/checkout/vnpay-return.integration.test.ts`: Test return page load → polling → Paid/Failed/Expired states
- [ ] T030 [US2] Verify US2 complete: Test all polling scenarios, edge cases, UI transitions

---

## Phase 5: User Story 3 - Admin and Customer View VNPAY Payment Details (P1)

**Goal**: Display VNPAY-specific payment information in order views (customer & admin).

**Independent Test**:
- Customer order detail displays VNPAY as payment method (translated label)
- Payment history shows provider, transaction IDs, diagnostic fields
- Admin order view displays refund capability status
- Payment method selector distinguishes between Stripe/COD/VNPAY

**Story Tasks: Payment History & Order Display**

- [ ] T031 [P] [US3] Update order detail page `src/app/orders/[id]/page.tsx`: Extend payment section to display provider-specific fields (provider label, providerSessionId, providerPaymentId, bankCode, cardType for VNPAY)
- [ ] T032 [P] [US3] Create payment details display component `src/components/orders/payment-details.tsx`: Render provider-agnostic + provider-specific fields, use i18n labels
- [ ] T033 [P] [US3] Update admin order list `src/app/admin/orders/page.tsx`: Add payment method column showing VNPAY/Stripe/COD with visual badges
- [ ] T034 [P] [US3] Update admin order detail `src/app/admin/orders/[id]/page.tsx`: Display all Payment fields including VNPAY diagnostics, response codes, transaction dates
- [ ] T035 [P] [US3] Add payment method mapper function in `src/lib/payment.ts`: Create `getPaymentMethodIcon()`, `getPaymentMethodColor()` for consistent UI
- [ ] T036 [US3] Update payment-service to fetch full payment history: Ensure `getPaymentByOrderId()` returns provider-neutral + provider-specific fields (backend contract verified)
- [ ] T037 [P] [US3] Add unit tests for payment display in `src/__tests__/components/payment-details.test.ts`: Test rendering of provider fields, i18n label usage
- [ ] T038 [P] [US3] Add integration test for order views in `src/__tests__/orders/payment-display.integration.test.ts`: Test customer/admin views with VNPAY payment data
- [ ] T039 [US3] Verify US3 complete: Manually verify payment display in customer/admin order views with mock VNPAY data

---

## Phase 6: User Story 4 - Admin Requests Refund for VNPAY Payment (P2)

**Goal**: Route refund requests through provider-agnostic endpoint, handle VNPAY-specific capability gating.

**Independent Test**:
- Refund button visible on VNPAY-paid orders (if refund enabled by backend)
- Refund submission calls provider-routed endpoint
- Success response shows refund status
- Disabled refund capability shows translated message

**Story Tasks: Refund Handling**

- [ ] T040 [P] [US4] Add refund UI to admin order detail `src/app/admin/orders/[id]/page.tsx`: Show refund button, input for partial refund amount, confirmation dialog
- [ ] T041 [P] [US4] Implement refund submission handler in admin order detail: Call `paymentService.createRefund(orderId, { amount, reason })`, handle success/error responses
- [ ] T042 [P] [US4] Add refund status display: Show refund state (Pending/Succeeded/Failed) and provider-specific refund ID when available
- [ ] T043 [US4] Handle VNPAY refund capability gating: Detect `REFUND_CAPABILITY_DISABLED` error, show i18n message, disable refund button gracefully
- [ ] T044 [P] [US4] Add unit tests for refund logic in `src/__tests__/admin/refund.test.ts`: Test success, error, capability-disabled scenarios
- [ ] T045 [P] [US4] Add integration test for refund flow in `src/__tests__/admin/refund-flow.integration.test.ts`: Test refund submission and response handling
- [ ] T046 [US4] Verify US4 complete: Test refund button visibility, submission, error handling with mock backend responses

---

## Phase 7: Internationalization (EN/VI)

**Goal**: Externalize all VNPAY UI strings in i18n message files.

**Independent Test**: All VNPAY text translated to EN/VI, no hardcoded strings in code, i18n keys match used strings.

### i18n Tasks

- [ ] T047 [P] Add VNPAY labels to English messages in `src/i18n/messages/en.json`: 9 keys (payment.method.vnpay, checkout.vnpay_pending_verification, checkout.vnpay_success, checkout.vnpay_failed, checkout.vnpay_invalid, checkout.vnpay_expired, refund.vnpay_unavailable, error.payment_url_failed, error.reconcile_timeout)
- [ ] T048 [P] Add VNPAY labels to Vietnamese messages in `src/i18n/messages/vi.json`: Same 9 keys with Vietnamese translations
- [ ] T049 [P] Verify i18n key usage in code: `grep -r "t(\"" src/ | grep vnpay` returns all used keys
- [ ] T050 [P] Test locale switching: Verify EN/VI labels appear correctly when locale is changed
- [ ] T051 Verify i18n complete: No hardcoded VNPAY strings in code

---

## Phase 8: Code Quality & Testing

**Goal**: Ensure clean builds, all tests pass, TypeScript strict mode, no secrets in code.

### Quality Assurance Tasks

- [ ] T052 [P] Run TypeScript build: `pnpm build` (zero errors, zero warnings)
- [ ] T053 [P] Run linter: `pnpm lint` (zero errors, zero warnings)
- [ ] T054 [P] Run all tests: `pnpm test` (all VNPAY tests passing, coverage > 80% for new code)
- [ ] T055 [P] Security check - no VNPAY secrets: `grep -r "Vnpay.*Secret\|HashSecret\|vnp_SecureHash" src/` (zero matches)
- [ ] T056 [P] Verify no direct VNPAY API calls: `grep -r "vnpayment\.vn" src/` (only in backend URL config, never called from frontend)
- [ ] T057 [P] Check all new types exported correctly: Import all new types in a test file and verify TypeScript resolves them
- [ ] T058 Run full pre-commit checks: `git diff --check` (no trailing whitespace)

---

## Implementation Strategy

### MVP Scope (Day 1-2)

Start with User Story 1 (Checkout Selection & Redirect):
- Complete Phase 1 (Setup)
- Complete Phase 2 (Types & Enums)
- Complete Phase 3 (US1: Payment selection and URL creation)
- Verify with manual testing

**Why**: US1 is the critical path. Without it, no other story can be tested. Allows sandbox testing to begin.

### Full Scope (Day 3-8)

Add in priority order:
1. **Day 2-3**: US2 (Return page + polling) — Most complex, enables payment confirmation
2. **Day 4-5**: US3 (Payment history display) — Builds on US1+US2, unblocks admin features
3. **Day 5-6**: US4 (Refund handling) — P2, can be added after P1 stories verified
4. **Day 6-7**: i18n (EN/VI translations) — Can be parallelized with other work
5. **Day 7-8**: Testing, quality assurance, final verification

### Parallelization Opportunities

Within Phase 3 (US1):
- T006-T012: Type definitions can be done in parallel
- T014-T015: Service and component changes can be parallelized

Within Phase 4 (US2):
- T021-T022: Component and route can be parallelized
- T027-T029: Tests can be started once component structure is clear

Within Phase 5 (US3):
- T031-T034: Order page updates can be parallelized
- T037-T038: Tests can run in parallel

Within Phase 7 (i18n):
- T047-T048: EN and VI translations can be done in parallel

---

## Task Dependencies

```
Phase 1 (Setup) → Phase 2 (Types & Enums)
                    ↓
            ┌───────┴────────┐
            ↓                ↓
    Phase 3 (US1)      Phase 4 (US2) [can start once Phase 2 done]
            ↓
    Phase 5 (US3)
            ↓
    Phase 6 (US4) [can start once Payment interface complete]
    
    Phase 7 (i18n) [can start once all components written]
    Phase 8 (QA) [final, all other phases must complete first]
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 8  
**Can Be Parallel**: US3 while US2 in progress, US4 while US3 in progress, i18n anytime after Phase 2.

---

## Task Completion Criteria

Each task is complete when:

1. Code changes match file path and description
2. TypeScript compilation succeeds (if modifying types)
3. Tests pass (if tests included in task)
4. Git status shows expected file modifications
5. No console errors or warnings on manual testing

---

## Phase Verification Checklist

After each phase, verify:

- [ ] All tasks in phase marked complete
- [ ] No blocking issues from previous phase
- [ ] New code passes TypeScript build
- [ ] Related tests pass
- [ ] Feature works as described in spec acceptance scenarios

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Build passes | 0 errors, 0 warnings |
| Tests pass | 100% of VNPAY tests |
| Test coverage | >80% for new code |
| TypeScript strict | 0 errors |
| Linting | 0 errors |
| Hardcoded strings | 0 (all in i18n) |
| Secrets in code | 0 |
| Breaking changes | 0 (backward compatible) |

---

## Testing Approach

### Unit Tests (Required)

- Payment service methods (success, error, timeout)
- sessionStorage helpers (get, set, clear, expiration)
- Payment status mappers
- i18n key usage

### Integration Tests (Required)

- Full checkout flow (select → create URL → redirect)
- Full return flow (return → polling → Paid/Failed/Expired)
- Payment display in order views
- Refund button behavior

### Manual Testing (Required Before Merge)

1. Select VNPAY on checkout page
2. Submit with valid delivery/shipping
3. Confirm payment URL created and valid
4. Redirect to VNPAY (can be tested with mock in sandbox)
5. Return page loads and polling begins
6. Verify success/failure message display
7. Verify cart cleared on success
8. Check order detail shows VNPAY payment info
9. Verify i18n labels in EN/VI

---

## Next Steps

1. Use this tasks.md as a checklist during implementation
2. Run `pnpm dev` and test after each phase
3. Create PR with all phase 1-8 tasks completed
4. Get code review before merge to main
5. After merge: sandbox acceptance testing with real VNPAY merchant
