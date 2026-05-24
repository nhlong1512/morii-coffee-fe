# Contract: Checkout Delivery Experience

## Purpose

Describe the frontend contract expectations for a customer completing checkout with either self-pickup or GHN delivery.

## Actors

- Signed-in customer
- Morii frontend
- Morii backend

## Preconditions

- Customer is authenticated
- Cart contains at least one item
- Backend exposes delivery profile, master-data, quote, and checkout endpoints

## User-Facing Inputs

- Delivery method selection
- Recipient name
- Phone number
- Address line
- Province selection
- District selection
- Ward selection
- Optional order notes
- Optional save-delivery-profile preference
- Payment method choice

## Required Behaviors

1. When the customer selects self-pickup:
   - delivery quote is not required
   - delivery fee is not applied
   - delivery submission uses pickup-specific validation only

2. When the customer selects GHN delivery:
   - structured address fields become required
   - the customer can request a quote based on current cart and address
   - the returned quote summary is shown before checkout submission
   - the quote snapshot is included in final checkout submission

3. When the customer changes shipping-relevant data after receiving a quote:
   - the previous quote is no longer considered valid for submit
   - the customer must refresh the quote before proceeding

4. When the customer chooses pay-on-delivery:
   - order submission completes directly after successful validation

5. When the customer chooses online payment:
   - checkout session creation is initiated after successful validation
   - the customer is redirected into payment flow

## Failure Behaviors

- Missing structured delivery information blocks GHN delivery submit
- Quote retrieval failure shows actionable recovery messaging
- Expired quote blocks submit until refreshed
- Backend quote validation failure prevents checkout completion and prompts requote

## Success Signals

- Customer sees current delivery fee and delivery timing before confirming a delivery order
- Pickup customers can still complete checkout without delivery quote friction
