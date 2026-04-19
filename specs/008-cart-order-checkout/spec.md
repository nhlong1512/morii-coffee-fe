# Feature Specification: Cart and Order Checkout

**Feature Branch**: `008-cart-order-checkout`
**Created**: 2026-04-19
**Updated**: 2026-04-20
**Status**: Draft
**Input**: User description: "Feature: Order / Cart for Morii Coffee — delivery-only cart, order details, and place order flow; Order History with status progress UI and order detail view (mock data, proof of concept)"

## Clarifications

### Session 2026-04-19

- Q: What should happen when a customer directly accesses the checkout URL with an empty cart? → A: Redirect to `/cart` page (show empty cart state + browse menu CTA)
- Scope update (2026-04-19): Order History page expanded to include a visual status progress stepper and a dedicated Order Detail page. All data is mock-only in this phase; API integration deferred to a separate phase.
- Q: When a customer interacts with an order card, what is the primary interaction model? → A: Keep accordion expand for quick item preview — add a separate "View Details" button/link to the detail page
- Q: Where does the status progress stepper appear on each order card in the list, and what is the visual design? → A: Always visible on the card (not hidden in accordion). Visual design: horizontal stepper — circle nodes connected by a progress line; completed steps = filled primary-color circle with checkmark icon; upcoming steps = outline/muted circle; each node has an illustrative icon below it and a bold label beneath the icon. Matches provided reference design.
- Status update (2026-04-20): Order status enum redesigned from 4 values to 7 values aligned with backend API lifecycle. Stepper expanded from 3 steps to 6 sequential steps: PENDING → CONFIRMED → READY_TO_PICKUP → IN_DELIVERY → DELIVERED → REVIEWED. CANCELLED remains a terminal state. All status values use SCREAMING_SNAKE_CASE to match backend contract.
- Q: On small screens (≤375px), how does the horizontal stepper behave? → A: Compress in place — smaller nodes, tighter spacing, labels wrap or truncate; no horizontal scroll
- Q: In what order should orders be listed on the Order History page? → A: Most recent first — descending by order date
- Q: Should all UI strings on the Cart and Checkout pages be fully localized (VI/EN via next-intl)? → A: Yes — all strings externalized in VI/EN message files following existing pattern
- Q: Should a product thumbnail image be shown alongside each cart item? → A: Yes — show a small thumbnail image per cart item
- Q: How should the order submission error be displayed to the customer? → A: Toast notification (non-blocking, auto-dismisses, form stays visible)
- Q: Should the cart retain its full contents when a customer navigates back from the Order/Delivery Details page? → A: Yes — full cart contents retained (natural persistence behavior)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Manage Cart (Priority: P1)

A logged-in customer navigates to the Cart page after adding items from the menu. They can see all items in their cart with name, size, and quantity, along with a price summary. They can adjust quantities or remove items before proceeding to checkout.

**Why this priority**: The cart is the gateway to every order. Without a functional cart view, no purchase flow is possible.

**Independent Test**: Can be fully tested by adding items via the store's cart state and navigating to `/cart` — delivers a complete self-contained cart review experience.

**Acceptance Scenarios**:

1. **Given** a customer has one or more items in their cart, **When** they navigate to the Cart page, **Then** each item is displayed with its thumbnail image, name, selected size, quantity, and unit price.
2. **Given** the cart is empty, **When** a customer navigates to the Cart page, **Then** an empty state is shown with a call-to-action to browse the menu.
3. **Given** the cart has items, **When** the customer increases or decreases an item's quantity, **Then** the item quantity and all price summary totals update immediately.
4. **Given** the cart has items, **When** the customer removes an item, **Then** the item disappears from the list and the price summary recalculates.
5. **Given** the cart has items and a promotion has been applied, **When** the Cart page loads, **Then** a discount line appears in the price summary with the deducted amount.

---

### User Story 2 - Fill Delivery and Payment Details (Priority: P1)

A customer with a non-empty cart clicks "Checkout" and is taken to the Order/Delivery Details page. They fill in their delivery information (full name, phone number, address) and select a payment method, then review the same price summary before placing the order.

**Why this priority**: Capturing accurate delivery information is mandatory for every delivery order. This page is the last step before commitment.

