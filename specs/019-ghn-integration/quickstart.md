# Quickstart: GHN Delivery Experience

## Goal

Validate the end-to-end frontend behavior for GHN delivery across checkout, customer order views, and admin shipment management after implementation.

## Prerequisites

- Backend environment exposes delivery profile, shipping master data, quote, shipment summary, and shipment action endpoints
- Authenticated customer account and administrator account are available
- Cart contains at least one item eligible for delivery
- Frontend app is running locally

## Scenario 1: Customer completes delivery checkout

1. Sign in as a customer.
2. Add at least one product to the cart.
3. Open checkout.
4. Choose home delivery.
5. Enter or confirm recipient details and structured location selection.
6. Request a shipping quote.
7. Confirm that fee, ETA, and selected delivery service are displayed.
8. Submit checkout through:
   - pay-on-delivery path
   - online payment path
9. Confirm the order is accepted and delivery method is visible on the resulting order view.

## Scenario 2: Quote invalidation works

1. Open checkout and obtain a delivery quote.
2. Change a shipping-relevant field such as district, ward, or cart quantity.
3. Confirm that the previous quote is no longer accepted for submit.
4. Request a new quote.
5. Confirm checkout can proceed again.

## Scenario 3: Customer sees shipment visibility

1. Open a delivery order in customer order detail.
2. Confirm the page shows delivery method and shipment summary when available.
3. If shipment creation has not completed, confirm the page shows a pending-shipment state instead of blank tracking UI.

## Scenario 4: Administrator manages shipment

1. Sign in as an administrator.
2. Open an eligible order in admin order detail.
3. Perform the following as applicable:
   - create or retry shipment
   - refresh shipment
   - refresh quote
   - update shipment note
   - cancel shipment
4. Confirm each action updates the visible shipment state or returns a clear failure message.

## Verification Commands

Run these before handoff:

```bash
pnpm test -- --runInBand
pnpm build
```

Run targeted tests while iterating on contracts and UI:

```bash
pnpm test -- --runInBand src/__tests__/services
pnpm test -- --runInBand src/__tests__/components/checkout
pnpm test -- --runInBand src/__tests__/hooks
pnpm test -- --runInBand src/__tests__/features/shipping
```

## Expected Result

- Delivery checkout works with quote-driven validation
- Pickup checkout remains functional
- Customer order views show delivery and shipment visibility correctly
- Admin order detail supports shipment recovery and management actions
- Full unit test suite and production build pass
