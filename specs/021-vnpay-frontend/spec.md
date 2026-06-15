# Feature Specification: VNPAY Frontend Integration

**Feature Branch**: `021-vnpay-frontend`  
**Created**: June 15, 2026  
**Status**: Draft  
**Input**: Implement VNPAY Payment integration on Next.js frontend, extending backend-completed VNPAY payment gateway with frontend checkout, return state polling, reconciliation, and payment history display.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Customer Selects VNPAY and Completes Checkout (Priority: P1)

A customer on the checkout page wants to pay using VNPAY instead of Stripe or cash on delivery. They select VNPAY as their payment method, submit checkout details (delivery address, shipping selection), and are redirected to the VNPAY hosted payment page to complete the transaction.

**Why this priority**: This is the core payment flow. Customers cannot complete any VNPAY transaction without being able to select VNPAY and initiate the payment URL generation. This is the MVP itself.

**Independent Test**: Can be fully tested by verifying VNPAY appears in payment method selector, calling the backend create-payment-url endpoint, confirming pending checkout is persisted in sessionStorage, and validating redirect to VNPAY hosted page.

**Acceptance Scenarios**:

1. **Given** customer is on checkout page, **When** they select VNPAY payment method, **Then** VNPAY option appears selected and form remains on checkout page
2. **Given** customer selects VNPAY and has valid cart + delivery address, **When** they submit checkout, **Then** frontend calls POST `/api/v1/payments/vnpay/payment-url` with delivery/shipping data
3. **Given** payment URL creation succeeds, **When** backend returns `paymentUrl`, `checkoutDraftId`, `txnRef`, `expiresAtUtc`, **Then** frontend stores `{ provider: "VNPAY", checkoutDraftId, providerSessionId: txnRef, expiresAtUtc }` in `sessionStorage.morii.pendingHostedCheckout`
4. **Given** checkout data is persisted, **When** frontend has valid payment URL, **Then** `window.location.assign(paymentUrl)` redirects to VNPAY hosted page
5. **Given** payment URL creation fails (network error, validation error), **When** backend returns error, **Then** frontend shows translated error message and remains on checkout page, allowing retry

---

### User Story 2 - Customer Returns From VNPAY and Sees Payment Status (Priority: P1)

After completing or canceling payment on the VNPAY hosted page, VNPAY returns the customer to the application. The frontend shows a pending verification screen, polls the backend to verify the authoritative payment state, and displays success or failure once confirmed.

**Why this priority**: Without the return flow, customers have no visibility into payment outcome. This directly affects user experience and business metrics (order confirmation, cart clearing timing).

**Independent Test**: Can be fully tested by simulating VNPAY return redirect, confirming pending checkout is loaded, verifying polling logic queries backend, and validating terminal states stop polling.

**Acceptance Scenarios**:

1. **Given** VNPAY returns to `/checkout/vnpay/return?txnRef=...&result=success`, **When** return page loads, **Then** page retrieves pending checkout from sessionStorage
2. **Given** pending checkout exists, **When** frontend calls POST `/api/v1/payments/vnpay/reconcile`, **Then** backend returns current `paymentStatus` (Paid, Failed, NotRequired, or null)
3. **Given** backend returns `paymentStatus: "Paid"` with `orderId`, **When** response received, **Then** frontend clears cart and shows success message
4. **Given** `paymentStatus` remains pending, **When** polling interval elapses, **Then** frontend makes another reconcile call every 2-3 seconds
5. **Given** current time exceeds `expiresAtUtc`, **When** polling continues, **Then** frontend stops and shows "Payment expired" message
6. **Given** polling exceeds 300 seconds, **When** timeout reached, **Then** frontend shows "Verification timed out" message
7. **Given** backend returns `paymentStatus: "Failed"`, **When** terminal failure confirmed, **Then** frontend shows failure message and allows retry

---

### User Story 3 - Admin and Customer View VNPAY Payment Details (Priority: P1)