**Independent Test**: Can be tested by mocking a populated cart state and rendering the delivery details page — validates form fields, validation rules, and payment method selection independently.

**Acceptance Scenarios**:

1. **Given** a customer is on the Cart page with items, **When** they click "Checkout", **Then** they are navigated to the Order/Delivery Details page.
2. **Given** the customer is on the Order/Delivery Details page, **When** the page loads, **Then** the delivery form shows Full Name, Phone Number, and Address fields; payment method defaults to COD.
3. **Given** the customer selects MoMo or PayPal as the payment method, **When** the radio button is changed, **Then** the selection is reflected visually and the chosen method is stored for submission.
4. **Given** the customer is on the Order/Delivery Details page, **When** they view the right panel, **Then** the same price summary (subtotal, tax, shipping, discount if any) is shown as on the Cart page.
5. **Given** the customer leaves a required delivery field blank, **When** they click "Place Order", **Then** the form highlights the missing field with a validation error and the order is not submitted.

---

### User Story 3 - Place Order and Confirm (Priority: P2)

A customer completes the delivery form and payment selection, then clicks "Place Order". The system submits the order. On success, the customer is redirected to their Order History page.

**Why this priority**: This closes the transaction. Failure here results in a lost conversion; success is the definition of done for the purchase flow.

**Independent Test**: Can be tested by mocking the order submission API call and asserting redirection behavior — demonstrates the end-to-end success and failure paths independently.

**Acceptance Scenarios**:

1. **Given** all delivery fields are filled and a payment method is selected, **When** the customer clicks "Place Order", **Then** the button enters a loading/disabled state and the order is submitted.
2. **Given** the order submission succeeds, **When** the response is received, **Then** the customer is redirected to the Order History page.
3. **Given** the order submission fails, **When** the response is received, **Then** a toast notification displays the error, the button returns to its active state, and all entered delivery data is preserved so the customer can retry immediately.

---

### User Story 4 - Browse Order History with Status Progress (Priority: P2)

A logged-in customer navigates to the Order History page and sees all their past orders listed as cards. Each card prominently displays a visual progress indicator showing where the order stands in the fulfilment lifecycle: PENDING → CONFIRMED → READY_TO_PICKUP → IN_DELIVERY → DELIVERED → REVIEWED. Cancelled orders show a terminated state. The customer can expand a card for a quick item summary (accordion pattern retained), and a "View Details" button/link is available on each card header to navigate to the full detail view.

**Why this priority**: Order tracking is one of the top post-purchase customer needs. Without it, customers contact support for status updates — a high-cost, low-trust interaction.

**Independent Test**: Can be tested using the existing mock order data — renders the order list with status steppers, independently of the checkout flow.

**Acceptance Scenarios**:

1. **Given** a customer has past orders, **When** they navigate to `/orders`, **Then** each order is shown as a card with order number, date, total, item count, and a status progress stepper.
2. **Given** an order with status "IN_DELIVERY", **When** the card is displayed, **Then** the stepper shows PENDING, CONFIRMED, and READY_TO_PICKUP as completed, IN_DELIVERY as active, and DELIVERED/REVIEWED as upcoming.
3. **Given** an order with status "DELIVERED", **When** the card is displayed, **Then** the first 5 steps (PENDING through DELIVERED) are shown as completed; REVIEWED is upcoming.
4. **Given** an order with status "PENDING", **When** the card is displayed, **Then** PENDING is shown as the active step; all subsequent steps are shown as upcoming.
5. **Given** an order with status "CANCELLED", **When** the card is displayed, **Then** the stepper shows a Cancelled terminal state with an X icon; all forward steps are visually muted.
6. **Given** the customer has no past orders, **When** they navigate to `/orders`, **Then** an empty state is shown with a call-to-action to start shopping.

---

### User Story 5 - View Full Order Detail (Priority: P2)

A customer clicks "View Details" on an order card and is taken to a dedicated Order Detail page (`/orders/[id]`). This page shows the complete picture of the order: the status progress stepper at the top, all ordered items with thumbnails, the delivery address used, the payment method, and a full price breakdown.

**Why this priority**: Customers need a single place to see everything about a past order — what they ordered, where it was sent, and what they paid. This page also serves as the foundation for the real API integration in the next phase.

