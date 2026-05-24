# Feature Specification: GHN Delivery Experience

**Feature Branch**: `019-ghn-integration`  
**Created**: 2026-05-24  
**Status**: Draft  
**Input**: User description: "Implement GHN integration frontend from docs/features/ghn-integration/frontend-handoff.en.md, covering structured delivery profiles, checkout quotes, shipment tracking, admin shipment actions, updated tests, and final unit-test/build verification."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Delivery Checkout With A Valid Shipping Quote (Priority: P1)

As a customer ordering for delivery, I want to enter a structured delivery address and receive a shipping quote before I place my order so that I can confidently complete checkout with the correct delivery fee and delivery expectations.

**Why this priority**: This is the core customer value of the feature. Without structured delivery checkout and a valid shipping quote, the delivery flow cannot be completed reliably.

**Independent Test**: Can be fully tested by signing in as a customer, selecting home delivery, entering a valid structured address, receiving a shipping quote, and successfully starting either a cash-on-delivery or card-payment checkout flow.

**Acceptance Scenarios**:

1. **Given** a signed-in customer has items in their cart and chooses home delivery, **When** they enter a complete delivery address, **Then** the system shows a current shipping quote, the expected arrival timing, and the selected delivery service before order submission.
2. **Given** a customer has already received a shipping quote, **When** they change any shipping-relevant information such as delivery area or cart contents, **Then** the system requires a refreshed quote before the order can proceed.
3. **Given** a customer chooses self-pickup instead of home delivery, **When** they proceed through checkout, **Then** the system does not require a delivery quote and does not charge a delivery fee.

---

### User Story 2 - Manage Delivery Shipments From Admin Order Detail (Priority: P2)

As an administrator, I want to manage delivery shipments from the order detail view so that I can recover failed shipment creation, refresh shipment information, and keep delivery operations moving without leaving the order workflow.

**Why this priority**: Admin recovery and operational visibility protect order fulfillment when shipment creation or synchronization does not complete automatically.

**Independent Test**: Can be fully tested by opening an eligible order in the admin area and performing shipment-related actions such as create or retry, refresh shipment status, refresh quote, update shipment notes, and cancel shipment when allowed.

**Acceptance Scenarios**:

1. **Given** an order is eligible for delivery shipment creation but does not yet have a successful shipment, **When** an administrator opens the order detail, **Then** the system provides a clear action to create or retry the shipment.
2. **Given** an order already has a shipment, **When** an administrator refreshes shipment information, **Then** the latest shipment state is shown on the order detail page.
3. **Given** a shipment is still in a cancellable state, **When** an administrator cancels it, **Then** the system records the updated shipment status and reflects that outcome in the order detail view.

---

### User Story 3 - Track Shipment Progress After Order Creation (Priority: P3)

As a customer with an existing delivery order, I want to view shipment progress and tracking information on my order so that I understand what is happening after checkout and know whether delivery is still in progress, completed, or needs attention.

**Why this priority**: Shipment transparency reduces uncertainty and support burden after checkout, but it depends on the delivery order flow already being available.

**Independent Test**: Can be fully tested by opening an existing delivery order after shipment creation and verifying that shipment status, tracking information, and delivery method details are visible without needing any admin workflow.

**Acceptance Scenarios**:

1. **Given** a customer order has a live shipment, **When** the customer opens the order detail page, **Then** the system displays the delivery method, shipment status, and tracking information in a read-only format.
2. **Given** shipment creation has not succeeded yet, **When** the customer opens the order detail page, **Then** the system clearly communicates that the order exists while shipment processing is still pending.
3. **Given** the shipment state changes after the order is created, **When** the customer revisits the order detail page, **Then** the latest available shipment state is shown.

---

### Edge Cases

