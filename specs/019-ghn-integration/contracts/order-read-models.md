# Contract: Order Read Models For GHN Delivery

## Purpose

Define the read-model expectations for order list and order detail experiences once GHN delivery is introduced.

## Customer Order History

Each order item shown in customer order history must be able to communicate:

- whether the order is pickup or delivery
- whether the order has carrier-backed shipment tracking
- a compact shipment state summary for delivery orders

Expected user outcome:

- customers can distinguish pickup orders from delivery orders without opening each order

## Customer Order Detail

Customer order detail must combine:

- order fulfillment status
- payment status
- delivery method
- shipment summary when available

The interface must preserve these as separate concepts rather than collapsing them into one status label.

## Admin Order Detail

Admin order detail must combine:

- order fulfillment status
- payment details
- delivery details
- shipment summary
- shipment action affordances

The screen must remain the primary operational surface for both order review and shipment recovery.

## State Integrity Rules

- Payment state does not imply shipment state.
- Shipment state does not replace order fulfillment state.
- A delivery order may exist before shipment creation succeeds.
- A pickup order does not require shipment data.

## Success Signals

- Order list and detail screens remain understandable when payment, order, and shipment states differ
- Delivery orders expose enough visibility for customers and enough controls for administrators