**Independent Test**: Can be tested by navigating directly to `/orders/[mock-id]` with mock data — renders the full detail view independently of the order list.

**Acceptance Scenarios**:

1. **Given** a customer is on the Order History page, **When** they click "View Details" on an order, **Then** they are navigated to `/orders/[id]`.
2. **Given** a customer is on the Order Detail page, **When** the page loads, **Then** the status progress stepper is shown at the top of the page reflecting the order's current status.
3. **Given** a customer is on the Order Detail page, **When** they view the items section, **Then** each ordered item is shown with its thumbnail image, name, size, quantity, and line-item price.
4. **Given** a customer is on the Order Detail page, **When** they view the delivery section, **Then** the full name, phone number, and address used for this order are displayed.
5. **Given** a customer is on the Order Detail page, **When** they view the payment section, **Then** the selected payment method (COD, MoMo, or PayPal) is displayed.
6. **Given** a customer is on the Order Detail page, **When** they view the price breakdown, **Then** subtotal, tax, shipping fee, discount (if any), and grand total are all shown.
7. **Given** the order ID in the URL does not match any known order, **When** the page loads, **Then** a "not found" message is shown with a link back to Order History.

---

### Edge Cases

- When the cart is empty and the customer navigates directly to the checkout URL, they are redirected to the Cart page (resolved: see FR-005).
- What if a cart item becomes unavailable between being added to the cart and order submission?
- What if the customer submits a phone number in an invalid format?
- What if the order API call times out or returns a network error?
- When the customer navigates back from the Order/Delivery Details page, the full cart contents are retained (resolved: Zustand persistence handles this naturally — no special clearing logic applied).
- What if the customer clicks "Place Order" multiple times in rapid succession?
- What if a customer navigates to `/orders/[id]` with an ID that does not exist in mock data?
- On small screens (≤375px), the stepper compresses in place — smaller nodes, tighter spacing, labels wrap or truncate; no horizontal scroll (resolved).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all cart items with a product thumbnail image, name, selected size, quantity, and line-item price on the Cart page.
- **FR-002**: System MUST display a price summary panel showing subtotal, tax fee, shipping fee, and discount/promotion amount (when applicable) on both the Cart and Order/Delivery Details pages.
- **FR-003**: Users MUST be able to increase, decrease, or remove cart item quantities from the Cart page, with the price summary updating in real time.
- **FR-004**: System MUST show an empty-cart state with a link to the menu when the cart contains no items.
- **FR-005**: System MUST prevent navigation to the checkout page when the cart is empty; if a customer accesses the checkout URL directly with an empty cart, they MUST be redirected to the Cart page where the empty state and browse-menu CTA are displayed.
- **FR-006**: The Cart page MUST include a "Checkout" button that navigates to the Order/Delivery Details page.
- **FR-007**: The Order/Delivery Details page MUST include a delivery form with three required fields: Full Name, Phone Number, and Address.
- **FR-008**: The Order/Delivery Details page MUST include a payment method selector with three radio button options: COD (selected by default), MoMo, and PayPal.
- **FR-009**: The Order/Delivery Details page MUST display the same price summary panel as the Cart page.
- **FR-010**: The Order/Delivery Details page MUST include a "Place Order" button that submits the order.
- **FR-011**: System MUST validate all required delivery form fields before order submission; invalid or missing fields MUST display inline error messages.
- **FR-012**: System MUST show a loading/disabled state on the "Place Order" button while the order is being submitted to prevent double-submission.
- **FR-013**: Upon successful order submission, the system MUST redirect the customer to the Order History page.
- **FR-014**: Upon failed order submission, the system MUST display a toast notification with an error message, return the "Place Order" button to its active state, and preserve all entered delivery data so the customer can retry immediately.
- **FR-015**: MoMo and PayPal payment processing integrations are explicitly out of scope for this phase; selecting these options captures intent only — no payment gateway redirect or QR flow is triggered.
- **FR-016**: All user-visible strings on the Cart and Order/Delivery Details pages MUST be externalized in the project's VI/EN i18n message files, following the existing next-intl localization pattern.

**Order History & Detail (FR-017 – FR-026)**