- What happens when a customer selects home delivery but does not complete all required location fields before requesting or using a quote?
- How does the system behave when a shipping quote becomes stale before the customer finishes checkout?
- What happens when shipment creation fails after an order has already been accepted?
- How does the system respond when shipment status cannot be refreshed temporarily?
- What happens when a customer changes from home delivery to self-pickup after previously obtaining a delivery quote?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow signed-in customers to maintain a default delivery profile that includes recipient details and structured location information for delivery checkout.
- **FR-002**: The system MUST let customers choose between self-pickup and carrier delivery during checkout.
- **FR-003**: The system MUST require a valid delivery quote before a customer can complete a home-delivery checkout.
- **FR-004**: The system MUST show customers the active delivery quote, including delivery fee, expected timing, and selected delivery service, before they confirm a home-delivery checkout.
- **FR-005**: The system MUST invalidate or refresh a delivery quote whenever shipping-relevant order or address information changes.
- **FR-006**: The system MUST submit the delivery quote snapshot as part of a home-delivery checkout so that the backend can verify the quote before accepting the order.
- **FR-007**: The system MUST support both pay-on-delivery checkout and card-payment checkout for home-delivery orders.
- **FR-008**: The system MUST allow self-pickup checkout without requiring delivery quoting.
- **FR-009**: The system MUST store and display delivery method information on customer order history and order detail views.
- **FR-010**: The system MUST display shipment summary information on delivery orders once shipment data exists.
- **FR-011**: The system MUST clearly indicate when a delivery order exists but shipment creation has not yet completed successfully.
- **FR-012**: The admin order detail experience MUST support shipment creation or retry for eligible delivery orders.
- **FR-013**: The admin order detail experience MUST support shipment refresh so administrators can retrieve the latest shipment state.
- **FR-014**: The admin order detail experience MUST support shipment requoting from the persisted order snapshot.
- **FR-015**: The admin order detail experience MUST allow administrators to update shipment notes.
- **FR-016**: The admin order detail experience MUST allow administrators to cancel a shipment only when the shipment state permits cancellation.
- **FR-017**: The system MUST preserve the separation between payment state, order fulfillment state, and shipment state in all customer and admin views.
- **FR-018**: The system MUST prevent customers from completing home-delivery checkout when required shipment information is missing, stale, or invalid.
- **FR-019**: The system MUST present customer-facing shipment information as read-only and reserve shipment control actions for authorized administrators.
- **FR-020**: The system MUST handle temporary quote, shipment, or synchronization failures with clear next-step messaging instead of leaving the user in an ambiguous state.

### Key Entities *(include if feature involves data)*

- **Delivery Profile**: A saved customer delivery preference containing recipient details and structured location information used to prefill delivery checkout.
- **Delivery Quote**: A time-sensitive shipping snapshot containing fee, delivery timing, and service selection information used to validate checkout.
- **Shipment Summary**: The current delivery shipment view associated with an order, including shipment status, tracking reference, service information, and the latest synchronization state.
- **Delivery Order**: A customer order that uses carrier delivery rather than self-pickup and therefore requires quote validation and shipment lifecycle tracking.
- **Shipment Action**: An administrator-initiated operation that manages a shipment after order creation, such as create or retry, refresh, requote, note update, or cancellation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of customers who choose home delivery can complete address entry and receive a delivery quote on their first attempt without manual support.
- **SC-002**: Customers can complete checkout with either self-pickup or home delivery in under 3 minutes during standard usage conditions.
- **SC-003**: Administrators can complete a shipment recovery action for an eligible order in under 1 minute from the order detail page.
- **SC-004**: 100% of delivery orders shown to customers display either a current shipment summary or an explicit pending-shipment state.
- **SC-005**: Shipment-related support escalations caused by missing delivery visibility or missing retry tools decrease after release compared with the current manual workflow.

## Assumptions

- The existing order, payment, and authentication experiences remain in place and this feature extends them rather than replacing them.
- Delivery quoting and shipment lifecycle behavior are only required for the GHN delivery option in this release.
- Self-pickup remains a supported order path and does not require shipment quoting.
- Delivery quotes are short-lived and may expire before checkout completes, so refresh behavior is acceptable and expected.
- Administrator shipment actions are available from the existing admin order detail surface rather than a new standalone operations page.
- Customers only need read-only shipment visibility in this release; shipment control remains an administrator-only responsibility.
