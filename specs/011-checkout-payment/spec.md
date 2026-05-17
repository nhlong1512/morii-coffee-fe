# Feature Specification: Checkout Payment and Payment Management

**Feature Branch**: `011-checkout-payment`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: User description: "Làm ơn đọc file docs/features/payment/FRONTEND_INTEGRATION_GUIDE.md và giúp tôi implement thêm tính năng thanh toán ở bước checkout. Nếu cần, hãy update thêm admin để có luôn tính năng quản lý thanh toán."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Checkout With the Right Payment Flow (Priority: P1)

As a signed-in customer, I can choose a supported payment method during checkout and be guided through the correct next step so I can finish placing my order without guessing what happens next.

**Why this priority**: Checkout completion is the revenue-critical path. Without this flow, card payments cannot be used and the checkout experience stays incomplete.

**Independent Test**: Can be fully tested by placing one cash-on-delivery order and one card-payment order, confirming each path ends in an understandable order/payment outcome.

**Acceptance Scenarios**:

1. **Given** a signed-in customer with items in the cart, **When** they choose cash on delivery and place the order, **Then** the order is created and the customer sees a clear post-checkout outcome without being sent to an external payment step.
2. **Given** a signed-in customer with items in the cart, **When** they choose online card payment and place the order, **Then** the order is created, a hosted card-payment session is started, and the customer is redirected to complete payment.
3. **Given** a customer returns from the hosted card-payment flow, **When** the order payment is paid, pending, or failed, **Then** the storefront shows the correct order/payment outcome and next action for that state.

---

### User Story 2 - Track Payment State After Order Placement (Priority: P2)

As a customer, I can see the latest payment state for my order after checkout so I know whether the order is paid, still processing, failed, or does not require payment.

**Why this priority**: Payment visibility reduces confusion and support volume after redirect-based checkout.

**Independent Test**: Can be fully tested by viewing an order that is unpaid, paid, failed, and cash-on-delivery, and checking that the payment state and retry guidance are accurate.

**Acceptance Scenarios**:

1. **Given** a customer opens an order that was created for card payment, **When** payment is still pending, **Then** the order view explains that payment confirmation is still in progress.
2. **Given** a customer opens an order with a failed card payment, **When** the order is still payable, **Then** the order view offers a clear retry-payment action.
3. **Given** a customer opens a cash-on-delivery order, **When** no online payment is required, **Then** the order view communicates that payment will be collected on delivery or pickup.

---

### User Story 3 - Manage Payment State in Admin (Priority: P3)

As an admin, I can see payment state alongside order state and issue refunds for eligible paid orders so I can safely manage post-purchase payment operations.

**Why this priority**: Staff need payment visibility to avoid confirming unpaid card orders and to handle refund requests without leaving the admin workflow.

**Independent Test**: Can be fully tested by reviewing an order list/detail view, confirming payment data is visible, and issuing a full or partial refund on a refundable order.

**Acceptance Scenarios**:

1. **Given** an admin opens the orders list or detail page, **When** an order was paid online, **Then** the admin can see the current payment method and payment status next to fulfillment data.
2. **Given** an admin opens an order that is refundable, **When** they submit a valid refund request, **Then** the system records the refund attempt and updates the visible payment summary.
3. **Given** an admin opens an order that is not refundable, **When** they review the payment section, **Then** the interface prevents refund submission and explains why the action is unavailable.

### Edge Cases

- If the customer reaches checkout with an empty cart, the system returns them to the cart instead of allowing payment selection or order submission.
- If the hosted card-payment session cannot be created, the order/payment error is shown immediately and the customer remains on checkout with their form data preserved.
- If the customer returns from hosted payment before backend confirmation finishes, the storefront shows a pending state instead of incorrectly marking the order as failed.
- If a refund amount exceeds the remaining refundable balance, the admin sees the backend rejection and the existing payment summary remains unchanged.
- If a card-payment order has already been cancelled or fully refunded, both storefront and admin surfaces show its terminal payment state and do not offer retry/refund actions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The checkout experience MUST present all currently supported payment methods that a customer is allowed to choose for order placement.
- **FR-002**: The system MUST create a normal order when the customer submits checkout details, regardless of whether the selected payment method requires immediate online payment.
- **FR-003**: The system MUST start an online-payment session immediately after order creation when the selected payment method requires hosted online payment.
- **FR-004**: The system MUST redirect the customer to the hosted payment page only after a valid online-payment session is created.
- **FR-005**: The system MUST show a dedicated post-payment outcome experience for card payments that communicates whether the payment is pending, paid, or failed.
- **FR-006**: The system MUST allow customers to retrieve the latest payment summary for an order after returning from hosted payment or when reopening the order later.
- **FR-007**: The system MUST show payment state separately from fulfillment state so users can distinguish payment progress from order progress.
- **FR-008**: The system MUST allow customers to retry payment for an order only when the order remains payable and the previous online payment attempt failed or expired.
- **FR-009**: The system MUST continue to support cash-on-delivery orders without forcing an online-payment step.
- **FR-010**: The admin order list MUST display payment method and payment status for each order shown.
- **FR-011**: The admin order detail experience MUST display the order’s payment summary, including payment attempts, refund attempts, and refunded amount when available.
- **FR-012**: The admin experience MUST allow refund submission only for orders whose payment state is refundable.
- **FR-013**: The system MUST support both full refunds and partial refunds when the refund request is within the remaining refundable amount.
- **FR-014**: The system MUST show backend validation or business-rule failures for payment-session creation, payment lookup, and refunds in clear user-facing language.
- **FR-015**: The system MUST preserve the customer’s checkout form input when a payment-related submission step fails before redirect.
- **FR-016**: The system MUST prevent staff from treating payment-only actions as fulfillment actions, including clearly surfacing when an order is awaiting payment.

### Key Entities *(include if feature involves data)*

- **Checkout Payment Selection**: The customer’s chosen payment method for a new order, including whether the order requires immediate online payment or not.
- **Order Payment Summary**: The current payment state of an order, including payment status, payment method, payment attempts, refund attempts, and refunded totals.
- **Payment Attempt**: A single online-payment attempt tied to an order, including provider identifiers, amount, state, timestamps, and failure details when relevant.
- **Refund Attempt**: A refund request tied to a paid order, including amount, reason, current refund state, and creation time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of supported checkout payment methods lead to a clear next step within 5 seconds of submission, either order confirmation, hosted payment redirect, or an actionable error.
- **SC-002**: Customers can determine the payment outcome of a newly placed online-payment order in under 30 seconds after returning from hosted payment.
- **SC-003**: At least 95% of admin payment-management tasks for eligible orders can be completed without leaving the order management area.
- **SC-004**: Support-facing ambiguity between payment state and fulfillment state is reduced so that every order in admin exposes both states in a single view.

## Assumptions

- Existing authenticated checkout and order APIs remain the source of truth for order creation, order detail, and order history.
- The initial release scope includes cash on delivery and Stripe-hosted card payment; other listed payment methods remain non-functional until backend support is activated for them.
- Hosted card payment returns the customer to storefront routes that can safely fetch the latest order payment summary by order identifier.
- Refund operations are restricted to admins and rely on backend validation for refundable-state rules and remaining refundable balance.