- **FR-017**: The Order History page MUST display each past order as a card showing: order number, order date, item count, grand total, and a status progress stepper always visible on the card (not hidden behind the accordion). Orders MUST be sorted most recent first (descending by order date).
- **FR-018**: The status progress stepper MUST use a horizontal design with exactly 6 sequential steps: PENDING → CONFIRMED → READY_TO_PICKUP → IN_DELIVERY → DELIVERED → REVIEWED. It renders as circle nodes connected by a progress line. Completed steps MUST show a filled primary-color circle with a checkmark; the active step MUST show a filled primary-color circle with its step icon; upcoming steps MUST show an outline/muted circle. Each node MUST have an illustrative icon (Clock, CreditCard, Package, Truck, Home, Star) and a text label below it. The connecting line segment between completed steps MUST be filled; segments to upcoming steps MUST be muted/grey. On smaller screens the stepper MUST be horizontally scrollable or compress in place. The status enum: `PENDING | CONFIRMED | READY_TO_PICKUP | IN_DELIVERY | DELIVERED | REVIEWED | CANCELLED`.
- **FR-019**: For orders with status "CANCELLED", the stepper MUST display a Cancelled terminal state with a red X icon and a "Cancelled" label; the 6-step progress row is not shown for cancelled orders.
- **FR-020**: Each order card MUST include a "View Details" button/link in the card header that navigates to the Order Detail page at `/orders/[id]`. The accordion expand/collapse behavior on the card header is retained for quick item preview; "View Details" is a distinct, separate action.
- **FR-021**: The Order Detail page (`/orders/[id]`) MUST display the status progress stepper prominently at the top of the page.
- **FR-022**: The Order Detail page MUST list all ordered items with thumbnail image, name, size, quantity, and line-item price.
- **FR-023**: The Order Detail page MUST show the delivery information used for the order: full name, phone number, and delivery address.
- **FR-024**: The Order Detail page MUST show the payment method selected at the time of ordering.
- **FR-025**: The Order Detail page MUST display a full price breakdown: subtotal, tax, shipping fee, discount (when non-zero), and grand total.
- **FR-026**: All Order History and Order Detail page data is served from mock data in this phase; no real API calls are made. The mock data structure MUST mirror the expected real API response shape to ensure a clean integration path in the next phase.

### Key Entities

- **Cart**: A persistent collection of items a customer intends to purchase. Attributes: list of cart items, applied promotion code (optional), computed totals.
- **Cart Item**: A single product entry in the cart. Attributes: product thumbnail image, product name, selected size, quantity, unit price.
- **Price Summary**: A computed view of order financials. Attributes: subtotal (sum of line items), tax fee, shipping fee, discount amount (when promotion applied), grand total.
- **Delivery Information**: Customer-provided shipping details. Attributes: full name, phone number, delivery address.
- **Order**: The submitted or historical purchase record. Attributes: order ID, order number, date, status (`PENDING | CONFIRMED | READY_TO_PICKUP | IN_DELIVERY | DELIVERED | REVIEWED | CANCELLED`), ordered items snapshot, delivery information (name, phone, address), payment method, subtotal, tax, shipping fee, discount, grand total, tracking number (nullable).
- **Order Status Progress**: A derived view of an order's fulfilment lifecycle rendered as a horizontal 6-step stepper: PENDING → CONFIRMED → READY_TO_PICKUP → IN_DELIVERY → DELIVERED → REVIEWED. Each step has: a circle node (filled+checkmark when complete, filled+icon when active, outlined when upcoming), a connecting progress line (filled for completed segments, muted for upcoming), an illustrative icon (Clock, CreditCard, Package, Truck, Home, Star), and a text label. CANCELLED is a terminal state shown as a red X with label — the 6-step row is replaced entirely.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can navigate from a populated Cart page to a successfully placed order in under 3 minutes on a standard connection.
- **SC-002**: 100% of order submissions with valid delivery information and COD payment complete without error and redirect to Order History.
- **SC-003**: 90% of users correctly complete the delivery form on their first submission attempt (no re-submission required due to validation errors).
- **SC-004**: The Cart and Checkout pages render correctly and are fully usable with mock data, enabling UI review and user testing before backend integration.
- **SC-005**: No duplicate orders are ever created from a single "Place Order" click, regardless of network latency or repeated user interactions.
- **SC-006**: Customers cannot reach the Order/Delivery Details page with an empty cart — zero successful navigations from an empty cart to checkout.
- **SC-007**: The status progress stepper correctly reflects the order status for all seven states (PENDING, CONFIRMED, READY_TO_PICKUP, IN_DELIVERY, DELIVERED, REVIEWED, CANCELLED) across 100% of displayed orders.
- **SC-008**: The Order Detail page renders all required fields (items, delivery info, payment method, price breakdown) for every mock order, with zero missing or placeholder fields.
- **SC-009**: The mock data structure for orders is directly compatible with the expected `POST /api/orders` and `GET /api/orders` API response shapes, enabling the next-phase API integration with no data model changes.