When viewing an order that was paid via VNPAY, both customers (order detail) and admins (order management) should see VNPAY-specific information: payment method, provider, transaction ID, and refund status.

**Why this priority**: Payment visibility is critical for support and diagnostics. Customers and admins must distinguish VNPAY from Stripe/COD and reference VNPAY transaction numbers.

**Independent Test**: Can be fully tested by retrieving a VNPAY-paid order and confirming payment details display provider, transaction IDs, and status.

**Acceptance Scenarios**:

1. **Given** customer views order detail paid via VNPAY, **When** payment section loads, **Then** payment method shows "VNPAY" (translated label)
2. **Given** payment history displays, **When** backend returns `provider: "VNPAY"` fields, **Then** frontend displays transaction identifiers and provider info
3. **Given** admin views order payment tab, **When** VNPAY payment fetched, **Then** admin sees provider fields plus status codes
4. **Given** multiple payment methods exist, **When** order history viewed, **Then** payment method labels distinguish between providers clearly

---

### User Story 4 - Admin Requests Refund for VNPAY Payment (Priority: P2)

An admin wants to refund a VNPAY payment. The system routes the refund request to VNPAY and displays the result.

**Why this priority**: Refund capability handles customer issues. However, depends on backend capability gating and VNPAY API enablement.

**Independent Test**: Can be fully tested by calling provider-routed refund endpoint and verifying response handling for success/disabled states.

**Acceptance Scenarios**:

1. **Given** admin views VNPAY-paid order, **When** payment section loads, **Then** refund button appears (if enabled)
2. **Given** admin submits refund, **When** they confirm, **Then** frontend calls POST `/api/v1/payments/{orderId}/refund`
3. **Given** VNPAY refund disabled, **When** admin attempts refund, **Then** backend returns error and frontend shows translated message

### Edge Cases

- Customer closes browser during VNPAY payment (payment proceeds on VNPAY side, sessionStorage persists until customer returns)
- VNPAY returns with invalid signature (backend returns `result=invalid`, frontend shows "Invalid transaction")
- Polling timeout reached but payment still processing (customer guided to check order history)
- Payment expires before polling completes (customer informed to place new order)
- Multiple concurrent reconcile calls (frontend deduplicates, only one active poll)
- Customer navigates away during pending checkout (sessionStorage remains; return link can resume)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

#### Payment Method & Types
- **FR-001**: Frontend type system MUST include `PaymentMethod = "COD" | "MOMO" | "PAYPAL" | "STRIPE" | "VNPAY"`
- **FR-002**: Frontend type system MUST include provider-neutral payment fields: `provider`, `providerSessionId`, `providerPaymentId`, `providerTransactionId`
- **FR-003**: DTOs MUST preserve backward-compatible Stripe-named field aliases during transition

#### Checkout Selection & Initiation
- **FR-004**: Payment method selector MUST display VNPAY option alongside Stripe and COD
- **FR-005**: VNPAY MUST be treated as prepaid for shipping quote calculation (COD amount = 0 to GHN)
- **FR-006**: When customer selects VNPAY and submits checkout, frontend MUST call `POST /api/v1/payments/vnpay/payment-url` with delivery/shipping data (no amount, IP, or signing)
- **FR-007**: Payment URL creation MUST be retried only on API failures; URLs MUST never be fabricated by frontend

#### Pending Checkout Storage
- **FR-008**: Before redirecting to VNPAY, frontend MUST persist checkout in `sessionStorage` with key `morii.pendingHostedCheckout`
- **FR-009**: Persisted checkout MUST include: `provider`, `checkoutDraftId`, `providerSessionId` (txnRef), `expiresAtUtc`
- **FR-010**: Cart items MUST NOT be cleared until backend confirms `paymentStatus: "Paid"`

#### Return Page & Polling
- **FR-011**: Return page MUST load pending checkout from sessionStorage and begin polling
- **FR-012**: Polling MUST call `POST /api/v1/payments/vnpay/reconcile` with `{ checkoutDraftId, txnRef }`
- **FR-013**: Initial poll within 1 second; subsequent polls every 2-3 seconds
- **FR-014**: Polling MUST stop when: `paymentStatus === "Paid"` OR time > `expiresAtUtc` OR 300 seconds elapsed
- **FR-015**: When `paymentStatus === "Paid"`, frontend MUST clear cart and display success with order number
- **FR-016**: When payment expires or times out, show message and allow retry
- **FR-017**: When `paymentStatus === "Failed"`, show failure message and allow retry

#### Payment History & Refunds
- **FR-018**: Customer order detail MUST display VNPAY payment method (if applicable)
- **FR-019**: Payment history MUST show provider, transaction IDs, and response codes
- **FR-020**: Admin refund MUST route through provider-agnostic endpoint; backend routes by provider
- **FR-021**: When VNPAY refund disabled, frontend MUST display backend error message

#### Internationalization
- **FR-022**: All VNPAY UI strings MUST be externalized in i18n files
- **FR-023**: Required i18n keys: `payment.method.vnpay`, `checkout.vnpay_pending_verification`, `checkout.vnpay_success`, `checkout.vnpay_failed`, `checkout.vnpay_invalid`, `checkout.vnpay_expired`, `refund.vnpay_unavailable`, `error.payment_url_failed`, `error.reconcile_timeout`

#### Testing & Code Quality
- **FR-024**: Frontend code MUST NOT contain VNPAY hash secret, signing logic, or direct VNPAY API calls
- **FR-025**: All payment-method and checkout flows MUST be covered by unit and integration tests
- **FR-026**: TypeScript strict mode MUST pass with zero errors

### Key Entities *(include if feature involves data)*

- **PendingHostedCheckout**: Session-scoped checkout state with provider, draft ID, provider session ID, and expiration timestamp
- **PaymentMethod**: Frontend enum including VNPAY, used in checkout selection and order display
- **PaymentProvider**: Provider identifier (Stripe, VNPAY) for distinguishing payment integration; provider-neutral aliases for backend DTO transition
- **Order**: Order entity now includes payment provider and provider-specific transaction identifiers

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Customers can select VNPAY and be redirected to payment page in under 3 seconds from checkout submission
- **SC-002**: After VNPAY return, 95% of paid orders confirmed and cart cleared within 10 seconds of return page load
- **SC-003**: Payment polling completes within 300 seconds for successfully confirmed payments
- **SC-004**: All VNPAY checkout, return, and payment-history flows have passing unit tests (100% feature coverage)
- **SC-005**: TypeScript compilation passes with zero errors in strict mode
- **SC-006**: Customer and admin can view VNPAY payment details without errors
- **SC-007**: Refund functionality correctly routes VNPAY payments to correct provider
- **SC-008**: All UI text for VNPAY flows translated to English and Vietnamese (no hardcoded strings)
- **SC-009**: Frontend contains zero VNPAY signing logic, hash secret references, or direct VNPAY API calls

## Assumptions

- Backend VNPAY payment gateway is complete and endpoints stable (verified 2026-06-15 with 548 tests passing)
- VNPAY backend includes signed payment URL creation, IPN finalization, return verification, QueryDR reconciliation, and provider-neutral payment history
- Existing Zustand cart/checkout stores can be extended with VNPAY provider awareness without major refactoring
- Existing i18n infrastructure (next-intl) supports VNPAY-specific message keys
- Frontend can trust backend-returned URLs without additional validation (backend controls signing)
- GHN shipping quote API accepts prepaid VNPAY orders (backend handles logic; frontend passes VNPAY as prepaid)
- Browser sessionStorage available and reliable for pending checkout persistence
- Customer IP captured by backend (frontend does not send IP; backend validates and captures)
- Stripe-compatible payment history display can be extended with provider-neutral fields with backward compatibility
- Refund API remains provider-agnostic; backend routes by payment provider (no frontend provider-specific refund logic)