## Assumptions

- The user is already authenticated before accessing the Cart or Checkout pages; unauthenticated users are redirected to login.
- All UI strings on the Cart and Checkout pages are externalized in VI/EN i18n message files via next-intl, consistent with the rest of the application.
- Cart state is managed client-side with persistence (Zustand + localStorage); cart contents are fully retained when navigating back from the checkout page — no clearing logic is applied on back-navigation.
- Mock data will be used for product details, pricing, tax rate, and shipping fee calculations for this phase.
- Tax is calculated as a fixed percentage of the subtotal; 10% will be used as the mock rate pending business confirmation.
- Shipping is a fixed flat fee; 15,000 VND will be used as the mock fee pending delivery zone logic (out of scope for this phase).
- Phone number validation follows Vietnamese mobile number format (10 digits, starting with 03/05/07/08/09).
- The Order History page (`/orders`) is treated as a known destination; it may be a stub or existing page.
- Cart minimum quantity is 1; the remove action is triggered when quantity would drop below 1.
- Order History and Order Detail pages use mock data from `src/data/orders.ts`; no real API calls are made in this phase. Mock orders are sorted most recent first (descending by date).
- The mock Order data will be extended to include `delivery`, `paymentMethod`, `subtotal`, `tax`, `shipping`, and `discount` fields so the detail view is fully populated and mirrors the real API shape.
- Status timestamps (e.g., "dispatched at 14:32") are optional in the mock and will be added when the real API provides them.
- The status progress stepper is a custom UI component — no third-party stepper library is introduced.

## Suggested Improvements

The following are not in scope for this phase but are recommended for consideration before or shortly after launch.

### UI/UX Enhancements

- **Order Confirmation Page**: Show a dedicated confirmation screen after placement (with order number and estimated delivery time) rather than jumping directly to history. This reduces post-purchase anxiety and increases trust.
- **Sticky Price Summary on Mobile**: Pin the price total (or a collapsed summary) to the bottom of the screen so customers always see their running total without scrolling.
- **Checkout Progress Indicator**: Add a step indicator (e.g., Cart → Details → Done) so customers understand where they are in the flow.
- **Real-time Field Validation**: Validate form fields on blur (when the user leaves a field) rather than only on submit, providing instant feedback.
- **Saved Addresses**: Allow returning customers to select a previously used delivery address to speed up repeat orders.
- **Address Autocomplete**: Offer location suggestions as the customer types their address to reduce input errors and improve accuracy.

### Business Logic Edge Cases Worth Considering

- **Minimum Order Amount**: Define and enforce a minimum cart total before allowing checkout (e.g., 50,000 VND); display a warning in the cart if below threshold.
- **Stock Re-validation at Checkout**: Re-check item availability at the moment of order submission, not only when added to cart, and surface clear messaging for any unavailable items.
- **Price Drift Handling**: If a product price changes between cart addition and order submission, define whether to silently recalculate or alert the customer before confirming.
- **Promotion Code Entry**: The spec includes discount in the price summary, but no input mechanism is defined. A coupon/promo code field on the Cart page is the expected entry point.
- **Cart Persistence Duration**: Define how long cart data is retained (browser session vs. 7-day vs. 30-day) and communicate this expectation to customers.
- **Order Cancellation Window**: Allow a short cancellation window (e.g., 5 minutes) after placement before the order enters preparation status.
- **Guest Checkout**: Evaluate whether unauthenticated users should be able to complete an order (requires phone + address as identity) — this would meaningfully increase conversion rates.
